import mongoose from 'mongoose';
import Post from '../models/post.model.js';
import Comment from '../models/comment.model.js';
import Like from '../models/like.model.js';
import { UserService } from './user.service.js';

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

    // Ghi lịch sử cho user
    const postObj = await Post.findById(postId).lean();
    const postTitle = postObj?.content ? postObj.content.slice(0, 30) : '';
    await UserService.pushHistory(
      authorId,
      `Bạn đã bình luận vào một bài viết${postTitle ? ': "' + postTitle + '..."' : ''}`
    );

    // Increment commentsCount
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    // Populate author info before returning
    const populatedComment = await Comment.findById(comment._id)
      .populate('authorId', 'name email avatar')
      .lean();

    return populatedComment;
  },

  /**
   * Lấy danh sách comments của post với phân trang
   * @param {string} postId 
   * @param {Object} options - { page, limit }
   * @returns {Promise<Object>} - { comments, pagination }
   */
  async getCommentsByPost(postId, { page = 1, limit = 10 }) {
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

    // Ensure limit không vượt quá 50
    const safeLimit = Math.min(limit, 50);
    const skip = (page - 1) * safeLimit;

    const [comments, total] = await Promise.all([
      Comment.find({ postId })
        .sort({ createdAt: 1 }) // Cũ nhất trước
        .skip(skip)
        .limit(safeLimit)
        .populate('authorId', 'name email avatar')
        .lean(),
      Comment.countDocuments({ postId })
    ]);

    const totalPages = Math.ceil(total / safeLimit);

    return {
      comments,
      pagination: {
        page,
        limit: safeLimit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  },

  /**
   * Like một post (idempotent - nếu đã like thì trả về success mà không tăng counter)
   * @param {string} postId 
   * @param {string} userId 
   * @returns {Promise<Object>} - { liked: true, likes: <count> }
   */
  async likePost(postId, userId) {
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

    // Check xem đã like chưa
    const existingLike = await Like.findOne({
      targetId: postId,
      targetType: 'Post',
      userId
    }).lean();

    if (existingLike) {
      // Đã like rồi → trả về success (idempotent)
      return {
        liked: true,
        likes: post.likesCount
      };
    }

    // Tạo like record và tăng counter
    await Like.create({
      targetId: postId,
      targetType: 'Post',
      userId
    });
    console.log(`[DEBUG] likePost: Created Like for post=${postId} user=${userId}`);

    // Ghi lịch sử cho user
    const postTitle = post?.content ? post.content.slice(0, 30) : '';
    await UserService.pushHistory(
      userId,
      `Bạn đã thích một bài viết${postTitle ? ': "' + postTitle + '..."' : ''}`
    );

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $inc: { likesCount: 1 } },
      { new: true }
    ).lean();

    return {
      liked: true,
      likes: updatedPost.likesCount
    };
  },

  /**
   * Unlike một post (idempotent - nếu chưa like thì trả về success)
   * @param {string} postId 
   * @param {string} userId 
   * @returns {Promise<Object>} - { liked: false, likes: <count> }
   */
  async unlikePost(postId, userId) {
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

    // Xóa like record nếu có
    const deleted = await Like.findOneAndDelete({
      targetId: postId,
      targetType: 'Post',
      userId
    });

    // Nếu đã xóa được → update counter theo thực tế (self-healing)
    if (deleted) {
      // Ghi lịch sử cho user
      const postTitle = post?.content ? post.content.slice(0, 30) : '';
      await UserService.pushHistory(
        userId,
        `Bạn đã bỏ thích một bài viết${postTitle ? ': "' + postTitle + '..."' : ''}`
      );

      const realCount = await Like.countDocuments({ targetId: postId, targetType: 'Post' });

      const updatedPost = await Post.findByIdAndUpdate(
        postId,
        { likesCount: realCount },
        { new: true }
      ).lean();

      return {
        liked: false,
        likes: updatedPost.likesCount
      };
    }

    // Chưa like → trả về success & self-heal count
    const realCount = await Like.countDocuments({ targetId: postId, targetType: 'Post' });
    if (post.likesCount !== realCount) {
      await Post.findByIdAndUpdate(postId, { likesCount: realCount });
    }

    return {
      liked: false,
      likes: realCount
    };
  }
};
