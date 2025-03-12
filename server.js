require('dotenv').config(); // Ensure environment variables are loaded
const express = require('express');
const cors = require('cors');
const path = require('path');
const admin = require('firebase-admin');
//Parse the environment variable correctly
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT.replace(/\\n/g,'\n'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
console.log("Firebase Admin SDK initialized successfully!");

const path = require("path");
const admin = require("firebase-admin");

// Load service account key properly
const serviceAccountPath = path.resolve(__dirname, "service-account.json");

// Initialize Firebase Admin SDK
console.log(serviceAccount);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL || "https://perontipsltd.firebaseio.com", // Use environment variable if set
});

// Import middleware, controllers, and routes
const { logQuizAttempt } = require('./middleware/analytics');
const quizController = require('./controllers/quizController');
const paymentController = require('./controllers/paymentController');
const authMiddleware = require('./middleware/authMiddleware');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const quizRoutes = require('./routes/quizRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const predictions = require('./models/predictions'); // Import betting predictions model

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Admin Login Route
app.post('/admin_login', (req, res) => {
  const { email, password } = req.body;

  // Admin credentials stored in environment variables for security
  const adminCredentials = {
    email: process.env.ADMIN_EMAIL || 'perontips@gmail.com',
    password: process.env.ADMIN_PASSWORD || 'Kipzz1945.#',
  };

  if (email === adminCredentials.email && password === adminCredentials.password) {
    res.redirect('/admin_dashboard.html');
  } else {
    res.status(401).send('Unauthorized access. Please contact PERON TIPS LIMITED for support.');
  }
});

// Betting Predictions Payment
app.post('/betting/predictions/payment', async (req, res) => {
  const { phoneNumber, amount } = req.body;

  try {
    const paymentResult = await paymentController.initiatePayment(
      phoneNumber,
      amount,
      process.env.MPESA_STK_PUSH_URL || 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
    );

    if (paymentResult.success) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: 'Payment failed' });
    }
  } catch (error) {
    console.error('Error during payment:', error);
    res.status(500).json({ success: false, error: 'Payment processing error' });
  }
});

// Fetch Betting Predictions
app.get('/betting/predictions', async (req, res) => {
  try {
    const bettingData = await predictions.getAll();
    res.json({ predictions: bettingData });
  } catch (error) {
    console.error('Error fetching predictions:', error);
    res.status(500).json({ error: 'Error loading predictions' });
  }
});

// Use Routes
app.use('/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/admin', authMiddleware.verifyAdmin, adminRoutes);

// Log analytics data
app.use(async (req, res, next) => {
  try {
    const path = req.path;
    await logQuizAttempt(path);
    next();
  } catch (error) {
    console.error('Error logging analytics data:', error);
    next();
  }
});

// Serve Static Admin Login Page
app.get('/admin_login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin_login.html'));
});

// Default Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Peron Tips API (Sandbox Mode)' });
});

// Payment Initiation Route
app.post('/api/payments/initiate', async (req, res) => {
  const { phoneNumber, amount } = req.body;

  try {
    const paymentResult = await paymentController.initiatePayment(
      phoneNumber,
      amount,
      process.env.MPESA_STK_PUSH_URL || 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
    );

    if (paymentResult.success) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: 'Payment failed' });
    }
  } catch (error) {
    console.error('Error during payment:', error);
    res.status(500).json({ success: false, error: 'Payment processing error' });
  }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
