
//seed.js
import bcrypt from 'bcryptjs';
import { User } from './models/user.model.js';
import { Event } from './models/event.model.js';
import { Registration } from './models/registration.model.js';
import Channel from './models/channel.model.js';
import Post from './models/post.model.js';
import Comment from './models/comment.model.js';
import Like from './models/like.model.js';

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
    Channel.deleteMany({}),
    Post.deleteMany({}),
    Comment.deleteMany({}),
    Like.deleteMany({}),
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

  // ==== 4. CHANNELS (cho mỗi event OPENED) ====
  const channels = [];
  for (const event of events) {
    const channel = await Channel.create({
      eventId: event._id,
    });
    channels.push({ channel, event });
  }

  // ==== 5. POSTS (2-3 posts cho 5 channels đầu) ====
  const postContents = [
    'Chào mọi người! Rất vui được tham gia sự kiện này 🎉',
    'Mình có thể đến sớm 30 phút để chuẩn bị được không ạ?',
    'Cảm ơn ban tổ chức đã tạo cơ hội cho chúng mình!',
    'Hôm nay thời tiết đẹp quá, rất mong chờ sự kiện!',
    'Mọi người nhớ mang theo nước uống nhé!',
  ];

  const posts = [];
  for (let i = 0; i < 5 && i < channels.length; i++) {
    const { channel } = channels[i];
    
    // Lấy volunteers đã APPROVED cho event này
    const approvedRegs = registrations.filter(
      r => r.eventId.toString() === channel.eventId.toString() && 
           (r.status === 'APPROVED' || r.status === 'COMPLETED')
    );
    
    // Tạo 2-3 posts cho mỗi channel
    const numPosts = 2 + Math.floor(Math.random() * 2);
    for (let j = 0; j < numPosts; j++) {
      const author = approvedRegs.length > 0 
        ? volunteers.find(v => v._id.toString() === approvedRegs[j % approvedRegs.length]?.volunteerId.toString()) || manager
        : manager;
      
      const post = await Post.create({
        channelId: channel._id,
        authorId: author._id,
        content: randomFromArray(postContents),
        attachments: [],
        likes: 0,
      });
      posts.push(post);
    }
  }

  // ==== 6. COMMENTS (2-4 comments cho mỗi post) ====
  const commentContents = [
    'Đồng ý ạ!',
    'Mình cũng thế 😊',
    'Tuyệt vời quá!',
    'Cảm ơn bạn đã chia sẻ!',
    'Mình sẽ nhớ!',
    'Hay quá!',
  ];

  for (const post of posts) {
    const numComments = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numComments; i++) {
      const author = randomFromArray([...volunteers, manager]);
      await Comment.create({
        postId: post._id,
        authorId: author._id,
        content: randomFromArray(commentContents),
      });
    }
  }

  // ==== 7. LIKES (random likes cho posts) ====
  for (const post of posts) {
    const likers = volunteers.filter(() => Math.random() > 0.5);
    for (const liker of likers) {
      await Like.create({
        postId: post._id,
        userId: liker._id,
      });
    }
    // Update likes count
    const likeCount = await Like.countDocuments({ postId: post._id });
    await Post.updateOne({ _id: post._id }, { $set: { likes: likeCount } });
  }

  console.log('✅ Seed done!');
  console.log(`   - Users: 5`);
  console.log(`   - Events: ${events.length}`);
  console.log(`   - Registrations: ${registrations.length}`);
  console.log(`   - Channels: ${channels.length}`);
  console.log(`   - Posts: ${posts.length}`);
}

/* Restart database
docker compose exec mongo mongosh -u root -p root123 \
  --authenticationDatabase admin volunteerhub \
  --quiet --eval "db.dropDatabase()"
docker compose restart backend && sleep 5 && docker compose logs backend --tail=20
*/