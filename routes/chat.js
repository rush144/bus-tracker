const express = require('express');
const router = express.Router();
const ChatMessage = require('../models/chatmessage');

router.get('/', async (req, res) => {
  try {
    const messages = await ChatMessage.find().sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chat messages' });
  }
});

module.exports = router;
