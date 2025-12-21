import webpush from 'web-push';
import Subscription from '../models/subscription.model.js';

// Hardcoded keys to resolve environment variable loading issues
const VAPID_PUBLIC_KEY = 'BL0VNiUlDdC_zSCloOdyDTnAuHGow65nYeQ9YWA7xYSqaCxXrNpo4s5diPf_mKq7Kfap_Qqb_u4-3MHdwZyEiQI';
const VAPID_PRIVATE_KEY = 'FKs1lyAUeiJzmNfeRmbjP62bIZ7abLzcdZVnHZFAvtM';

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

export async function sendNotificationToUser(userId, { title, body }) {
  const payload = JSON.stringify({ title, body });
  // Find all subscriptions for this user (user might have multiple devices)
  const subs = await Subscription.find({ userId });

  if (!subs.length) return { success: 0, fail: 0 };

  let success = 0, fail = 0;
  for (const sub of subs) {
    try {
      await webpush.sendNotification(sub, payload);
      success++;
    } catch (err) {
      console.error("Push Error:", err);
      fail++;
      if (err.statusCode === 410 || err.statusCode === 404) {
        await Subscription.deleteOne({ endpoint: sub.endpoint });
      }
    }
  }
  console.log(`Sent notification to User ${userId}: Success=${success}, Fail=${fail}`);
  return { success, fail };
}
