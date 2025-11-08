import bcrypt from 'bcryptjs';
import { User } from '../models/user.model.js';

export const AuthService = {
  async register({ email, password, name }) {
    // kiểm tra trùng email
    if (await User.exists({ email })) {
      const err = new Error('EMAIL_EXISTS'); err.status = 409; throw err;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const doc = await User.create({ email, passwordHash, name, roles: ['VOLUNTEER'] });
    return { id: doc._id.toString(), email: doc.email, name: doc.name };
  },

  async login({ email, password }) {
    // tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      const err = new Error('INVALID_CREDENTIALS'); err.status = 401; throw err;
    }

    // kiểm tra password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      const err = new Error('INVALID_CREDENTIALS'); err.status = 401; throw err;
    }

    // kiểm tra status
    if (user.status !== 'ACTIVE') {
      const err = new Error('ACCOUNT_INACTIVE'); err.status = 403; throw err;
    }

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      roles: user.roles
    };
  }
};

