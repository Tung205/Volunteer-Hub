import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import logo from '../assets/logoApp.png'; 

const Header = () => {
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md h-20">
      <div className="max-w-7xl mx-auto px-6 py-3 grid grid-cols-2 md:grid-cols-3 items-center h-full">
        <div className="flex justify-start">
          <Link to="/" onClick={handleScrollTop}>
            <img src={logo} alt="logo" className="w-auto h-12" />
          </Link>
        </div>

        <ul className="hidden md:flex justify-center space-x-6 text-gray-700 font-medium">
          <li>
            <NavLink 
              to="/" 
              onClick={handleScrollTop}
              className="underline-animated font-bold text-xl"
            >
              Trang chủ
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/events" 
              onClick={handleScrollTop}
              className="underline-animated font-bold text-xl"
            >
              Sự kiện
            </NavLink>
          </li>
        </ul>

        <div className="flex justify-end space-x-3">
          <Link to="/login" className="border-2 text-base md:text-xl font-bold border-green-600 px-4 py-1 rounded-full hover:bg-green-100 transition-colors duration-300 text-green-700">
            Đăng nhập
          </Link>
          <Link to="/register" className="border-2 text-base md:text-xl font-bold border-green-600 px-4 py-1 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors duration-300">
            Đăng ký
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Header;