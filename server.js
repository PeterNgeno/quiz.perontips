require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const admin = require('firebase-admin'); // Import Firebase Admin SDK
const serviceAccount = require('./config'); // Path to your config.js file

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://perontipsltd.firebaseio.com" // Make sure the database URL is correct
});

const { logQuizAttempt } = require('./middleware/analytics');
const quizController = require('./controllers/quizController');
const paymentController = require('./controllers/paymentController');
const authMiddleware = require('./middleware/authMiddleware');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Import Betting Predictions Model
const predictions = require('./models/predictions'); // Import the betting predictions model

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
const quizRoutes = require('./routes/quizRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Serve static admin login page
app.get('/admin_login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin_login.html'));
});

// Admin Login Route
app.post('/admin_login', (req, res) => {
  const { name, email, password } = req.body;

  // Temporary admin credentials
  const adminCredentials = {
    name: 'Peter',
    email: 'perontips@gmail.com',
    password: 'Kipzz1945',
  };

  // Validate credentials
  if (email === 'perontips@gmail.com' && password === 'Kipzz1945.#') {
    res.redirect('/admin_dashboard.html');
  } else {
    res.status(401).send('You are not authorized for this page. Please contact PERON TIPS LIMITED for help.');
  }
});

// Handle Betting Payment
app.post('/betting/predictions/payment', async (req, res) => {
  const { phoneNumber, amount } = req.body;

  try {
    // Trigger STK Push
    const paymentResult = await paymentController.initiatePayment(
      phoneNumber,
      amount
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
    const bettingData = await predictions.getAll(); // Fetch all predictions from Firebase
    res.json({ predictions: bettingData });
  } catch (error) {
    console.error('Error fetching predictions:', error);
    res.status(500).json({ error: 'Error loading predictions' });
  }
});

// Update Betting Predictions Route (Admin only)
app.post('/admin/betting', async (req, res) => {
  const predictionsData = req.body.predictions;

  try {
    // Assuming your Firebase database has a "predictions" collection
    const db = admin.firestore();
    const predictionsRef = db.collection('betting_predictions');
    
    // Loop through predictions and save them to Firebase
    for (const prediction of predictionsData) {
      await predictionsRef.add({
        prediction1: prediction.p1,
        prediction2: prediction.p2,
        prediction3: prediction.p3,
        createdAt: admin.firestore.FieldValue.serverTimestamp()  // Save the timestamp for sorting
      });
    }

    res.send('Betting predictions updated successfully');
  } catch (error) {
    console.error('Error updating predictions:', error);
    res.status(500).send('Error updating betting predictions');
  }
});

// Use Routes
app.use('/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/admin', authMiddleware.verifyAdmin, adminRoutes);

// Analytics Logging Middleware
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

// Default Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Peron Tips API' });
});

// Payment Initiation Route
app.post('/api/payments/initiate', paymentController.initiatePayment);

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
