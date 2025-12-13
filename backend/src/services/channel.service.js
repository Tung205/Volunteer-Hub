import mongoose from 'mongoose';
import Channel from '../models/channel.model.js';
import Post from '../models/post.model.js';

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
  }
};
