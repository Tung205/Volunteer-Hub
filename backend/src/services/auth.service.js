import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/user.model.js';
import { EmailService } from './email.service.js';
import { UserService } from './user.service.js';


export const AuthService = {
  async register({ email, password, name, dateOfBirth, gender }) {
    // kiểm tra trùng email
    if (await User.exists({ email })) {
      const err = new Error('EMAIL_EXISTS'); err.status = 409; throw err;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const doc = await User.create({ email, passwordHash, name, roles: ['VOLUNTEER'], dateOfBirth, gender });
    // Ghi lịch sử cho user
    await UserService.pushHistory(
      doc._id,
      'Bạn đã đăng ký tài khoản thành công'
    );
    return { id: doc._id.toString(), email: doc.email, name: doc.name, dateOfBirth: doc.dateOfBirth, gender: doc.gender };
  },

  async login({ email, password }) {
    // tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      const err = new Error('INVALID_CREDENTIALS'); err.status = 401; throw err;
    }

    // Check Lockout
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const err = new Error('ACCOUNT_LOCKED');
      err.status = 403;
      err.message = 'Tài khoản tạm khóa do đăng nhập sai nhiều lần. Vui lòng thử lại sau 1 phút.';
      throw err;
    }

    // kiểm tra password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      // Increment login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= 3) {
        user.lockUntil = Date.now() + 60 * 1000; // Lock for 1 minute
      }
      await user.save();

      const err = new Error('INVALID_CREDENTIALS'); err.status = 401; throw err;
    }

    // Reset attempts on success
    if (user.loginAttempts > 0 || user.lockUntil) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();
    }

    // Check status
    if (user.status !== 'active') {
      const err = new Error('ACCOUNT_RESTRICTED');
      err.status = 403;
      err.message = 'Tài khoản của bạn đang bị hạn chế';
      throw err;
    }

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
  },

  async forgotPassword(email, authUser = null) {
    let user;

    if (authUser) {
      // If authenticated, target the logged-in user
      user = await User.findById(authUser.id);
      if (!user) {
        const err = new Error('USER_NOT_FOUND'); err.status = 404; throw err;
      }
    } else {
      // If not authenticated, must provide registered email
      user = await User.findOne({ email });
      if (!user) {
        const err = new Error('USER_NOT_FOUND'); err.status = 404; throw err;
      }
    }

    // Rate limiting: 1 minute
    if (user.lastResetEmailSentAt && (Date.now() - user.lastResetEmailSentAt) < 60 * 1000) {
      const err = new Error('RATE_LIMIT_EXCEEDED');
      err.status = 429;
      err.message = 'Vui lòng đợi 1 phút trước khi yêu cầu mã mới.'; // Added message from original
      throw err;
    }

    // Generate 6 digit code
    const code = crypto.randomInt(100000, 999999).toString();

    // Save to user (hash it ideally, but strict time/demo constraints maybe plain for now matches prev logic)
    user.resetPasswordToken = code;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins
    user.lastResetEmailSentAt = Date.now();
    await user.save();

    // Send email to the PROVIDED email (allow sending to custom email if auth)
    // If not auth, email === user.email anyway.
    await EmailService.sendEmail(email, "Mã xác nhận đặt lại mật khẩu", `Mã của bạn là: <b>${code}</b>`);

    return { message: 'Email sent' };
  },

  async resetPassword({ email, code, newPassword }, authUser = null) {
    let user;

    if (authUser) {
      user = await User.findById(authUser.id);
      console.log("Resetting for Auth User:", user?._id);
    } else {
      user = await User.findOne({ email });
      console.log("Resetting for Email User:", user?._id);
    }

    if (!user) {
      const err = new Error('USER_NOT_FOUND'); err.status = 404; throw err;
    }

    console.log(`Verifying Code: Received '${code}' vs Stored '${user.resetPasswordToken}'`);
    console.log(`Expiry: Now ${Date.now()} vs Exp ${user.resetPasswordExpires}`);

    if (user.resetPasswordToken !== code || user.resetPasswordExpires < Date.now()) {
      const err = new Error('INVALID_TOKEN'); err.status = 400; throw err;
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { message: "Password updated" };
  }
};
