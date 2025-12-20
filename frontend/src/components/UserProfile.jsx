import React, { useState, useEffect } from 'react';
import { IoClose, IoPencil, IoSend } from "react-icons/io5";
import Swal from 'sweetalert2';
import ForgotPassword from './ForgotPassword';

const UserProfile = ({ isOpen, onClose, user }) => {
  // --- STATES ---
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Form Data States
  const [name, setName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [requestReason, setRequestReason] = useState("");

  // UI Toggle States
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showManagerRequest, setShowManagerRequest] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);

  // Sync data khi mở
  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  // --- LOGIC CHECK CHANGE ---
  // Nút Lưu chỉ xanh khi: Tên thay đổi HOẶC Có nhập mật khẩu mới
  const hasChanges = (name !== user.name) || (oldPassword && newPassword);

  // --- HANDLERS ---
  const handleSave = () => {
    if (!hasChanges) return;

    // Logic call API update profile
    console.log("Saving...", { name, oldPassword, newPassword });

    Swal.fire("Thành công", "Thông tin đã được cập nhật!", "success");
    // Reset fields password sau khi lưu
    setOldPassword("");
    setNewPassword("");
    setShowPasswordChange(false);
    setIsEditingName(false);
  };

  const handleSendRequestManager = () => {
    if (!requestReason.trim()) {
      Swal.fire("Lỗi", "Vui lòng nhập lý do!", "warning");
      return;
    }

    // --- TODO: BACKEND INTEGRATION FLOW ---
    // 1. Prepare Payload:
    //    const payload = {
    //      userId: user.id,
    //      currentRole: user.role,
    //      requestedRole: 'MANAGER',
    //      reason: requestReason,
    //      timestamp: new Date().toISOString()
    //    };

    // 2. Call API Endpoint:
    //    await api.post('/api/users/upgrade-request', payload);

    // 3. Notification Logic (Backend side):
    //    - Create a notification for ADMIN role: "User {name} requested to upgrade to Manager."
    //    - Add request to the 'Pending Upgrades' queue in Admin Dashboard.

    // 4. UI Feedback:
    console.log("Request Manager Reason:", requestReason);
    Swal.fire("Đã gửi", "Yêu cầu nâng cấp tài khoản đang được Admin xem xét.", "success");
    setShowManagerRequest(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative flex flex-col">

          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
            <h2 className="text-xl font-bold text-gray-800">Thông tin cá nhân</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition">
              <IoClose size={28} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">

            {/* 1. Avatar & Name */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-3xl font-bold mb-3 border-4 border-white shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>

              {/* Name Field với nút Bút chì */}
              <div className="flex items-center gap-2 w-full justify-center">
                {isEditingName ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                    className="text-center font-bold text-xl border-b-2 border-green-500 outline-none px-2 py-1"
                    onBlur={() => setIsEditingName(false)} // Tự tắt khi click ra ngoài
                  />
                ) : (
                  <h3 className="text-xl font-bold text-gray-800">{name}</h3>
                )}
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-gray-400 hover:text-green-600 p-1"
                  title="Sửa tên"
                >
                  <IoPencil />
                </button>
              </div>
              <p className="text-gray-500 text-sm">{user.email}</p>
            </div>

            {/* 3. Nút Đổi mật khẩu (Toggle) */}
            <div>
              <button
                onClick={() => setShowPasswordChange(!showPasswordChange)}
                className="text-green-700 font-semibold text-sm hover:underline flex items-center gap-1"
              >
                {showPasswordChange ? "Hủy đổi mật khẩu" : "Đổi mật khẩu"}
              </button>

              {/* Form Đổi mật khẩu */}
              {showPasswordChange && (
                <div className="mt-4 space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100 animate-slide-down">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mật khẩu cũ</label>
                    <input
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:border-green-500 outline-none bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mật khẩu mới</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:border-green-500 outline-none bg-white"
                    />
                  </div>
                  <div className="text-right">
                    <button
                      onClick={() => setIsForgotPasswordOpen(true)}
                      className="text-xs text-red-500 hover:underline italic"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Footer: Nút Lưu */}
          <div className="p-6 border-t border-gray-100 mt-auto">
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={`w-full py-3 rounded-xl font-bold text-lg transition-all duration-300 ${hasChanges
                ? "bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-green-200 cursor-pointer transform hover:-translate-y-0.5"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
            >
              Lưu thay đổi
            </button>
          </div>

        </div>
      </div>

      {/* Popup Quên Mật Khẩu (Nằm đè lên trên Popup Profile) */}
      <ForgotPassword
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
    </>
  );
};

export default UserProfile;