import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import VolunteerView from '../components/dashboard/VolunteerView';
import ManagerView from '../components/dashboard/ManagerView';
import AdminView from '../components/dashboard/AdminView';
import FeaturedActivities from '../components/dashboard/FeaturedActivities';
import RecentActivities from '../components/dashboard/RecentActivities';

// --- MAIN COMPONENT ---
const DashBoard = () => {
    console.log("DASHBOARD LAYOUT UPDATED v2 - PLEASE CHECK CONSOLE");
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
            <div className="w-full px-4 md:px-6 space-y-8">
                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch min-h-[1050px]">

                    {/* Left Column (Featured - Wide) */}
                    <div className="lg:col-span-2 space-y-8 animate-slide-right flex flex-col h-full">
                        {/* Dynamic Role View */}
                        {renderRoleView()}

                        {/* Featured Activities */}
                        <FeaturedActivities />
                    </div>

                    {/* Right Column (Recent - Narrow) */}
                    <div className="lg:col-span-1 animate-slide-left h-full flex flex-col">
                        <RecentActivities
                            currentUserRole={currentUserRole}
                            className="h-full flex-1"
                        />
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