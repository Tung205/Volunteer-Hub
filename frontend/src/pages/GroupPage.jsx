import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  MapPin, Heart, MessageCircle, Share2, MoreHorizontal, Image as ImageIcon,
  Send, ShieldCheck, Clock, Edit, Trash2, LogOut, CheckCircle, XCircle, Users, X
} from 'lucide-react';
import Swal from 'sweetalert2';
import PostDetail from '../components/group/PostDetail';
import LikesList from '../components/group/LikesList';

// --- MOCK DATA ---
const MOCK_EVENT = {
  id: 1,
  name: "Chiến dịch Mùa Hè Xanh 2025",
  coverImage: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=1474&auto=format&fit=crop",
  description: "Đây là nhóm chính thức để trao đổi thông tin về chiến dịch Mùa Hè Xanh.",
  location: "Hà Nội, Việt Nam",
  address: "Đại học Bách Khoa, Số 1 Đại Cồ Việt",
  memberCount: 5,
  startDate: "2025-06-01T08:00:00Z"
};

const MOCK_MEMBERS = [
  { id: 99, name: "Nguyễn Văn Tôm", avatar: "https://ui-avatars.com/api/?name=Nguyen+Van+T&background=random", role: "admin" }, // Manager/Admin
  { id: 101, name: "Lê Tình Nguyện", avatar: "https://ui-avatars.com/api/?name=Le+Tinh+Nguyen&background=random", role: "volunteer" },
  { id: 102, name: "Phạm Hùng", avatar: "https://ui-avatars.com/api/?name=Pham+Hung&background=random", role: "volunteer" },
  { id: 103, name: "Hoàng Mai", avatar: "https://ui-avatars.com/api/?name=Hoang+Mai&background=random", role: "volunteer" },
  { id: 104, name: "Trần Đức", avatar: "https://ui-avatars.com/api/?name=Tran+Duc&background=random", role: "volunteer" },
];

