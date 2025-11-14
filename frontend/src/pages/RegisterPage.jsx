import React, {useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import register_left from '../assets/register_left.png';
import register_right from '../assets/register_right.png';

import PolicyPopup from "../components/PolicyPopup.jsx";
import api from '../api/axios';
const registerSchema = z.object({
    name: z.string().min(1, "Họ và tên là bắt buộc"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string()
        .min(1, "Mật khẩu là bắt buộc")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{6,}$/,
            {
                message: "Mật khẩu phải ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt"
            }
        ),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
    dateOfBirth: z.string()
        .min(1, "Ngày sinh là bắt buộc")
        .refine(val => !isNaN(new Date(val).getTime()), "Ngày sinh không hợp lệ")
        .refine(val => new Date(val) <= new Date(), "Ngày sinh không thể ở tương lai")
        .refine(val => {
            const today = new Date();
            const minAgeDate = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
            return new Date(val) <= minAgeDate;
        }, "Bạn phải đủ 16 tuổi để tham gia"),
    gender: z.enum(["Nam", "Nữ", "Khác"], {
        errorMap: () => ({ message: "Vui lòng chọn giới tính" })
    }),
    acceptTerms: z.boolean().refine(val => val === true, {
        message: "Bạn phải chấp nhận chính sách của chúng tôi"
    })
}).refine(data => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"] // Báo lỗi cho trường 'confirmPassword'
});


function RegisterPage() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isPolicyOpen, setIsPolicyOpen] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(registerSchema),
        mode: "onBlur"
    });

    const onSubmit = async (data) => {
        const fullData = {
            ...data,
            dateOfBirth: new Date(data.dateOfBirth)
        };
        console.log("Dữ liệu form hợp lệ (từ Zod):", fullData);

        try {
            // TODO: Xử lý logic gọi API đăng ký ở đây
            const res = await api.post("/auth/register", data);

            Swal.fire({
                icon: 'success',
                title: 'Đăng ký thành công!',
                timer: 2000,
                showConfirmButton: false,
            }).then(() => {
                navigate('/login');
            });
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Đăng ký thất bại',
                text: error.response?.data?.error || 'Đã có lỗi xảy ra.',
            });
        }
    };

    const onError = (errorList) => {
        console.log("Lỗi form (từ Zod):", errorList);
    };

    return (
        <div className="flex min-h-screen bg-white items-center">
            <img
                src={register_left}
                alt="Planting flowers"
                className="w-1/3 object-contain hidden md:block max-h-[600px] px-4"
            />
            {/* Container Form (Giữa) */}
            <div className="w-full md:w-1/3 flex items-center justify-center p-6 md:p-12">
                <div className="w-full max-w-md">

                    <div className="text-center mb-8">
                        <h2 className="text-2xl text-gray-600">Đăng ký để trở thành....</h2>
                        <h1 className="text-4xl font-bold text-green-600">Tình nguyện viên</h1>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
                        <div>
                            <label htmlFor="fullName" className="sr-only">Họ và tên</label>
                            <input
                                type="text"
                                id="fullName"
                                placeholder="Họ và tên"
                                {...register("name")}
                                className={`w-full px-4 py-3 border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
                            />
                            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="email" className="sr-only">Email</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="Email"
                                {...register("email")}
                                className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Mật khẩu</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    placeholder="Mật khẩu (ít nhất 6 ký tự)"
                                    {...register("password")}
                                    className={`w-full px-4 py-3 pr-10 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
                                />
                                <button
                                    type="button" // Quan trọng: Ngăn form submit
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-green-600 cursor-pointer"
                                >
                                    {showPassword ? <AiOutlineEyeInvisible className="h-5 w-5" /> : <AiOutlineEye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">Xác nhận mật khẩu</label>
                            <div className="relative">
                                <input
                                    // 2. Đổi type dựa trên state
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    placeholder="Xác nhận mật khẩu"
                                    {...register("confirmPassword")}
                                    // Thêm 'pr-10'
                                    className={`w-full px-4 py-3 pr-10 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500`}
                                />
                                {/* 3. Thêm nút icon */}
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-green-600 cursor-pointer"
                                >
                                    {showConfirmPassword ? <AiOutlineEyeInvisible className="h-5 w-5" /> : <AiOutlineEye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
                            <input
                                type="date"
                                id="dateOfBirth"
                                {...register("dateOfBirth")}
                                className={`w-full px-4 py-3 border ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'} rounded-lg text-gray-700 cursor-pointer`}
                            />
                            {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                    <input id="gender-nam" type="radio" value="Nam"
                                           {...register("gender")}
                                           className="h-4 w-4 text-green-600 border-gray-300 hover:cursor-pointer" />
                                    <label htmlFor="gender-nam" className="ml-2 text-sm text-gray-900">Nam</label>
                                </div>
                                <div className="flex items-center">
                                    <input id="gender-nu" type="radio" value="Nữ"
                                           {...register("gender")}
                                           className="h-4 w-4 text-green-600 border-gray-300 hover:cursor-pointer" />
                                    <label htmlFor="gender-nu" className="ml-2 text-sm text-gray-900">Nữ</label>
                                </div>
                                <div className="flex items-center">
                                    <input id="gender-khac" type="radio" value="Khác"
                                           {...register("gender")}
                                           className="h-4 w-4 text-green-600 border-gray-300 hover:cursor-pointer" />
                                    <label htmlFor="gender-khac" className="ml-2 text-sm text-gray-900">Khác</label>
                                </div>
                            </div>
                            {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>}
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="acceptTerms"
                                {...register("acceptTerms")}
                                className={`h-4 w-4 text-green-600 border-gray-300 rounded hover:cursor-pointer ${errors.acceptTerms ? 'ring-2 ring-red-500' : ''}`}
                            />
                            <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-900">
                                Tôi chấp nhận những <button type="button" onClick={() => setIsPolicyOpen(true)} className="font-medium text-green-600 hover:underline"
                            >
                                chính sách
                            </button> của Volunteer Hub
                            </label>
                        </div>
                        {errors.acceptTerms && <p className="text-red-500 text-sm">{errors.acceptTerms.message}</p>}
                        <div>
                            <button
                                type="submit"
                                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition duration-300 hover:cursor-pointer"
                            >
                                Đăng ký
                            </button>
                        </div>
                        <p className="text-center text-sm text-gray-600">
                            Đã có tài khoản?{' '}
                            <Link to="/login" className="font-medium text-green-600 hover:underline">
                                Đăng nhập ngay
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
            <img
                src={register_right}
                alt="Planting tree"
                className="w-1/3 object-contain hidden md:block max-h-[600px] px-4"
            />
            <PolicyPopup
                isOpen={isPolicyOpen}
                onClose={() => setIsPolicyOpen(false)}
            />
        </div>
    );
}

export default RegisterPage;