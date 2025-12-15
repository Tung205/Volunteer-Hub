import { ChannelService } from '../services/channel.service.js';

export const ChannelController = {
  /**
   * GET /channels/:cid/posts
   * Lấy danh sách posts của channel với phân trang
   */
  async getPosts(req, res) {
    try {
      const { cid } = req.params;
      const { page, limit } = req.query;

      const result = await ChannelService.getPostsByChannel(cid, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10
      });

      return res.json(result);
    } catch (e) {
      if (e.status) {
        return res.status(e.status).json({ error: e.message });
      }
      console.error('ChannelController.getPosts error:', e);
      return res.status(500).json({ error: 'INTERNAL' });
    }
  },

  /**
   * POST /channels/:cid/posts
   * Tạo bài viết mới trong channel
   */
  async createPost(req, res) {
    try {
      const { cid } = req.params;
      const authorId = req.user.id;
      const { content, attachments } = req.body;

      const post = await ChannelService.createPost(cid, authorId, {
        content,
        attachments
      });

      return res.status(201).json({ post });
    } catch (e) {
      if (e.status) {
        return res.status(e.status).json({ error: e.message });
      }
      console.error('ChannelController.createPost error:', e);
      return res.status(500).json({ error: 'INTERNAL' });
    }
  },

  /**
   * POST /channels/:cid/posts/:pid/comments
   * Tạo bình luận cho bài viết
   */
  async createComment(req, res) {
    try {
      const { pid } = req.params;
      const authorId = req.user.id;
      const { content } = req.body;

      const comment = await ChannelService.createComment(pid, authorId, {
        content
      });

      return res.status(201).json({ comment });
    } catch (e) {
      if (e.status) {
        return res.status(e.status).json({ error: e.message });
      }
      console.error('ChannelController.createComment error:', e);
      return res.status(500).json({ error: 'INTERNAL' });
    }
  }
};
