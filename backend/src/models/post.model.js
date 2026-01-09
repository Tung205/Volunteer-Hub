import mongoose from 'mongoose';

const AttachmentSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String, // ví dụ: 'image', 'file', 'video'
      required: true,
      trim: true,
    },
  },
  { _id: false } // không cần _id riêng cho từng attachment
);

const PostSchema = new mongoose.Schema(
  {
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Channel',
      required: true,
      index: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    attachments: [AttachmentSchema],
    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index: {channelId:1, createdAt:-1}
PostSchema.index({ channelId: 1, createdAt: -1 });

const Post = mongoose.model('Post', PostSchema);
export default Post;
