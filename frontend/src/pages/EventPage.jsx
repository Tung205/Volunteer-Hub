import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

import InfoEvent from '../components/InfoEvent';
import EventCard from '../components/EventCard';

import bannerImage from '../assets/introDashboard.png';

import { IoSearch } from "react-icons/io5";

//simulation (10 events)
const MOCK_EVENTS = Array.from({ length: 12 }).map((_, index) => ({
  id: index + 1,
  imageUrl: "https://storage.googleapis.com/agent-tools-public-content/image_a0b60e.png",
  title: `Sự kiện Trồng cây gây rừng ${index + 1}`,
  location: "Lào Cai",
  date: "23/11/2025",
  organizer: "Nguyễn Văn A",
  description: "Mô tả chi tiết sự kiện...",

  userStatus: index === 0 ? 'approved' : (index === 1 ? 'pending' : null) 
}));

const EventPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // --- STATE ---
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  //config page
  const itemsPerPage = 6;
  const totalPages = Math.ceil(events.length / itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const currentEvents = events.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCardClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleRegister = () => {
    const isAuthenticated = localStorage.getItem('accessToken'); 

    if (!isAuthenticated) {
      setIsModalOpen(false);

      // Tạo URL Redirect
      const redirectUrl = `/events?eventId=${selectedEvent.id}&popup=true&autoRegister=true`;
      
      //don't log in
      Swal.fire({
        icon: 'warning',
        title: 'Bạn chưa đăng nhập',
        text: 'Vui lòng đăng nhập để đăng ký sự kiện!',
        showCancelButton: true,
        confirmButtonText: 'Đăng nhập ngay',
        cancelButtonText: 'Hủy',
        confirmButtonColor: '#16a34a'
      }).then((result) => {
        if (result.isConfirmed) {
          //direct Login + redirect params
          navigate(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
        }
      });
      return;
    }

    //log in
    Swal.fire({
        title: 'Đang xử lý...',
        didOpen: () => Swal.showLoading(),
        timer: 1000
    }).then(() => {
        const updatedEvents = events.map(ev => 
            ev.id === selectedEvent.id ? { ...ev, userStatus: 'pending' } : ev
        );
        setEvents(updatedEvents);
        
        setSelectedEvent(prev => ({ ...prev, userStatus: 'pending' }));

        Swal.fire('Thành công', 'Đăng ký thành công! Vui lòng chờ duyệt.', 'success');
    });
  };

  const handleJoinChat = () => {
    navigate('/');
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const eventId = params.get('eventId');
    const popup = params.get('popup');
    const autoRegister = params.get('autoRegister');

    if (eventId && popup === 'true') {
        const foundEvent = events.find(e => e.id === parseInt(eventId));
        if (foundEvent) {
            setSelectedEvent(foundEvent);
            setIsModalOpen(true);
            
            if (autoRegister === 'true') {
                navigate('/events', { replace: true });
                
                // Vì useEffect chạy sau render, ta gọi hàm xử lý đăng ký (cần logic check auth ở đây hoặc gọi API luôn)
                // Ở đây mình giả lập gọi API luôn vì đã login rồi
                setTimeout(() => {
                   // Logic update state giống handleRegister phía trên...
                   // (Để code gọn, bạn nên tách logic update state ra 1 hàm riêng)
                   const updatedEvents = events.map(ev => 
                        ev.id === parseInt(eventId) ? { ...ev, userStatus: 'pending' } : ev
                    );
                    setEvents(updatedEvents);
                    setSelectedEvent(prev => ({ ...prev, userStatus: 'pending' }));
                    Swal.fire('Thành công', 'Đăng ký tự động thành công!', 'success');
                }, 500);
            }
        }
    }
  }, [location.search, navigate]); // Bỏ 'events' ra để tránh loop nếu events thay đổi


  return (
    <div className="w-full bg-gray-50 min-h-screen pb-10">
      
      {/*SECTION 1: BANNER*/}
      <section className="w-full h-[300px] md:h-[400px] relative">
         <img 
            src={bannerImage}
            alt="Search Banner"
            className="w-full h-full object-cover"
         />
         <div className="absolute inset-0 bg-black/50"></div>
         
         {/* search box */}
         <div className='absolute inset-0 flex flex-col items-center justify-center px-4 text-center z-10'>
             <h1 className="text-white text-2xl md:text-4xl font-bold mb-2">Xin chào,</h1>
             <h2 className='text-white text-2xl md:text-4xl font-bold mb-8'>
                 Hôm nay bạn muốn tham gia sự kiện nào?
             </h2>

             <div className='w-full max-w-3xl relative mb-6 bg-white/80'>
                 <input
                     type='text'
                     placeholder='Nhập sự kiện bạn muốn tham gia'
                     className='w-full py-4 px-6 rounded-sm text-gray-700 outline-none focus:ring-2 focus:ring-green-500 shadow-lg text-lg'
                 />
                 <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-600">
                     <IoSearch size={28} />
                 </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl mb-8">
                 <div className="relative">
                     <select className="w-full py-3 px-4 rounded-sm text-gray-600 bg-white border-none outline-none cursor-pointer text-center font-medium shadow-sm hover:bg-gray-50 appearance-none">
                         <option value="">-- Chọn Địa điểm --</option>
                         <option value="HN">Hà Nội</option>
                         <option value="HCM">TP. Hồ Chí Minh</option>
                         <option value="DN">Đà Nẵng</option>
                         <option value="HP">Hải Phòng</option>
                         <option value="CT">Cần Thơ</option>
                         <option value="LC">Lào Cai</option>
                         <option value="HG">Hà Giang</option>
                     </select>
                 </div>

                 <div className="relative">
                     <select className="w-full py-3 px-4 rounded-sm text-gray-600 bg-white border-none outline-none cursor-pointer text-center font-medium shadow-sm hover:bg-gray-50 appearance-none">
                         <option value="">-- Chọn Quy mô --</option>
                         <option value="small">Nhóm nhỏ (&lt; 20 người)</option>
                         <option value="medium">Vừa (20 - 100 người)</option>
                         <option value="large">Lớn (&gt; 100 người)</option>
                     </select>
                 </div>
             </div>

             <button className="bg-[#bfd200] hover:bg-[#a3b800] text-black font-bold py-3 px-16 rounded shadow-lg transition-transform transform hover:scale-105 text-lg uppercase tracking-wide">
                 Tìm kiếm
             </button>
         </div>
      </section>

      {/*SECTION 2: List Event*/}
      <section className="max-w-7xl mx-auto px-4 mt-12">
        <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-green-700 inline-block border-b-4 border-green-500 pb-2">
                Một số sự kiện dành cho bạn!
            </h2>
        </div>

        {/* Grid Danh sách */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentEvents.map(item => (
                <EventCard 
                    key={item.id} 
                    event={item} 
                    onClick={handleCardClick} 
                />
            ))}
        </div>

        {/*Prev / Next Buttons*/}
        <div className="flex justify-center items-center mt-10 space-x-4">
            {currentPage > 1 && (
                <button 
                    onClick={handlePrevPage}
                    className="px-6 py-2 border border-gray-300 rounded hover:bg-green-600 hover:text-white transition font-medium"
                >
                    Trước
                </button>
            )}
            
            {/* Hiển thị text trang cho dễ nhìn (Tùy chọn) */}
            <span className="text-gray-500 text-sm">Trang {currentPage} / {totalPages}</span>

            {currentPage < totalPages && (
                <button 
                    onClick={handleNextPage}
                    className="px-6 py-2 border border-gray-300 rounded hover:bg-green-600 hover:text-white transition font-medium"
                >
                    Sau
                </button>
            )}
        </div>
      </section>

      {/* --- POPUP MODAL --- */}
      <InfoEvent 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={selectedEvent}
        userStatus={selectedEvent?.userStatus || 'guest'}
        onRegister={handleRegister}
        onJoinChat={handleJoinChat}
      />

    </div>
  );
};

export default EventPage;