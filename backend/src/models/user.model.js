import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email:        { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  name:         { type: String, default: '' },
  roles:        { type: [String], default: ['VOLUNTEER'] },
  status:       { type: String, default: 'ACTIVE' }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
