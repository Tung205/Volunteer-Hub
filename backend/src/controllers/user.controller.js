import { UserService } from '../services/user.service.js';

export const UserController = {
  /**
   * GET /users/me
   * Lấy profile của user đang đăng nhập
   */
  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const user = await UserService.getUserById(userId);

      return res.json({ user });
    } catch (e) {
      if (e.status) {
        return res.status(e.status).json({ error: e.message });
      }
      console.error('UserController.getProfile error:', e);
      return res.status(500).json({ error: 'INTERNAL' });
    }
  }
};
