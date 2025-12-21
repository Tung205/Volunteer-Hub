import React, { useState, useEffect } from 'react';
import { IoClose, IoPencil } from "react-icons/io5";
import Swal from 'sweetalert2';
import api from '../../api/axios';
import ChangePassword from './ChangePassword';
import ForgotPassword from './ForgotPassword';

const UserProfile = ({ isOpen, onClose, user: initialUser }) => {
  const [userData, setUserData] = useState(null);

  // Form Data
  const [name, setName] = useState(initialUser?.name || "");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  // UI States
  const [isEditing, setIsEditing] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Sync data
  useEffect(() => {
    if (isOpen && initialUser) {
      const fetchProfile = async () => {
        try {
          const res = await api.get('/users/me');
          const data = res.data.user;
          setUserData(data);

          setName(data.name || "");
          setGender(data.gender || "MALE");
          if (data.dateOfBirth) {
            const formattedDate = new Date(data.dateOfBirth).toISOString().split('T')[0];
            setDateOfBirth(formattedDate);
          } else {
            setDateOfBirth("");
          }
        } catch (error) {
          console.error("Failed to fetch profile", error);
          Swal.fire("Lỗi", "Không thể tải thông tin cá nhân", "error");
        }
      };
      fetchProfile();
    }
  }, [isOpen, initialUser]);

  if (!isOpen) return null;

  const displayUser = userData || initialUser;
  if (!displayUser) return null;

  const hasChanges = (name !== displayUser.name) ||
    (gender !== displayUser.gender) ||
    (dateOfBirth !== (displayUser.dateOfBirth ? new Date(displayUser.dateOfBirth).toISOString().split('T')[0] : ""));

  const handleSave = async () => {
    if (!name.trim()) return Swal.fire("Lỗi", "Tên không được để trống", "warning");

    try {
      const payload = {
        name,
        gender,
        dateOfBirth,
      };

      const res = await api.patch('/users/me', payload);

      Swal.fire("Thành công", "Cập nhật hồ sơ thành công!", "success");
      setUserData(res.data.user);
      setIsEditing(false);

    } catch (error) {
      console.error("Update error:", error);
      Swal.fire("Lỗi", error.response?.data?.error || "Cập nhật thất bại", "error");
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative flex flex-col">

          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
            <h2 className="text-xl font-bold text-gray-800">Thông tin cá nhân</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition">
              <IoClose size={28} />
            </button>
          </div>

          {/* Body */}
          <div className="p-8 space-y-8">

            {/* Top Section: Avatar & Info */}
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              {/* Avatar */}
              <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-5xl font-bold border-4 border-white shadow-md shrink-0">
                {displayUser.name?.charAt(0).toUpperCase()}
              </div>

              {/* Info Display (Removed H3 Name as per request to have it in Display name field only/or separate) 
                    Actually user said: "tôi muốn phần này ... hiện ở Display name". 
                    I'll keep the side info simple (Email, Status, Role) and let Name be in the form below.
                */}
              <div className="flex-grow space-y-2 text-center md:text-left pt-2">
                <p className="text-gray-500 font-medium">{displayUser.email}</p>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${displayUser.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {displayUser.status || 'ACTIVE'}
                  </span>
                  <span className="text-sm text-gray-400 font-semibold border border-gray-200 px-2 rounded">
                    {displayUser.roles?.join(', ') || 'N/A'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition ${isEditing ? 'bg-gray-200 text-gray-700' : 'bg-green-600 text-white hover:bg-green-700'}`}
              >
                <IoPencil /> {isEditing ? "Hủy chỉnh sửa" : "Chỉnh sửa"}
              </button>
            </div>

            {/* Detailed Info Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Display Name - Here is the "Display name" field where the user likely wants the Name to appear */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Tên hiển thị (Display Name)</label>
                {/* Using the style of the H3 (2xl font bold) inside input if possible, or just standard input */}
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border rounded-xl outline-none transition text-lg font-semibold ${isEditing ? 'border-green-500 bg-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Giới tính</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border rounded-xl outline-none transition ${isEditing ? 'border-green-500 bg-white' : 'bg-gray-50 border-gray-200 text-gray-500 disabled:opacity-100'}`}
                >
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>

              {/* Birthday */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Ngày sinh</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-4 py-2 border rounded-xl outline-none transition ${isEditing ? 'border-green-500 bg-white' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                />
              </div>
            </div>

            {/* Change Password Button - Separated as requested */}
            <div className="border-t pt-6 flex justify-between items-center">
              <p className="text-gray-500 text-sm">Bạn muốn thay đổi mật khẩu?</p>
              <button
                onClick={() => setIsChangePasswordOpen(true)}
                className="px-4 py-2 border border-green-600 text-green-600 font-bold rounded-lg hover:bg-green-50 transition"
              >
                Đổi mật khẩu
              </button>
            </div>

          </div>

          {/* Footer: Save Actions */}
          {isEditing && (
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => {
                  setIsEditing(false);
                  if (userData) {
                    setName(userData.name);
                    setGender(userData.gender);
                    // Re-format dateOfBirth if it exists
                    if (userData.dateOfBirth) {
                      const dateObj = new Date(userData.dateOfBirth);
                      const formattedDate = dateObj.toISOString().split('T')[0];
                      setDateOfBirth(formattedDate);
                    } else {
                      setDateOfBirth("");
                    }
                  }
                }}
                className="px-6 py-2 rounded-lg font-semibold text-gray-600 hover:bg-gray-200 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={`px-6 py-2 rounded-lg font-bold shadow-lg transition transform hover:-translate-y-0.5 ${hasChanges ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-green-200' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                Lưu thay đổi
              </button>
            </div>
          )}

        </div>
      </div>

      <ChangePassword
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </>
  );
};

export default UserProfile;
