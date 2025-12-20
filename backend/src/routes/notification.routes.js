const express = require('express');
const router = express.Router();
const webpush = require('web-push');
const Subscription = require('../models/subscription.model');

// TODO: Thay bằng key thực tế, sinh bằng web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'YOUR_PUBLIC_KEY';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'YOUR_PRIVATE_KEY';

webpush.setVapidDetails(
  'mailto:admin@volunteerhub.local',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// Gửi push broadcast
router.post('/broadcast', async (req, res) => {
  try {
    const { title, body } = req.body;
    const payload = JSON.stringify({ title, body });
    const subs = await Subscription.find();
    let success = 0, fail = 0;
    for (const sub of subs) {
      try {
        await webpush.sendNotification(sub, payload);
        success++;
      } catch (err) {
        fail++;
        // Nếu lỗi 410 (Gone) hoặc 404 (Not Found) thì xóa subscription khỏi DB
        if (err.statusCode === 410 || err.statusCode === 404) {
          await Subscription.deleteOne({ endpoint: sub.endpoint });
        }
      }
    }
    res.json({ message: 'Push sent', success, fail });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
