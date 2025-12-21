import React, { useState } from 'react';
import { Search, Lock, Unlock, X, ChevronDown, User } from 'lucide-react';
import Swal from 'sweetalert2';

const MOCK_USERS = [
    // 3 Managers
    { id: 1, name: 'Nguyễn Văn A', email: 'manager1@example.com', role: 'manager', status: 'active' },
    { id: 2, name: 'Trần Thị B', email: 'manager2@example.com', role: 'manager', status: 'active' },
    { id: 3, name: 'Lê Văn C', email: 'manager3@example.com', role: 'manager', status: 'locked' },
    // 7 Volunteers
    { id: 4, name: 'Phạm Thị D', email: 'vol1@example.com', role: 'volunteer', status: 'active' },
    { id: 5, name: 'Hoàng Văn E', email: 'vol2@example.com', role: 'volunteer', status: 'active' },
    { id: 6, name: 'Vũ Thị F', email: 'vol3@example.com', role: 'volunteer', status: 'active' },
    { id: 7, name: 'Đặng Văn G', email: 'vol4@example.com', role: 'volunteer', status: 'locked' },
    { id: 8, name: 'Bùi Thị H', email: 'vol5@example.com', role: 'volunteer', status: 'active' },
    { id: 9, name: 'Đỗ Văn I', email: 'vol6@example.com', role: 'volunteer', status: 'active' },
    { id: 10, name: 'Ngô Thị K', email: 'vol7@example.com', role: 'volunteer', status: 'active' },
];

const UserManagement = ({ isOpen, onClose }) => {
    const [users, setUsers] = useState(MOCK_USERS);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all'); // all, manager, volunteer

    if (!isOpen) return null;

    const handleToggleStatus = (user) => {
        if (user.status === 'active') {
            // Confirm before locking
            Swal.fire({
                title: 'Khóa tài khoản?',
                text: `Sau khi bạn khóa người dùng ${user.name}, họ sẽ không thể truy cập hệ thống!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Khóa tài khoản',
                cancelButtonText: 'Hủy'
            }).then((result) => {
                if (result.isConfirmed) {
                    updateUserStatus(user.id, 'locked');
                    Swal.fire(
                        'Đã khóa!',
                        `Người dùng ${user.name} đã bị khóa.`,
                        'success'
                    );
                }
            });
        } else {
            // Unlock immediately (or add confirm if needed, currently direct per simple UX)
            // Todo: Add backend logic here
            updateUserStatus(user.id, 'active');
        }
    };

    const updateUserStatus = (userId, newStatus) => {
        // Todo: Call API to update status
        setUsers(USERS => USERS.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    };

    const filteredUsers = users.filter(user => {
        const matchName = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchRole = roleFilter === 'all' || user.role === roleFilter;
        return matchName && matchRole;
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-fade-in-up border border-green-100">
                {/* Header */}
                <div className="flex-none flex items-center justify-between p-6 border-b border-green-100 bg-gradient-to-r from-green-50 to-emerald-50">
                    <div>
                        <h2 className="text-2xl font-bold text-green-900">Quản lý người dùng</h2>
                        <p className="text-sm text-green-700 mt-1 opacity-80">Danh sách thành viên và phân quyền hệ thống</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-full transition-all shadow-sm hover:shadow"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Filters */}
                <div className="flex-none p-6 bg-white border-b border-green-50 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên hoặc email..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder-gray-400 text-gray-700"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative w-full md:w-56">
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                            <select
                                className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer appearance-none text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="all">Tất cả vai trò</option>
                                <option value="manager">Quản lý sự kiện</option>
                                <option value="volunteer">Tình nguyện viên</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table List - Fixed height container logic with flex-1 */}
                <div className="flex-1 overflow-y-auto p-6 bg-green-50/10">
                    <div className="bg-white rounded-xl shadow-sm border border-green-100 overflow-x-auto min-h-full">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead className="bg-green-50/50 border-b border-green-100 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-green-800 uppercase tracking-wider backdrop-blur-sm bg-green-50/90">Thành viên</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-green-800 uppercase tracking-wider backdrop-blur-sm bg-green-50/90 w-[200px]">Vai trò</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-green-800 uppercase tracking-wider backdrop-blur-sm bg-green-50/90 w-[180px]">Trạng thái</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-green-800 uppercase tracking-wider text-right backdrop-blur-sm bg-green-50/90 w-[150px]">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-green-50">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-green-50/40 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${user.role === 'manager' ? 'bg-gradient-to-br from-teal-500 to-green-600' : 'bg-gradient-to-br from-emerald-400 to-green-500'
                                                        }`}>
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">{user.name}</div>
                                                        <div className="text-sm text-gray-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${user.role === 'manager'
                                                    ? 'bg-teal-50 text-teal-700 border-teal-100'
                                                    : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                    }`}>
                                                    {user.role === 'manager' ? 'Quản lý' : 'Tình nguyện viên'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'active'
                                                    ? 'bg-green-100 text-green-800 border border-green-100'
                                                    : 'bg-red-50 text-red-700 border border-red-100'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                                                        }`}></span>
                                                    {user.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleToggleStatus(user)}
                                                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all shadow-sm hover:shadow active:scale-95 ${user.status === 'active'
                                                        ? 'bg-white border border-red-200 text-red-600 hover:bg-red-50'
                                                        : 'bg-white border border-green-200 text-green-600 hover:bg-green-50'
                                                        }`}
                                                >
                                                    {user.status === 'active' ? (
                                                        <>
                                                            <Lock size={14} className="mr-1.5" /> Khóa
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Unlock size={14} className="mr-1.5" /> Mở khóa
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-20 text-center text-green-600/50">
                                            <div className="flex flex-col items-center justify-center">
                                                <User size={48} className="mb-3 opacity-50" />
                                                <p className="text-lg font-medium">Không tìm thấy người dùng nào</p>
                                                <p className="text-sm">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer info using flex-none to stay fixed */}
                <div className="flex-none px-6 py-4 border-t border-green-100 bg-green-50 flex justify-between items-center text-sm text-green-700">
                    <span>Hiển thị <strong>{filteredUsers.length}</strong> trên tổng số <strong>{users.length}</strong> người dùng</span>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;