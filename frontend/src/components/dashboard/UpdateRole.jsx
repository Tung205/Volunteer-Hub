import React, { useState } from 'react';
import { FaUserCog, FaTimesCircle } from "react-icons/fa";
import Swal from 'sweetalert2';

const UpdateRole = ({ isOpen, onClose }) => {
    const [upgradeReason, setUpgradeReason] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSendUpgradeRequest = () => {
        if (!upgradeReason.trim()) {
            Swal.fire("Lỗi", "Vui lòng nhập lý do!", "warning");
            return;
        }

        // --- TODO: BACKEND INTEGRATION FLOW ---
        // 1. Prepare Payload: userId, currentRole, requestedRole='MANAGER', reason, timestamp
        // 2. Call API: api.post('/api/users/upgrade-request', payload)
        // 3. Notify Admin

        console.log("Upgrade Request:", upgradeReason);
        Swal.fire("Đã gửi", "Yêu cầu nâng cấp tài khoản đang được Admin xem xét.", "success");
        setIsSubmitted(true);
        // onClose(); // Keep open to show state change
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
                <div className="bg-green-600 p-4 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <FaUserCog /> Đăng ký làm Manager
                    </h3>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition">
                        <FaTimesCircle size={24} />
                    </button>
                </div>
                <div className="p-6">
                    <p className="text-gray-600 mb-4 text-sm">
                        Trở thành Manager giúp bạn tổ chức sự kiện, quản lý tình nguyện viên và đóng góp nhiều hơn cho cộng đồng.
                    </p>
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Lý do / Mong muốn:</label>
                        <textarea
                            rows="4"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm resize-none disabled:bg-gray-100"
                            placeholder="Ví dụ: Tôi có kinh nghiệm tổ chức các hoạt động tình nguyện..."
                            value={upgradeReason}
                            onChange={(e) => setUpgradeReason(e.target.value)}
                            disabled={isSubmitted}
                        ></textarea>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-500 hover:text-gray-700 font-semibold text-sm"
                        >
                            Đóng
                        </button>
                        {isSubmitted ? (
                            <button
                                disabled
                                className="bg-gray-400 text-white px-6 py-2 rounded-lg font-bold shadow-md cursor-not-allowed"
                            >
                                Bạn đã gửi yêu cầu
                            </button>
                        ) : (
                            <button
                                onClick={handleSendUpgradeRequest}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold shadow-md transition transform hover:scale-105"
                            >
                                Gửi yêu cầu
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateRole;