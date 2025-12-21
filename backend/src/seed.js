import bcrypt from "bcryptjs";
import { User } from "./models/user.model.js";
import { Event } from "./models/event.model.js";
import { Registration } from "./models/registration.model.js";
import Channel from "./models/channel.model.js";
import Post from "./models/post.model.js";
import Comment from "./models/comment.model.js";
import Like from "./models/like.model.js";
// Helpers
// =====================
function randomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function removeVietnameseTones(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function makeEmailFromName(fullName) {
  const clean = removeVietnameseTones(fullName).toLowerCase().trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  const last = parts[parts.length - 1] || "user";
  return `${last}@gmail.com`;
}

// ✅ Cloudinary image (ổn định, không redirect kiểu Unsplash source)
const CLOUDINARY_IMAGE =
  "https://res.cloudinary.com/dfftcie7c/image/upload/w_1200,q_auto,f_auto/v1766202863/Screenshot_2025-12-20_103843_weczaf.png";

// =====================
// Seed
// =====================
export async function seedDatabase() {
  console.log("🌱 Seeding database...");

  if (process.env.NODE_ENV && process.env.NODE_ENV !== "development") {
    throw new Error(
      `Refuse to seed in NODE_ENV=${process.env.NODE_ENV}. Set NODE_ENV=development to proceed.`
    );
  }

  await Promise.all([
    User.deleteMany({}),
    Event.deleteMany({}),
    Registration.deleteMany({}),
    Channel.deleteMany({}),
    Post.deleteMany({}),
    Comment.deleteMany({}),
    Like.deleteMany({}),
  ]);

  // =====================
  // 1) USERS
  // =====================
  const passwordAdminHash = await bcrypt.hash("Admin@123", 10);
  const passwordManagerHash = await bcrypt.hash("Manager@123", 10);
  const passwordVolunteerHash = await bcrypt.hash("Volunteer@123", 10);

  const adminName = "Trần Minh Anh";
  const admin = await User.create({
    email: makeEmailFromName(adminName),
    passwordHash: passwordAdminHash,
    name: adminName,
    roles: ["ADMIN"],
  });

  const managerNames = ["Nguyễn Thanh Tùng", "Nguyễn Đức Toàn"];
  const managers = [];
  for (const name of managerNames) {
    managers.push(
      await User.create({
        email: makeEmailFromName(name),
        passwordHash: passwordManagerHash,
        name,
        roles: ["MANAGER"],
      })
    );
  }

  const volunteerNames = [
    "Lê Thị Mai",
    "Phạm Quốc Huy",
    "Võ Hoàng Long",
    "Bùi Ngọc Linh",
  ];
  const volunteers = [];
  for (const name of volunteerNames) {
    volunteers.push(
      await User.create({
        email: makeEmailFromName(name),
        passwordHash: passwordVolunteerHash,
        name,
        roles: ["VOLUNTEER"],
      })
    );
  }

  const registrableUsers = [...volunteers, ...managers];

  // =====================
  // 2) EVENTS
  // =====================
  const locations = [
    "Hà Nội",
    "TP. Hồ Chí Minh",
    "Đà Nẵng",
    "Huế",
    "Lào Cai",
    "Quảng Ninh",
    "Cần Thơ",
  ];

  const now = new Date();

  const eventIdeas = [
    { title: "Dọn rác bãi biển – Giữ xanh đại dương", desc: "Thu gom rác, phân loại và tuyên truyền bảo vệ môi trường biển.", kw: "beach cleanup" },
    { title: "Dạy tiếng Anh cho trẻ vùng cao", desc: "Lớp học giao tiếp cơ bản, hoạt động trò chơi và luyện phát âm.", kw: "teaching kids" },
    { title: "Áo ấm cho em", desc: "Gom áo ấm, phân loại, đóng gói và trao tặng cho trẻ em khó khăn.", kw: "winter donation" },
    { title: "Bữa cơm 0 đồng", desc: "Nấu và phát suất ăn miễn phí cho người lao động, bệnh nhân khó khăn.", kw: "community meal" },
    { title: "Hiến máu nhân đạo – Giọt hồng sẻ chia", desc: "Tổ chức hiến máu và hỗ trợ điều phối người tham gia.", kw: "blood donation" },
    { title: "Trồng cây gây rừng – Một cây xanh, triệu hy vọng", desc: "Trồng cây, chăm sóc và gắn bảng tuyên truyền.", kw: "tree planting" },
    { title: "Gây quỹ sách giáo khoa cho học sinh nghèo", desc: "Quyên góp sách, đồ dùng học tập và phân phối theo trường.", kw: "school books donation" },
    { title: "Thăm và tặng quà mái ấm tình thương", desc: "Giao lưu, hỗ trợ hoạt động và tặng nhu yếu phẩm.", kw: "charity home" },
    { title: "Sửa xe miễn phí cho người lao động", desc: "Hỗ trợ kiểm tra xe, thay dầu/vá xe và tư vấn an toàn.", kw: "bike repair" },
    { title: "Chợ 0 đồng – Trao đi để nhận lại", desc: "Tổ chức gian hàng miễn phí quần áo, nhu yếu phẩm.", kw: "free market" },
    { title: "Ngày hội tái chế – Biến rác thành quà", desc: "Thu gom vật liệu tái chế, workshop làm đồ handmade.", kw: "recycling workshop" },
    { title: "Lớp kỹ năng mềm cho thanh thiếu niên", desc: "Hướng dẫn giao tiếp, làm việc nhóm, thuyết trình cơ bản.", kw: "soft skills workshop" },
    { title: "Hỗ trợ bệnh viện – Dẫn đường & chăm sóc tinh thần", desc: "Hướng dẫn thủ tục, hỗ trợ người nhà và phát nước.", kw: "hospital volunteer" },
    { title: "Chăm sóc người già tại viện dưỡng lão", desc: "Tổ chức trò chuyện, đọc sách, hoạt động vận động nhẹ.", kw: "nursing home" },
    { title: "Làm sạch công viên – Thành phố xanh", desc: "Nhặt rác, làm sạch khu vui chơi, trồng hoa.", kw: "park cleanup" },
    { title: "Tập huấn sơ cứu cơ bản cho cộng đồng", desc: "Hướng dẫn sơ cứu, xử lý tình huống khẩn cấp.", kw: "first aid training" },
    { title: "Đêm nhạc gây quỹ học bổng", desc: "Tổ chức chương trình, bán vé gây quỹ học bổng.", kw: "charity concert" },
    { title: "Hỗ trợ lớp học tình thương", desc: "Soạn bài, kèm học, tổ chức hoạt động ngoại khóa.", kw: "volunteer teaching" },
    { title: "Gom pin cũ – Bảo vệ môi trường", desc: "Thu gom pin, phân loại và chuyển đến điểm xử lý.", kw: "battery recycling" },
    { title: "Tủ quần áo miễn phí – Ai cần đến lấy", desc: "Set up tủ đồ, sắp xếp và hỗ trợ người nhận.", kw: "clothes donation" },
    { title: "Chạy bộ gây quỹ – Mỗi bước chân, một hy vọng", desc: "Sự kiện thể thao gây quỹ cho trẻ em khó khăn.", kw: "charity run" },
    { title: "Tặng suất ăn cho người vô gia cư", desc: "Chuẩn bị và phát suất ăn, nước uống buổi tối.", kw: "homeless outreach" },
    { title: "Vẽ tranh tường – Làm đẹp khu phố", desc: "Vẽ bích họa cộng đồng tại khu dân cư/trường học.", kw: "street mural" },
    { title: "Workshop hướng nghiệp cho học sinh", desc: "Chia sẻ ngành nghề, CV cơ bản, định hướng tương lai.", kw: "career workshop" },
    { title: "Thu gom đồ điện tử cũ", desc: "Thu gom, phân loại và chuyển cho đơn vị tái chế.", kw: "e-waste recycling" },
    { title: "Chia sẻ kỹ năng tin học cho người lớn tuổi", desc: "Hướng dẫn điện thoại thông minh, internet an toàn.", kw: "computer class seniors" },
    { title: "Ngày hội đọc sách – Nuôi dưỡng tri thức", desc: "Đọc sách cùng trẻ em, kể chuyện, đổi sách.", kw: "reading day" },
    { title: "Hỗ trợ nông sản – Kết nối yêu thương", desc: "Hỗ trợ đóng gói, vận chuyển nông sản đến điểm bán.", kw: "farmers market" },
    { title: "Tặng cây giống – Xanh hóa ban công", desc: "Phát cây giống, hướng dẫn chăm sóc và phân loại rác hữu cơ.", kw: "plant giveaway" },
    { title: "Sửa nhà cho hộ khó khăn", desc: "Sơn sửa nhỏ, dọn dẹp, gia cố khu vực xuống cấp.", kw: "home repair volunteer" },
  ];

  const events = [];

  for (let i = 0; i < eventIdeas.length; i++) {
    const idea = eventIdeas[i];

    const startTime = new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + 3 * 60 * 60 * 1000);

    const organizer = managers[i % managers.length];

    const event = await Event.create({
      title: idea.title,
      description: idea.desc,
      location: randomFromArray(locations),
      address: `${(i + 3) * 7} Đường Tình Nguyện`,
      startTime,
      endTime,

      organizerId: organizer._id,
      organizerName: organizer.name,

      maxParticipants: randomFromArray([10, 20, 30, 50]),
      currentParticipants: 0,

      status: "OPENED",
      approvedBy: admin._id,
      approvedAt: new Date(),

      // ✅ ĐÚNG schema: coverImageUrl
      coverImageUrl: CLOUDINARY_IMAGE,
    });

    events.push(event);
  }

  // =====================
  // 3) REGISTRATIONS
  // =====================
  const usedPairs = new Set();
  const shuffledEvents = [...events].sort(() => Math.random() - 0.5);

  for (let i = 0; i < 30; i++) {
    const event = shuffledEvents[i % shuffledEvents.length];

    let user, key;
    do {
      user = randomFromArray(registrableUsers);
      key = `${event._id}-${user._id}`;
    } while (usedPairs.has(key));

    usedPairs.add(key);

    const status =
      Math.random() < 0.15 ? "PENDING" : randomFromArray(["APPROVED", "COMPLETED"]);

    await Registration.create({
      eventId: event._id,
      volunteerId: user._id,
      volunteerName: user.name,
      volunteerEmail: user.email,
      status,
      registeredAt: new Date(),
      approvedBy:
        status === "APPROVED" || status === "COMPLETED" ? admin._id : undefined,
    });
  }

  console.log("✅ Seed done!");
  console.log(`Admin: ${admin.email} / Admin@123`);
  console.log(
    `Managers: ${managers.map((m) => `${m.email} / Manager@123`).join(" | ")}`
  );
  console.log(
    `Volunteers: ${volunteers.map((v) => `${v.email} / Volunteer@123`).join(" | ")}`
  );
}
