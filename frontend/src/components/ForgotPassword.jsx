import React, { useState } from 'react';
import { IoClose } from "react-icons/io5";
import Swal from 'sweetalert2';

const ForgotPassword = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Call API Forgot Password here
    Swal.fire("Đã gửi!", `Link đặt lại mật khẩu đã được gửi tới ${email}`, "success");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
          <IoClose size={24} />
        </button>

        <h3 className="text-xl font-bold text-gray-800 mb-2">Quên mật khẩu?</h3>
        <p className="text-sm text-gray-500 mb-6">Nhập email của bạn để nhận liên kết đặt lại mật khẩu.</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="nhap_email_cua_ban@gmail.com"
            />
          </div>
          <button type="submit" className="w-full bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition">
            Gửi yêu cầu
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;