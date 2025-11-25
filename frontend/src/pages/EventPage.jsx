import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';

import InfoEvent from '../components/InfoEvent';
import EventCard from '../components/EventCard';

import bannerImage from '../assets/introDashboard.png';

import { IoSearch, IoLocationOutline } from "react-icons/io5";

// --- MOCK DATA ---
const MOCK_EVENTS = Array.from({ length: 20 }).map((_, index) => ({
  id: index + 1,
  imageUrl: "https://storage.googleapis.com/agent-tools-public-content/image_a0b60e.png",
  title: index % 2 === 0 ? `Sự kiện Trồng cây gây rừng ${index + 1}` : `Chiến dịch Dọn rác bãi biển ${index + 1}`,
  location: index % 3 === 0 ? "Lào Cai" : (index % 3 === 1 ? "Hà Nội" : "Đà Nẵng"),
  date: "23/11/2025",
  organizer: "Nguyễn Văn A",
  description: "Mô tả chi tiết sự kiện...",
  userStatus: index === 0 ? 'approved' : (index === 1 ? 'pending' : null),
  scale: index % 2 === 0 ? 'medium' : 'large'
}));

const EventPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // --- STATE ---
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State cho Search & Filter
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [locationFilter, setLocationFilter] = useState(searchParams.get('loc') || '');
  const [scaleFilter, setScaleFilter] = useState(searchParams.get('scale') || '');
  
  // State cho Suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  // --- PAGINATION CONFIG ---
  const itemsPerPage = 6;
  const totalPages = Math.ceil(events.length / itemsPerPage);

  // --- HANDLER SEARCH & FILTER ---
  
  const filterEvents = (term, loc, scale) => {
    let result = MOCK_EVENTS;

    if (term) {
      result = result.filter(e => e.title.toLowerCase().includes(term.toLowerCase()));
    }
    if (loc) {
      result = result.filter(e => e.location === loc); // Mock data phải khớp chính xác value
    }
    if (scale) {
        if(scale === 'small') result = result.filter(e => e.id % 3 === 0);
    }

    setEvents(result);
    setCurrentPage(1); // Reset về trang 1 khi search
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 0) {
      const matchedTitles = MOCK_EVENTS
        .filter(e => e.title.toLowerCase().includes(value.toLowerCase()))
        .map(e => e.title);
      
      const uniqueSuggestions = [...new Set(matchedTitles)].slice(0, 5);
      setSuggestions(uniqueSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const executeSearch = (termOverride) => {
    const term = termOverride !== undefined ? termOverride : searchTerm;
    
    // Đẩy params lên URL (đây là cách giữ trạng thái khi reload/back)
    // URL sẽ thành: /events?q=...&loc=...&scale=...
    setSearchParams({ 
        q: term, 
        loc: locationFilter, 
        scale: scaleFilter 
    });
    
    setShowSuggestions(false);
  };

  const handleSelectSuggestion = (suggestion) => {
    setSearchTerm(suggestion);
    executeSearch(suggestion);
  };

  //(Lazy Load / Persistence Logic)
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const loc = searchParams.get('loc') || '';
    const scale = searchParams.get('scale') || '';

    // Sync state với URL
    setSearchTerm(q);
    setLocationFilter(loc);
    setScaleFilter(scale);

    filterEvents(q, loc, scale);
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      const redirectUrl = `/events?eventId=${selectedEvent.id}&popup=true&autoRegister=true`;
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
          navigate(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
        }
      });
      return;
    }
    // Logic đăng ký
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
    const eventId = searchParams.get('eventId');
    const popup = searchParams.get('popup');
    const autoRegister = searchParams.get('autoRegister');

    if (eventId && popup === 'true') {
        const foundEvent = MOCK_EVENTS.find(e => e.id === parseInt(eventId));
        if (foundEvent) {
            setSelectedEvent(foundEvent);
            setIsModalOpen(true);
            if (autoRegister === 'true') {
                // navigate('/events', { replace: true }); 
                
                setTimeout(() => {
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
  }, []);


  return (
    <div className="w-full bg-gray-50 min-h-screen pb-10">
      
      {/*SECTION 1: BANNER & SEARCH*/}
      <section className="w-full h-[450px] md:h-[550px] relative">
         <img 
            src={bannerImage}
            alt="Search Banner"
            className="w-full h-full object-cover"
            loading="lazy"
         />
         <div className="absolute inset-0 bg-black/50"></div>
         
         {/* Search Box Container */}
         <div className='absolute inset-0 flex flex-col items-center justify-center px-4 text-center z-10'>
             <h1 className="text-white text-2xl md:text-4xl font-bold mb-2">Xin chào,</h1>
             <h2 className='text-white text-2xl md:text-4xl font-bold mb-8'>
                 Hôm nay bạn muốn tham gia sự kiện nào?
             </h2>

             {/* SEARCH BAR & SUGGESTIONS */}
             <div className='w-full max-w-3xl relative mb-6' ref={searchRef}>
                 <div className="relative bg-white/80">
                    <input
                        type='text'
                        value={searchTerm}
                        onChange={handleInputChange}
                        onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
                        onFocus={() => searchTerm && setShowSuggestions(true)}
                        placeholder='Nhập sự kiện bạn muốn tham gia'
                        className='w-full py-4 px-6 rounded-sm text-gray-700 outline-none focus:ring-2 focus:ring-green-500 shadow-lg text-lg'
                    />
                    <button 
                        onClick={() => executeSearch()}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-600"
                    >
                        <IoSearch size={28} />
                    </button>
                 </div>

                 {/* SUGGESTION DROPDOWN */}
                 {showSuggestions && suggestions.length > 0 && (
                    <ul className="absolute top-full left-0 right-0 bg-white rounded-b-md shadow-xl border-t border-gray-100 overflow-hidden z-50 text-left animate-fade-in">
                        {suggestions.map((suggestion, index) => (
                            <li 
                                key={index}
                                onClick={() => handleSelectSuggestion(suggestion)}
                                className="px-6 py-3 hover:bg-gray-50 cursor-pointer text-gray-700 flex items-center gap-3 transition-colors"
                            >
                                <IoSearch className="text-gray-400" />
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                 )}
             </div>

             {/* FILTERS */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl mb-8">
                 <div className="relative">
                     <select 
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="w-full py-3 px-4 rounded-sm text-gray-600 bg-white border-none outline-none cursor-pointer text-center font-medium shadow-sm hover:bg-gray-50 appearance-none"
                     >
                         <option value="">-- Tất cả Địa điểm --</option>
                         <option value="Hà Nội">Hà Nội</option>
                         <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                         <option value="Đà Nẵng">Đà Nẵng</option>
                         <option value="Lào Cai">Lào Cai</option>
                     </select>
                 </div>

                 <div className="relative">
                     <select 
                        value={scaleFilter}
                        onChange={(e) => setScaleFilter(e.target.value)}
                        className="w-full py-3 px-4 rounded-sm text-gray-600 bg-white border-none outline-none cursor-pointer text-center font-medium shadow-sm hover:bg-gray-50 appearance-none"
                     >
                         <option value="">-- Tất cả Quy mô --</option>
                         <option value="small">Nhóm nhỏ (&lt; 20 người)</option>
                         <option value="medium">Vừa (20 - 100 người)</option>
                         <option value="large">Lớn (&gt; 100 người)</option>
                     </select>
                 </div>
             </div>

             <button 
                onClick={() => executeSearch()}
                className="bg-[#bfd200] hover:bg-[#a3b800] text-black font-bold py-3 px-16 rounded shadow-lg transition-transform transform hover:scale-105 text-lg uppercase tracking-wide"
             >
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
            {(searchTerm || locationFilter) && (
                <p className="text-gray-500 mt-2">
                    Tìm thấy {events.length} kết quả 
                    {searchTerm && ` cho "${searchTerm}"`}
                    {locationFilter && ` tại "${locationFilter}"`}
                </p>
            )}
        </div>

        {/* Grid Danh sách */}
        {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentEvents.map(item => (
                    <div key={item.id} className="animate-fade-in">
                        <EventCard 
                            event={item} 
                            onClick={handleCardClick} 
                        />
                    </div>
                ))}
            </div>
        ) : (
            <div className="text-center py-10 text-gray-500">
                <p className="text-xl">Không tìm thấy sự kiện nào phù hợp.</p>
            </div>
        )}

        {/* Prev / Next Buttons */}
        {events.length > 0 && (
            <div className="flex justify-center items-center mt-10 space-x-4">
                {currentPage > 1 && (
                    <button 
                        onClick={handlePrevPage}
                        className="px-6 py-2 border border-gray-300 rounded hover:bg-green-600 hover:text-white transition font-medium"
                    >
                        Trước
                    </button>
                )}
                
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
        )}
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