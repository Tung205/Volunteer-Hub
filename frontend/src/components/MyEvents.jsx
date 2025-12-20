import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimesCircle, FaHistory, FaCalendarCheck, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";

// Mock Data
const MY_EVENTS = [
    // Đang tham gia / Sắp tới
    { id: 1, title: "Mùa hè xanh 2025", location: "Hà Giang", date: "20/07/2025", status: "Sắp diễn ra", type: "UPCOMING" },
    { id: 2, title: "Dọn dẹp Hồ Tây", location: "Hà Nội", date: "25/01/2025", status: "Đang diễn ra", type: "UPCOMING" },
    // Đã tham gia
    { id: 3, title: "Hiến máu nhân đạo", location: "Hà Nội", date: "10/12/2024", status: "Đã hoàn thành", type: "PAST" },
    { id: 4, title: "Tiếp sức mùa thi 2024", location: "TP.HCM", date: "05/06/2024", status: "Đã hoàn thành", type: "PAST" },
    { id: 5, title: "Áo ấm vùng cao", location: "Lào Cai", date: "15/11/2024", status: "Đã hoàn thành", type: "PAST" },
];

const MyEvents = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('UPCOMING'); // 'UPCOMING' | 'PAST'
    const navigate = useNavigate();

    if (!isOpen) return null;

    const displayedEvents = MY_EVENTS.filter(evt => evt.type === activeTab);

    const handleEventClick = (eventId) => {
        onClose(); // Đóng modal trước
        navigate(`/group/${eventId}`); // Chuyển trang
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col h-[600px] animate-slide-up">

                {/* Header */}
                <div className="bg-green-600 p-4 flex justify-between items-center text-white">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <FaHistory /> Lịch sử hoạt động
                    </h3>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition">
                        <FaTimesCircle size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('UPCOMING')}
                        className={`flex-1 py-3 font-bold text-sm transition ${activeTab === 'UPCOMING' ? 'text-green-600 border-b-2 border-green-600 bg-green-50' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <span className="flex items-center justify-center gap-2"><FaCalendarCheck /> Đang/Sắp tham gia</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('PAST')}
                        className={`flex-1 py-3 font-bold text-sm transition ${activeTab === 'PAST' ? 'text-green-600 border-b-2 border-green-600 bg-green-50' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <span className="flex items-center justify-center gap-2"><FaHistory /> Đã tham gia</span>
                    </button>
                </div>

                {/* List */}
                <div className="p-4 overflow-y-auto flex-1 bg-gray-50 space-y-3 custom-scrollbar">
                    {displayedEvents.length > 0 ? (
                        displayedEvents.map(event => (
                            <div
                                key={event.id}
                                onClick={() => handleEventClick(event.id)}
                                className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer hover:border-green-300"
                            >
                                <h4 className="font-bold text-green-700 text-base mb-1">{event.title}</h4>
                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                                    <span className="flex items-center gap-1"><FaMapMarkerAlt /> {event.location}</span>
                                    <span className="flex items-center gap-1"><FaCalendarAlt /> {event.date}</span>
                                </div>
                                <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold ${event.status === 'Đã hoàn thành'
                                    ? 'bg-gray-200 text-gray-600'
                                    : 'bg-green-100 text-green-700'
                                    }`}>
                                    {event.status}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <p className="italic">Chưa có sự kiện nào trong danh sách này.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 bg-white border-t border-gray-100 text-center">
                    <button onClick={onClose} className="text-gray-500 text-sm hover:text-green-600 font-semibold">
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MyEvents;
