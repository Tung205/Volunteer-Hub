import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  name: { type: String, default: '' },
  roles: { type: [String], default: ['VOLUNTEER'] },
  dateOfBirth: { type: Date, default: null },
  gender: { type: String, enum: ['Nam', 'Nữ', 'Khác'], default: 'Khác' },
  status: { type: String, enum: ['active', 'inactive', 'banned'], default: 'active' },

  // Rate Limiting & Security
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },

  // Password Reset
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  lastResetEmailSentAt: { type: Date },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
