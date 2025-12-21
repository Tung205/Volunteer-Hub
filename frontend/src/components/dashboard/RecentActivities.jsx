import React, { useState } from 'react';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle } from "react-icons/fa";
import { NOTIFICATIONS } from '../../data/mockData';

const RecentActivities = ({ currentUserRole, userHistory = [] }) => {
    const [filterActivity, setFilterActivity] = useState('today'); // 'today' | 'all'

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

    // Filter Notification
    const filteredNotifications = userHistory
        .filter(n => formatTime(n.time) !== null) // Loại bỏ nếu ko thuộc "Hôm nay" khi đang filter
        .sort((a, b) => new Date(b.time) - new Date(a.time));

    const getIcon = (type) => {
        // Typically history doesn't have type, defaulting to Info. Or infer from text?
        // Let's infer simplisticly or just use Info/Check.
        // If text contains "thành công", "chấp nhận" -> success.
        // If "từ chối", "hủy" -> error.
        const text = type?.toLowerCase() || ''; // type here is actually 'text' in history object if we passed it, but map below uses n.text
        return <FaInfoCircle className="text-green-500 text-xl" />;
    };

    // Helper to guess icon based on content
    const guessIcon = (text) => {
        const lower = text.toLowerCase();
        if (lower.includes('thành công') || lower.includes('chấp nhận') || lower.includes('duyệt')) return <FaCheckCircle className="text-green-500 text-xl" />;
        if (lower.includes('từ chối') || lower.includes('hủy') || lower.includes('thất bại')) return <FaTimesCircle className="text-red-500 text-xl" />;
        return <FaInfoCircle className="text-blue-500 text-xl" />;
    };

    return (
        <div className="bg-gradient-to-b from-green-100 to-white rounded-[20px] p-6 md:p-8 shadow-sm min-h-[400px] h-full flex-1">
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
                    filteredNotifications.map((notif, index) => (
                        <div key={index} className="flex items-start justify-between group">
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div className="mt-1 flex-shrink-0 bg-gray-50 p-1 rounded-full">
                                    {guessIcon(notif.text)}
                                </div>

                                {/* Content */}
                                <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                                    {notif.text}
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
    );
};

export default RecentActivities;
