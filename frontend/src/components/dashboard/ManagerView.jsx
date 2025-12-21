import React, { useState, useEffect } from 'react';
import { FaCalculator, FaClock, FaUserCog, FaTimesCircle } from "react-icons/fa";
import Swal from 'sweetalert2';
import CreateEvent from './CreateEvent';
import MyEvents from './MyEvents';
import { getManagedEvents, getPendingManagedEvents } from '../../api/eventApi';
import { getPendingRegistrations, approveRegistration, rejectRegistration, getMyRegistrations, cancelRegistration } from '../../api/registrationApi';

const ManagerView = () => {
    const [managerPendingList, setManagerPendingList] = useState({ MANAGING: [], OTHER: [], MY_REGISTRATIONS: [] });
    // Note: 'MANAGING' refers to pending requests FOR my events. 'OTHER' was used for MY pending requests to other events, but Manager usually focuses on Managing.
    // Let's keep the structure or simplify.
    // The previous mock data had: MANAGING (requests to my events) and OTHER (my requests to other events).
    // I will map:
    // - MANAGING: getPendingRegistrations() (List of users wanting to join my events)
    // - OTHER: getMyRegistrations() where status is PENDING (My requests to join other events) -> This requires borrowing from Volunteer view logic or just omitting if not priority.
    // Let's focus on MANAGING first as that's the core Manager duty.

    const [managedEventsCount, setManagedEventsCount] = useState(0);
    const [showCreateEvent, setShowCreateEvent] = useState(false);
    const [showMyEventsModal, setShowMyEventsModal] = useState(false);
    const [showPendingListModal, setShowPendingListModal] = useState(false);
    const [managerTab, setManagerTab] = useState('MANAGING');
    const [loading, setLoading] = useState(false);

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) return;

            // 1. Get Managed Events Count
            const eventsData = await getManagedEvents(user.id, 1); // Limit 1 to just get pagination total
            setManagedEventsCount(eventsData.pagination.total);

            // 2. Get Pending Registrations (Requests to join my events)
            const pendingRegs = await getPendingRegistrations();

            // 3. Get Managed Events that are PENDING (Waiting for Admin approval)
            const myPendingEvents = await getPendingManagedEvents(user.id);

            // 4. Get My Registrations (PENDING) - Events I want to join
            const myRegs = await getMyRegistrations();
            const myPendingRegs = myRegs.filter(r => r.status === 'PENDING');

            setManagerPendingList(prev => ({
                ...prev,
                MANAGING: pendingRegs.map(reg => ({
                    id: reg._id,
                    userName: reg.volunteerName || reg.volunteerId?.name || 'Unknown',
                    eventTitle: reg.eventTitle || 'Unknown Event', // Service populates this
                    date: new Date(reg.registeredAt).toLocaleDateString(),
                    ...reg
                })),
                OTHER: myPendingEvents.map(evt => ({
                    id: evt._id,
                    title: evt.title,
                    startTime: new Date(evt.startTime).toLocaleString(),
                    location: evt.location,
                    ...evt
                })),
                MY_REGISTRATIONS: myPendingRegs.map(reg => ({
                    ...reg,
                    id: reg._id,
                    eventId: reg.eventId?._id, // Populate might return object
                    title: reg.eventId?.title || 'Unknown Event',
                    date: new Date(reg.registeredAt).toLocaleDateString(),
                }))
            }));

        } catch (error) {
            console.error("Error loading manager data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getPendingCount = () => {
        return managerPendingList.MANAGING.length; // + managerPendingList.OTHER.length;
    };

    const handleApprove = async (regId, userName) => {
        try {
            await approveRegistration(regId);
            Swal.fire("Đã duyệt", `Đã chấp nhận ${userName}`, "success");
            // Refresh list
            setManagerPendingList(prev => ({
                ...prev,
                MANAGING: prev.MANAGING.filter(i => i.id !== regId)
            }));
            // Optionally refresh events count if needed, but approved doesn't change managed count, just participant count inside event.
        } catch (error) {
            Swal.fire("Lỗi", "Không thể duyệt yêu cầu", "error");
        }
    };

    const handleReject = async (regId, userName) => {
        try {
            await rejectRegistration(regId);
            Swal.fire("Đã từ chối", `Đã từ chối ${userName}`, "info");
            setManagerPendingList(prev => ({
                ...prev,
                MANAGING: prev.MANAGING.filter(i => i.id !== regId)
            }));
        } catch (error) {
            Swal.fire("Lỗi", "Không thể từ chối yêu cầu", "error");
        }
    };

    const handleCancelRegistration = async (eventId, title) => {
        try {
            const result = await Swal.fire({
                title: 'Hủy đăng ký?',
                text: `Bạn có chắc muốn hủy đăng ký tham gia "${title}"?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Hủy đăng ký',
                cancelButtonText: 'Đóng'
            });

            if (result.isConfirmed) {
                await cancelRegistration(eventId);
                Swal.fire("Đã hủy", `Đã hủy đăng ký sự kiện ${title}`, "success");
                setManagerPendingList(prev => ({
                    ...prev,
                    MY_REGISTRATIONS: prev.MY_REGISTRATIONS.filter(i => i.eventId !== eventId)
                }));
            }
        } catch (error) {
            Swal.fire("Lỗi", "Không thể hủy đăng ký", "error");
        }
    };

    return (
        <div className="space-y-6">
            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Card 1: Manager Events Count */}
                <div
                    onClick={() => setShowMyEventsModal(true)}
                    className="bg-green-200 rounded-[20px] hover:bg-green-100 p-6 flex flex-col items-center justify-center shadow-sm relative overflow-hidden cursor-pointer"
                >
                    <div className="bg-green-500 p-3 rounded-full absolute top-4 left-4 shadow-sm text-white">
                        <FaCalculator size={20} />
                    </div>
                    <div className="mt-8 text-center">
                        <span className="text-4xl font-black text-green-800 block mb-1">{managedEventsCount}</span>
                        <p className="font-bold text-gray-800 text-sm">Sự kiện đã tạo</p>
                    </div>
                </div>

                {/* Card 2: Pending Requests */}
                <div
                    onClick={() => setShowPendingListModal(true)}
                    className="bg-green-200 rounded-[20px] p-6 flex flex-col items-center justify-center shadow-sm cursor-pointer hover:bg-green-100 transition relative overflow-hidden"
                >
                    <div className="bg-green-500 p-3 rounded-full absolute top-4 left-4 shadow-sm text-white">
                        <FaClock size={20} />
                    </div>
                    <div className="mt-8 text-center">
                        <span className="text-4xl font-black text-green-800 block mb-1">
                            {getPendingCount()}
                        </span>
                        <p className="font-bold text-gray-800 text-sm">Yêu cầu chờ duyệt</p>
                    </div>
                </div>

                {/* Card 3: Create Event (Role) */}
                <div
                    onClick={() => setShowCreateEvent(true)}
                    className="bg-green-200 rounded-[20px] p-6 flex flex-col items-center justify-center shadow-sm relative overflow-hidden cursor-pointer hover:bg-green-100 transition"
                >
                    <div className="bg-green-500 p-3 rounded-full absolute top-4 left-4 shadow-sm text-white">
                        <FaUserCog size={20} />
                    </div>
                    <div className="mt-8 text-center">
                        <span className="bg-gray-100 text-green-800 text-lg font-bold px-4 py-1 rounded-full shadow-sm block mb-2">
                            MANAGER
                        </span>
                        <p className="font-bold text-gray-800 text-sm">Tạo sự kiện mới</p>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreateEvent isOpen={showCreateEvent} onClose={() => setShowCreateEvent(false)} />
            {/* Note: MyEvents needs to handle "Manager Mode" to show created events, or just show joined events based on intention.
                Usually "My Events" means joined. "Managed Events" is different.
                However, for this task, I'll leave MyEvents as is (Joined) since Manager can also join.
                If user wanted to see "Created Events", that's a different list.
                But the card says "Sự kiện tham gia" (Joined) in original code BUT I changed label to "Sự kiện đã tạo" based on context.
                Wait, card 1 original label: "Sự kiện tham gia" (Joined).
                My change: "Sự kiện đã tạo" (Created).
                I should probably stick to one or enable both.
                Let's stick to "Sự kiện đã tạo" (Created) for Manager Dashboard as it makes more sense for a manager view.
                But `MyEvents.jsx` displays Joined events.
                I will leave `MyEvents` as is for now, maybe Manager wants to see joined events too.
                But the count `managedEventsCount` reflects CREATED events.
            */}
            <MyEvents isOpen={showMyEventsModal} onClose={() => setShowMyEventsModal(false)} />

            {/* Pending List Modal */}
            {showPendingListModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col h-[80vh]"> {/* Fixed Height */}
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-xl font-bold text-gray-800">Quản lý yêu cầu</h3>
                            <button onClick={() => setShowPendingListModal(false)} className="text-gray-500 hover:text-red-500 transition">
                                <FaTimesCircle size={24} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b bg-gray-50 px-4 pt-2">
                            <button
                                onClick={() => setManagerTab('MANAGING')}
                                className={`pb-3 px-4 font-semibold text-sm transition relative ${managerTab === 'MANAGING' ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <FaClock /> Yêu cầu tham gia
                                    <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">{managerPendingList.MANAGING.length}</span>
                                </div>
                                {managerTab === 'MANAGING' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600"></div>}
                            </button>
                            <button
                                onClick={() => setManagerTab('OTHER')}
                                className={`pb-3 px-4 font-semibold text-sm transition relative ${managerTab === 'OTHER' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <FaUserCog /> Sự kiện chờ duyệt
                                    <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">{managerPendingList.OTHER.length}</span>
                                </div>
                                {managerTab === 'OTHER' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></div>}
                            </button>
                            <button
                                onClick={() => setManagerTab('MY_REGISTRATIONS')}
                                className={`pb-3 px-4 font-semibold text-sm transition relative ${managerTab === 'MY_REGISTRATIONS' ? 'text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <div className="flex items-center gap-2">
                                    <FaClock /> Đăng ký của tôi
                                    <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">{managerPendingList.MY_REGISTRATIONS.length}</span>
                                </div>
                                {managerTab === 'MY_REGISTRATIONS' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-600"></div>}
                            </button>

                        </div>

                        <div className="p-4 overflow-y-auto flex-1 bg-gray-50">
                            {/* Content */}
                            {managerTab === 'MANAGING' ? (
                                <div className="space-y-3">
                                    {loading ? <p className="text-center text-gray-500">Đang tải...</p> :
                                        managerPendingList.MANAGING.length > 0 ? managerPendingList.MANAGING.map(req => (
                                            <div key={req.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                                                <div>
                                                    <p className="font-bold text-gray-800">{req.userName}</p>
                                                    <p className="text-sm text-gray-500">Xin tham gia: <span className="font-medium text-green-700">{req.eventTitle}</span></p>
                                                    <p className="text-xs text-gray-400">{req.date}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleApprove(req.id, req.userName)}
                                                        className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-md text-sm font-semibold transition"
                                                    >
                                                        Duyệt
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(req.id, req.userName)}
                                                        className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-md text-sm font-semibold transition"
                                                    >
                                                        Từ chối
                                                    </button>
                                                </div>
                                            </div>
                                        )) : <p className="text-center text-gray-500 italic">Không có yêu cầu tham gia nào.</p>}
                                </div>
                            ) : managerTab === 'OTHER' ? (
                                <div className="space-y-3">
                                    {managerPendingList.OTHER.length > 0 ? managerPendingList.OTHER.map(evt => (
                                        <div key={evt.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                                            <div>
                                                <p className="font-bold text-gray-800">{evt.title}</p>
                                                <p className="text-sm text-gray-500">Địa điểm: <span className="font-medium text-blue-700">{evt.location}</span></p>
                                                <p className="text-xs text-gray-400">Bắt đầu: {evt.startTime}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-md text-sm font-semibold">
                                                    Chờ Admin duyệt
                                                </span>
                                            </div>
                                        </div>
                                    )) : <p className="text-center text-gray-500 italic">Không có sự kiện nào đang chờ duyệt.</p>}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {managerPendingList.MY_REGISTRATIONS.length > 0 ? managerPendingList.MY_REGISTRATIONS.map(reg => (
                                        <div key={reg.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                                            <div>
                                                <p className="font-bold text-gray-800">{reg.title}</p>
                                                <p className="text-sm text-gray-500">Trạng thái: <span className="font-bold text-orange-500">Chờ duyệt</span></p>
                                                <p className="text-xs text-gray-400">Đăng ký ngày: {reg.date}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleCancelRegistration(reg.eventId, reg.title)}
                                                    className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-md text-sm font-semibold transition"
                                                >
                                                    Hủy đăng ký
                                                </button>
                                            </div>
                                        </div>
                                    )) : <p className="text-center text-gray-500 italic">Bạn chưa đăng ký sự kiện nào (đang chờ duyệt).</p>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerView;
