import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  eventId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  volunteerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  volunteerName:  { type: String, default: '' },
  volunteerEmail: { type: String, default: '' },
  status:         { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'], default: 'PENDING', index: true },
  registeredAt:   { type: Date, default: Date.now },
  approvedBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: { type: String, default: '', maxlength: 500 }
}, { timestamps: true });

// Một TNV không được đăng ký 2 lần vào 1 event
registrationSchema.index({ eventId: 1, volunteerId: 1 }, { unique: true });

export const Registration = mongoose.model('Registration', registrationSchema);
