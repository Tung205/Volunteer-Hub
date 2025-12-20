import React, { useState } from 'react';
import { MapPin, Heart, MessageCircle, Share2, MoreHorizontal, Image as ImageIcon, Send, ShieldCheck, Clock, Edit, Trash2, LogOut, CheckCircle, XCircle } from 'lucide-react';
import Swal from 'sweetalert2';

// 1. Dữ liệu giả lập (Mock Data)
const MOCK_EVENT = {
  id: 1,
  name: "Chiến dịch Mùa Hè Xanh 2025",
  coverImage: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=1474&auto=format&fit=crop",
  description: "Đây là nhóm chính thức để trao đổi thông tin về chiến dịch Mùa Hè Xanh. Các tình nguyện viên vui lòng cập nhật thông tin tại đây.",
  location: "Hà Nội, Việt Nam",
  address: "Đại học Bách Khoa, Số 1 Đại Cồ Việt",
  memberCount: 234,
  startDate: "2025-06-01T08:00:00Z" // Ngày bắt đầu sự kiện (Giả sử tương lai)
};

// Giả lập người dùng (Thay đổi role 'manager' <-> 'volunteer' để test)
const CURRENT_USER = {
  id: 99,
  name: "Nguyễn Văn Tôm",
  avatar: "https://ui-avatars.com/api/?name=Nguyen+Van+T&background=random",
  // role: "volunteer" 
  role: "admin"
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
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      likes: 15,
      isLiked: false, // User hiện tại đã like chưa
      comments: [
        { id: 101, author: "Lê Tình Nguyện", content: "Cảm ơn admin!", timestamp: new Date(Date.now() - 1800000).toISOString() }
      ],
      status: "approved"
    },
    {
      id: 2,
      author: "Lê Tình Nguyện",
      role: "volunteer",
      avatar: "https://ui-avatars.com/api/?name=Le+Tinh+Nguyen&background=random",
      content: "Mọi người ơi cho mình hỏi lịch tập trung hôm nay ở đâu ạ?",
      image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=500&auto=format&fit=crop",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      likes: 5,
      isLiked: true,
      comments: [],
      status: "approved"
    }
  ]);

  const [newPostContent, setNewPostContent] = useState("");
  const [hasJoined, setHasJoined] = useState(true); // Trạng thái đã tham gia nhóm

  // State cho comment đang nhập của từng bài viết { postId: "content" }
  const [commentInputs, setCommentInputs] = useState({});

  // Kiểm tra ngày sự kiện
  const isEventStarted = new Date() >= new Date(MOCK_EVENT.startDate);

  // --- HANDLERS ---

  // Đăng bài
  const handlePostSubmit = () => {
    if (!newPostContent.trim()) return;

    const newPost = {
      id: Date.now(),
      author: CURRENT_USER.name,
      role: CURRENT_USER.role,
      avatar: CURRENT_USER.avatar,
      content: newPostContent,
      image: null,
      timestamp: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      comments: [],
      status: CURRENT_USER.role === 'manager' ? 'approved' : 'pending'
    };

    setPosts([newPost, ...posts]);
    setNewPostContent("");

    if (newPost.status === 'pending') {
      // TODO: Gửi thông báo tới Manager để duyệt bài
      console.log("TODO: Notify Manager about new pending post");
      Swal.fire({
        icon: 'success',
        title: 'Đã gửi bài viết',
        text: 'Bài viết của bạn đang chờ Quản lý duyệt!',
        confirmButtonText: 'Đóng'
      });
    } else {
      // TODO: Gửi thông báo tới mọi thành viên trong nhóm (Broadcast)
      console.log("TODO: Broadcast notification to all members");
      Swal.fire({
        icon: 'success',
        title: 'Đăng bài thành công',
        showConfirmButton: false,
        timer: 1500
      });
    }
  };

  // Duyệt bài (Manager)
  const handleApprovePost = (postId, isApproved) => {
    if (isApproved) {
      setPosts(posts.map(post =>
        post.id === postId ? { ...post, status: 'approved' } : post
      ));
      // TODO: Gửi thông báo cho Volunteer (Accept)
      // TODO: Gửi thông báo Broadcast cho cả nhóm
      console.log("TODO: Notify Volunteer (Approved) & Broadcast");
      Swal.fire({
        icon: 'success',
        title: 'Đã duyệt bài viết',
        showConfirmButton: false,
        timer: 1000
      });
    } else {
      setPosts(posts.filter(post => post.id !== postId));
      // TODO: Gửi thông báo cho Volunteer (Reject)
      console.log("TODO: Notify Volunteer (Rejected)");
      Swal.fire({
        icon: 'info',
        title: 'Đã từ chối bài viết',
        showConfirmButton: false,
        timer: 1000
      });
    }
  };

  // Like / Unlike (Toggle)
  const handleLike = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const isLiked = !post.isLiked;
        return {
          ...post,
          isLiked: isLiked,
          likes: isLiked ? post.likes + 1 : post.likes - 1
        };
      }
      return post;
    }));
  };

  // Gửi Comment
  const handleCommentSubmit = (postId) => {
    const content = commentInputs[postId];
    if (!content?.trim()) return;

    const newComment = {
      id: Date.now(),
      author: CURRENT_USER.name,
      content: content,
      timestamp: new Date().toISOString()
    };

    setPosts(posts.map(post =>
      post.id === postId ? { ...post, comments: [...post.comments, newComment] } : post
    ));

    setCommentInputs({ ...commentInputs, [postId]: "" }); // Reset input
  };

  // Actions quản lý nhóm
  const handleLeaveGroup = () => {
    Swal.fire({
      title: 'Bạn chắc chắn muốn rời nhóm?',
      text: "Bạn sẽ không nhận được thông báo từ nhóm nữa.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Rời nhóm',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        setHasJoined(false);
        Swal.fire(
          'Đã rời nhóm!',
          'Bạn đã rời khỏi nhóm thành công.',
          'success'
        );
      }
    });
  };

  const handleDeleteEvent = () => {
    Swal.fire({
      title: 'Xóa nhóm vĩnh viễn?',
      text: "Hành động này không thể hoàn tác! Toàn bộ bài viết và thành viên sẽ bị xóa.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa ngay',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire(
          'Đã xóa!',
          'Nhóm đã bị xóa khỏi hệ thống.',
          'success'
        );
        // Logic xóa thật sẽ gọi API và redirect
      }
    });
  };

  const handleEditEvent = () => {
    Swal.fire({
      title: 'Chỉnh sửa sự kiện',
      text: "Chức năng đang phát triển...",
      icon: 'info'
    });
  };

  // --- RENDER HELPERS ---
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " " + date.toLocaleDateString();
  };

  if (!hasJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Bạn đã rời khỏi nhóm này</h2>
          <button onClick={() => setHasJoined(true)} className="text-blue-600 hover:underline">
            Vào lại nhóm (Demo)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5]">

      {/* 1. COVER AREA */}
      <div className="bg-white shadow-sm mb-4">
        <div className="max-w-6xl mx-auto">
          <div className="relative h-[350px] w-full rounded-b-xl overflow-hidden">
            <img
              src={MOCK_EVENT.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="px-8 py-4 pb-0">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{MOCK_EVENT.name}</h1>
                <p className="text-gray-500 font-medium mt-1">
                  Nhóm công khai · {MOCK_EVENT.memberCount} thành viên ·
                  <span className={`ml-2 ${isEventStarted ? 'text-red-500' : 'text-green-500'}`}>
                    {isEventStarted ? "Đã diễn ra" : "Sắp diễn ra"}
                  </span>
                </p>
              </div>

              {/* ACTION BUTTONS (Logic ẩn hiện theo Role & Thời gian) */}
              {!isEventStarted && (
                <div className="flex gap-2 mb-2">
                  {CURRENT_USER.role === 'volunteer' && (
                    <button
                      onClick={handleLeaveGroup}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold"
                    >
                      <LogOut size={18} /> Rời nhóm
                    </button>
                  )}

                  {CURRENT_USER.role === 'manager' && (
                    <>
                      <button
                        onClick={handleEditEvent}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-semibold"
                      >
                        <Edit size={18} /> Chỉnh sửa
                      </button>
                      <button
                        onClick={handleDeleteEvent}
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-semibold"
                      >
                        <Trash2 size={18} /> Xóa nhóm
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

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

      {/* 2. MAIN GRID */}
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* === LEFT: FEED === */}
        <div className="md:col-span-2 space-y-4">

          {/* Post Input */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex gap-3 mb-3">
              <img src={CURRENT_USER.avatar} alt="Me" className="w-10 h-10 rounded-full" />
              <div className="flex-1 bg-gray-100 rounded-full px-4 py-2">
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
            <div className="border-t pt-3 flex justify-end">
              <button
                onClick={handlePostSubmit}
                className="bg-blue-600 text-white px-6 py-1.5 rounded-md font-semibold hover:bg-blue-700 transition"
              >
                Đăng
              </button>
            </div>
          </div>

          {/* Pending Posts Queue (Only Manager sees this separately or highlighted) */}
          {CURRENT_USER.role === 'manager' && posts.some(p => p.status === 'pending') && (
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-400">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Clock className="text-yellow-600" /> Bài viết chờ duyệt
              </h3>
              {posts.filter(p => p.status === 'pending').map(post => (
                <div key={`pending-${post.id}`} className="bg-gray-50 p-3 rounded mb-2 text-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold">{post.author}</span>
                      <p className="text-gray-600 mt-1">{post.content}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprovePost(post.id, true)}
                        className="text-green-600 hover:bg-green-100 p-1 rounded" title="Duyệt"
                      >
                        <CheckCircle size={20} />
                      </button>
                      <button
                        onClick={() => handleApprovePost(post.id, false)}
                        className="text-red-600 hover:bg-red-100 p-1 rounded" title="Từ chối"
                      >
                        <XCircle size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Post List */}
          {posts.map((post) => {
            // Logic hiển thị:
            // - Manager: Thấy tất cả (đã tách pending lên trên hoặc hiển thị đặc biệt)
            // - Volunteer: Chỉ thấy Approved + Pending (của chính mình)

            // Nếu là pending mà không phải của mình và mình không phải manager -> Ẩn
            if (post.status === 'pending' && post.author !== CURRENT_USER.name && CURRENT_USER.role !== 'manager') return null;

            // Nếu Manager, các bài pending đã hiện ở box trên, có thể ẩn ở dưới hoặc hiện mờ. 
            // Ở đây để đơn giản: Manager thấy bài pending ở dưới dạng preview (không action)

            return (
              <div key={post.id} className={`bg-white rounded-lg shadow p-4 ${post.status === 'pending' ? 'opacity-70' : ''}`}>

                {/* Post Header */}
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
                        {formatTime(post.timestamp)}
                        {post.status === 'pending' && <span className="text-yellow-600 font-bold ml-2">(Chờ duyệt)</span>}
                      </div>
                    </div>
                  </div>
                  <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full">
                    <MoreHorizontal />
                  </button>
                </div>

                <p className="text-gray-800 mb-3 whitespace-pre-wrap">{post.content}</p>
                {post.image && (
                  <div className="mb-3 -mx-4">
                    <img src={post.image} alt="content" className="w-full h-auto" />
                  </div>
                )}

                {/* Like/Comment Stats */}
                <div className="flex justify-between items-center text-gray-500 text-sm mb-3">
                  <span className="flex items-center gap-1">
                    {post.likes > 0 && <div className="bg-blue-500 p-1 rounded-full"><Heart size={10} className="text-white fill-white" /></div>}
                    {post.likes} lượt thích
                  </span>
                  <span>{post.comments.length} bình luận</span>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-b py-1 flex justify-between mb-3">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex-1 flex justify-center items-center gap-2 py-2 hover:bg-gray-100 rounded-lg font-medium ${post.isLiked ? 'text-blue-600' : 'text-gray-600'}`}
                  >
                    <Heart size={20} className={post.isLiked ? 'fill-blue-600' : ''} /> Thích
                  </button>
                  <button className="flex-1 flex justify-center items-center gap-2 py-2 hover:bg-gray-100 rounded-lg text-gray-600 font-medium">
                    <MessageCircle size={20} /> Bình luận
                  </button>
                </div>

                {/* Comment Section */}
                <div>
                  {/* List Comments */}
                  {post.comments.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {post.comments.map(comment => (
                        <div key={comment.id} className="flex gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" /> {/* Placeholder avatar */}
                          <div className="bg-gray-100 rounded-2xl px-3 py-2">
                            <p className="font-bold text-xs text-gray-900">{comment.author}</p>
                            <p className="text-sm text-gray-800">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comment Input */}
                  <div className="flex gap-2 items-center">
                    <img src={CURRENT_USER.avatar} className="w-8 h-8 rounded-full" />
                    <div className="flex-1 relative">
                      <input
                        className="w-full bg-gray-100 rounded-full pl-3 pr-10 py-2 text-sm outline-none focus:bg-gray-200 transition"
                        placeholder="Viết bình luận..."
                        value={commentInputs[post.id] || ""}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(post.id)}
                      />
                      <button
                        onClick={() => handleCommentSubmit(post.id)}
                        className="absolute right-2 top-1.5 text-blue-600 hover:text-blue-700"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* === RIGHT: SIDEBAR === */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Giới thiệu</h2>
            <p className="text-gray-700 text-sm mb-4">{MOCK_EVENT.description}</p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="text-gray-500 mt-1 w-6 h-6" />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{MOCK_EVENT.location}</h4>
                  <p className="text-gray-500 text-xs">{MOCK_EVENT.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupPage;