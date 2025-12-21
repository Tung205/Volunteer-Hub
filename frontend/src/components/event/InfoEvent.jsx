import React from 'react';
import { IoClose } from "react-icons/io5";

const InfoEvent = ({
  isOpen,
  onClose,
  event,
  userStatus,     // 'guest' | 'pending' | 'approved'
  onRegister,
  onJoinChat,
  isReviewMode = false, // Add new prop
  onApprove,
  onReject,
}) => {

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

  //Nếu không mở hoặc chưa có data thì không render
  if (!isOpen) return null;

  // Mock Data Fallback
  const MOCK_DATA = {
    title: "Sự kiện Tình nguyện Mẫu",
    location: "Hà Nội",
    startTime: new Date().toISOString(),
    organizerName: "Tổ chức VolunteerHub",
    description: "Đây là mô tả mẫu cho sự kiện. Nếu bạn thấy nội dung này, có thể dữ liệu sự kiện chưa được truyền đầy đủ.",
    image: "https://placehold.co/600x400"
  };

  const displayEvent = { ...MOCK_DATA, ...event };

  const {
    title,
    location,
    startTime,
    organizerName,
    description,
    coverImageUrl,
  } = event;

  let formattedDate = "Chưa cập nhật";
  try {
    if (startTime) {
      formattedDate = new Date(startTime).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  } catch (e) {
    console.error("Date format error:", e);
  }

  const renderButton = () => {
    if (isReviewMode) {
      return (
        <div className="flex gap-4">
          <button
            onClick={onReject}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition transform hover:scale-105"
          >
            Không duyệt
          </button>
          <button
            onClick={onApprove}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition transform hover:scale-105"
          >
            Duyệt sự kiện
          </button>
        </div>
      );
    }

    switch (userStatus) {
      case 'pending':
        return (
          <button disabled className="bg-gray-400 text-white font-bold py-3 px-16 rounded-full cursor-not-allowed">
            Chờ duyệt...
          </button>
        );
      case 'approved':
        return (
          <button onClick={onJoinChat} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-16 rounded-full shadow-lg">
            Tham gia kênh chat
          </button>
        );
      case 'rejected':
        return (
          <button disabled className="bg-red-400 text-white font-bold py-3 px-16 rounded-full cursor-not-allowed">
            Đăng ký bị từ chối
          </button>
        )
      default:
        return (
          <button
            onClick={onRegister}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-16 rounded-full transition-transform transform hover:scale-105 shadow-lg shadow-green-200"
          >
            Đăng ký ngay
          </button>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">

        {/*Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition z-10 p-1 bg-white rounded-full shadow-sm"
        >
          <IoClose size={28} />
        </button>

        <div className="p-6 md:p-8 flex flex-col gap-6">

          {/*Header*/}
          <div className="flex flex-col md:flex-row gap-6 items-stretch">

            <div className="w-full md:w-5/12 flex-shrink-0">
              <img
                src={coverImageUrl || "https://placehold.co/600x400?text=No+Image"}
                alt={title}
                className="w-full h-[220px] md:h-full object-cover rounded-xl shadow-md border border-gray-100"
              />
            </div>

            {/*Summary */}
            <div className="border-2 border-green-500 rounded-2xl p-5 flex-1 flex flex-col justify-center space-y-2 bg-green-50/30 text-gray-800 text-sm md:text-base">
              <p>
                <span className="font-bold text-green-700">Sự kiện:</span> {title}
              </p>
              <p>
                <span className="font-bold text-green-700">Địa điểm:</span> {location}
              </p>
              <p>
                <span className="font-bold text-green-700">Thời gian:</span> {formattedDate}
              </p>
              <p>
                <span className="font-bold text-green-700">Người tổ chức:</span> {organizerName}
              </p>
            </div>
          </div>

          {/*Description*/}
          <div>
            <h3 className="font-bold text-lg mb-2 text-gray-700">Mô tả:</h3>
            <div className="border-2 border-green-500 rounded-2xl p-5 text-justify bg-white">
              <p className="whitespace-pre-line text-gray-600 leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            {renderButton()}
          </div>

        </div>
      </div>
    </div>
  );
};

export default InfoEvent;