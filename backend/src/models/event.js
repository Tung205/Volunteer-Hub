import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title:        { type: String, required: true },
  description:  { type: String, default: '' },
  category:     { type: String, default: '' }, // ví dụ: environment/community
  location: {
    city:       { type: String, index: true },
    address:    { type: String, default: '' },
    geo: {
      type:        { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: undefined } // [lng, lat]
    }
  },
  time: {
    start:      { type: Date, required: true },
    end:        { type: Date, required: true }
  },
  capacity:     { type: Number, default: 0 },
  status:       { type: String, enum: ['DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED'], default: 'DRAFT' },
  managerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stats: {
    registrations: { type: Number, default: 0 },
    approved:      { type: Number, default: 0 },
    posts:         { type: Number, default: 0 },
    likes:         { type: Number, default: 0 }
  },
  coverUrl:     { type: String, default: '' }
}, { timestamps: true });

// Indexes
eventSchema.index({ status: 1, 'time.start': 1 });
eventSchema.index({ 'location.city': 1 });
eventSchema.index({ title: 'text', description: 'text' });
eventSchema.index({ 'location.geo': '2dsphere' });

export const Event = mongoose.model('Event', eventSchema);
