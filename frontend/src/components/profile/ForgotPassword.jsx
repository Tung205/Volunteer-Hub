import React, { useState, useEffect } from 'react';
import { IoClose } from "react-icons/io5";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Swal from 'sweetalert2';
import api from '../../api/axios';

const ForgotPassword = ({ isOpen, onClose, email: initialEmail }) => {
  const [step, setStep] = useState(1); // 1: Send Code, 2: Verify & Reset
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Lock Body Scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (initialEmail) setEmail(initialEmail);
      setStep(1);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialEmail]);

  if (!isOpen) return null;

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email.trim()) return Swal.fire("Lỗi", "Vui lòng nhập email", "warning");

    setIsLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email });
      Swal.fire("Đã gửi!", `Mã xác nhận đã được gửi tới ${email}. Vui lòng kiểm tra hộp thư.`, "success");
      setStep(2);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.error || "Gửi mã thất bại. Vui lòng thử lại.";
      Swal.fire("Lỗi", msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!code || !newPassword || !confirmPassword) {
      return Swal.fire("Lỗi", "Vui lòng điền đầy đủ thông tin", "warning");
    }
    if (newPassword !== confirmPassword) {
      return Swal.fire("Lỗi", "Mật khẩu xác nhận không khớp", "warning");
    }

    setIsLoading(true);
    try {
      await api.post('/api/auth/reset-password', { email, code, newPassword });
      Swal.fire("Thành công!", "Đổi mật khẩu thành công. Bạn có thể đăng nhập ngay.", "success");
      onClose();
      // Reset state
      setStep(1);
      setCode("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.error || "Đổi mật khẩu thất bại.";
      Swal.fire("Lỗi", msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition">
          <IoClose size={24} />
        </button>

        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {step === 1 ? "Quên mật khẩu?" : "Đặt lại mật khẩu"}
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          {step === 1
            ? "Nhập email của bạn để nhận mã xác nhận."
            : "Nhập mã verification code đã được gửi tới email và mật khẩu mới."}
        </p>

        {step === 1 ? (
          <form onSubmit={handleSendCode}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="email@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
            >
              {isLoading ? "Đang gửi..." : "Gửi mã xác nhận"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="bg-green-50 text-green-700 px-3 py-2 rounded text-sm text-center mb-4 border border-green-200">
              Mã đã được gửi tới <strong>{email}</strong>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã xác nhận (Code)</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none font-mono text-center tracking-widest text-lg"
                placeholder="######"
              />
            </div>


            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none pr-10"
                placeholder="Nhập mật khẩu mới"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-500 hover:text-green-600 focus:outline-none"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none pr-10"
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 mt-2"
            >
              {isLoading ? "Đang xử lý..." : "Xác nhận đổi mật khẩu"}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full text-gray-500 text-sm hover:text-green-600 hover:underline mt-2"
            >
              Quay lại bước nhập email
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
export default ForgotPassword;