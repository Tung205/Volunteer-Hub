import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
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
  },
  {
    timestamps: true,
  }
);

// Index: {postId:1, createdAt:1}
CommentSchema.index({ postId: 1, createdAt: 1 });

const Comment = mongoose.model('Comment', CommentSchema);
export default Comment;
