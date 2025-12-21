import React, { useState } from 'react';
import { FaCalendarPlus, FaTimesCircle, FaMapMarkerAlt, FaFileAlt, FaCalendarAlt, FaUsers, FaSpinner } from "react-icons/fa";
import Swal from 'sweetalert2';
import { createEvent } from '../../api/eventApi';

const PROVINCES = [
    "Thành phố Hà Nội", "Thành phố Huế", "Tỉnh Lai Châu", "Tỉnh Điện Biên",
    "Tỉnh Sơn La", "Tỉnh Lạng Sơn", "Tỉnh Quảng Ninh", "Tỉnh Thanh Hóa",
    "Tỉnh Nghệ An", "Tỉnh Hà Tĩnh", "Tỉnh Cao Bằng", "Tỉnh Tuyên Quang",
    "Tỉnh Lào Cai", "Tỉnh Thái Nguyên", "Tỉnh Phú Thọ", "Tỉnh Bắc Ninh",
    "Tỉnh Hưng Yên", "Thành phố Hải Phòng", "Tỉnh Ninh Bình", "Tỉnh Quảng Trị",
    "Thành phố Đà Nẵng", "Tỉnh Quảng Ngãi", "Tỉnh Gia Lai", "Tỉnh Khánh Hòa",
    "Tỉnh Lâm Đồng", "Tỉnh Đắk Lắk", "Thành phố Hồ Chí Minh", "Tỉnh Đồng Nai",
    "Tỉnh Tây Ninh", "Thành phố Cần Thơ", "Tỉnh Vĩnh Long", "Tỉnh Đồng Tháp",
    "Tỉnh Cà Mau", "Tỉnh An Giang"
];

const CreateEvent = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        province: 'Hà Nội',
        address: '',
        startTime: '',
        endTime: '',
        endTime: '',
        scale: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        // Validate
        if (!formData.title || !formData.description || !formData.address || !formData.startTime || !formData.endTime || !formData.scale) {
            Swal.fire("Thiếu thông tin", "Vui lòng điền đầy đủ các trường!", "warning");
            return;
        }

        setLoading(true);
        try {
            const eventPayload = {
                title: formData.title,
                description: formData.description,
                location: formData.province,
                address: formData.address,
                startTime: formData.startTime,
                endTime: formData.endTime,
                maxParticipants: parseInt(formData.scale),
                coverImageUrl: "https://res.cloudinary.com/dfftcie7c/image/upload/w_1200,q_auto,f_auto/v1766202863/Screenshot_2025-12-20_103843_weczaf.png"
            };

            await createEvent(eventPayload);

            Swal.fire({
                icon: 'success',
                title: 'Tạo sự kiện thành công!',
                text: 'Sự kiện của bạn đang chờ Admin duyệt.',
                confirmButtonColor: '#16a34a' // Green-600
            });

            // Reset and close
            setFormData({
                title: '',
                description: '',
                province: 'Hà Nội',
                address: '',
                startTime: '',
                endTime: '',
                scale: ''
            });
            onClose();
        } catch (error) {
            console.error(error);
            Swal.fire("Lỗi", "Không thể tạo sự kiện. Vui lòng thử lại.", "error");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-green-600 p-4 flex justify-between items-center text-white shadow-md">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <FaCalendarPlus /> Tạo sự kiện mới
                    </h3>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition transform hover:scale-110">
                        <FaTimesCircle size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">

                    {/* Event Name */}
                    <div>
                        <label className="block text-gray-500 font-bold mb-1 text-sm">Tên sự kiện <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Nhập tên sự kiện..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-gray-600 placeholder-gray-400"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-gray-500 font-bold mb-1 text-sm flex items-center gap-1">
                            <FaFileAlt className="text-sm" /> Mô tả chi tiết <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            name="description"
                            rows="4"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Mô tả mục đích, ý nghĩa, hoạt động chính..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-gray-600 placeholder-gray-400 resize-none"
                        ></textarea>
                    </div>

                    {/* Location Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-500 font-bold mb-1 text-sm flex items-center gap-1">
                                <FaMapMarkerAlt className="text-sm" /> Tỉnh / Thành phố
                            </label>
                            <select
                                name="province"
                                value={formData.province}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-gray-600 bg-white"
                            >
                                {PROVINCES.map(prov => (
                                    <option key={prov} value={prov}>{prov}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-500 font-bold mb-1 text-sm">Địa chỉ cụ thể <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Số nhà, đường, xã/phường..."
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-gray-600 placeholder-gray-400"
                            />
                        </div>
                    </div>

                    {/* Time Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-500 font-bold mb-1 text-sm flex items-center gap-1">
                                <FaCalendarAlt className="text-sm" /> Thời gian bắt đầu <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-gray-600"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-500 font-bold mb-1 text-sm flex items-center gap-1">
                                <FaCalendarAlt className="text-sm" /> Thời gian kết thúc <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-gray-600"
                            />
                        </div>
                    </div>

                    {/* Scale */}
                    <div>
                        <label className="block text-gray-500 font-bold mb-1 text-sm flex items-center gap-1">
                            <FaUsers className="text-sm" /> Quy mô (người) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="scale"
                            value={formData.scale}
                            onChange={handleChange}
                            placeholder="VD: 50"
                            min="1"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-gray-600 placeholder-gray-400"
                        />
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-gray-500 font-bold hover:bg-gray-200 rounded-lg transition"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSubmit}
                        className={`bg-green-600 text-white px-8 py-2 rounded-lg font-bold shadow-lg hover:bg-green-700 transition transform hover:scale-105 flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        disabled={loading}
                    >
                        {loading && <FaSpinner className="animate-spin" />}
                        {loading ? 'Đang tạo...' : 'Tạo sự kiện'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateEvent;
