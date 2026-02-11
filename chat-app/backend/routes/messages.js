const express = require('express');
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/:roomId', auth, async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .sort({ timestamp: 1 })
      .limit(50);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const message = new Message({
      roomId: req.body.roomId,
      sender: req.user.name || 'Anonymous',  // From JWT
      text: req.body.text
    });
    await message.save();
    res.json(message);
  } catch (error) {
    console.error('Message save error:', error);
    res.status(500).json({ msg: 'Failed to save message' });
  }
});

module.exports = router;
