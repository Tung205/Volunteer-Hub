import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown } from "react-icons/fa";
import { FEATURED_EVENTS } from '../../data/mockData';

// --- COMPONENT EventCard Helper ---
const EventCard = ({ event }) => (
    <div className="bg-white rounded-xl p-3 shadow-sm flex gap-3 border border-gray-100">
        <div className="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
            <img src={event.image || "https://placehold.co/100"} alt="Thumb" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 flex flex-col justify-between">
            <div>
                <h3 className="font-bold text-gray-800 text-sm line-clamp-1">{event.title}</h3>
                <p className="text-gray-500 text-xs mt-1">📍 {event.location}</p>
                <p className="text-gray-400 text-[10px] mt-1">📅 {event.date}</p>
            </div>
            <div className="flex justify-end">
                <button className="bg-green-700 hover:bg-green-800 text-white text-[10px] font-bold py-1 px-3 rounded shadow-sm">
                    Chi tiết
                </button>
            </div>
        </div>
    </div>
);

const FeaturedActivities = () => {
    const [filterFeatured, setFilterFeatured] = useState('newest'); // 'newest' | 'posts' | 'members'
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowFilterDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const handleFilterSelect = (type) => {
        setFilterFeatured(type);
        setShowFilterDropdown(false);
    };

    return (
        <div className="bg-[#E8E8E8] rounded-[20px] p-6 h-full flex flex-col">
            {/* Header & Filter */}
            <div className="relative mb-6">
                <div className="flex flex-col items-center justify-center">
                    <h2 className="text-lg md:text-lg font-bold text-gray-800 leading-tight text-center">
                        Hoạt động nổi bật
                    </h2>
                    <span className="text-xs text-green-600 font-medium mt-1">
                        {filterFeatured === 'newest' && 'Mới nhất'}
                        {filterFeatured === 'posts' && 'Nhiều bài đăng'}
                        {filterFeatured === 'members' && 'Đông thành viên'}
                    </span>
                </div>

                {/* Filter Icon & Dropdown - Interactive */}
                <div className="absolute right-0 top-0" ref={dropdownRef}>
                    <button
                        onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                        className={`p-2 rounded-full transition cursor-pointer ${showFilterDropdown ? 'bg-green-100 text-green-700' : 'hover:bg-gray-200 text-gray-600'}`}
                    >
                        <FaChevronDown className={`transition-transform duration-200 ${showFilterDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    <div className={`absolute right-0 mt-2 w-48 bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100 z-10 origin-top-right transition-all duration-200 ease-out transform ${showFilterDropdown
                        ? 'opacity-100 scale-100 translate-y-0'
                        : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                        }`}>
                        <div className="py-1">
                            <div onClick={() => handleFilterSelect('newest')} className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center gap-2 ${filterFeatured === 'newest' ? 'bg-green-50 text-green-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}>
                                Mới nhất
                            </div>
                            <div onClick={() => handleFilterSelect('posts')} className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center gap-2 ${filterFeatured === 'posts' ? 'bg-green-50 text-green-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}>
                                Nhiều bài đăng
                            </div>
                            <div onClick={() => handleFilterSelect('members')} className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center gap-2 ${filterFeatured === 'members' ? 'bg-green-50 text-green-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}>
                                Đông thành viên
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* List Featured Events */}
            <div className="space-y-4 flex-1">
                {FEATURED_EVENTS.slice(0, 3).map((evt) => (
                    <EventCard key={evt.id} event={evt} />
                ))}
            </div>
        </div>
    );
};

export default FeaturedActivities;
