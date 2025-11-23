import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model.js';

export const AuthService = {
  async register({ email, password, name, dateOfBirth, gender }) {
    // kiểm tra trùng email
    if (await User.exists({ email })) {
      const err = new Error('EMAIL_EXISTS'); err.status = 409; throw err;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const doc = await User.create({ email, passwordHash, name, roles: ['VOLUNTEER'], dateOfBirth, gender });
    return { id: doc._id.toString(), email: doc.email, name: doc.name, dateOfBirth: doc.dateOfBirth, gender: doc.gender };
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

    // // kiểm tra status
    // if (user.status !== 'ACTIVE') {
    //   const err = new Error('ACCOUNT_INACTIVE'); err.status = 403; throw err;
    // }

    const token = jwt.sign(
      { id: user._id, email: user.email, roles: user.roles },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      accessToken: token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        roles: user.roles
      }
    };
  }
};

