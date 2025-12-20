import { sendBroadcastNotificationService } from '../services/notification.service.js';

export async function sendBroadcastNotification(req, res) {
  try {
    const { title, body } = req.body;
    const result = await sendBroadcastNotificationService({ title, body });
    res.json({ message: 'Push sent', ...result });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}
