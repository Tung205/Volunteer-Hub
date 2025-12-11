import React, { useState } from 'react';
import { MapPin, Heart, MessageCircle, Share2, MoreHorizontal, Image as ImageIcon, Send, ShieldCheck, Clock } from 'lucide-react';

// 1. Dữ liệu giả lập (Mock Data) - Sau này bạn sẽ thay thế bằng dữ liệu từ API
const MOCK_EVENT = {
  id: 1,
  name: "Chiến dịch Mùa Hè Xanh 2025",
  coverImage: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=1474&auto=format&fit=crop", // Ảnh nền sự kiện
  description: "Đây là nhóm chính thức để trao đổi thông tin về chiến dịch Mùa Hè Xanh. Các tình nguyện viên vui lòng cập nhật thông tin tại đây.",
  location: "Hà Nội, Việt Nam",
  address: "Đại học Bách Khoa, Số 1 Đại Cồ Việt",
  memberCount: 234
};

// Giả lập người dùng đang đăng nhập
const CURRENT_USER = {
  id: 99,
  name: "Nguyễn Văn A",
  avatar: "https://ui-avatars.com/api/?name=Nguyen+Van+A&background=random",
  role: "manager" // Thử đổi thành 'manager' để thấy sự khác biệt khi đăng bài
};

