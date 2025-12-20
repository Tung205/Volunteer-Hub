import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema(
  {
    title: {            // Tên sự kiện
      type: String,
      required: true,
      trim: true,  // tự động xóa dấu cách thừa ở cuối
    },
 
    description: {      // Mô tả chi tiết (đoạn dưới trong pop-up)
      type: String,
      required: true,
    },
    location: {         // Địa điểm (Lào Cai, Hà Nội…)
      type: String,
      required: true,
      index: true,
    },
    address: {          // Địa chỉ cụ thể (optional)
      type: String,
    },
    startTime: {        // Thời gian bắt đầu
      type: Date,
      required: true,
      index: true,
    },
    endTime: {          // Thời gian kết thúc (optional)
      type: Date,
    },
    organizerId: {      // Người tổ chức sự kiện (manager)
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    organizerName: {    // Cache để show nhanh trong pop-up
      type: String,
 },

    // Quy mô / giới hạn tham gia
    maxParticipants: {
      type: Number,
      default: 0,       // 0 = không giới hạn
    },
    currentParticipants: {
      type: Number,
      default: 0,
    },

    // Trạng thái sự kiện
    status: {
      type: String,
      enum: ['PENDING', 'OPENED', 'REJECTED', 'CLOSED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },

    // Thông tin duyệt sự kiện (ADMIN)
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      maxlength: 500,
    },

    // Hiển thị trên giao diện
    coverImageUrl: {     // Ảnh phía trái các card
      type: String,
    },

    searchText: {
      type: String,
      default: "",
      select: false,
    }
  },
  {
    timestamps: true,    // createdAt, updatedAt
  }
);

// Tự động tạo searchText trước khi save
EventSchema.pre('save', function (next) {
  this.searchText = [
    this.title,
    this.location,
    // this.category,
    // (this.tags || []).join(' '),
    this.description,
  ]
    .filter(Boolean)
    .join(' ');
  next();
});

// Index cho text search
EventSchema.index({ searchText: 'text' });

export const Event = mongoose.model('Event', EventSchema);
