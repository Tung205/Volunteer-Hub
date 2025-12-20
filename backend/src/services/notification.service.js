import webpush from 'web-push';
import Subscription from '../models/subscription.model.js';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'YOUR_PUBLIC_KEY';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'YOUR_PRIVATE_KEY';

webpush.setVapidDetails(
  'mailto:admin@volunteerhub.local',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

export async function sendBroadcastNotificationService({ title, body }) {
  const payload = JSON.stringify({ title, body });
  const subs = await Subscription.find();
  let success = 0, fail = 0;
  for (const sub of subs) {
    try {
      await webpush.sendNotification(sub, payload);
      success++;
    } catch (err) {
      fail++;
      if (err.statusCode === 410 || err.statusCode === 404) {
        await Subscription.deleteOne({ endpoint: sub.endpoint });
      }
    }
  }
  return { success, fail };
}
