const express = require('express');
const cors = require('cors');
const { db, admin } = require('./firebase'); // Firebase configuration
const { logQuizAttempt } = require('./middleware/analytics'); // Analytics middleware
const quizController = require('./controllers/quizController'); // Quiz controller
const paymentController = require('./controllers/paymentController'); // Payment controller
const authMiddleware = require('./middleware/authMiddleware'); // Authentication middleware
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // JSON parsing middleware

// Routes
const productRoutes = require('./routes/productRoutes'); // Product routes
const quizRoutes = require('./routes/quizRoutes'); // Quiz routes
const bettingRoutes = require('./routes/bettingRoutes'); // Betting routes
const paymentRoutes = require('./routes/paymentRoutes'); // Payment routes

// Use Routes
app.use('/api/products', productRoutes(db)); // Product API routes
app.use('/api/quiz', quizRoutes(db, quizController, paymentController, authMiddleware)); // Quiz API routes
app.use('/api/betting', bettingRoutes(db)); // Betting API routes
app.use('/api/payments', paymentRoutes(db)); // Payment API routes

// Analytics Logging Middleware
app.use(async (req, res, next) => {
  try {
    const path = req.path; // Log request path
    await logQuizAttempt(path);
    next();
  } catch (error) {
    console.error('Error logging analytics data:', error);
    next();
  }
});

// Default Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to SangPoint API' });
});

// Log Quiz Attempts
app.post('/api/quiz/attempt', async (req, res) => {
  try {
    const { userId, section, score, passed } = req.body; // Get quiz attempt details
    await logQuizAttempt(userId, section, score, passed);
    res.json({ message: 'Quiz attempt logged successfully', score });
  } catch (error) {
    console.error('Error logging quiz attempt:', error);
    res.status(500).json({ error: 'Failed to log quiz attempt' });
  }
});

// Payment Initiation Route
app.post('/api/payments/initiate', paymentController.initiatePayment); // Mpesa STK Push

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack
  res.status(500).json({ error: 'Something went wrong!' }); // Return generic error message
});

// Start the Server
const PORT = process.env.PORT || 5000; // Use environment port or default 5000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