const INIT_POSTS = [
  {
    id: 1,
    author: "Nguyễn Văn Tôm",
    role: "manager",
    avatar: "https://ui-avatars.com/api/?name=Nguyen+Van+T&background=random",
    content: "Chào mừng mọi người đến với nhóm! Hãy đọc kỹ quy định nhé.\nLịch trình cụ thể sẽ được cập nhật sớm.",
    image: null,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    likes: 15,
    isLiked: false,
    likers: [
      { id: 101, name: "Lê Tình Nguyện", avatar: "https://ui-avatars.com/api/?name=Le+Tinh+Nguyen&background=random" },
      { id: 102, name: "Phạm Hùng", avatar: "https://ui-avatars.com/api/?name=Pham+Hung&background=random" }
    ],
    comments: [
      { id: 101, author: "Lê Tình Nguyện", content: "Đã rõ ạ!", timestamp: new Date(Date.now() - 1800000).toISOString() }
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
    likers: [
      { id: 99, name: "Nguyễn Văn Tôm", avatar: "https://ui-avatars.com/api/?name=Nguyen+Van+T&background=random" }
    ],
    comments: [],
    status: "approved"
  }
];

// --- MAIN PAGE ---

const GroupPage = () => {
  const { eventId } = useParams();

  // States
  const [currentUser, setCurrentUser] = useState({ ...MOCK_MEMBERS[0] }); // Default Admin
  const [activeTab, setActiveTab] = useState('DISCUSSION'); // 'DISCUSSION' | 'MEMBERS'
  const [posts, setPosts] = useState(INIT_POSTS);
  const [newPostContent, setNewPostContent] = useState("");

  // Modal States
  const [selectedPost, setSelectedPost] = useState(null); // For PostDetail
  const [likesModalPost, setLikesModalPost] = useState(null); // For LikesList

  // --- ACTIONS ---

  const handlePostSubmit = () => {
    if (!newPostContent.trim()) return;
    const newPost = {
      id: Date.now(),
      author: currentUser.name,
      role: currentUser.role === 'admin' ? 'manager' : 'volunteer',
      avatar: currentUser.avatar,
      content: newPostContent,
      image: null,
      timestamp: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      likers: [],
      comments: [],
      status: currentUser.role === 'admin' ? 'approved' : 'pending' // Admin auto-approve
    };
    setPosts([newPost, ...posts]);
    setNewPostContent("");

    if (newPost.status === 'pending') {
      Swal.fire({ icon: 'success', title: 'Đã gửi bài viết', text: 'Đang chờ quản trị viên duyệt.', timer: 1500, showConfirmButton: false });
    }
  };

  const handleLike = (postId) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const isLiked = !post.isLiked;
        const newLikers = isLiked
          ? [...(post.likers || []), { id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar }]
          : (post.likers || []).filter(l => l.id !== currentUser.id);

        return {
          ...post,
          isLiked,
          likes: newLikers.length,
          likers: newLikers
        };
      }
      return post;
    }));
  };

  const handleCommentSubmit = (postId, content) => {
    if (!content?.trim()) return;
    const newComment = {
      id: Date.now(),
      author: currentUser.name,
      content: content,
      timestamp: new Date().toISOString()
    };

    const updatedPosts = posts.map(post =>
      post.id === postId ? { ...post, comments: [...post.comments, newComment] } : post
    );
    setPosts(updatedPosts);

    // Update selectedPost if clear to refresh modal
    if (selectedPost && selectedPost.id === postId) {
      const updatedPost = updatedPosts.find(p => p.id === postId);
      setSelectedPost(updatedPost);
    }
  };

  // Sort Members: Manager First
  const sortedMembers = [...MOCK_MEMBERS].sort((a, b) => {
    if (a.role === 'admin' && b.role !== 'admin') return -1;
    if (a.role !== 'admin' && b.role === 'admin') return 1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0fdf4] to-[#ffffff] pb-20">

      {/* --- COVER & HEADER --- */}
      <div className="bg-white shadow">
        <div className="max-w-5xl mx-auto">
          {/* Cover Image */}
          <div className="h-[250px] md:h-[320px] w-full relative group">
            <img src={MOCK_EVENT.coverImage} className="w-full h-full object-cover" alt="Cover" />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition" />
          </div>

          {/* Info Area */}
          <div className="px-4 md:px-8 py-4">
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">{MOCK_EVENT.name}</h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2 text-sm">
              <MapPin size={16} /> {MOCK_EVENT.location}
              <span className="mx-1">•</span>
              <Users size={16} /> {MOCK_EVENT.memberCount} thành viên
            </p>

            {/* Tabs */}
            <div className="flex items-center gap-6 mt-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('DISCUSSION')}
                className={`pb-3 font-bold text-sm border-b-2 transition ${activeTab === 'DISCUSSION' ? 'text-green-600 border-green-600' : 'text-gray-500 border-transparent hover:text-green-600'}`}
              >
                Thảo luận
              </button>
              <button
                onClick={() => setActiveTab('MEMBERS')}
                className={`pb-3 font-bold text-sm border-b-2 transition ${activeTab === 'MEMBERS' ? 'text-green-600 border-green-600' : 'text-gray-500 border-transparent hover:text-green-600'}`}
              >
                Thành viên
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 mt-6">

        {/* TAB: THẢO LUẬN */}
        {activeTab === 'DISCUSSION' && (
          <div className="flex gap-6 flex-col md:flex-row">
            {/* Left: Feed */}
            <div className="flex-1 space-y-4">

              {/* Write Post */}
              <div className="bg-white rounded-xl shadow-sm p-4 border border-green-100">
                <div className="flex gap-3">
                  <img src={currentUser.avatar} className="w-10 h-10 rounded-full" />
                  <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2 hover:bg-gray-200 transition cursor-text">
                    <input
                      className="w-full bg-transparent outline-none text-gray-700"
                      placeholder={`Bạn đang nghĩ gì, ${currentUser.name}?`}
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handlePostSubmit()}
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-3 border-t pt-2">
                  <button
                    onClick={handlePostSubmit}
                    className="bg-green-600 text-white px-6 py-1.5 rounded-lg font-semibold text-sm hover:bg-green-700 transition shadow-sm"
                  >
                    Đăng bài
                  </button>
                </div>
              </div>

              {/* Posts */}
              {posts.map(post => {
                if (post.status === 'pending' && currentUser.role !== 'admin' && post.author !== currentUser.name) return null;

                return (
                  <div key={post.id} className={`bg-white rounded-xl shadow-sm p-4 border border-gray-100 ${post.status === 'pending' ? 'opacity-75 ring-1 ring-yellow-400' : ''}`}>
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-3">
                        <img src={post.avatar} className="w-10 h-10 rounded-full border border-gray-100" />
                        <div>
                          <div className="flex items-center gap-1">
                            <h3 className="font-bold text-gray-900 text-sm">{post.author}</h3>
                            {post.role === 'manager' && <ShieldCheck size={14} className="text-blue-500" title="Quản trị viên" />}
                          </div>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            {new Date(post.timestamp).toLocaleString()}
                            {post.status === 'pending' && <span className="text-yellow-600 font-bold ml-1">• Đang chờ duyệt</span>}
                          </p>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:bg-gray-100 p-1 rounded"><MoreHorizontal size={20} /></button>
                    </div>

                    {/* Content */}
                    <div className="mb-3 text-gray-800 text-sm whitespace-pre-wrap">{post.content}</div>
                    {post.image && (
                      <div className="mb-3 rounded-lg overflow-hidden border border-gray-100 cursor-pointer" onClick={() => setSelectedPost(post)}>
                        <img src={post.image} className="w-full max-h-[400px] object-cover" />
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-3 border-b border-gray-100 pb-2">
                      <div
                        className="flex items-center gap-1 cursor-pointer hover:underline"
                        onClick={() => setLikesModalPost(post)}
                      >
                        {post.likes > 0 && <div className="bg-green-500 p-0.5 rounded-full"><Heart size={8} className="text-white fill-white" /></div>}
                        {post.likes} lượt thích
                      </div>
                      <div className="cursor-pointer hover:underline" onClick={() => setSelectedPost(post)}>
                        {post.comments.length} bình luận
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex-1 py-1.5 rounded flex justify-center items-center gap-2 text-sm font-semibold hover:bg-gray-50 transition ${post.isLiked ? 'text-green-600' : 'text-gray-500'}`}
                      >
                        <Heart size={18} className={post.isLiked ? 'fill-green-600' : ''} /> Thích
                      </button>
                      <button
                        onClick={() => setSelectedPost(post)}
                        className="flex-1 py-1.5 rounded flex justify-center items-center gap-2 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition"
                      >
                        <MessageCircle size={18} /> Bình luận
                      </button>
                      <button className="flex-1 py-1.5 rounded flex justify-center items-center gap-2 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition">
                        <Share2 size={18} /> Chia sẻ
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Info Box */}
            <div className="hidden md:block w-[300px] flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 sticky top-4">
                <h3 className="font-bold text-gray-800 mb-2">Giới thiệu</h3>
                <p className="text-gray-600 text-sm mb-4">{MOCK_EVENT.description}</p>
                <div className="flex items-start gap-2 text-sm text-gray-500">
                  <MapPin size={16} className="mt-0.5" />
                  <span>{MOCK_EVENT.address}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: THÀNH VIÊN */}
        {activeTab === 'MEMBERS' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Tất cả thành viên</h3>
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">{sortedMembers.length} người</span>
            </div>
            <div className="divide-y divide-gray-100">
              {sortedMembers.map(member => (
                <div key={member.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                  <div className="flex items-center gap-3">
                    <img src={member.avatar} className="w-12 h-12 rounded-full border border-gray-200" />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{member.name}</h4>
                      <p className="text-xs text-gray-500">Tham gia: 01/01/2025</p>
                    </div>
                  </div>
                  {member.role === 'admin' && (
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                      <ShieldCheck size={12} /> Quản trị viên
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* --- MODALS --- */}
      <PostDetail
        post={selectedPost}
        onClose={() => setSelectedPost(null)}
        onCommentSubmit={handleCommentSubmit}
        currentUser={currentUser}
      />
      <LikesList
        post={likesModalPost}
        onClose={() => setLikesModalPost(null)}
      />

      {/* --- DEV TOOL: TOGGLE ROLE --- */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setCurrentUser(prev => prev.role === 'admin' ? MOCK_MEMBERS[1] : MOCK_MEMBERS[0])}
          className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-lg font-bold text-sm transition ${currentUser.role === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-white'}`}
        >
          {currentUser.role === 'admin' ? <ShieldCheck size={16} /> : <Users size={16} />}
          {currentUser.role === 'admin' ? 'Mode: Manager' : 'Mode: Volunteer'}
        </button>
      </div>

    </div>
  );
};

export default GroupPage;