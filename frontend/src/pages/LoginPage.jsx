import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Swal from 'sweetalert2';
import ReCAPTCHA from 'react-google-recaptcha';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import loginImage from '../assets/login.png';
import api from '../api/axios';

const loginSchema = z.object({
    email: z.string()
        .min(1, "Email là bắt buộc")
        .email("Email hoặc mật khẩu không đúng định dạng"),
    password: z.string()
        .min(1, "Mật khẩu là bắt buộc")
        .min(8, "Email hoặc mật khẩu không đúng định dạng") 
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/, 
            "Email hoặc mật khẩu không đúng định dạng"
        ),
    recaptcha: z.string().min(1, "Vui lòng xác nhận bạn là con người"),
});

const RECAPTCHA_SITE_KEY = "6LePIAosAAAAAMHodd3LgeFAwwuzoS9viUYTpiAT";

function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const recaptchaRef = useRef(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, control, formState: { errors } } = useForm({
        resolver: zodResolver(loginSchema),
        mode: "onBlur"
    });

    const onSubmit = async (data) => {
        try {
            // Validation Captcha
            if (!data.recaptcha) {
                Swal.fire({ icon: 'error', title: 'Vui lòng xác nhận captcha' });
                return;
            }
            setIsLoading(true);

            //API Login
            const res = await api.post("/auth/login", data);

            if (res.data?.accessToken) {
                localStorage.setItem('accessToken', res.data.accessToken);
                // localStorage.setItem('user', JSON.stringify(res.data.user)); // Lưu thêm user info nếu cần
            }
            setIsLoading(false);
            Swal.fire({
                icon: 'success',
                title: 'Đăng nhập thành công!',
                text: 'Đang chuyển hướng...',
                timer: 1500,
                showConfirmButton: false,
            }).then(() => {
                //redirect
                const params = new URLSearchParams(location.search);
                const redirectUrl = params.get('redirect');

                if (redirectUrl) {
                    navigate(decodeURIComponent(redirectUrl));
                } else {
                    navigate('/dashboard');
                }
            });

        } catch (error) {
            setIsLoading(false);
            console.error("Lỗi đăng nhập:", error);
            Swal.fire({
                icon: 'error',
                title: 'Đăng nhập thất bại',
                text: error.response?.data?.error || 'Tài khoản hoặc mật khẩu không chính xác.',
            });
            recaptchaRef.current?.reset();
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
                                        ref={recaptchaRef}
                                        sitekey={RECAPTCHA_SITE_KEY}
                                        onChange={onChange}
                                    />
                                )}
                            />
                        </div>
                        {errors.recaptcha && <p className="text-red-500 text-sm mt-1 text-center">{errors.recaptcha.message}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`
                                    w-full py-3 px-4 rounded-lg font-semibold text-lg transition duration-300
                                    flex items-center justify-center gap-2
                                    ${isLoading 
                                        ? 'bg-green-400 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700 hover:cursor-pointer'
                                    }
                                    text-white
                                `}
                            >
                             {isLoading ? (
                                <>
                                    <AiOutlineLoading3Quarters className="animate-spin h-5 w-5" />
                                    <span>Đang xử lý...</span>
                                </>
                             ) : (
                                "Đăng nhập"
                             )}   
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