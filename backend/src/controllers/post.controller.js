import { PostService } from '../services/post.service.js';

export const PostController = {
  /**
   * POST /posts/:pid/comments
   * Tạo bình luận cho bài viết
   */
  async createComment(req, res) {
    try {
      const { pid } = req.params;
      const authorId = req.user.id;
      const { content } = req.body;

      const comment = await PostService.createComment(pid, authorId, {
        content
      });

      return res.status(201).json({ comment });
    } catch (e) {
      if (e.status) {
        return res.status(e.status).json({ error: e.message });
      }
      console.error('PostController.createComment error:', e);
      return res.status(500).json({ error: 'INTERNAL' });
    }
  },

  /**
   * GET /posts/:pid/comments
   * Lấy danh sách comments của post với phân trang
   */
  async getComments(req, res) {
    try {
      const { pid } = req.params;
      const { page, limit } = req.query;

      const result = await PostService.getCommentsByPost(pid, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10
      });

      return res.json(result);
    } catch (e) {
      if (e.status) {
        return res.status(e.status).json({ error: e.message });
      }
      console.error('PostController.getComments error:', e);
      return res.status(500).json({ error: 'INTERNAL' });
    }
  },

  /**
   * POST /posts/:pid/like
   * Like một bài viết
   */
  async likePost(req, res) {
    try {
      const { pid } = req.params;
      const userId = req.user.id;

      const result = await PostService.likePost(pid, userId);

      return res.json(result);
    } catch (e) {
      if (e.status) {
        return res.status(e.status).json({ error: e.message });
      }
      console.error('PostController.likePost error:', e);
      return res.status(500).json({ error: 'INTERNAL' });
    }
  },

  /**
   * DELETE /posts/:pid/like
   * Bỏ like một bài viết
   */
  async unlikePost(req, res) {
    try {
      const { pid } = req.params;
      const userId = req.user.id;

      const result = await PostService.unlikePost(pid, userId);

      return res.json(result);
    } catch (e) {
      if (e.status) {
        return res.status(e.status).json({ error: e.message });
      }
      console.error('PostController.unlikePost error:', e);
      return res.status(500).json({ error: 'INTERNAL' });
    }
  }
};
