import mongoose from 'mongoose';

const LikeSchema = new mongoose.Schema(
  {
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'targetType',
      index: true,
    },
    targetType: {
      type: String,
      required: true,
      enum: ['Post', 'Comment', 'Event'],
      default: 'Post'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique like per user per target
LikeSchema.index({ targetId: 1, targetType: 1, userId: 1 }, { unique: true });

// Index for counting likes
LikeSchema.index({ targetId: 1, targetType: 1 });

const Like = mongoose.model('Like', LikeSchema);
export default Like;
