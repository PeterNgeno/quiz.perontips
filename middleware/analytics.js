const admin = require('firebase-admin');
const path = require('path');

// Path to the new service account key file
const serviceAccount = path.join(__dirname, './service-account.json');

// Initialize Firebase Admin if not already initialized
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase initialized successfully.');
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

const db = admin.firestore();

// Function to log a quiz attempt to Firestore
async function logQuizAttempt(userId, section, score, passed) {
  try {
    const quizAttemptRef = db.collection('quiz_attempts').doc();
    await quizAttemptRef.set({
      user_id: userId,
      section: section,
      score: score,
      attempt_date: admin.firestore.FieldValue.serverTimestamp(),
      passed: passed,
    });

    await updateAnalytics(section, passed);
    console.log('Quiz attempt logged successfully.');
  } catch (error) {
    console.error('Error logging quiz attempt:', error);
  }
}

// Function to update analytics
async function updateAnalytics(section, passed) {
  const analyticsRef = db.collection('analytics').doc(section);

  try {
    const doc = await analyticsRef.get();
    if (doc.exists) {
      const data = doc.data();
      await analyticsRef.update({
        total_attempts: (data.total_attempts || 0) + 1,
        total_passes: passed ? (data.total_passes || 0) + 1 : data.total_passes,
        total_failures: !passed ? (data.total_failures || 0) + 1 : data.total_failures,
        last_updated: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      await analyticsRef.set({
        total_attempts: 1,
        total_passes: passed ? 1 : 0,
        total_failures: !passed ? 1 : 0,
        last_updated: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    console.log('Analytics updated successfully.');
  } catch (error) {
    console.error('Error updating analytics:', error);
  }
}

module.exports = { logQuizAttempt, updateAnalytics };
