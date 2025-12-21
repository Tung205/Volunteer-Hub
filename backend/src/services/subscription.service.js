import Subscription from '../models/subscription.model.js';

/**
 * Lưu subscription vào DB nếu chưa có endpoint
 * @param {Object} subscription - { endpoint, keys }
 * @returns {Promise<Object>} subscription document
 */
export async function saveSubscription(subscription, userId) {
  if (!subscription || !subscription.endpoint || !subscription.keys) {
    throw new Error('Invalid subscription');
  }
  let sub = await Subscription.findOne({ endpoint: subscription.endpoint });
  if (!sub) {
    sub = await Subscription.create({ ...subscription, userId });
  } else {
    // Update userId if changed (e.g. diff user login on same browser?) - OPTIONAL
    if (sub.userId.toString() !== userId) {
      sub.userId = userId;
      await sub.save();
    }
  }
  return sub;
}
