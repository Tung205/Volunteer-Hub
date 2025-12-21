import React, { useState, useEffect } from 'react';
import { FaCalculator, FaClock, FaUserCog, FaTimesCircle } from "react-icons/fa";
import UpdateRole from './UpdateRole';
import MyEvents from './MyEvents';
import { getMyManagerRequest, createManagerRequest } from '../../api/managerRequestApi';
import { getMyRegistrations } from '../../api/registrationApi';
import Swal from 'sweetalert2';

const VolunteerView = ({ roleName }) => { // roleName = 'TNV' or 'VOLUNTEER'
    const [registrations, setRegistrations] = useState([]);
    const [upgradeRequest, setUpgradeRequest] = useState(null);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [showMyEventsModal, setShowMyEventsModal] = useState(false);
    const [showPendingListModal, setShowPendingListModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const [regData, reqData] = await Promise.all([
                getMyRegistrations(),
                getMyManagerRequest()
            ]);
            console.log("Registrations loaded:", regData); // Debug log
            setRegistrations(regData || []);
            setUpgradeRequest(reqData);
        };
        fetchData();
    }, []);

    const handleUpgradeSubmit = async (reason) => {
        try {
            await createManagerRequest(reason);
            const reqData = await getMyManagerRequest();
            setUpgradeRequest(reqData);
            setShowUpgradeModal(false);
            Swal.fire('Thành công', 'Yêu cầu của bạn đã được gửi và đang chờ duyệt.', 'success');
        } catch (error) {
            Swal.fire('Lỗi', 'Không thể gửi yêu cầu.', 'error');
        }
    };

    // Update count logic: Include PENDING, APPROVED, COMPLETED (basically everything except REJECTED/CANCELLED?)
    // Or just all registrations? The user said "Tham gia 3 sự kiện" for pending ones. 
    // Let's count everything that is NOT Cancelled/Rejected.
    const joinedCount = registrations.filter(r => ['PENDING', 'APPROVED', 'COMPLETED'].includes(r.status)).length;
    const pendingList = registrations.filter(r => r.status === 'PENDING');


    return (
        <div className="space-y-6">
            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Card 1: My Events */}
                <div
                    onClick={() => setShowMyEventsModal(true)}
                    className="bg-green-200 rounded-[20px] hover:bg-green-100 p-6 flex flex-col items-center justify-center shadow-sm relative overflow-hidden cursor-pointer"
                >
                    <div className="bg-green-500 p-3 rounded-full absolute top-4 left-4 shadow-sm text-white">
                        <FaCalculator size={20} />
                    </div>
                    <div className="mt-8 text-center">
                        <span className="text-4xl font-black text-green-800 block mb-1">{joinedCount}</span>
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
                            {pendingList.length}
                        </span>
                        <p className="font-bold text-gray-800 text-sm">Chờ duyệt</p>
                    </div>
                </div>

                {/* Card 3: Upgrade Role */}
                <div
                    onClick={() => {
                        if (upgradeRequest && upgradeRequest.status === 'PENDING') {
                            Swal.fire('Đã gửi yêu cầu', 'Yêu cầu nâng cấp của bạn đang chờ Admin duyệt.', 'info');
                        } else {
                            setShowUpgradeModal(true);
                        }
                    }}
                    className="bg-green-200 rounded-[20px] p-6 flex flex-col items-center justify-center shadow-sm relative overflow-hidden cursor-pointer hover:bg-green-100 transition"
                >
                    <div className="bg-green-500 p-3 rounded-full absolute top-4 left-4 shadow-sm text-white">
                        <FaUserCog size={20} />
                    </div>
                    <div className="mt-8 text-center">
                        <span className="bg-gray-100 text-green-800 text-lg font-bold px-4 py-1 rounded-full shadow-sm block mb-2">
                            {roleName}
                        </span>
                        {upgradeRequest && upgradeRequest.status === 'PENDING' ? (
                            <span className="inline-block px-2 py-0.5 bg-yellow-400 text-black text-xs font-bold rounded-full mb-1">Đang chờ duyệt</span>
                        ) : (
                            <p className="font-bold text-gray-800 text-sm">Nâng cấp Manager</p>
                        )}

                    </div>
                </div>
            </div>

            {/* Modals */}
            <UpdateRole
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                onSubmit={handleUpgradeSubmit}
            />
            <MyEvents isOpen={showMyEventsModal} onClose={() => setShowMyEventsModal(false)} />

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

                        <div className="p-4 overflow-y-auto flex-1 bg-gray-50 space-y-3">
                            {pendingList.length > 0 ? pendingList.map(item => (
                                <div key={item._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-gray-800">{item.eventId?.title || 'Đang tải...'}</p>
                                        <p className="text-sm text-gray-500">Đăng ký sự kiện - {new Date(item.registeredAt).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                                        {item.status}
                                    </span>
                                </div>
                            )) : <p className="text-center text-gray-500 italic">Không có yêu cầu nào đang chờ.</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VolunteerView;
