const express = require('express');
const { initiatePayment, handleCallback } = require('../controllers/paymentController'); // Import the controller
const router = express.Router();

module.exports = (db, mpesa) => {
  // Route to initiate payment
  router.post('/initiate', async (req, res) => {
    try {
      const { amount, phoneNumber, timerDuration } = req.body;
      
      // Validate phone number format: must start with +254 followed by 9 digits
      const phonePattern = /^\+254\d{9}$/;
      if (!phonePattern.test(phoneNumber)) {
        throw new Error('Invalid phone number. It must start with +254 followed by 9 digits.');
      }

      // Call the initiatePayment function from the payment controller
      const result = await initiatePayment(req, res);

      // Insert payment record into Firestore
      const paymentData = {
        userId: req.body.userId, // Assuming userId is part of the request body
        amount,
        phoneNumber,
        status: result.success ? 'Pending' : 'Failed',
        paymentDate: new Date().toISOString(),
      };

      await db.collection('payments').add(paymentData);

      return res.json({ success: result.success, message: result.message });
    } catch (err) {
      console.error('Error processing payment:', err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Route to handle the callback from Safaricom after payment
  router.post('/callback', (req, res) => {
    handleCallback(req, res); // Call the handleCallback function from the payment controller
  });

  return router;
};
