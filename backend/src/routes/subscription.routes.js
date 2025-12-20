const express = require('express');
const router = express.Router();
const { saveSubscription } = require('../services/subscription.service');

// Đăng ký subscription mới
router.post('/', async (req, res) => {
  try {
    const { endpoint, keys } = req.body;
    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ message: 'Invalid subscription data' });
    }
    const sub = await saveSubscription({ endpoint, keys });
    return res.status(201).json({ message: 'Subscription saved', subscription: sub });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
