// /**
//  * SEED DATA FOR DEVELOPMENT
//  * File này chỉ dùng để tạo dữ liệu test
//  * Xóa file này khi deploy production
//  */

// import express from 'express';
// import bcrypt from 'bcryptjs';
// import { User } from './models/user.model.js';
// import { Event } from './models/event.model.js';

// const seedRouter = express.Router();

// seedRouter.post('/seed', async (req, res) => {
//   // Only allow in development mode
//   if (process.env.NODE_ENV !== 'development') {
//     return res.status(403).json({ 
//       error: 'FORBIDDEN', 
//       message: 'Seed endpoint is only available in development mode' 
//     });
//   }

//   try {
//     // Tạo user mẫu
//     const hashedPassword = await bcrypt.hash('123456', 10);
    
//     let user = await User.findOne({ email: 'admin@test.com' });
//     if (!user) {
//       user = await User.create({
//         email: 'admin@test.com',
//         passwordHash: hashedPassword,
//         name: 'Admin Test',
//         roles: ['VOLUNTEER', 'MANAGER', 'ADMIN'],
//       });
//     }
    
//     // Tạo thêm user MANAGER để test
//     let manager = await User.findOne({ email: 'manager@test.com' });
//     if (!manager) {
//       manager = await User.create({
//         email: 'manager@test.com',
//         passwordHash: hashedPassword,
//         name: 'Manager Test',
//         roles: ['MANAGER'],
//       });
//     }

//     // Tạo events mẫu theo model mới
//     const eventsData = [
//       {
//         title: 'Dọn Dẹp Bãi Biển Mỹ Khê 🏖️',
//         description: 'Cùng nhau làm sạch bãi biển Mỹ Khê. Hoạt động bao gồm nhặt rác, phân loại và tái chế.',
//         location: 'Đà Nẵng',
//         address: 'Bãi biển Mỹ Khê',
//         startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//         endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
//         organizerId: user._id,
//         organizerName: user.name,
//         maxParticipants: 50,
//         currentParticipants: 15,
//         status: 'OPENED',
//         coverImageUrl: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=800'
//       },
//       {
//         title: 'Trồng Cây Xanh Công Viên 🌳',
//         description: 'Chương trình trồng 100 cây xanh. Tạo không gian xanh cho thành phố.',
//         location: 'Đà Nẵng',
//         address: 'Công viên 29/3',
//         startTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
//         endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
//         organizerId: manager._id,
//         organizerName: manager.name,
//         maxParticipants: 30,
//         currentParticipants: 8,
//         status: 'OPENED',
//         coverImageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800'
//       },
//       {
//         title: 'Phát Cơm Từ Thiện 🍲',
//         description: 'Phát 200 suất ăn miễn phí cho người vô gia cư.',
//         location: 'Đà Nẵng',
//         address: 'Trung tâm Cộng đồng, Hải Châu',
//         startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
//         endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
//         organizerId: user._id,
//         organizerName: user.name,
//         maxParticipants: 20,
//         currentParticipants: 18,
//         status: 'OPENED',
//         coverImageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800'
//       },
//       {
//         title: 'Dạy Tiếng Anh Miễn Phí 📚',
//         description: 'Chương trình dạy tiếng Anh cơ bản cho trẻ em vùng khó khăn.',
//         location: 'Hà Nội',
//         address: 'Trung tâm Văn hóa Thanh niên',
//         startTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
//         endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
//         organizerId: manager._id,
//         organizerName: manager.name,
//         maxParticipants: 15,
//         currentParticipants: 10,
//         status: 'OPENED',
//         coverImageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800'
//       }
//     ];

//     // Xóa events cũ của users test
//     await Event.deleteMany({ 
//       organizerId: { $in: [user._id, manager._id] } 
//     });

//     // Tạo events mới
//     const createdEvents = await Event.insertMany(eventsData);

//     res.json({
//       success: true,
//       message: `✅ Đã tạo ${createdEvents.length} events mẫu`,
//       data: {
//         users: [
//           { email: 'admin@test.com', password: '123456', roles: user.roles },
//           { email: 'manager@test.com', password: '123456', roles: manager.roles }
//         ],
//         eventsCreated: createdEvents.length,
//         events: createdEvents.map(e => ({
//           id: e._id,
//           title: e.title,
//           status: e.status,
//           startTime: e.startTime
//         }))
//       }
//     });

//   } catch (error) {
//     console.error('Seed error:', error);
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// // Endpoint để xóa tất cả dữ liệu test
// seedRouter.delete('/seed', async (req, res) => {
//   // Only allow in development mode
//   if (process.env.NODE_ENV !== 'development') {
//     return res.status(403).json({ 
//       error: 'FORBIDDEN', 
//       message: 'Seed endpoint is only available in development mode' 
//     });
//   }

//   try {
//     const users = await User.find({ 
//       email: { $in: ['admin@test.com', 'manager@test.com'] } 
//     });
    
