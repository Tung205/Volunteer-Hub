import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimesCircle, FaHistory, FaCalendarCheck, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";
import { getMyRegistrations, cancelRegistration } from '../../api/registrationApi';
import Swal from 'sweetalert2';

const MyEvents = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('UPCOMING'); // 'UPCOMING' | 'PAST'
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Lock Body Scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            fetchRegistrations();
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const fetchRegistrations = async () => {
        setLoading(true);
        try {
            const data = await getMyRegistrations();
            setRegistrations(data || []);
        } catch (error) {
            console.error("Failed to load registrations", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // Filter Logic
    const displayedEvents = registrations.filter(reg => {
        const event = reg.eventId;
        if (!event) return false;

        const now = new Date();
        const endTime = new Date(event.endTime);
        const isCompleted = reg.status === 'COMPLETED' || reg.status === 'ATTENDED';
        const isApproved = reg.status === 'APPROVED';
        const isRejected = reg.status === 'REJECTED';
        const isHost = reg.isHost === true;

        if (activeTab === 'UPCOMING') {
            // TAB ĐANG/SẮP THAM GIA:
            // 1. Sự kiện mình làm HOST (luôn hiện, trừ khi đã qua thời gian thì sang past? User yêu cầu: "Hiện những sự kiện Manager làm host")
            // Update: "những sự kiện bị từ chối hay hết hạn thì cho vào [Đã tham gia]"
            // Vậy HOST cũng phải check time.

            if (isHost) {
                // Host events: Show if future/ongoing. If rejected/expired -> Past tab.
                // Wait, if event is REJECTED (by Admin), it should be in Past?
                // "những sự kiện bị từ chối hay hết hạn thì cho vào [Đã tham gia]" -> Applies to Host events too.
                const isEventRejected = event.status === 'REJECTED';
                if (isEventRejected) return false;
                if (endTime < now) return false;
                return true;
            }

            // 2. Sự kiện đăng ký (APPROVED only, no PENDING)
            // "những sự kiện nào đang chờ duyệt thì không hiện" -> PENDING removed.
            return isApproved && endTime >= now;

        } else {
            // TAB ĐÃ THAM GIA:
            // 1. REJECTED registrations
            if (isRejected) return true;

            // 2. COMPLETED/ATTENDED or Expired APPROVED/HOST
            if (isCompleted) return true;

            // 3. Expired events (Host or Approved)
            if ((isApproved || isHost) && endTime < now) return true;

            // 4. Host events that are REJECTED (by Admin)
            if (isHost && event.status === 'REJECTED') return true;

            return false;
        }
    }).map(reg => {
        // Map to display format
        const event = reg.eventId;
        return {
            id: event._id,
            title: event.title,
            location: event.location,
            date: new Date(event.startTime).toLocaleDateString('vi-VN'),
            status: reg.status,
            coverImageUrl: event.coverImageUrl,
            isHost: reg.isHost
        };
    });

    const handleEventClick = (eventId) => {
        onClose();
        navigate(`/group/${eventId}`);
    };

    const handleCancelRegistration = async (e, eventId, title) => {
        e.stopPropagation(); // Prevent ensuring parent click (navigate)
        try {
            const result = await Swal.fire({
                title: 'Hủy đăng ký?',
                text: `Bạn có chắc muốn hủy đăng ký tham gia "${title}"?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Hủy đăng ký',
                cancelButtonText: 'Đóng'
            });

            if (result.isConfirmed) {
                await cancelRegistration(eventId);
                Swal.fire("Đã hủy", `Đã hủy đăng ký sự kiện ${title}`, "success");
                // Refresh list
                fetchRegistrations();
            }
        } catch (error) {
            Swal.fire("Lỗi", "Không thể hủy đăng ký. Có thể đã quá hạn hủy.", "error");
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-700';
            case 'PENDING': return 'bg-yellow-100 text-yellow-700';
            case 'REJECTED': return 'bg-red-100 text-red-700';
            case 'COMPLETED': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'APPROVED': return 'Đã duyệt';
            case 'PENDING': return 'Chờ duyệt';
            case 'REJECTED': return 'Từ chối';
            case 'COMPLETED': return 'Hoàn thành';
            default: return status;
        }
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
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        </div>
                    ) : displayedEvents.length > 0 ? (
                        displayedEvents.map(event => (
                            <div
                                key={event.id}
                                onClick={() => handleEventClick(event.id)}
                                className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition cursor-pointer hover:border-green-300"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-green-700 text-base flex-1">
                                        {event.isHost && (
                                            <span className="inline-block px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] rounded mr-2 align-middle border border-purple-200">
                                                HOST
                                            </span>
                                        )}
                                        {event.title}
                                    </h4>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                                    <span className="flex items-center gap-1"><FaMapMarkerAlt /> {event.location}</span>
                                    <span className="flex items-center gap-1"><FaCalendarAlt /> {event.date}</span>
                                </div>
                                <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold ${getStatusBadge(event.status)}`}>
                                    {getStatusText(event.status)}
                                </span>
                                {event.status === 'PENDING' && (
                                    <button
                                        onClick={(e) => handleCancelRegistration(e, event.id, event.title)}
                                        className="inline-block ml-2 px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] font-bold hover:bg-red-200 transition"
                                    >
                                        Hủy
                                    </button>
                                )}
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
        </div >
    );
};

export default MyEvents;
