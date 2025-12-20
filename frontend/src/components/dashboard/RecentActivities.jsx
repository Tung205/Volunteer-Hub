import React, { useState } from 'react';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle } from "react-icons/fa";
import { NOTIFICATIONS } from '../../data/mockData';

const RecentActivities = ({ currentUserRole }) => {
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

    // Filter Notification theo Role và Thời gian
    const filteredNotifications = NOTIFICATIONS
        .filter(n => n.role === currentUserRole || n.role === 'ALL')
        .filter(n => formatTime(n.time) !== null) // Loại bỏ nếu ko thuộc "Hôm nay" khi đang filter
        .sort((a, b) => b.time - a.time);

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <FaCheckCircle className="text-green-500 text-xl" />;
            case 'error': return <FaTimesCircle className="text-red-500 text-xl" />;
            default: return <FaInfoCircle className="text-green-500 text-xl" />;
        }
    };

    return (
        <div className="bg-gradient-to-b from-green-100 to-white rounded-[20px] p-6 md:p-8 shadow-sm min-h-[400px]">
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

                                {/* Content */}
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
    );
};

export default RecentActivities;
