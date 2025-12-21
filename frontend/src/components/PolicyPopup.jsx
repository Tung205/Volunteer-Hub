import React from 'react';
import { HiOutlineX } from 'react-icons/hi';

function PolicyPopup({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40 p-4"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-2xl w-full relative z-50"
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition-colors"
                    aria-label="Đóng popup"
                >
                    <HiOutlineX className="w-6 h-6" />
                </button>
                <h2 className="text-2xl text-center font-bold text-gray-800 mb-4">
                    Chính sách & Điều khoản
                </h2>
                <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4 text-justify">
                    <div>
                        <h3 className="font-semibold text-green-700">1. Hãy tử tế và lịch sự</h3>
                        <p className="text-gray-600">
                            Tất cả chúng ta cùng có mặt ở đây để tạo nên một môi trường thân thiện. Hãy tôn trọng tất cả mọi người. Tranh luận lành mạnh là điều hết sức tự nhiên nhưng cũng cần tử tế.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-green-700">2. Không có quảng cáo hoặc spam</h3>
                        <p className="text-gray-600">
                            Trong nhóm, hãy cho đi nhiều hơn nhận lại. Bạn không được tự quảng bá, spam và đăng liên kết không phù hợp.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-green-700">3. Không có ngôn từ gây thù ghét hoặc bắt nạt</h3>
                        <p className="text-gray-600">
                            Hãy đảm bảo mọi người cảm thấy an toàn. Mọi hình thức bắt nạt đều không được cho phép và những bình luận hạ nhục về chủng tộc, tôn giáo, văn hóa, khuynh hướng tình dục, giới tính hoặc bản sắc sẽ không được chấp nhận.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-green-700">4. Hãy tự do chia sẻ nhé</h3>
                        <p className="text-gray-600">
                            Volunteer Hub là cộng đồng cho các bạn trẻ tham gia và chia sẻ về hoạt động tình nguyện mà mình tham gia, nên đừng ngần ngại kể chuyện và tương tác bạn nha!
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-green-700">5. Duy trì tài khoản</h3>
                        <p className="text-gray-600">
                            Nếu tài khoản của bạn không hoạt động trong vòng 6 tháng, chúng tôi sẽ xóa tài khoản của bạn khỏi hệ thống.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default PolicyPopup;