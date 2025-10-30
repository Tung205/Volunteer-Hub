import React, {useState, useRef} from 'react';
import { BsPersonWorkspace, BsArrowRight} from 'react-icons/bs';
import { HiOutlineCalendar ,HiUserGroup } from 'react-icons/hi';
import Swal from 'sweetalert2';
import { Link, useNavigate } from 'react-router-dom';

//Components
import AnimatedScroll from "../components/AnimatedScroll.jsx";

//Pages
import RegisterPage from "../pages/RegisterPage.jsx";

// Image
import logo from '../assets/logoApp.png';
import  introDashboard_1 from '../assets/introDashboard_2.jpg';
import userStory1 from '../assets/userStory1.png';
import userStory2 from '../assets/userStory2.png';
import userStory3 from '../assets/userStory3.png';

function IntroPage() {

    const scrollContainerRef = useRef(null);
    const scrollToTop = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        }
    };

    const stories = [
        {
            image: userStory1,
            quote: "Tình nguyện giúp tôi cảm thấy sống có ích hơn. Tôi sẽ tiếp tục tình nguyện",
            name: "Bạn Thanh Tùng",
            info1: "K68I - CS1",
            info2: "Trường Đại học Công nghệ - ĐHQGHN"
        },
        {
            image: userStory2,
            quote: "Trước đây, tôi luôn muốn tham gia nhưng không biết bắt đầu từ đâu. VolunteerHub đã kết nối tôi với những sự kiện ý nghĩa chỉ bằng vài cú nhấp chuột.",
            name: "Bạn Nguyễn Đức Toàn",
            info1: "K68I - CS1",
            info2: "Trường Đại học Công nghệ - ĐHQGHN"
        },
        {
            image: userStory3,
            quote: "Từ một tình nguyện viên, tôi đã trở thành Quản lý sự kiện. Kỹ năng tổ chức và lãnh đạo tôi học được tại đây là vô giá. Đừng ngần ngại, hãy tham gia!",
            name: "Võ Minh Dũng",
            info1: "K68I - CS1",
            info2: "Trường Đại học Công nghệ - ĐHQGHN"
        }
    ];
    const [activeStoryIndex, setActiveStoryIndex] = useState(0);
    const activeStory = stories[activeStoryIndex];

    const dummyEvents = [
        {
            id: 1,
            title: "Áo ấm cho em",
            location: "Hà Giang",
            date: "2/11/2025",
            imageUrl: "" // Để trống để tạo placeholder
        },
        {
            id: 2,
            title: "Chủ Nhật Xanh",
            location: "Hà Nội",
            date: "5/11/2025",
            imageUrl: ""
        },
        {
            id: 3,
            title: "Hiến máu nhân đạo",
            location: "Đà Nẵng",
            date: "10/11/2025",
            imageUrl: ""
        }
    ];

    return (
        <div className="h-screen flex flex-col">
            {/*NegBar*/}
            <nav className="sticky top-0 z-50 bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-6 py-3 grid grid-cols-2 md:grid-cols-3 items-center">
                    <div className="flex justify-start">
                        <Link to="/" onClick={scrollToTop}>
                            <img
                                src={logo}
                                alt="logo"
                                className="w-auto h-12"
                            />
                        </Link>
                    </div>
                    <ul className="col-span-2 order-3 flex justify-center space-x-6 text-gray-700 font-medium pt-3
                       md:col-span-1 md:order-none md:pt-0">
                        <li><Link to="/" className="underline-animated font-bold text-xl">Trang chủ</Link></li>
                        <li><Link to="/events" className="underline-animated font-bold text-xl">Sự kiện</Link></li>
                    </ul>
                    <div className="flex justify-end space-x-3">
                        <Link to="/login" className="border-2 text-xl font-bold border-green-600 px-3 py-1 rounded-full hover:text-gray-600 hover:bg-green-100 transition-colors duration-300">Đăng nhập</Link>
                        <Link to="/register" className="border-2 text-xl font-bold border-green-600 px-3 py-1 rounded-full  hover:text-gray-600 hover:bg-green-100 transition-colors duration-300">Đăng ký</Link>
                    </div>
                </div>
            </nav>
            <main ref={scrollContainerRef} className="flex-1 overflow-y-auto scroll-snap-type-y scroll-snap-mandatory">
                {/*Main1*/}
                <section className="h-screen bg-green-50 flex flex-col md:flex-row items-center justify-evenly px-6 md:px-10 py-16 scroll-snap-align-start">
                    <div className="max-w-3xl flex flex-col items-center text-center">
                        <h2 className="text-5xl md:text-7xl font-bold text-green-800 mb-4">
                            VOLUNTEER <span className="text-gray-600">HUB</span>
                        </h2>
                        <p className="text-lg md:text-xl text-gray-700 mb-6">
                            Nền tảng giúp tình nguyện viên tìm kiếm, tham gia và chia sẻ những hoạt động ý nghĩa nhất tới cộng đồng.
                        </p>
                        <button className="bg-green-600 text-white text-xl px-6 py-2 rounded-md hover:bg-green-700 transition">
                            Khám phá sự kiện
                        </button>
                    </div>
                    <div className="w-72 mt-8 md:mt-0 bg-white border border-gray-300 p-2 rounded-lg shadow-md">
                        <img
                            className="w-full rounded-md"
                            src={introDashboard_1}
                            alt="Image1"
                        />
                    </div>
                </section>
                {/*Main2*/}
                <section className=" py-12 text-center flex flex-col justify-center scroll-snap-align-start ">
                    <AnimatedScroll>
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-800">
                                Cách hoạt động
                            </h2>
                            <div className="w-50 h-1 bg-green-600 mx-auto mt-2"></div>
                        </div>
                        <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-8 md:gap-12">
                            <div className="flex flex-col items-center text-center w-60 hover:opacity-60">
                                <div className="w-32 h-32 border-2 border-gray-400 rounded-lg flex items-center justify-center mb-4">
                                    <BsPersonWorkspace className="text-5xl text-gray-700" />
                                </div>
                                <h3 className="text-lg font-semibold text-green-600">Đăng ký tài khoản</h3>
                                <p className="text-gray-600 text-sm mt-1">để trở thành 1 tình nguyện viên</p>
                            </div>
                            <div className="hidden md:block md:mt-12">
                                <BsArrowRight className="text-4xl text-gray-400 " />
                            </div>

                            <div className="flex flex-col items-center text-center w-60 hover:opacity-60">
                                <div className="w-32 h-32 border-2 border-gray-400 rounded-lg flex items-center justify-center mb-4">
                                    <HiOutlineCalendar className="text-5xl text-gray-700" />
                                </div>
                                <h3 className="text-lg font-semibold text-green-600">Chọn sự kiện</h3>
                                <p className="text-gray-600 text-sm mt-1">mà bạn muốn tham gia</p>
                            </div>
                            <div className="hidden md:block md:mt-12">
                                <BsArrowRight className="text-4xl text-gray-400 " />
                            </div>
                            <div className="flex flex-col items-center text-center w-60 hover:opacity-60">
                                <div className="w-32 h-32 border-2 border-gray-400 rounded-lg flex items-center justify-center mb-4">
                                    <HiUserGroup className="text-5xl text-gray-700" />
                                </div>
                                <h3 className="text-lg font-semibold text-green-600">Tham gia nhóm</h3>
                                <p className="text-gray-600 text-sm mt-1">để nhận những thông báo</p>
                            </div>
                        </div>
                    </AnimatedScroll>
                </section>
                {/*Main3*/}
                <section className=" bg-white flex flex-col justify-center items-center py-16 scroll-snap-align-start">
                    <AnimatedScroll className="w-full flex flex-col items-center">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-800">
                                Câu chuyện tình nguyện
                            </h2>
                            <div className="w-50 h-1 bg-green-600 mx-auto mt-2"></div>
                        </div>
                        <div className="w-full min-h-[400px] flex items-center justify-center">
                            <AnimatedScroll
                                key={activeStoryIndex}
                                className="w-full flex flex-col items-center"
                            >
                                <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 px-6 max-w-6xl w-full">
                                    <div className="flex-shrink-0 w-full max-w-xs sm:w-80 h-auto bg-white border-2 border-green-300 p-3 rounded-[3rem] shadow-lg">
                                        <img
                                            src={activeStory.image}
                                            alt={activeStory.name}
                                            className="w-full h-full object-cover rounded-[2.5rem]"
                                        />
                                    </div>
                                    <div className="flex-1 text-center md:text-left mt-8 md:mt-0 max-w-md">
                                        <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 leading-relaxed mb-6 text-justify">
                                            "{activeStory.quote}"
                                        </p>
                                        <p className="text-gray-700 text-base font-semibold">
                                            {activeStory.name}
                                        </p>
                                        <p className="text-gray-500 text-sm">
                                            {activeStory.info1}
                                        </p>
                                        <p className="text-gray-500 text-sm">
                                            {activeStory.info2}
                                        </p>
                                    </div>
                                </div>
                            </AnimatedScroll>
                        </div>
                        <div className="flex justify-center mt-12 space-x-3">
                            {stories.map((story, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveStoryIndex(index)}
                                    aria-label={`Xem câu chuyện ${index + 1}`}
                                    className={`
                                        w-3 h-3 rounded-full cursor-pointer
                                        transition-colors duration-300
                                        ${activeStoryIndex === index ? 'bg-green-600' : 'bg-gray-300 hover:bg-gray-400'}
                                    `}
                                />
                            ))}
                        </div>

                    </AnimatedScroll>
                </section>
                {/*Main4*/}
                <section className=" bg-white flex flex-col justify-center items-center py-16 scroll-snap-align-start">
                    <AnimatedScroll className="w-full flex flex-col items-center">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-800">
                                Một số sự kiện nổi bật
                            </h2>
                            <div className="w-50 h-1 bg-green-600 mx-auto mt-2"></div>
                        </div>
                        <div className="flex flex-col md:flex-row justify-center items-stretch gap-8 w-full max-w-6xl px-4">
                            {dummyEvents.map((event) => (
                                <div
                                    key={event.id}
                                    className="flex-1 bg-white border-2 border-green-300 rounded-[2rem] shadow-lg
                               flex flex-col items-center p-4"
                                >
                                    <div className="w-full h-40 bg-gray-100 rounded-[1.5rem] mb-4 flex items-center justify-center">
                                        <span className="text-gray-400">Ảnh sự kiện {event.id}</span>
                                    </div>

                                    <div className="text-center">
                                        <h3 className="text-lg font-bold text-gray-800">
                                            Sự kiện "{event.title}"
                                        </h3>
                                        <p className="text-gray-600 text-sm mt-1">Địa điểm: {event.location}</p>
                                        <p className="text-gray-600 text-sm">Thời gian: {event.date}</p>
                                    </div>
                                    <Link
                                        to={`/events/${event.id}`}
                                        className="mt-auto bg-green-600 text-white font-semibold py-2 px-8 rounded-full
                                   hover:bg-green-700 transition-all duration-300"
                                    >
                                        Xem chi tiết
                                    </Link>
                                </div>
                            ))}
                        </div>

                    </AnimatedScroll>
                </section>

                {/* --- MAIN 3, 4 (Thêm vào đây nếu muốn) ---
                  <section className="h-screen bg-blue-500 flex items-center justify-center scroll-snap-align-start">
                    <h1 className="text-6xl text-white">Main 3</h1>
                  </section>
                */}

            </main>

            <footer className="bg-gray-100 text-center py-4">
                <a className="hover:underline" href="https://www.google.com/">Contact Us</a>
                <p className="text-gray-500 text-sm"></p>
            </footer>
        </div>
    );
}

export default IntroPage;