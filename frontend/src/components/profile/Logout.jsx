import React from 'react';
import { IoWarningOutline } from "react-icons/io5";

const Logout = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    // Lớp phủ mờ
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      
      {/* Hộp nội dung */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
        
        {/* Icon cảnh báo & Tiêu đề */}
        <div className="flex flex-col items-center text-center">
          <div className="bg-red-100 p-3 rounded-full mb-4">
            <IoWarningOutline className="text-red-600 text-3xl" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Đăng xuất?</h3>
          <p className="text-gray-500 text-sm mb-6">
            Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?
          </p>
        </div>

        {/* Các nút hành động */}
        <div className="flex gap-3">
          {/* Nút Hủy (Xám) */}
          <button 
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
          >
            Hủy
          </button>

          {/* Nút Xác nhận (Đỏ) */}
          <button 
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-md hover:shadow-lg transition"
          >
            Đăng xuất
          </button>
        </div>

      </div>
    </div>
  );
};

export default Logout;