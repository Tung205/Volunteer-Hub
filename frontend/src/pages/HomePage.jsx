import React, { use, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { BsPersonWorkspace, BsArrowRight } from 'react-icons/bs';
import { HiOutlineCalendar, HiUserGroup } from 'react-icons/hi';

// Components
import AnimatedScroll from "../components/AnimatedScroll.jsx";
import InfoEvent from '../components/event/InfoEvent';
import { getFeaturedEvents } from '../api/eventApi';

import introDashboard_1 from '../assets/introDashboard.png';
import userStory1 from '../assets/userStory1.png';
import userStory2 from '../assets/userStory2.png';
import userStory3 from '../assets/userStory3.png';

const HomePage = () => {
    const stories = [
        {
            image: userStory1,
            quote: "Tình nguyện giúp tôi cảm thấy sống có ích hơn. Tôi sẽ tiếp tục làm và làm tình nguyện để lan tỏa tinh thần đẹp đẽ này tới mọi người",
            name: "Bạn Thanh Tùng",
            info1: "K68I - CS1",
            info2: "Trường Đại học Công nghệ - ĐHQGHN"
        },
        {
            image: userStory2,
            quote: "Trước đây, tôi luôn muốn tham gia nhưng không biết bắt đầu từ đâu. VolunteerHub đã làm tôi nghiện làm tình nguyện.",
            name: "Bạn Đức Toàn",
            info1: "K68I - CS1",
            info2: "Trường Đại học Công nghệ - ĐHQGHN"
        },
        {
            image: userStory3,
            quote: "Từ một tình nguyện viên, tôi đã trở thành Quản lý sự kiện. Kỹ năng tổ chức và lãnh đạo tôi học được tại đây là vô giá.",
            name: "Bạn Minh Dũng",
            info1: "K68I - CS1",
            info2: "Trường Đại học Công nghệ - ĐHQGHN"
        }
    ];

    const [activeStoryIndex, setActiveStoryIndex] = useState(0);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [featuredEvents, setFeaturedEvents] = useState([]);
    const activeStory = stories[activeStoryIndex];
    const navigate = useNavigate();

    // Fetch Featured Events (Highlighted)
    React.useEffect(() => {
        const fetchEvents = async () => {
            try {
                // 'members' maps to /api/events/highlighted
                const events = await getFeaturedEvents('members', 3);
                if (events && events.length > 0) {
                    setFeaturedEvents(events);
                }
            } catch (error) {
                console.error("Failed to load featured events", error);
            }
        };
        fetchEvents();
    }, []);

    const handleEventClick = (event) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    // Redirect if already logged in
    React.useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            navigate('/dashboard', { replace: true });
        }
    }, [navigate]);

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

    return (
        <div className="flex flex-col w-full">

            {/* SECTION 1*/}
            <section className="min-h-[90vh] bg-gradient-to-r from-green-600 to-green-200 flex flex-col md:flex-row items-center justify-evenly px-6 md:px-10 py-16">
                <div className="max-w-3xl flex flex-col items-start text-justify">
                    <h2 className="text-5xl md:text-7xl font-bold mb-10 text-green-50">
                        VOLUNTEER HUB
                    </h2>
                    <p className="text-lg md:text-xl font-semibold text-gray-800 mb-6">
                        Một hệ sinh thái dành riêng cho tình nguyện viên, là nơi bạn có thể dễ dàng tìm kiếm các hoạt động tình nguyện từ các tổ chức uy tín, nhanh chóng đăng ký tham gia các dự án tâm huyết, đồng thời chia sẻ những khoảnh khắc và thành tựu ý nghĩa nhất của mình để lan tỏa năng lượng tích cực trong cộng đồng.
                    </p>
                    <Link to="/events">
                        <button className="bg-green-800 text-white text-xl px-6 py-2 rounded-md hover:bg-green-700 transition mt-10 shadow-lg">
                            Khám phá sự kiện
                        </button>
                    </Link>
                </div>
                <div className="w-80 mt-8 md:mt-0 bg-white border border-gray-300 p-2 rounded-lg shadow-2xl rotate-3 hover:rotate-0 transition duration-500">
                    <img className="w-full rounded-md" src={introDashboard_1} alt="Dashboard Intro" />
                </div>
            </section>

            {/* SECTION 2*/}
            <section className="py-20 bg-gray-50 text-center">
                <AnimatedScroll>
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-800">Cách hoạt động</h2>
                        <div className="w-50 h-1 bg-green-600 mx-auto mt-2"></div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-4 md:gap-12">
                        {/* Step 1 */}
                        <div className="flex flex-col items-center w-64">
                            <div className="w-32 h-32 border-2 border-gray-400 rounded-lg flex items-center justify-center mb-4 bg-white shadow-sm">
                                <BsPersonWorkspace className="text-5xl text-gray-700" />
                            </div>
                            <h3 className="text-lg font-semibold text-green-600">Đăng ký tài khoản</h3>
                            <p className="text-gray-600 text-sm mt-1">để trở thành tình nguyện viên</p>
                        </div>
                        <BsArrowRight className="hidden md:block text-4xl text-gray-400 mt-12" />

                        {/* Step 2 */}
                        <div className="flex flex-col items-center w-64">
                            <div className="w-32 h-32 border-2 border-gray-400 rounded-lg flex items-center justify-center mb-4 bg-white shadow-sm">
                                <HiOutlineCalendar className="text-5xl text-gray-700" />
                            </div>
                            <h3 className="text-lg font-semibold text-green-600">Chọn sự kiện</h3>
                            <p className="text-gray-600 text-sm mt-1">mà bạn muốn tham gia</p>
                        </div>
                        <BsArrowRight className="hidden md:block text-4xl text-gray-400 mt-12" />

                        {/* Step 3 */}
                        <div className="flex flex-col items-center w-64">
                            <div className="w-32 h-32 border-2 border-gray-400 rounded-lg flex items-center justify-center mb-4 bg-white shadow-sm">
                                <HiUserGroup className="text-5xl text-gray-700" />
                            </div>
                            <h3 className="text-lg font-semibold text-green-600">Tham gia nhóm</h3>
                            <p className="text-gray-600 text-sm mt-1">để nhận thông báo mới nhất</p>
                        </div>
                    </div>
                </AnimatedScroll>
            </section>

            {/* SECTION 3*/}
            <section className="py-20 bg-white">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-800">Câu chuyện tình nguyện</h2>
                    <div className="w-50 h-1 bg-green-600 mx-auto mt-2"></div>
                </div>

                <div className="w-full max-w-6xl mx-auto px-4">
                    <AnimatedScroll key={activeStoryIndex} className="w-full">
                        <div className="flex flex-col md:flex-row items-center gap-10 justify-center min-h-[300px]">
                            <div className="w-64 h-64 flex-shrink-0">
                                <img
                                    src={activeStory.image}
                                    alt={activeStory.name}
                                    className="w-full h-full object-cover rounded-full border-4 border-green-200 shadow-lg"
                                />
                            </div>
                            <div className="max-w-lg text-center md:text-left">
                                <p className="text-xl italic text-gray-600 mb-4">"{activeStory.quote}"</p>
                                <h4 className="text-lg font-bold text-green-700">{activeStory.name}</h4>
                                <p className="text-sm text-gray-500">{activeStory.info1}</p>
                                <p className="text-sm text-gray-500">{activeStory.info2}</p>
                            </div>
                        </div>
                    </AnimatedScroll>

                    {/* Dots Navigation */}
                    <div className="flex justify-center mt-8 space-x-2">
                        {stories.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveStoryIndex(index)}
                                className={`w-3 h-3 rounded-full transition-all ${activeStoryIndex === index ? 'bg-green-600 w-6' : 'bg-gray-300 hover:bg-gray-400'}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 4*/}
            <section className="py-20 bg-gray-50">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-800">Sự kiện nổi bật</h2>
                    <div className="w-50 h-1 bg-green-600 mx-auto mt-2"></div>
                </div>
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
                    {featuredEvents.length > 0 ? featuredEvents.map((event) => (
                        <div key={event._id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition p-6 border border-green-100 flex flex-col h-full">
                            <div className="h-48 bg-gray-200 rounded-xl mb-4 overflow-hidden relative group">
                                {event.coverImageUrl ? (
                                    <img
                                        src={event.coverImageUrl}
                                        alt={event.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/400x200?text=Volunteer+Hub' }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                                        <HiOutlineCalendar size={48} className="opacity-50" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                                    HOT
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 min-h-[56px]">{event.title}</h3>

                            <div className="flex items-center text-gray-600 text-sm mb-2">
                                <span className="mr-2">📍</span>
                                <span className="truncate">{event.location}</span>
                            </div>

                            <div className="flex items-center text-gray-600 text-sm mb-6">
                                <span className="mr-2">📅</span>
                                <span>{new Date(event.startTime).toLocaleDateString('vi-VN')}</span>
                            </div>

                            <button
                                onClick={() => handleEventClick(event)}
                                className="mt-auto text-center block w-full py-2 rounded-full border border-green-600 text-green-600 font-semibold hover:bg-green-600 hover:text-white transition"
                            >
                                Xem chi tiết
                            </button>
                        </div>
                    )) : (
                        <div className="col-span-3 text-center py-10 text-gray-500 italic">
                            Hiện chưa có sự kiện nổi bật nào.
                        </div>
                    )}
                </div>
            </section>

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

export default HomePage;