const Subscription = require('../models/subscription.model');

/**
 * Lưu subscription vào DB nếu chưa có endpoint
 * @param {Object} subscription - { endpoint, keys }
 * @returns {Promise<Object>} subscription document
 */
async function saveSubscription(subscription) {
  if (!subscription || !subscription.endpoint || !subscription.keys) {
    throw new Error('Invalid subscription');
  }
  let sub = await Subscription.findOne({ endpoint: subscription.endpoint });
  if (!sub) {
    sub = await Subscription.create(subscription);
  }
  return sub;
}

module.exports = {
  saveSubscription,
};
