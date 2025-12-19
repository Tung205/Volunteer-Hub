import mongoose from 'mongoose';
import Post from '../models/post.model.js';
import Comment from '../models/comment.model.js';

export const PostService = {
  /**
   * Tạo comment cho bài post
   * @param {string} postId 
   * @param {string} authorId 
   * @param {Object} data - { content }
   * @returns {Promise<Object>} - comment đã tạo
   */
  async createComment(postId, authorId, { content }) {
    // Kiểm tra post tồn tại
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      const error = new Error('INVALID_POST_ID');
      error.status = 400;
      error.message = 'Post ID không hợp lệ';
      throw error;
    }

    const post = await Post.findById(postId).lean();
    if (!post) {
      const error = new Error('POST_NOT_FOUND');
      error.status = 404;
      error.message = 'Không tìm thấy bài viết';
      throw error;
    }

    // Tạo comment
    const comment = await Comment.create({
      postId,
      authorId,
      content
    });

    // Populate author info before returning
    const populatedComment = await Comment.findById(comment._id)
      .populate('authorId', 'name email avatar')
      .lean();

    return populatedComment;
  }
};
