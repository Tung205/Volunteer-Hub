import React, { useState, useEffect, useRef } from 'react'; // <--- 1. SỬA LỖI: Thêm useState, useEffect
import { Link, useNavigate, NavLink } from 'react-router-dom';
import logo from "../../assets/logoApp.png";

import { IoLogOutOutline } from "react-icons/io5";
import { FaUserCircle, FaBell } from "react-icons/fa";

import Logout from '../profile/Logout';
import UserProfile from '../profile/UserProfile';

const Header = () => {

  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogoutClick = () => {
    setShowDropdown(false); // Đóng menu dropdown trước
    setIsLogoutOpen(true); // Mở Logout xác nhận
  };

  const confirmLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setIsLogoutOpen(false);
    navigate('/');
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    setIsProfileOpen(true);
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsAuthenticated(!!token);

    if (token) {
      // Thử lấy thông tin user từ localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        // Nếu chưa có data thật, dùng Mock Data để test giao diện Profile
        setUser({
          name: "Nguyễn Văn A",
          email: "nguyenvana@gmail.com",
          role: "TNV" // Thử đổi thành "MANAGER" hoặc "ADMIN" để test
        });
      }
    }
  }, []);

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setShowDropdown(false); // <--- UX: Đóng menu khi bấm link
  };

  // Logic: Đã đăng nhập -> Dashboard, Chưa -> Trang chủ Guest
  const homeLink = isAuthenticated ? "/dashboard" : "/";

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white shadow-md h-20">
        <div className="w-full px-8 md:px-12 grid grid-cols-2 md:grid-cols-3 items-center h-full">

          {/* CỘT 1: LOGO */}
          <div className="flex justify-start">
            <Link to={homeLink} onClick={handleScrollTop}>
              <img src={logo} alt="logo" className="w-auto h-12" />
            </Link>
          </div>

          {/* CỘT 2: MENU GIỮA */}
          <ul className="hidden md:flex justify-center space-x-6 text-gray-700 font-medium">
            <li>
              <NavLink
                to={homeLink}
                onClick={handleScrollTop}
                // Thêm logic active class nếu cần thiết
                className="underline-animated font-bold text-xl hover:text-green-600 transition"
              >
                Trang chủ
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/events"
                onClick={handleScrollTop}
                className="underline-animated font-bold text-xl hover:text-green-600 transition"
              >
                Sự kiện
              </NavLink>
            </li>
          </ul>

          {/* CỘT 3: USER / AUTH BUTTONS */}
          {isAuthenticated ? (
            <div className="flex justify-end relative items-center gap-3" ref={dropdownRef}> {/* <--- 2. SỬA LỖI: Thêm flex justify-end để icon dính phải */}
              <span className="hidden md:block text-sm font-semibold text-gray-700">Xin chào, {user?.name}</span>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <FaUserCircle size={32} className="text-gray-400 hover:text-green-600 transition" />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div className="absolute right-0 top-10 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-2 animate-fade-in z-50">

                  <div className="px-4 py-2 border-b border-gray-100 mb-1">
                    <p className="text-sm font-bold text-gray-800 truncate">{user?.name}</p>
                    {/* <p className="text-xs text-gray-500 truncate">{user?.email}</p> */}
                  </div>
                  <button
                    onClick={handleProfileClick}
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <FaUserCircle className="text-gray-500" /> Hồ sơ cá nhân
                  </button>
                  <button
                    onClick={async () => {
                      setShowDropdown(false);
                      const { subscribeUserToPush } = await import('../../utils/push-notification');
                      await subscribeUserToPush();
                    }}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <FaBell className="text-gray-500" /> Bật thông báo
                  </button>
                  <div className="border-t my-1"></div>
                  <button
                    onClick={handleLogoutClick}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <IoLogOutOutline /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-end space-x-3">
              <Link to="/login" className="border-2 text-base md:text-xl font-bold border-green-600 px-4 py-1 rounded-full hover:bg-green-100 transition-colors duration-300 text-green-700">
                Đăng nhập
              </Link>
              <Link to="/register" className="border-2 text-base md:text-xl font-bold border-green-600 px-4 py-1 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors duration-300">
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </nav>

      <Logout
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={confirmLogout}
      />

      <UserProfile
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
      />
    </>
  );
};

export default Header;