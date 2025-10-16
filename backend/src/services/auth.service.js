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
  }
};

