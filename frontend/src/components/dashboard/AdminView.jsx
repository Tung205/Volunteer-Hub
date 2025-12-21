import React, { useState } from 'react';
import { FaCloudDownloadAlt, FaClock, FaUserCog, FaTimesCircle } from "react-icons/fa";
import Swal from 'sweetalert2';
import UserManagement from './UserManagement';
import InfoEvent from '../event/InfoEvent';
import { MOCK_PENDING_DATA } from '../../data/mockData';

const AdminView = () => {
    const [adminPendingList, setAdminPendingList] = useState(MOCK_PENDING_DATA.ADMIN);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showPendingListModal, setShowPendingListModal] = useState(false);
    const [selectedPendingEvent, setSelectedPendingEvent] = useState(null);

    const getPendingCount = () => {
        return adminPendingList.EVENTS.length + adminPendingList.UPGRADES.length;
    };

    const handleOpenReview = (event) => {
        setSelectedPendingEvent(event);
        setShowPendingListModal(false);
    };

    const handleApproveEvent = () => {
        Swal.fire({
            title: 'Duyệt sự kiện?',
            text: `Bạn có chắc chắn muốn duyệt sự kiện "${selectedPendingEvent?.title}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Duyệt ngay',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                // TODO: API Call
                setAdminPendingList(prev => ({
                    ...prev,
                    EVENTS: prev.EVENTS.filter(e => e.id !== selectedPendingEvent.id)
                }));
                setSelectedPendingEvent(null);
                Swal.fire('Đã duyệt!', 'Sự kiện đã được công khai.', 'success');
            }
        });
    };

    const handleRejectEvent = () => {
        Swal.fire({
            title: 'Từ chối sự kiện?',
            icon: 'warning',
            input: 'textarea',
            inputPlaceholder: 'Nhập lý do từ chối...',
            showCancelButton: true,
            confirmButtonText: 'Từ chối',
            confirmButtonColor: '#d33',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                // TODO: API Call
                setAdminPendingList(prev => ({
                    ...prev,
                    EVENTS: prev.EVENTS.filter(e => e.id !== selectedPendingEvent.id)
                }));
                setSelectedPendingEvent(null);
                Swal.fire('Đã từ chối!', 'Sự kiện đã bị loại bỏ.', 'info');
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Card 1: Export */}
                <div
                    onClick={() => console.log("Export Data API Call")}
                    className="bg-green-200 rounded-[20px] p-6 flex flex-col items-center justify-center shadow-sm cursor-pointer hover:bg-green-100 transition relative overflow-hidden"
                >
                    <div className="bg-green-500 p-3 rounded-full absolute top-4 left-4 shadow-sm text-white">
                        <FaCloudDownloadAlt size={20} />
                    </div>
                    <div className="mt-8 text-center">
                        <span className="text-xl font-bold text-green-800 block mb-1">Xuất dữ liệu</span>
                        <p className="font-bold text-gray-800 text-xs">(Click để tải về)</p>
                    </div>
                </div>

                {/* Card 2: Pending */}
                <div
                    onClick={() => setShowPendingListModal(true)}
                    className="bg-green-200 rounded-[20px] p-6 flex flex-col items-center justify-center shadow-sm cursor-pointer hover:bg-green-100 transition relative overflow-hidden"
                >
                    <div className="bg-green-500 p-3 rounded-full absolute top-4 left-4 shadow-sm text-white">
                        <FaClock size={20} />
                    </div>
                    <div className="mt-8 text-center">
                        <span className="text-4xl font-black text-green-800 block mb-1">
                            {getPendingCount()}
                        </span>
                        <p className="font-bold text-gray-800 text-sm">Chờ duyệt</p>
                    </div>
                </div>

                {/* Card 3: User Management */}
                <div
                    onClick={() => setShowUserModal(true)}
                    className="bg-green-200 rounded-[20px] p-6 flex flex-col items-center justify-center shadow-sm relative overflow-hidden cursor-pointer hover:bg-green-100 transition"
                >
                    <div className="bg-green-500 p-3 rounded-full absolute top-4 left-4 shadow-sm text-white">
                        <FaUserCog size={20} />
                    </div>
                    <div className="mt-8 text-center">
                        <span className="bg-gray-100 text-green-800 text-lg font-bold px-4 py-1 rounded-full shadow-sm block mb-2">
                            ADMIN
                        </span>
                        <p className="font-bold text-gray-800 text-sm">Quản lý User</p>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <UserManagement isOpen={showUserModal} onClose={() => setShowUserModal(false)} />

            {/* Pending List Modal */}
            {showPendingListModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-xl font-bold text-gray-800">Danh sách chờ duyệt</h3>
                            <button onClick={() => setShowPendingListModal(false)} className="text-gray-500 hover:text-red-500 transition">
                                <FaTimesCircle size={24} />
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto flex-1 bg-gray-50 space-y-6">
                            {/* Events */}
                            <div>
                                <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <FaClock className="text-green-600" /> Sự kiện chờ duyệt ({adminPendingList.EVENTS.length})
                                </h4>
                                <div className="space-y-2">
                                    {adminPendingList.EVENTS.length > 0 ? adminPendingList.EVENTS.map(evt => (
                                        <div
                                            key={evt.id}
                                            onClick={() => handleOpenReview(evt)}
                                            className="bg-white p-3 rounded-lg border hover:border-green-500 cursor-pointer transition flex justify-between items-center group"
                                        >
                                            <div>
                                                <span className="font-bold text-gray-800 block">{evt.title}</span>
                                                <span className="text-xs text-gray-500">Bởi: {evt.organizerName}</span>
                                            </div>
                                            <button className="text-sm text-green-600 underline opacity-0 group-hover:opacity-100 transition">Xem chi tiết</button>
                                        </div>
                                    )) : <p className="text-sm text-gray-400 italic">Trống</p>}
                                </div>
                            </div>

                            {/* Upgrades */}
                            <div>
                                <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <FaUserCog className="text-blue-600" /> Yêu cầu nâng cấp Manager ({adminPendingList.UPGRADES.length})
                                </h4>
                                <div className="space-y-2">
                                    {adminPendingList.UPGRADES.length > 0 ? adminPendingList.UPGRADES.map(req => (
                                        <div key={req.id} className="bg-white p-4 rounded-lg border border-gray-100">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-bold text-gray-800">{req.userName}</p>
                                                    <p className="text-sm text-gray-600 italic">"{req.reason}"</p>
                                                    <p className="text-xs text-gray-400 mt-1">{req.date}</p>
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-3 mt-2">
                                                <button
                                                    onClick={() => {
                                                        Swal.fire("Đã duyệt", `Đã nâng cấp quyền cho ${req.userName}`, "success");
                                                        setAdminPendingList(prev => ({ ...prev, UPGRADES: prev.UPGRADES.filter(i => i.id !== req.id) }));
                                                    }}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-semibold transition"
                                                >
                                                    Duyệt
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        Swal.fire("Đã từ chối", `Đã từ chối yêu cầu của ${req.userName}`, "info");
                                                        setAdminPendingList(prev => ({ ...prev, UPGRADES: prev.UPGRADES.filter(i => i.id !== req.id) }));
                                                    }}
                                                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-1.5 rounded text-sm font-semibold transition"
                                                >
                                                    Từ chối
                                                </button>
                                            </div>
                                        </div>
                                    )) : <p className="text-sm text-gray-400 italic">Trống</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Event Detail Review */}
            {selectedPendingEvent && (
                <InfoEvent
                    isOpen={!!selectedPendingEvent}
                    onClose={() => {
                        setSelectedPendingEvent(null);
                        setShowPendingListModal(true);
                    }}
                    event={selectedPendingEvent}
                    isReviewMode={true}
                    onApprove={handleApproveEvent}
                    onReject={handleRejectEvent}
                />
            )}
        </div>
    );
};

export default AdminView;