//     const userIds = users.map(u => u._id);
    
//     await Event.deleteMany({ organizerId: { $in: userIds } });
//     await User.deleteMany({ _id: { $in: userIds } });

//     res.json({
//       success: true,
//       message: '✅ Đã xóa tất cả dữ liệu test'
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error.message
//     });
//   }
// });

// export default seedRouter;



//seed.js
import bcrypt from 'bcryptjs';
import { User } from './models/user.model.js';
import { Event } from './models/event.model.js';
import { Registration } from './models/registration.model.js';

function randomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function seedDatabase() {
  console.log('🌱 Seeding database...');

  // XÓA cũ cho môi trường dev, cẩn thận nếu prod
  await Promise.all([
    User.deleteMany({}),
    Event.deleteMany({}),
    Registration.deleteMany({}),
  ]);

  // ==== 1. USERS ====
  const passwordAdmin = await bcrypt.hash('Admin123!', 10);
  const passwordManager = await bcrypt.hash('Manager123!', 10);
  const passwordVolunteer = await bcrypt.hash('Volunteer123!', 10);

  const admin = await User.create({
    email: 'admin@example.com',
    passwordHash: passwordAdmin,
    name: 'Admin User',
    roles: ['ADMIN'],
  });

  const manager = await User.create({
    email: 'manager@example.com',
    passwordHash: passwordManager,
    name: 'Manager User',
    roles: ['MANAGER'],
  });

  const volunteer1 = await User.create({
    email: 'vol1@example.com',
    passwordHash: passwordVolunteer,
    name: 'Volunteer One',
    roles: ['VOLUNTEER'],
  });
  const volunteer2 = await User.create({
    email: 'vol2@example.com',
    passwordHash: passwordVolunteer,
    name: 'Volunteer Two',
    roles: ['VOLUNTEER'],
  });
  const volunteer3 = await User.create({
    email: 'vol3@example.com',
    passwordHash: passwordVolunteer,
    name: 'Volunteer Three',
    roles: ['VOLUNTEER'],
  });

  const volunteers = [volunteer1, volunteer2, volunteer3];

  // ==== 2. EVENTS ====
  const locations = ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Huế', 'Lào Cai'];
  const coverImages = [
    'https://example.com/event1.jpg',
    'https://example.com/event2.jpg',
    'https://example.com/event3.jpg',
  ];

  const events = [];
  const now = new Date();

  for (let i = 1; i <= 30; i++) {
    const startOffsetDays = i;
    const startTime = new Date(
      now.getTime() + startOffsetDays * 24 * 60 * 60 * 1000
    );
    const endTime = new Date(startTime.getTime() + 3 * 60 * 60 * 1000);

    const location = randomFromArray(locations);
    const maxParticipants =
      Math.random() < 0.3 ? 0 : randomFromArray([10, 20, 30, 50]);

    const event = await Event.create({
      title: `Sự kiện thiện nguyện #${i}`,
      description: `Mô tả chi tiết cho sự kiện thiện nguyện số ${i}.`,
      location,
      address: `${i} Đường Tình Nguyện, ${location}`,
      startTime,
      endTime,
      organizerId: manager._id,
      organizerName: manager.name,
      maxParticipants,
      currentParticipants: 0,
      status: 'OPENED',
      approvedBy: admin._id,
      approvedAt: new Date(),
      coverImageUrl: randomFromArray(coverImages),
    });

    events.push(event);
  }

  // ==== 3. REGISTRATIONS ====
  const statuses = ['PENDING', 'APPROVED', 'COMPLETED'];
  const usedPairs = new Set();
  const totalRegistrations = 30;
  const registrations = [];

  for (let i = 0; i < totalRegistrations; i++) {
    let event, volunteer, key;

    while (true) {
      event = randomFromArray(events);
      volunteer = randomFromArray(volunteers);
      key = `${event._id.toString()}-${volunteer._id.toString()}`;
      if (!usedPairs.has(key)) {
        usedPairs.add(key);
        break;
      }
    }

    const status = randomFromArray(statuses);

    const reg = await Registration.create({
      eventId: event._id,
      volunteerId: volunteer._id,
      volunteerName: volunteer.name,
      volunteerEmail: volunteer.email,
      status,
      registeredAt: new Date(),
      approvedBy:
        status === 'APPROVED' || status === 'COMPLETED' ? admin._id : undefined,
    });

    registrations.push(reg);
  }

  // update currentParticipants
  const countByEvent = {};
  registrations.forEach((reg) => {
    if (reg.status === 'APPROVED' || reg.status === 'COMPLETED') {
      const id = reg.eventId.toString();
      countByEvent[id] = (countByEvent[id] || 0) + 1;
    }
  });

  for (const [eventId, count] of Object.entries(countByEvent)) {
    await Event.updateOne(
      { _id: eventId },
      { $set: { currentParticipants: count } }
    );
  }

  console.log('✅ Seed done!');
}
