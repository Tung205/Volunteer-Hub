import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaUser } from "react-icons/fa";
import Swal from 'sweetalert2';
import VolunteerView from '../components/dashboard/VolunteerView';
import ManagerView from '../components/dashboard/ManagerView';
import AdminView from '../components/dashboard/AdminView';
import FeaturedActivities from '../components/dashboard/FeaturedActivities';
import RecentActivities from '../components/dashboard/RecentActivities';

// --- MAIN COMPONENT ---
const DashBoard = () => {
    const navigate = useNavigate();
    const [currentUserRole, setCurrentUserRole] = useState('TNV'); // 'TNV' | 'MANAGER' | 'ADMIN'
    const [userName, setUserName] = useState("Nguyễn Văn A");

    // Check login state
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const userObj = JSON.parse(storedUser);
                setUserName(userObj.fullName || "User");
                if (userObj.role) setCurrentUserRole(userObj.role);
            } catch (e) {
                console.error("Error parsing user data", e);
            }
        }
    }, []);

    const handleLogout = () => {
        Swal.fire({
            title: 'Đăng xuất?',
            text: "Bạn có chắc chắn muốn đăng xuất không?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Đăng xuất',
            cancelButtonText: 'Hủy'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                navigate('/login');
            }
        });
    };

    const renderRoleView = () => {
        switch (currentUserRole) {
            case 'ADMIN': return <AdminView />;
            case 'MANAGER': return <ManagerView />;
            default: return <VolunteerView roleName={currentUserRole} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[25px] shadow-sm border border-gray-100 animate-fade-in-down">
                    {/* Welcome Text */}
                    <div className="mb-4 md:mb-0 text-center md:text-left">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-green-800 tracking-tight">
                            Xin chào, {userName}! 👋
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Hôm nay bạn muốn đóng góp điều gì cho cộng đồng?
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-full">
                            <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center text-green-700">
                                <FaUser size={14} />
                            </div>
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-gray-700">{userName}</p>
                                <p className="text-[10px] text-gray-500 font-semibold">{currentUserRole}</p>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white p-3 rounded-full transition-all duration-300 shadow-sm group"
                            title="Đăng xuất"
                        >
                            <FaSignOutAlt className="group-hover:rotate-180 transition-transform duration-300" />
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column (Activities & Role View) */}
                    <div className="lg:col-span-2 space-y-8 animate-slide-right">
                        {/* Dynamic Role View */}
                        {renderRoleView()}

                        {/* Recent Activities */}
                        <RecentActivities currentUserRole={currentUserRole} />
                    </div>

                    {/* Right Column (Featured) */}
                    <div className="lg:col-span-1 animate-slide-left h-full">
                        <FeaturedActivities />
                    </div>
                </div>
            </div>

            {/* DEV TOOL: Role Switcher */}
            <div className="fixed bottom-4 right-4 z-[9999] bg-white p-3 rounded-lg shadow-2xl border-2 border-indigo-500 transform transition hover:scale-105 group opacity-50 hover:opacity-100">
                <p className="text-[10px] uppercase font-black text-indigo-500 mb-2 text-center tracking-wider">Debug: Change Role</p>
                <div className="flex gap-2">
                    {['TNV', 'MANAGER', 'ADMIN'].map(role => (
                        <button
                            key={role}
                            onClick={() => {
                                setCurrentUserRole(role);
                                // Update localStorage to persist
                                try {
                                    const stored = JSON.parse(localStorage.getItem('user') || '{}');
                                    stored.role = role;
                                    localStorage.setItem('user', JSON.stringify(stored));
                                } catch (e) { }

                                Swal.fire({
                                    toast: true,
                                    position: 'bottom-start',
                                    icon: 'info',
                                    title: `Role: ${role}`,
                                    showConfirmButton: false,
                                    timer: 1000,
                                    width: '200px'
                                });
                            }}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${currentUserRole === role
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {role}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashBoard;