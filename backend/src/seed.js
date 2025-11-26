/**
 * SEED DATA FOR DEVELOPMENT
 * File này chỉ dùng để tạo dữ liệu test
 * Xóa file này khi deploy production
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from './models/user.model.js';
import { Event } from './models/event.model.js';

const seedRouter = express.Router();

seedRouter.post('/seed', async (req, res) => {
  try {
    // Xóa dữ liệu cũ (optional - uncomment nếu muốn reset)
    // await Event.deleteMany({});
    // await User.deleteMany({});

    // Tạo user mẫu
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    let user = await User.findOne({ email: 'admin@test.com' });
    if (!user) {
      user = await User.create({
        email: 'admin@test.com',
        passwordHash: hashedPassword,
        name: 'Admin Test',
        roles: ['VOLUNTEER', 'MANAGER'],
      });
    }
    
    // Tạo thêm user MANAGER để test
    let manager = await User.findOne({ email: 'manager@test.com' });
    if (!manager) {
      manager = await User.create({
        email: 'manager@test.com',
        passwordHash: hashedPassword,
        name: 'Manager Test',
        roles: ['MANAGER'],
      });
    }

    // Tạo events mẫu
    const eventsData = [
      {
        title: 'Dọn Dẹp Bãi Biển Mỹ Khê 🏖️',
        description: 'Cùng nhau làm sạch bãi biển Mỹ Khê. Hoạt động bao gồm nhặt rác, phân loại và tái chế. Mang theo găng tay và tinh thần tích cực!',
        category: 'environment',
        location: {
          city: 'Đà Nẵng',
          address: 'Bãi biển Mỹ Khê, Đà Nẵng',
          geo: {
            type: 'Point',
            coordinates: [108.2425, 16.0544] // [lng, lat]
          }
        },
        time: {
          start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 ngày
          end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000) // +4 giờ
        },
        capacity: 50,
        status: 'PUBLISHED',
        managerId: user._id,
        stats: {
          registrations: 15,
          approved: 12,
          posts: 0,
          likes: 8
        },
        coverUrl: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800'
      },
      {
        title: 'Trồng Cây Xanh Công Viên 29/3 🌳',
        description: 'Chương trình trồng 100 cây xanh tại công viên 29/3. Tạo không gian xanh cho thành phố. Các dụng cụ sẽ được cung cấp.',
        category: 'environment',
        location: {
          city: 'Đà Nẵng',
          address: 'Công viên 29/3, Hải Châu, Đà Nẵng',
          geo: {
            type: 'Point',
            coordinates: [108.2194, 16.0471]
          }
        },
        time: {
          start: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // +14 ngày
          end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000)
        },
        capacity: 30,
        status: 'PUBLISHED',
        managerId: user._id,
        stats: {
          registrations: 8,
          approved: 6,
          posts: 0,
          likes: 5
        },
        coverUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800'
      },
      {
        title: 'Phát Cơm Từ Thiện Cho Người Vô Gia Cư 🍲',
        description: 'Phát 200 suất ăn miễn phí cho người vô gia cư tại khu vực trung tâm. Cần tình nguyện viên hỗ trợ chuẩn bị và phát suất ăn.',
        category: 'community',
        location: {
          city: 'Đà Nẵng',
          address: 'Trung tâm Cộng đồng, Hải Châu, Đà Nẵng',
          geo: {
            type: 'Point',
            coordinates: [108.2022, 16.0678]
          }
        },
        time: {
          start: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // +3 ngày
          end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000)
        },
        capacity: 20,
        status: 'PUBLISHED',
        managerId: user._id,
        stats: {
          registrations: 18,
          approved: 15,
          posts: 0,
          likes: 22
        },
        coverUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800'
      },
      {
        title: 'Dạy Tiếng Anh Miễn Phí Cho Trẻ Em 📚',
        description: 'Chương trình dạy tiếng Anh cơ bản cho trẻ em vùng khó khăn. Yêu cầu tình nguyện viên có kiến thức tiếng Anh giao tiếp.',
        category: 'education',
        location: {
          city: 'Đà Nẵng',
          address: 'Trung tâm Văn hóa Thanh niên, Thanh Khê, Đà Nẵng',
          geo: {
            type: 'Point',
            coordinates: [108.1839, 16.0678]
          }
        },
        time: {
          start: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // +10 ngày
          end: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000)
        },
        capacity: 15,
        status: 'PUBLISHED',
        managerId: user._id,
        stats: {
          registrations: 10,
          approved: 8,
          posts: 0,
          likes: 12
        },
        coverUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800'
      },
      {
        title: 'Chăm Sóc Động Vật Hoang Dã 🐾',
        description: 'Tham gia chăm sóc và bảo vệ động vật hoang dã tại trung tâm cứu hộ. Hoạt động bao gồm cho ăn, vệ sinh chuồng trại.',
        category: 'animal',
        location: {
          city: 'Đà Nẵng',
          address: 'Trung tâm Cứu hộ Động vật, Hòa Vang, Đà Nẵng',
          geo: {
            type: 'Point',
            coordinates: [108.1278, 16.0172]
          }
        },
        time: {
          start: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // +21 ngày
          end: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000)
        },
        capacity: 12,
        status: 'PUBLISHED',
        managerId: user._id,
        stats: {
          registrations: 6,
          approved: 5,
          posts: 0,
          likes: 9
        },
        coverUrl: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=800'
      },
      {
        title: 'Hiến Máu Nhân Đạo ❤️',
        description: 'Ngày hội hiến máu tình nguyện. Mỗi đơn vị máu có thể cứu sống 3 người. Hãy tham gia để lan tỏa yêu thương!',
        category: 'health',
        location: {
          city: 'Đà Nẵng',
          address: 'Bệnh viện C Đà Nẵng, Hải Châu, Đà Nẵng',
          geo: {
            type: 'Point',
            coordinates: [108.2119, 16.0750]
          }
        },
        time: {
          start: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // +5 ngày
          end: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000)
        },
        capacity: 100,
        status: 'PUBLISHED',
        managerId: user._id,
        stats: {
          registrations: 45,
          approved: 40,
          posts: 0,
          likes: 67
        },
        coverUrl: 'https://images.unsplash.com/photo-1615461066159-fea0960485d5?w=800'
      }
    ];

    // Xóa events cũ của user test (nếu có)
    await Event.deleteMany({ managerId: user._id });

    // Tạo events mới
    const createdEvents = await Event.insertMany(eventsData);

    res.json({
      success: true,
      message: `✅ Đã tạo ${createdEvents.length} events mẫu`,
      data: {
        user: {
          email: user.email,
          password: '123456', // Password mặc định
          name: user.name
        },
        eventsCreated: createdEvents.length,
        events: createdEvents.map(e => ({
          id: e._id,
          title: e.title,
          status: e.status,
          start: e.time.start
        }))
      }
    });

  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint để xóa tất cả dữ liệu test
seedRouter.delete('/seed', async (req, res) => {
  try {
    const user = await User.findOne({ email: 'admin@test.com' });
    if (user) {
      await Event.deleteMany({ managerId: user._id });
      await User.deleteOne({ _id: user._id });
    }

    res.json({
      success: true,
      message: '✅ Đã xóa tất cả dữ liệu test'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default seedRouter;
