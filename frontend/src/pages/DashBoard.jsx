import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaCloudDownloadAlt, FaCalculator, FaClock, FaUserCog, 
    FaCheckCircle, FaTimesCircle, FaInfoCircle, 
    FaFilter 
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";

// --- GIẢ LẬP COMPONENT EventCard (Bạn thay bằng import thật) ---
const EventCard = ({ event }) => (
    <div className="bg-white rounded-xl p-3 shadow-sm flex gap-3 border border-gray-100">
        <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
             <img src={event.image || "https://placehold.co/100"} alt="Thumb" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 flex flex-col justify-between">
            <div>
                <h3 className="font-bold text-gray-800 text-sm line-clamp-1">{event.title}</h3>
                <p className="text-gray-500 text-xs mt-1">📍 {event.location}</p>
                <p className="text-gray-400 text-[10px] mt-1">📅 {event.date}</p>
            </div>
            <div className="flex justify-end">
                 <button className="bg-green-700 hover:bg-green-800 text-white text-[10px] font-bold py-1 px-3 rounded shadow-sm">
                    Chi tiết
                </button>
            </div>
        </div>
    </div>
);

// --- MOCK DATA ---
const CURRENT_USER_ROLE = "MANAGER"; // Thử đổi thành: "ADMIN", "TNV", "MANAGER"

const FEATURED_EVENTS = [
    { id: 1, title: "Trồng cây gây rừng", location: "Lào Cai", date: "23/11/2025" },
    { id: 2, title: "Dọn rác bãi biển", location: "Đà Nẵng", date: "01/12/2025" },
    { id: 3, title: "Hiến máu nhân đạo", location: "Hà Nội", date: "15/12/2025" },
];

const NOTIFICATIONS = [
    // Mock for TNV
    { id: 1, type: 'success', content: 'Bạn đã được duyệt tham gia sự kiện "Mùa hè xanh"', time: new Date().setHours(new Date().getHours() - 1), role: 'TNV' },
    { id: 2, type: 'error', content: 'Yêu cầu tham gia "Hiến máu" bị từ chối', time: new Date().setHours(new Date().getHours() - 5), role: 'TNV' },
    { id: 3, type: 'info', content: 'Sự kiện "Mùa hè xanh" có bài đăng mới: Lịch trình chi tiết', time: new Date().setDate(new Date().getDate() - 2), role: 'TNV' },
    
    // Mock for Manager
    { id: 4, type: 'success', content: 'Sự kiện "Dạy học vùng cao" của bạn đã được Admin duyệt', time: new Date().setHours(new Date().getHours() - 2), role: 'MANAGER' },
    { id: 5, type: 'info', content: 'Thành viên Nguyễn Văn A vừa tham gia sự kiện của bạn', time: new Date().setDate(new Date().getDate() - 1), role: 'MANAGER' },
    
    // Mock for Admin
    { id: 6, type: 'info', content: 'Có yêu cầu cấp quyền Manager mới từ User B', time: new Date().setHours(new Date().getHours() - 3), role: 'ADMIN' },
    { id: 7, type: 'success', content: 'Sự kiện mới "Gây quỹ" chờ duyệt', time: new Date().setDate(new Date().getDate() - 5), role: 'ADMIN' },
    
    // Chung
    { id: 8, type: 'info', content: 'Bạn đã cập nhật hồ sơ cá nhân thành công', time: new Date().setHours(new Date().getHours() - 10), role: 'ALL' },
];

