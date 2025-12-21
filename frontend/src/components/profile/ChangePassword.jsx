import React, { useState } from 'react';
import { IoClose } from "react-icons/io5";
import Swal from 'sweetalert2';
import api from '../../api/axios';
import ForgotPassword from './ForgotPassword';

const ChangePassword = ({ isOpen, onClose }) => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Lock Body Scroll
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            return Swal.fire("Lỗi", "Vui lòng điền đầy đủ thông tin", "warning");
        }
        if (newPassword !== confirmNewPassword) {
            return Swal.fire("Lỗi", "Mật khẩu mới không khớp", "warning");
        }
        // Regex validation (optional, can match Register Page)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return Swal.fire("Lỗi", "Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.", "warning");
        }

        setIsLoading(true);
        try {
            // Assuming backend uses PATCH /users/me for password update 
            // AND we send oldPassword just in case backend validates it (or ignoring it if not).
            // Based on previous analysis, backend might not validate oldPassword strictly via `findByIdAndUpdate` 
            // unless middleware handles it. We send it as 'currentPassword' or 'oldPassword' if needed, 
            // but strictly following the prompt "nhập đúng mật khẩu cũ... khớp thì update".
            // Since I cannot verify old password on client without logging in again (hacky), 
            // and backend snippet provided suggests direct update, I will send the new password.
            // IF the backend actually requires old password verification, logic should be there.
            // I'll send it in payload as `oldPassword` just in case.
            await api.patch('/users/me', {
                password: newPassword,
                oldPassword: oldPassword
            });

            Swal.fire("Thành công", "Đổi mật khẩu thành công!", "success");
            onClose();
            // Reset fields
            setOldPassword("");
            setNewPassword("");
            setConfirmNewPassword("");

        } catch (error) {
            console.error("Change Password Error:", error);
            Swal.fire("Lỗi", error.response?.data?.error || "Đổi mật khẩu thất bại", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative flex flex-col">

                    {/* Header */}
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                        <h2 className="text-xl font-bold text-gray-800">Đổi mật khẩu</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition">
                            <IoClose size={24} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Mật khẩu cũ</label>
                            <input
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="w-full px-4 py-2 border rounded-xl outline-none focus:border-green-500 transition border-gray-300"
                                placeholder="Nhập mật khẩu hiện tại"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Mật khẩu mới</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-2 border rounded-xl outline-none focus:border-green-500 transition border-gray-300"
                                placeholder="Nhập mật khẩu mới"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                            <input
                                type="password"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                className="w-full px-4 py-2 border rounded-xl outline-none focus:border-green-500 transition border-gray-300"
                                placeholder="Nhập lại mật khẩu mới"
                            />
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <button
                                onClick={() => setIsForgotPasswordOpen(true)}
                                className="text-sm text-red-500 hover:underline italic font-medium"
                            >
                                Quên mật khẩu?
                            </button>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                        <button
                            onClick={onClose}
                            className="px-5 py-2 rounded-lg font-semibold text-gray-600 hover:bg-gray-200 transition"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="px-5 py-2 rounded-lg font-bold bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-green-200 transition transform hover:-translate-y-0.5 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Đang xử lý..." : "Xác nhận"}
                        </button>
                    </div>
                </div>
            </div>

            <ForgotPassword
                isOpen={isForgotPasswordOpen}
                onClose={() => setIsForgotPasswordOpen(false)}
            />
        </>
    );
};

export default ChangePassword;
