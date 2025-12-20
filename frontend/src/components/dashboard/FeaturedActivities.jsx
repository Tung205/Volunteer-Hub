import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown } from "react-icons/fa";
import EventCard from '../EventCard';
import InfoEvent from '../InfoEvent';
import { getFeaturedEvents, getEventById } from '../../api/eventApi';

const FeaturedActivities = () => {
    const [filterFeatured, setFilterFeatured] = useState('newest'); // 'newest' | 'posts' | 'members'
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal state
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
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

    // Fetch events when filter changes
    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                // --- MOCK DATA FOR TESTING LAYOUT (6 ITEMS) ---
                const MOCK_TEST_EVENTS = Array(6).fill(null).map((_, index) => ({
                    _id: `mock-${index}`,
                    title: `Sự kiện Test Giao diện #${index + 1}`,
                    location: "Hoạt động Ngoại khóa",
                    startTime: new Date().toISOString(),
                    coverImageUrl: "https://placehold.co/600x400?text=Event+" + (index + 1),
                    organizerId: { name: "Admin Test" }
                }));

                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 500));
                setEvents(MOCK_TEST_EVENTS);

                // Original API call (Commented out for test)
                // const data = await getFeaturedEvents(filterFeatured, 6);
                // setEvents(data);
            } catch (error) {
                console.error("Failed to load events", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [filterFeatured]);

    const handleFilterSelect = (type) => {
        setFilterFeatured(type);
        setShowFilterDropdown(false);
    };

    // Handle viewing event details
    const handleViewDetails = async (event) => {
        setLoadingDetails(true);
        try {
            // Fetch full details
            const fullEvent = await getEventById(event._id);
            setSelectedEvent(fullEvent);
            setIsInfoOpen(true);
        } catch (error) {
            console.error("Failed to load event details", error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleCloseModal = () => {
        setIsInfoOpen(false);
        setSelectedEvent(null);
    };

    // Dummy handlers for registration/chat (can be connected later)
    const handleRegister = () => {
        alert("Chức năng đăng ký đang được phát triển!");
    };

    return (
        <div className="bg-gradient-to-b from-green-100 to-white border border-green-200 shadow-sm rounded-[20px] p-6 flex flex-col overflow-hidden flex-1 h-full">
            {/* Header & Filter */}
            <div className="relative mb-6">
                <div className="flex flex-col items-center justify-center">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800 leading-tight text-center">
                        Hoạt động nổi bật
                    </h2>
                    <span className="text-xs text-green-600 font-medium mt-1">
                        {filterFeatured === 'newest' && 'Mới nhất'}
                        {filterFeatured === 'posts' && 'Nhiều thảo luận'}
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
                                Nhiều thảo luận
                            </div>
                            <div onClick={() => handleFilterSelect('members')} className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center gap-2 ${filterFeatured === 'members' ? 'bg-green-50 text-green-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}>
                                Đông thành viên
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* List Featured Events - Grid Layout */}
            {loading ? (
                <div className="flex-1 flex justify-center items-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                    {events.length > 0 ? (
                        events.map((evt) => (
                            <EventCard
                                key={evt._id}
                                event={evt}
                                onClick={handleViewDetails}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center text-gray-500 py-10 text-sm">
                            Chưa có sự kiện nổi bật nào.
                        </div>
                    )}
                </div>
            )}

            {/* Event Details Modal */}
            <InfoEvent
                isOpen={isInfoOpen}
                onClose={handleCloseModal}
                event={selectedEvent || {}}
                userStatus="guest" // Default for now
                onRegister={handleRegister}
            />
        </div>
    );
};

export default FeaturedActivities;
