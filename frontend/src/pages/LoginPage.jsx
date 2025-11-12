import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Swal from 'sweetalert2';
import ReCAPTCHA from 'react-google-recaptcha';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import loginImage from '../assets/login.png';
import api from '../api/axios';
const loginSchema = z.object({
    email: z.string().min(1, "Email là bắt buộc").email("Email không hợp lệ"),
    password: z.string().min(1, "Mật khẩu là bắt buộc"),
    recaptcha: z.string().min(1, "Vui lòng xác nhận bạn là con người"),
});

// const RECAPTCHA_SITE_KEY = "6LczHgosAAAAAADagXxJ_uCmyE2LtYYu79b1_x4y";
const RECAPTCHA_SITE_KEY = "6LePIAosAAAAAMHodd3LgeFAwwuzoS9viUYTpiAT";
function LoginPage() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    // 5. Lấy thêm 'control' từ useForm
    const { register, handleSubmit, control, formState: { errors } } = useForm({
        resolver: zodResolver(loginSchema),
        mode: "onBlur"
    });

    const onSubmit = async (data) => {
        try {
            console.log("Dữ liệu form hợp lệ:", data);
            if (!data.recaptcha) {
                Swal.fire({ icon: 'error', title: 'Vui lòng xác nhận captcha' });
                return;
            }
            // TODO: GỬI 'data.recaptcha' LÊN BACKEND
            // Backend của bạn PHẢI dùng "Secret Key" để xác thực token này với Google
            // trước khi cho phép đăng nhập.
            const res = await api.post("/auth/login", data);
            Swal.fire({
                icon: 'success',
                title: 'Đăng nhập thành công!',
                timer: 2000,
                showConfirmButton: false,
            }).then(() => {
                navigate('/dashboard');
            });
        } catch (error) {
            console.error("Lỗi đăng nhập:", error);
            Swal.fire({
                icon: 'error',
                title: 'Đăng nhập thất bại',
                text: error.response?.data?.error || 'Đã có lỗi xảy ra. Vui lòng thử lại.',
            });
        } finally {
             recaptchaRef.current.reset();
        }
    };

    const onError = (errorList) => {
        console.log("Lỗi form:", errorList);
    };

    return (
        <div className="flex min-h-screen bg-white items-center">

            <div className="w-1/2 h-screen object-contain hidden md:flex items-center justify-center p-12">
                <img
                    src={loginImage}
                    alt="Team Volunteers"
                    className="w-full h-auto max-w-lg"
                />
            </div>

            <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-sm">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-bold text-gray-800">ĐĂNG NHẬP</h1>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-5">
                        <div>
                            <input
                                type="email"
                                id="email"
                                placeholder="Email"
                                {...register("email")}
                                className={`w-full px-4 py-3 border-b-2 ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-green-500`}
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                        </div>
                        <div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    placeholder="Password"
                                    {...register("password")}
                                    className={`w-full px-4 py-3 border-b-2 ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-green-500`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-green-600 cursor-pointer">
                                    {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                        </div>
                        <div className="flex justify-center">
                            <Controller
                                name="recaptcha"
                                control={control}
                                render={({ field: { onChange } }) => (
                                    <ReCAPTCHA
                                        sitekey={RECAPTCHA_SITE_KEY}
                                        onChange={onChange}
                                    />
                                )}
                            />
                            {errors.recaptcha && <p className="text-red-500 text-sm mt-1">{errors.recaptcha.message}</p>}
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition duration-300"
                            >
                                Đăng nhập
                            </button>
                        </div>
                        <p className="text-center text-sm text-gray-600">
                            Bạn chưa có tài khoản?{' '}
                            <Link to="/register" className="font-medium text-green-600 hover:underline">
                                Đăng ký tại đây
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;