const DashboardPage = () => {
  // State
  const [filterActivity, setFilterActivity] = useState('today'); // 'today' | 'all'
  const [filterFeatured, setFilterFeatured] = useState('newest'); // 'newest' | 'posts' | 'members'

  // --- LOGIC 1: SUMMARY CARDS ---
  const renderCard1 = () => {
      if (CURRENT_USER_ROLE === 'ADMIN') {
          return (
            <div 
                onClick={() => console.log("Export Data API Call")} 
                className="bg-red-100 rounded-[20px] p-6 flex flex-col items-center justify-center shadow-sm cursor-pointer hover:bg-red-200 transition relative overflow-hidden"
            >
                <div className="bg-red-400 p-3 rounded-full absolute top-4 left-4 shadow-sm text-white">
                    <FaCloudDownloadAlt size={20} />
                </div>
                <div className="mt-8 text-center">
                    <span className="text-xl font-bold text-red-800 block mb-1">Xuất dữ liệu</span>
                    <p className="text-red-600 text-xs">(Click để tải về)</p>
                </div>
            </div>
          );
      } else {
          // TNV hoặc MANAGER
          return (
            <div className="bg-red-100 rounded-[20px] p-6 flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
                <div className="bg-red-400 p-3 rounded-full absolute top-4 left-4 shadow-sm text-white">
                    <FaCalculator size={20} />
                </div>
                <div className="mt-8 text-center">
                    <span className="text-4xl font-black text-red-500 block mb-1">
                        {CURRENT_USER_ROLE === 'MANAGER' ? '15' : '4'}
                    </span>
                    <p className="font-bold text-gray-800 text-sm">Sự kiện tham gia</p>
                    {CURRENT_USER_ROLE === 'MANAGER' && <span className="text-xs text-red-600">(+Quản lý)</span>}
                </div>
            </div>
          );
      }
  };

  const renderCard2 = () => {
      // Logic hiển thị số lượng chờ duyệt
      // Admin: Sự kiện chờ duyệt, Yêu cầu lên Manager
      // Manager: Bài viết chờ duyệt, Sự kiện chờ duyệt
      // TNV: Bài viết/Yêu cầu đang chờ duyệt
      const count = 10; // Giả lập số liệu
      
      return (
        <div 
            onClick={() => console.log("Open Pending Popup")}
            className="bg-yellow-100 rounded-[20px] p-6 flex flex-col items-center justify-center shadow-sm cursor-pointer hover:bg-yellow-200 transition relative overflow-hidden"
        >
            <div className="bg-yellow-400 p-3 rounded-full absolute top-4 left-4 shadow-sm text-white">
                <FaClock size={20} />
            </div>
            <div className="mt-8 text-center">
                <span className="text-4xl font-black text-yellow-600 block mb-1">{count}</span>
                <p className="font-bold text-gray-800 text-sm">Chờ duyệt</p>
            </div>
        </div>
      );
  };

  const renderCard3 = () => (
    <div className="bg-blue-100 rounded-[20px] p-6 flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
        <div className="bg-blue-400 p-3 rounded-full absolute top-4 left-4 shadow-sm text-white">
            <FaUserCog size={20} />
        </div>
        <div className="mt-8 text-center">
            <span className="bg-blue-400 text-white text-lg font-bold px-4 py-1 rounded-full shadow-sm block mb-2">
                {CURRENT_USER_ROLE}
            </span>
            <p className="font-bold text-gray-800 text-sm">Vai trò</p>
        </div>
    </div>
  );

  // --- LOGIC 2: NOTIFICATIONS (Facebook Style) ---
  const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      const now = new Date();
      const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();

      if (filterActivity === 'today' && !isToday) return null; // Filter logic

      if (isToday) {
          return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      } else {
          return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      }
  };

  // Filter Notification theo Role và Thời gian
  const filteredNotifications = NOTIFICATIONS
    .filter(n => n.role === CURRENT_USER_ROLE || n.role === 'ALL')
    .filter(n => formatTime(n.time) !== null) // Loại bỏ nếu ko thuộc "Hôm nay" khi đang filter
    .sort((a, b) => b.time - a.time);

  const getIcon = (type) => {
      switch(type) {
          case 'success': return <FaCheckCircle className="text-green-500 text-xl" />;
          case 'error': return <FaTimesCircle className="text-red-500 text-xl" />;
          default: return <FaInfoCircle className="text-green-500 text-xl" />;
      }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d4f8d4] to-[#a7e8a7] py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* --- CỘT TRÁI (2/3) --- */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* 1. Summary Cards Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {renderCard1()}
                        {renderCard2()}
                        {renderCard3()}
                    </div>

                    {/* 2. Recent Activities (Thông báo) */}
                    <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-sm min-h-[400px]">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h2 className="text-xl font-bold text-gray-800">Hoạt động gần đây</h2>
                            
                            {/* Filter Dropdown */}
                            <select 
                                value={filterActivity}
                                onChange={(e) => setFilterActivity(e.target.value)}
                                className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-md hover:bg-gray-200 cursor-pointer outline-none"
                            >
                                <option value="today">Hôm nay</option>
                                <option value="all">Tất cả</option>
                            </select>
                        </div>

                        <div className="space-y-6">
                            {filteredNotifications.length > 0 ? (
                                filteredNotifications.map((notif) => (
                                    <div key={notif.id} className="flex items-start justify-between group">
                                        <div className="flex items-start gap-4">
                                            {/* Icon */}
                                            <div className="mt-1 flex-shrink-0 bg-gray-50 p-1 rounded-full">
                                                {getIcon(notif.type)}
                                            </div>
                                            
                                            {/* Content (Mô phỏng Facebook: Bold text quan trọng nếu cần) */}
                                            <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                                                {notif.content}
                                            </p>
                                        </div>
                                        
                                        {/* Time */}
                                        <span className="text-gray-400 text-xs whitespace-nowrap ml-4 mt-1">
                                            {formatTime(notif.time)}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-400 italic">Không có thông báo nào trong khoảng thời gian này.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- CỘT PHẢI (1/3) --- */}
                <div className="lg:col-span-1">
                    <div className="bg-[#E8E8E8] rounded-[20px] p-6 h-full flex flex-col">
                        
                        {/* Header & Filter */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg md:text-xl font-bold text-gray-800 leading-tight">
                                    Hoạt động Tình Nguyện nổi bật
                                </h2>
                                <HiSparkles className="text-yellow-500 text-2xl flex-shrink-0" />
                            </div>
                            
                            {/* Filter Icon & Dropdown giả lập */}
                            <div className="relative group">
                                <button className="p-2 hover:bg-gray-200 rounded-full transition">
                                    <FaFilter className="text-gray-600" />
                                </button>
                                {/* Tooltip/Menu giả lập khi hover */}
                                <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md overflow-hidden hidden group-hover:block z-10">
                                    <div onClick={() => setFilterFeatured('newest')} className="px-4 py-2 hover:bg-green-50 text-sm cursor-pointer">Mới nhất</div>
                                    <div onClick={() => setFilterFeatured('posts')} className="px-4 py-2 hover:bg-green-50 text-sm cursor-pointer">Nhiều bài đăng</div>
                                    <div onClick={() => setFilterFeatured('members')} className="px-4 py-2 hover:bg-green-50 text-sm cursor-pointer">Đông thành viên</div>
                                </div>
                            </div>
                        </div>

                        {/* List Featured Events */}
                        <div className="space-y-4 flex-1">
                            {FEATURED_EVENTS.slice(0, 3).map((evt) => (
                                <EventCard key={evt.id} event={evt} />
                            ))}
                        </div>

                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};

export default DashboardPage;