const GroupPage = () => {
  // --- STATE MANAGEMENT ---
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "Trần Quản Lý",
      role: "manager",
      avatar: "https://ui-avatars.com/api/?name=Tran+Quan+Ly&background=0D8ABC&color=fff",
      content: "Chào mừng mọi người đến với nhóm! Hãy đọc kỹ quy định nhé.",
      image: null,
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 tiếng trước
      likes: 15,
      comments: 2,
      status: "approved"
    },
    {
      id: 2,
      author: "Lê Tình Nguyện",
      role: "volunteer",
      avatar: "https://ui-avatars.com/api/?name=Le+Tinh+Nguyen&background=random",
      content: "Mọi người ơi cho mình hỏi lịch tập trung hôm nay ở đâu ạ?",
      image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=500&auto=format&fit=crop",
      timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 tiếng trước
      likes: 5,
      comments: 4,
      status: "approved"
    }
  ]);

  const [newPostContent, setNewPostContent] = useState("");

  // --- HANDLERS ---

  // Xử lý đăng bài mới
  const handlePostSubmit = () => {
    if (!newPostContent.trim()) return;

    const newPost = {
      id: Date.now(),
      author: CURRENT_USER.name,
      role: CURRENT_USER.role,
      avatar: CURRENT_USER.avatar,
      content: newPostContent,
      image: null, // Ở đây tạm thời chưa xử lý upload ảnh thật
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
      // Logic duyệt bài: Manager đăng thì hiện luôn, Volunteer thì phải chờ
      status: CURRENT_USER.role === 'manager' ? 'approved' : 'pending'
    };

    // Thêm bài mới vào đầu danh sách
    setPosts([newPost, ...posts]);
    setNewPostContent("");
    
    if (newPost.status === 'pending') {
      alert("Bài viết của bạn đã được gửi và đang chờ Quản lý duyệt!");
    }
  };

  // Xử lý Like (Đơn giản hóa)
  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  // --- RENDER HELPERS ---
  
  // Format thời gian hiển thị
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " " + date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5]"> {/* Màu nền đặc trưng Facebook */}
      
      {/* 1. COVER AREA */}
      <div className="bg-white shadow-sm mb-4">
        <div className="max-w-6xl mx-auto">
          {/* Ảnh bìa */}
          <div className="relative h-[350px] w-full rounded-b-xl overflow-hidden">
            <img 
              src={MOCK_EVENT.coverImage} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Thông tin Header */}
          <div className="px-8 py-4 pb-0">
            <h1 className="text-3xl font-bold text-gray-900">{MOCK_EVENT.name}</h1>
            <p className="text-gray-500 font-medium mt-1">Nhóm công khai · {MOCK_EVENT.memberCount} thành viên</p>
            
            {/* Tabs Navigation (Giống hình ảnh) */}
            <div className="flex items-center gap-1 mt-6 border-t border-gray-300">
              {['Thảo luận', 'Đáng chú ý', 'Mọi người', 'File phương tiện'].map((tab, index) => (
                <button 
                  key={index}
                  className={`px-4 py-4 font-semibold text-sm ${index === 0 ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-100 rounded-lg'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN GRID LAYOUT */}
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* === LEFT COLUMN: FEED === */}
        <div className="md:col-span-2 space-y-4">
          
          {/* Box Đăng bài */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex gap-3 mb-3">
              <img src={CURRENT_USER.avatar} alt="Me" className="w-10 h-10 rounded-full" />
              <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 hover:bg-gray-200 cursor-text">
                <input 
                  type="text" 
                  className="w-full bg-transparent outline-none text-gray-700"
                  placeholder={`${CURRENT_USER.name} ơi, bạn đang nghĩ gì thế?`}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePostSubmit()}
                />
              </div>
            </div>
            <div className="border-t pt-3 flex justify-between items-center">
              <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg text-gray-600 text-sm font-medium">
                <ImageIcon className="text-green-500 w-5 h-5" /> Ảnh/Video
              </button>
              <button 
                onClick={handlePostSubmit}
                className="bg-blue-600 text-white px-6 py-1.5 rounded-md font-semibold hover:bg-blue-700 transition"
              >
                Đăng
              </button>
            </div>
          </div>

          {/* Danh sách bài viết */}
          {posts.map((post) => {
            // Chỉ hiển thị bài pending nếu là chính chủ (để họ biết) hoặc là manager (để duyệt)
            // Ở đây tôi làm đơn giản: Manager thấy hết, Volunteer chỉ thấy bài approved + bài pending của chính mình
            if (post.status === 'pending' && post.author !== CURRENT_USER.name && CURRENT_USER.role !== 'manager') return null;

            return (
              <div key={post.id} className={`bg-white rounded-lg shadow p-4 ${post.status === 'pending' ? 'border-2 border-yellow-200' : ''}`}>
                
                {/* Header bài viết */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-3">
                    <img src={post.avatar} alt={post.author} className="w-10 h-10 rounded-full" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{post.author}</h3>
                        {post.role === 'manager' && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                            <ShieldCheck size={12} /> Quản trị viên
                          </span>
                        )}
                      </div>
                      <div className="text-gray-500 text-xs flex items-center gap-1">
                        {formatTime(post.timestamp)} · <span className="font-bold">Công khai</span>
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full">
                    <MoreHorizontal />
                  </button>
                </div>

                {/* Nội dung bài viết */}
                {post.status === 'pending' && (
                  <div className="bg-yellow-50 text-yellow-800 text-sm p-2 rounded mb-3 flex items-center gap-2">
                    <Clock size={16} /> Bài viết đang chờ Quản trị viên phê duyệt
                  </div>
                )}
                
                <p className="text-gray-800 mb-3 whitespace-pre-wrap">{post.content}</p>
                
                {post.image && (
                  <div className="mb-3 -mx-4">
                    <img src={post.image} alt="Post content" className="w-full h-auto object-cover max-h-[500px]" />
                  </div>
                )}

                {/* Footer tương tác */}
                <div className="flex justify-between items-center text-gray-500 text-sm mb-3">
                  <span>{post.likes} lượt thích</span>
                  <span>{post.comments} bình luận</span>
                </div>
                
                <div className="border-t pt-2 flex justify-between">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className="flex-1 flex justify-center items-center gap-2 py-2 hover:bg-gray-100 rounded-lg text-gray-600 font-medium"
                  >
                    <Heart size={20} /> Thích
                  </button>
                  <button className="flex-1 flex justify-center items-center gap-2 py-2 hover:bg-gray-100 rounded-lg text-gray-600 font-medium">
                    <MessageCircle size={20} /> Bình luận
                  </button>
                  <button className="flex-1 flex justify-center items-center gap-2 py-2 hover:bg-gray-100 rounded-lg text-gray-600 font-medium">
                    <Share2 size={20} /> Chia sẻ
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* === RIGHT COLUMN: SIDEBAR INFO === */}
        <div className="md:col-span-1 space-y-4">
          
          {/* Box Giới thiệu (About) */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Giới thiệu</h2>
            
            <p className="text-gray-700 text-sm mb-4">
              {MOCK_EVENT.description}
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="text-gray-500 mt-1 w-6 h-6" />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{MOCK_EVENT.location}</h4>
                  <p className="text-gray-500 text-xs">{MOCK_EVENT.address}</p>
                </div>
              </div>
              
              {/* Giả lập Map (chỉ là ảnh placeholder) */}
              <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-xs">
                [Bản đồ hiển thị tại đây]
              </div>
            </div>
          </div>

          {/* Box Quy tắc nhóm (Optional but realistic) */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-sm font-bold text-gray-900 mb-2">Quy tắc nhóm</h2>
            <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
              <li>Tôn trọng lẫn nhau.</li>
              <li>Không spam quảng cáo.</li>
              <li>Chỉ đăng nội dung liên quan đến sự kiện.</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GroupPage;