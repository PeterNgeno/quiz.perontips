const express = require('express');
const router = express.Router();
const { db } = require('../firebase');
const { verifyAdmin } = require('../middleware/authMiddleware');

// Get all quiz questions
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('quizzes').get();
    const quizzes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ quizzes });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
});

// Submit quiz answers
router.post('/submit', async (req, res) => {
  const { answers } = req.body;

  try {
    const snapshot = await db.collection('quizzes').get();
    const quizzes = snapshot.docs.map(doc => doc.data());
    const score = quizzes.reduce((acc, question, i) =>
      answers[i] === question.answer ? acc + 1 : acc, 0);

    res.json({ score, message: 'Quiz submitted successfully' });
  } catch (error) {
    console.error('Error calculating score:', error);
    res.status(500).json({ error: 'Failed to calculate score' });
  }
});

// Admin add quiz question
router.post('/add', verifyAdmin, async (req, res) => {
  const { question, options, answer } = req.body;
  if (!question || !options || !answer) return res.status(400).json({ error: 'All fields are required' });

  try {
    const newQuiz = await db.collection('quizzes').add({ question, options, answer });
    res.json({ message: 'Quiz added successfully', id: newQuiz.id });
  } catch (error) {
    console.error('Error adding quiz:', error);
    res.status(500).json({ error: 'Failed to add quiz' });
  }
});

// Admin delete quiz question
router.delete('/delete/:id', verifyAdmin, async (req, res) => {
  try {
    await db.collection('quizzes').doc(req.params.id).delete();
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
});

module.exports = router;
