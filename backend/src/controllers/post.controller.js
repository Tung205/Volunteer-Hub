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
  }
};
