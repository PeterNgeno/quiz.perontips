require('dotenv').config();
const admin = require('firebase-admin');

// Check if necessary environment variables are present
if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
  throw new Error("Firebase environment variables are not properly set.");
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Fix multiline private key
  }),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com` // Ensure the database URL is set properly
});

module.exports = admin;
