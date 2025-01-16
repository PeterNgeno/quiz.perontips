module.exports = (db, mpesa) => ({
  processPayment: async (userId, amount, phoneNumber) => {
    try {
      // Validate phone number format: must start with +254 followed by 9 digits
      const phonePattern = /^\+254\d{9}$/;
      if (!phonePattern.test(phoneNumber)) {
        throw new Error('Invalid phone number. It must start with +254 followed by 9 digits.');
      }

      // Process payment via Mpesa
      const result = await mpesa.stkPush(userId, amount, phoneNumber);

      // Insert payment record into Firestore
      const paymentData = {
        userId,
        amount,
        phoneNumber, // Save the phone number along with the payment
        status: result.status,
        paymentDate: new Date().toISOString(),
      };

      await db.collection('payments').add(paymentData);
      return { success: true, result };
    } catch (err) {
      console.error('Error processing payment:', err.message);
      return { success: false, error: err.message };
    }
  },
});
