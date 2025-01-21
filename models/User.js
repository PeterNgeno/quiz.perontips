const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const { verifyAdmin } = require('../middleware/authMiddleware');

// Route to get all quiz questions
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('quizzes').get();
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
  const userAnswers = req.body.answers;
  let score = 0;

  try {
    const snapshot = await db.collection('quizzes').get();
    const quizzes = snapshot.docs.map(doc => doc.data());

    // Validate answers
    quizzes.forEach((question, index) => {
      if (userAnswers[index] && userAnswers[index] === question.answer) {
        score++;
      }
    });

    res.json({ message: 'Quiz submitted successfully', score });
  } catch (err) {
    console.error('Error calculating quiz score:', err);
    res.status(500).json({ error: 'Failed to calculate score' });
  }
});

// Admin route to add a quiz question (admin access only)
router.post('/add', verifyAdmin, async (req, res) => {
  const { question, options, answer } = req.body;

  if (!question || !options || !answer) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
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
    await db.collection('quizzes').doc(id).delete();
    res.json({ message: 'Quiz question deleted successfully' });
  } catch (err) {
    console.error('Error deleting quiz question:', err);
    res.status(500).json({ error: 'Failed to delete quiz question' });
  }
});

module.exports = router;
