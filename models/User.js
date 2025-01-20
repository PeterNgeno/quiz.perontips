const express = require('express');
const router = express.Router();
const { db } = require('../firebase'); // Import Firebase Firestore instance
const { verifyAdmin } = require('../middleware/authMiddleware'); // Middleware to verify admin access

// Route to get all quiz questions
router.get('/', async (req, res) => {
  try {
    // Fetch all quizzes from Firestore
    const snapshot = await db.collection('quizzes').get(); // Get all quiz documents
    const quizzes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ message: 'Quiz page is working!', quizzes });
  } catch (err) {
    console.error('Error fetching quizzes:', err);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

// Route to submit quiz answers and calculate score
router.post('/submit', async (req, res) => {
  const userAnswers = req.body.answers; // Assuming the answers are sent in the body
  let score = 0;

  try {
    // Fetch all quizzes from Firestore
    const snapshot = await db.collection('quizzes').get();
    const quizzes = snapshot.docs.map(doc => doc.data());

    // Compare user answers with the correct answers
    quizzes.forEach((question, index) => {
      if (userAnswers[index] === question.answer) {
        score++;
      }
    });

    res.json({ message: 'Quiz submitted successfully', score });
  } catch (err) {
    console.error('Error fetching quizzes for score calculation:', err);
    res.status(500).json({ error: 'Failed to calculate score' });
  }
});

// Admin route to add a quiz question (admin access only)
router.post('/add', verifyAdmin, async (req, res) => {
  const { question, options, answer } = req.body;

  try {
    // Validate input
    if (!question || !options || !answer) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Add new quiz question to Firestore
    const newQuizRef = await db.collection('quizzes').add({ question, options, answer });
    res.json({ message: 'Quiz question added successfully', id: newQuizRef.id });
  } catch (err) {
    console.error('Error adding quiz question:', err);
    res.status(500).json({ error: 'Failed to add quiz question' });
  }
});

// Admin route to delete a quiz question (admin access only)
router.delete('/delete/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    // Delete quiz question from Firestore
    await db.collection('quizzes').doc(id).delete();
    res.json({ message: 'Quiz question deleted successfully' });
  } catch (err) {
    console.error('Error deleting quiz question:', err);
    res.status(500).json({ error: 'Failed to delete quiz question' });
  }
});

module.exports = router;
