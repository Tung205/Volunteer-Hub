import React, { useState, useEffect } from 'react';
import { FaCloudDownloadAlt, FaClock, FaUserCog, FaTimesCircle } from "react-icons/fa";
import Swal from 'sweetalert2';
import UserManagement from './UserManagement';
import InfoEvent from '../event/InfoEvent';
import { getAllUsers } from '../../api/userApi';
import { getAllEventsForExport, getPendingEvents, approveEvent, rejectEvent } from '../../api/eventApi';
import { exportMergedToCSV, exportToJSON } from '../../utils/exportUtils';
import api from '../../api/axios';

const AdminView = () => {
    const [adminPendingList, setAdminPendingList] = useState({ EVENTS: [], UPGRADES: [] });
    const [showUserModal, setShowUserModal] = useState(false);
    const [showPendingListModal, setShowPendingListModal] = useState(false);
    const [selectedPendingEvent, setSelectedPendingEvent] = useState(null);
    const [adminPendingListTab, setAdminTab] = useState('EVENTS');

    useEffect(() => {
        if (showPendingListModal) {
            fetchPendingEvents();
        }
    }, [showPendingListModal]);

    const fetchPendingEvents = async () => {
        try {
            const { events } = await getPendingEvents();
            // Upgrades are not implemented in backend yet, so empty list
            setAdminPendingList({ EVENTS: events || [], UPGRADES: [] });
        } catch (error) {
            console.error("Error fetching pending:", error);
        }
    };

    const getPendingCount = () => {
        return adminPendingList.EVENTS.length + adminPendingList.UPGRADES.length;
    };

    const handleExport = async () => {
        // Step 1: Choose Format
        const { value: format } = await Swal.fire({
            title: 'Chọn định dạng xuất',
            text: 'Sẽ xuất cả danh sách Người dùng và Sự kiện',
            input: 'radio',
            inputOptions: {
                'csv': 'CSV (Excel)',
                'json': 'JSON'
            },
            inputValue: 'csv',
            showCancelButton: true,
            confirmButtonText: 'Tải xuống',
            cancelButtonText: 'Hủy'
        });

        if (!format) return;

        // Show Loading
        Swal.fire({
            title: 'Đang tải dữ liệu...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            // Execute Export - Fetch BOTH
            const [users, events] = await Promise.all([
                getAllUsers(),
                getAllEventsForExport()
            ]);

            console.log("Export Data - Users:", users);
            console.log("Export Data - Events:", events);

            const filename = 'volunteer_hub_full_data';

            if (format === 'csv') {
                exportMergedToCSV(users, events, filename);
            } else {
                // Merge for JSON
                const mergedData = {
                    users: users,
                    events: events
                };
                exportToJSON(mergedData, filename);
            }

            Swal.fire({
                icon: 'success',
                title: 'Đã xuất dữ liệu!',
                text: `Đã tải xuống file ${filename}.${format}`,
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error("Export Error:", error);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi xuất dữ liệu',
                text: 'Không thể tải dữ liệu từ server.'
            });
        }
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
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await approveEvent(selectedPendingEvent._id);

                    setAdminPendingList(prev => ({
                        ...prev,
                        EVENTS: prev.EVENTS.filter(e => e._id !== selectedPendingEvent._id)
                    }));
                    setSelectedPendingEvent(null);
                    Swal.fire('Đã duyệt!', 'Sự kiện đã được công khai.', 'success');
                } catch (error) {
                    Swal.fire('Lỗi', error.response?.data?.error || 'Không thể duyệt sự kiện', 'error');
                }
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
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const reason = result.value;
                    await rejectEvent(selectedPendingEvent._id, reason);

                    setAdminPendingList(prev => ({
                        ...prev,
                        EVENTS: prev.EVENTS.filter(e => e._id !== selectedPendingEvent._id)
                    }));
                    setSelectedPendingEvent(null);
                    Swal.fire('Đã từ chối!', 'Sự kiện đã bị loại bỏ.', 'info');
                } catch (error) {
                    Swal.fire('Lỗi', error.response?.data?.error || 'Không thể từ chối sự kiện', 'error');
                }
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Card 1: Export */}
                <div
                    onClick={handleExport}
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
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col h-[80vh]"> {/* Fixed Height */}
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-xl font-bold text-gray-800">Danh sách chờ duyệt</h3>
                            <button onClick={() => setShowPendingListModal(false)} className="text-gray-500 hover:text-red-500 transition">
                                <FaTimesCircle size={24} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b bg-gray-50 px-4 pt-2">
                            <button
                                onClick={() => setAdminTab('EVENTS')}
                                className={`pb-3 px-4 font-semibold text-sm transition relative ${adminPendingListTab === 'EVENTS' ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <FaClock /> Sự kiện chờ duyệt
                                    <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">{adminPendingList.EVENTS.length}</span>
                                </div>
                                {adminPendingListTab === 'EVENTS' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600"></div>}
                            </button>
                            <button
                                onClick={() => setAdminTab('UPGRADES')}
                                className={`pb-3 px-4 font-semibold text-sm transition relative ${adminPendingListTab === 'UPGRADES' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <FaUserCog /> Nâng cấp Manager
                                    <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">{adminPendingList.UPGRADES.length}</span>
                                </div>
                                {adminPendingListTab === 'UPGRADES' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto flex-1 bg-gray-50">
                            {/* Events Tab */}
                            {adminPendingListTab === 'EVENTS' && (
                                <div className="space-y-2">
                                    {adminPendingList.EVENTS.length > 0 ? adminPendingList.EVENTS.map(evt => (
                                        <div
                                            key={evt._id}
                                            onClick={() => handleOpenReview(evt)}
                                            className="bg-white p-4 rounded-lg border border-gray-100 hover:border-green-500 cursor-pointer transition flex justify-between items-center group shadow-sm"
                                        >
                                            <div>
                                                <span className="font-bold text-gray-800 block text-lg">{evt.title}</span>
                                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                    <span>Bởi: <span className="font-medium text-gray-700">{evt.organizerId?.name || evt.organizerName}</span></span>
                                                    <span>•</span>
                                                    <span>{evt.date || 'TBD'}</span>
                                                </div>
                                            </div>
                                            <button className="bg-green-50 text-green-600 px-3 py-1 rounded text-sm font-medium opacity-0 group-hover:opacity-100 transition">
                                                Xem chi tiết
                                            </button>
                                        </div>
                                    )) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400 py-10">
                                            <FaClock size={40} className="mb-2 opacity-20" />
                                            <p className="italic">Không có sự kiện nào chờ duyệt</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Upgrades Tab */}
                            {adminPendingListTab === 'UPGRADES' && (
                                <div className="space-y-3">
                                    {adminPendingList.UPGRADES.length > 0 ? adminPendingList.UPGRADES.map(req => (
                                        <div key={req.id} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                        {req.userName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-800">{req.userName}</p>
                                                        <p className="text-xs text-gray-400">{req.date}</p>
                                                    </div>
                                                </div>
                                                <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium">Pending</span>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-md mb-3 text-sm text-gray-600 italic border border-gray-100">
                                                "{req.reason}"
                                            </div>
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => {
                                                        Swal.fire("Đã từ chối", `Đã từ chối yêu cầu của ${req.userName}`, "info");
                                                        setAdminPendingList(prev => ({ ...prev, UPGRADES: prev.UPGRADES.filter(i => i.id !== req.id) }));
                                                    }}
                                                    className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium text-sm transition"
                                                >
                                                    Từ chối
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        Swal.fire("Đã duyệt", `Đã nâng cấp quyền cho ${req.userName}`, "success");
                                                        setAdminPendingList(prev => ({ ...prev, UPGRADES: prev.UPGRADES.filter(i => i.id !== req.id) }));
                                                    }}
                                                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition shadow-sm"
                                                >
                                                    Chấp nhận
                                                </button>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400 py-10">
                                            <FaUserCog size={40} className="mb-2 opacity-20" />
                                            <p className="italic">Không có yêu cầu nâng cấp nào</p>
                                        </div>
                                    )}
                                </div>
                            )}
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
