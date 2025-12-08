import React from 'react';
import { Link } from 'react-router-dom';
import {
    FaCalendarCheck,
    FaClock,
    FaUserCog,
    FaCheckCircle,
    FaTimesCircle,
    FaInfoCircle,
    FaMapMarkerAlt,
    FaCalendarAlt
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";

const DashBoard = () => {
    // 1. Dữ liệu giả lập cho 3 thẻ thống kê (Summary Cards)
    const stats = [
        {
            id: 1,
            title: "Sự kiện đã tham gia",
            count: 4,
            icon: <FaCalendarCheck className="text-white text-xl" />,
            bg: "bg-red-100",
            iconBg: "bg-red-400", // Màu nền của icon tròn
            textColor: "text-gray-800",
            countColor: "text-red-500"
        },
        {
            id: 2,
            title: "Chờ duyệt",
            count: 10,
            icon: <FaClock className="text-white text-xl" />,
            bg: "bg-yellow-100",
            iconBg: "bg-yellow-400",
            textColor: "text-gray-800",
            countColor: "text-yellow-600"
        },
        {
            id: 3,
            title: "Vai trò",
            roleName: "TNV", // Text hiển thị trong badge
            icon: <FaUserCog className="text-white text-xl" />,
            bg: "bg-blue-100",
            iconBg: "bg-blue-400",
            textColor: "text-gray-800",
            roleColor: "bg-blue-400 text-white" // Style cho badge TNV
        },
    ];

    // 2. Dữ liệu giả lập cho "Hoạt động gần đây"
    const recentActivities = [
        { id: 1, type: 'success', text: 'Bạn đã đăng ký tham gia "Dọn rác bãi biển"', time: '12:30 pm' },
        { id: 2, type: 'info', text: 'Bạn đã cập nhật hồ sơ cá nhân', time: '16:36 pm' },
        { id: 3, type: 'error', text: 'Bạn đã bị từ chối tham gia sự kiện A', time: '16:36 pm' },
    ];

    // 3. Dữ liệu giả lập cho "Sự kiện nổi bật"
    const featuredEvents = [
        { id: 1, title: "Trồng cây gây rừng", location: "Lào Cai", start: "3/12/2025", end: "4/12/2025" },
        { id: 2, title: "Trồng cây gây rừng", location: "Lào Cai", start: "3/12/2025", end: "4/12/2025" },
        { id: 3, title: "Trồng cây gây rừng", location: "Lào Cai", start: "3/12/2025", end: "4/12/2025" },
    ];

    // Helper render icon hoạt động
    const renderActivityIcon = (type) => {
        switch(type) {
            case 'success': return <FaCheckCircle className="text-green-500 text-xl" />;
            case 'info': return <FaInfoCircle className="text-green-500 text-xl" />;
            case 'error': return <FaTimesCircle className="text-red-500 text-xl" />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">

                {/* GRID CHÍNH: Chia 2 cột (Cột trái 2 phần, Cột phải 1 phần) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* --- CỘT TRÁI (Chiếm 2/3) --- */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* 1. Summary Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {stats.map((item) => (
                                <div key={item.id} className={`${item.bg} rounded-[20px] p-6 flex flex-col items-center justify-center shadow-sm relative overflow-hidden`}>
                                    {/* Icon tròn góc trên trái */}
                                    <div className={`${item.iconBg} p-3 rounded-full absolute top-4 left-4 shadow-sm`}>
                                        {item.icon}
                                    </div>

                                    {/* Nội dung chính */}
                                    <div className="mt-8 text-center">
                                        {item.roleName ? (
                                            // Nếu là thẻ Vai trò
                                            <span className={`${item.roleColor} text-lg font-bold px-4 py-1 rounded-full shadow-sm block mb-2`}>
                                            {item.roleName}
                                        </span>
                                        ) : (
                                            // Nếu là thẻ đếm số
                                            <span className={`text-4xl font-black ${item.countColor} block mb-1`}>
                                            {item.count}
                                        </span>
                                        )}
                                        <p className={`font-bold ${item.textColor} text-sm md:text-base`}>
                                            {item.title}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 2. Hoạt động gần đây */}
                        <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Hoạt động gần đây</h2>
                                {/* Dropdown giả */}
                                <button className="bg-gray-100 text-gray-500 text-sm px-3 py-1 rounded-md hover:bg-gray-200 transition">
                                    Hôm nay ▼
                                </button>
                            </div>

                            <div className="space-y-6">
                                {recentActivities.map((act) => (
                                    <div key={act.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-4">
                                            {renderActivityIcon(act.type)}
                                            <span className="text-gray-700 font-medium text-sm md:text-base">
                                            {act.text}
                                        </span>
                                        </div>
                                        <span className="text-gray-400 text-sm whitespace-nowrap ml-4">
                                        {act.time}
                                    </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* --- CỘT PHẢI (Chiếm 1/3) --- */}
                    <div className="lg:col-span-1">
                        <div className="bg-[#E8E8E8] rounded-[20px] p-6 h-full"> {/* Màu nền xám nhạt riêng cho khung này */}

                            <div className="flex items-center gap-2 mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Hoạt động Tình Nguyện nổi bật</h2>
                                <HiSparkles className="text-yellow-500 text-2xl" />
                            </div>

                            <div className="space-y-4">
                                {featuredEvents.map((evt) => (
                                    <div key={evt.id} className="bg-white rounded-xl p-4 shadow-sm flex gap-4">
                                        {/* Ảnh Placeholder */}
                                        <div className="w-24 h-24 bg-white border-2 border-gray-300 rounded-lg flex-shrink-0 flex items-center justify-center">
                                            {/* Icon ảnh giả lập */}
                                            <div className="w-4 h-4 rounded-full border-2 border-gray-400"></div>
                                            <div className="w-8 h-4 border-t-2 border-r-2 border-gray-400 mt-2 ml-1 transform rotate-45"></div>
                                        </div>

                                        {/* Nội dung card */}
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="font-bold text-gray-800 text-base">{evt.title}</h3>
                                                <p className="text-gray-600 text-xs mt-1">
                                                    <span className="font-bold">Địa điểm:</span> {evt.location}
                                                </p>
                                                <p className="text-gray-500 text-[10px] mt-1">
                                                    Thời gian bắt đầu: {evt.start}
                                                </p>
                                                <p className="text-gray-500 text-[10px]">
                                                    Thời gian kết thúc: {evt.end}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Nút Chi tiết (Nằm giữa theo chiều dọc hoặc dưới cùng) */}
                                        <div className="flex flex-col justify-center">
                                            <button className="bg-green-700 hover:bg-green-800 text-white text-xs font-bold py-1 px-3 rounded shadow-sm">
                                                Chi tiết
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DashBoard;