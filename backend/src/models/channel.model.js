// models/channel.model.js
const mongoose = require('mongoose');

const ChannelSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      unique: true, // 1 event chỉ có 1 channel
      index: true,
    },
  },
  {
    timestamps: true, // tự sinh createdAt, updatedAt
  }
);

// Index đảm bảo eventId là duy nhất (phòng trường hợp unique ở trên bị remove)
ChannelSchema.index({ eventId: 1 }, { unique: true });

const Channel = mongoose.model('Channel', ChannelSchema);
module.exports = Channel;
