import React, { useState } from 'react';
import { FaCalculator, FaClock, FaUserCog, FaTimesCircle } from "react-icons/fa";
import Swal from 'sweetalert2';
import CreateEventModal from '../CreateEventModal';
import MyEvents from '../MyEvents';
import { MOCK_PENDING_DATA } from '../../data/mockData';

const ManagerView = () => {
    const [managerPendingList, setManagerPendingList] = useState(MOCK_PENDING_DATA.MANAGER);
    const [showCreateEventModal, setShowCreateEventModal] = useState(false);
    const [showMyEventsModal, setShowMyEventsModal] = useState(false);
    const [showPendingListModal, setShowPendingListModal] = useState(false);
    const [managerTab, setManagerTab] = useState('MANAGING');

    const getPendingCount = () => {
        return managerPendingList.MANAGING.length + managerPendingList.OTHER.length;
    };

    return (
        <div className="space-y-6">
            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Card 1: My Events + Managing */}
                <div
                    onClick={() => setShowMyEventsModal(true)}
                    className="bg-green-200 rounded-[20px] hover:bg-green-100 p-6 flex flex-col items-center justify-center shadow-sm relative overflow-hidden cursor-pointer"
                >
                    <div className="bg-green-500 p-3 rounded-full absolute top-4 left-4 shadow-sm text-white">
                        <FaCalculator size={20} />
                    </div>
                    <div className="mt-8 text-center">
                        <span className="text-4xl font-black text-green-800 block mb-1">15</span>
                        <p className="font-bold text-gray-800 text-sm">Sự kiện tham gia</p>
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

                {/* Card 3: Create Event (Role) */}
                <div
                    onClick={() => setShowCreateEventModal(true)}
                    className="bg-green-200 rounded-[20px] p-6 flex flex-col items-center justify-center shadow-sm relative overflow-hidden cursor-pointer hover:bg-green-100 transition"
                >
                    <div className="bg-green-500 p-3 rounded-full absolute top-4 left-4 shadow-sm text-white">
                        <FaUserCog size={20} />
                    </div>
                    <div className="mt-8 text-center">
                        <span className="bg-gray-100 text-green-800 text-lg font-bold px-4 py-1 rounded-full shadow-sm block mb-2">
                            MANAGER
                        </span>
                        <p className="font-bold text-gray-800 text-sm">Tạo sự kiện mới</p>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreateEventModal isOpen={showCreateEventModal} onClose={() => setShowCreateEventModal(false)} />
            <MyEvents isOpen={showMyEventsModal} onClose={() => setShowMyEventsModal(false)} />

            {/* Pending List Modal */}
            {showPendingListModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-xl font-bold text-gray-800">Quản lý yêu cầu</h3>
                            <button onClick={() => setShowPendingListModal(false)} className="text-gray-500 hover:text-red-500 transition">
                                <FaTimesCircle size={24} />
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto flex-1 bg-gray-50">
                            {/* Tabs */}
                            <div className="flex mb-4 border-b">
                                <button
                                    onClick={() => setManagerTab('MANAGING')}
                                    className={`pb-2 px-4 font-semibold ${managerTab === 'MANAGING' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
                                >
                                    Yêu cầu tham gia
                                </button>
                                <button
                                    onClick={() => setManagerTab('OTHER')}
                                    className={`pb-2 px-4 font-semibold ${managerTab === 'OTHER' ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500'}`}
                                >
                                    Khác (Của tôi)
                                </button>
                            </div>

                            {/* Content */}
                            {managerTab === 'MANAGING' ? (
                                <div className="space-y-3">
                                    {managerPendingList.MANAGING.length > 0 ? managerPendingList.MANAGING.map(req => (
                                        <div key={req.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                                            <div>
                                                <p className="font-bold text-gray-800">{req.userName}</p>
                                                <p className="text-sm text-gray-500">Xin tham gia: <span className="font-medium text-green-700">{req.eventTitle}</span></p>
                                                <p className="text-xs text-gray-400">{req.date}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        Swal.fire("Đã duyệt", `Đã chấp nhận ${req.userName}`, "success");
                                                        setManagerPendingList(prev => ({ ...prev, MANAGING: prev.MANAGING.filter(i => i.id !== req.id) }));
                                                    }}
                                                    className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-md text-sm font-semibold transition"
                                                >
                                                    Duyệt
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        Swal.fire("Đã từ chối", `Đã từ chối ${req.userName}`, "info");
                                                        setManagerPendingList(prev => ({ ...prev, MANAGING: prev.MANAGING.filter(i => i.id !== req.id) }));
                                                    }}
                                                    className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-md text-sm font-semibold transition"
                                                >
                                                    Từ chối
                                                </button>
                                            </div>
                                        </div>
                                    )) : <p className="text-center text-gray-500 italic">Không có yêu cầu tham gia nào.</p>}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {managerPendingList.OTHER.length > 0 ? managerPendingList.OTHER.map(item => (
                                        <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-gray-800">{item.title}</p>
                                                <p className="text-sm text-gray-500">Trạng thái: {item.status}</p>
                                            </div>
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                                Đang chờ
                                            </span>
                                        </div>
                                    )) : <p className="text-center text-gray-500 italic">Không có phê duyệt nào đang chờ.</p>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerView;
