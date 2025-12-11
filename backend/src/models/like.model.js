const mongoose = require('mongoose');

const LikeSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
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

// Không cho 1 user like 1 post nhiều lần
LikeSchema.index({ postId: 1, userId: 1 }, { unique: true });

// Hỗ trợ query tất cả like của 1 post
LikeSchema.index({ postId: 1 });

const Like = mongoose.model('Like', LikeSchema);
module.exports = Like;
