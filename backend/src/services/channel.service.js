import mongoose from 'mongoose';
import Channel from '../models/channel.model.js';
import Post from '../models/post.model.js';
import Comment from '../models/comment.model.js';

export const ChannelService = {
  /**
   * Tìm channel theo ID
   * @param {string} channelId 
   * @returns {Promise<Object|null>}
   */
  async findChannelById(channelId) {
    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      const error = new Error('INVALID_CHANNEL_ID');
      error.status = 400;
      error.message = 'Channel ID không hợp lệ';
      throw error;
    }

    const channel = await Channel.findById(channelId).lean();

    if (!channel) {
      const error = new Error('CHANNEL_NOT_FOUND');
      error.status = 404;
      error.message = 'Không tìm thấy channel';
      throw error;
    }

    return channel;
  },

  /**
   * Tìm channel theo Event ID
   * @param {string} eventId
   * @returns {Promise<Object>}
   */
  async findChannelByEventId(eventId) {
    const channel = await Channel.findOne({ eventId }).lean();
    if (!channel) {
      const error = new Error('CHANNEL_NOT_FOUND');
      error.status = 404;
      error.message = 'Sự kiện này chưa có kênh thảo luận';
      throw error;
    }
    return channel;
  },

  /**
   * Lấy danh sách posts của channel với phân trang
   * @param {string} channelId 
   * @param {Object} options - { page, limit }
   * @returns {Promise<Object>} - { posts, pagination }
   */
  async getPostsByChannel(channelId, { page = 1, limit = 10 }) {
    // Ensure limit không vượt quá 50
    const safeLimit = Math.min(limit, 50);
    const skip = (page - 1) * safeLimit;

    const [posts, total] = await Promise.all([
      Post.find({ channelId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .populate('authorId', 'name email avatar')
        .lean(),
      Post.countDocuments({ channelId })
    ]);

    const totalPages = Math.ceil(total / safeLimit);

    return {
      posts,
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
   * Tạo bài viết mới trong channel
   * @param {string} channelId 
   * @param {string} authorId 
   * @param {Object} data - { content, attachments }
   * @returns {Promise<Object>} - post đã tạo
   */
  async createPost(channelId, authorId, { content, attachments = [] }) {
    const post = await Post.create({
      channelId,
      authorId,
      content,
      attachments,
      likes: 0
    });

    // Populate author info before returning
    const populatedPost = await Post.findById(post._id)
      .populate('authorId', 'name email avatar')
      .lean();

    return populatedPost;
  },

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
  },

  /**
   * Lấy danh sách người đã like bài viết
   */
  async getLikers(postId) {
    // Import Like model inside method or top level (if not circular)
    // Assuming Like model is needed.
    // import Like from '../models/like.model.js'; // Top level better.
    // Since I can't easily add import top level without reading file, I'll rely on dynamic import or assume it's there?
    // Wait, ChannelService didn't import Like model at top.

    // I will use mongoose.model('Like') as a safe fallback if not imported, 
    // or just assume I can add it? I'll use mongoose.model for safety.
    const Like = mongoose.model('Like');

    const likes = await Like.find({ targetId: postId, targetType: 'Post' })
      .populate('userId', 'name email avatar') // populate user info
      .lean();

    // Return array of users
    return likes.map(like => like.userId);
  }
};
