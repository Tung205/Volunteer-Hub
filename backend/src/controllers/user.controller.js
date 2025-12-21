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
  },

  /**
   * GET /users (ADMIN only)
   * Lấy tất cả users để export/quản lý
   */
  async getAllUsers(req, res) {
    try {
      const users = await UserService.getAllUsers();
      return res.json({ users });
    } catch (e) {
      console.error('UserController.getAllUsers error:', e);
      return res.status(500).json({ error: 'INTERNAL' });
    }
  },

  /**
   * PATCH /users/me
   * Cập nhật profile của user đang đăng nhập
   */
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const user = await UserService.updateProfile(userId, req.body);

      return res.json({ user });
    } catch (e) {
      if (e.status) {
        return res.status(e.status).json({ error: e.message });
      }
      console.error('UserController.updateProfile error:', e);
      return res.status(500).json({ error: 'INTERNAL' });
    }
  },

  /**
   * GET /users/:id
   * Lấy profile rút gọn của user khác (MANAGER/ADMIN)
   */
  async getPublicProfile(req, res) {
    try {
      const { id } = req.params;
      const user = await UserService.getPublicProfile(id);

      return res.json({ user });
    } catch (e) {
      if (e.status) {
        return res.status(e.status).json({ error: e.message });
      }
      console.error('UserController.getPublicProfile error:', e);
      return res.status(500).json({ error: 'INTERNAL' });
    }
  }
};
