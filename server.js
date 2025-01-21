const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { logQuizAttempt } = require('./middleware/analytics');
const quizController = require('./controllers/quizController');
const paymentController = require('./controllers/paymentController');
const authMiddleware = require('./middleware/authMiddleware');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

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
    res.status(401).send('Invalid credentials');
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
