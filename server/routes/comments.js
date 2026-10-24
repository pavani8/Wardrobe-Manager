const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getComments, saveComments } = require('../utils/dataStore');

const router = express.Router();

router.use(authenticateToken);

router.post('/', (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Comment message is required' });
    }

    const comments = getComments();
    const newComment = {
      id: Date.now().toString(),
      userId: req.user.userId,
      message: message.trim(),
      read: false,
      createdAt: new Date().toISOString()
    };

    comments.push(newComment);
    saveComments(comments);

    res.status(201).json({
      message: 'Comment submitted to admin successfully',
      comment: newComment
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/mine', (req, res) => {
  try {
    const comments = getComments()
      .filter((c) => c.userId === req.user.userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
