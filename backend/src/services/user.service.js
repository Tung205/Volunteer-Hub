import { User } from '../models/user.model.js';

export const UserService = {
  /**
   * Lấy thông tin user theo ID
   * @param {string} userId 
   * @returns {Promise<Object>} - user object (không có passwordHash)
   */
  async getUserById(userId) {
    const user = await User.findById(userId)
      .select('-passwordHash')
      .lean();

    if (!user) {
      const error = new Error('USER_NOT_FOUND');
      error.status = 404;
      error.message = 'Không tìm thấy người dùng';
      throw error;
    }

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      createdAt: user.createdAt
    };
  },

  /**
   * Cập nhật profile user
   * @param {string} userId 
   * @param {Object} data - { name?, dateOfBirth?, gender? }
   * @returns {Promise<Object>} - user object đã cập nhật
   */
  async updateProfile(userId, data) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, runValidators: true }
    ).select('-passwordHash').lean();

    if (!user) {
      const error = new Error('USER_NOT_FOUND');
      error.status = 404;
      error.message = 'Không tìm thấy người dùng';
      throw error;
    }

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      createdAt: user.createdAt
    };
  }
};
