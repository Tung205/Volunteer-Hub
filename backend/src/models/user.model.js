import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email:        { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  name:         { type: String, default: '' },
  roles:        { type: [String], default: ['VOLUNTEER'] },
  dateOfBirth:  { type: Date, default: null },
  gender:       { type: String, enum: ['Nam', 'Nữ', 'Khác'], default: 'Khác' },
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
