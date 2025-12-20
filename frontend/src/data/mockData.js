export const FEATURED_EVENTS = [
    { id: 1, title: "Trồng cây gây rừng", location: "Lào Cai", date: "23/11/2025" },
    { id: 2, title: "Dọn rác bãi biển", location: "Đà Nẵng", date: "01/12/2025" },
    { id: 3, title: "Hiến máu nhân đạo", location: "Hà Nội", date: "15/12/2025" },
];

export const NOTIFICATIONS = [
    // Mock for TNV
    { id: 1, type: 'success', content: 'Bạn đã được duyệt tham gia sự kiện "Mùa hè xanh"', time: new Date().setHours(new Date().getHours() - 1), role: 'TNV' },
    { id: 2, type: 'error', content: 'Yêu cầu tham gia "Hiến máu" bị từ chối', time: new Date().setHours(new Date().getHours() - 5), role: 'TNV' },
    { id: 3, type: 'info', content: 'Sự kiện "Mùa hè xanh" có bài đăng mới: Lịch trình chi tiết', time: new Date().setDate(new Date().getDate() - 2), role: 'TNV' },

    // Mock for Manager
    { id: 4, type: 'success', content: 'Sự kiện "Dạy học vùng cao" của bạn đã được Admin duyệt', time: new Date().setHours(new Date().getHours() - 2), role: 'MANAGER' },
    { id: 5, type: 'info', content: 'Thành viên Nguyễn Văn A vừa tham gia sự kiện của bạn', time: new Date().setDate(new Date().getDate() - 1), role: 'MANAGER' },

    // Mock for Admin
    { id: 6, type: 'info', content: 'Có yêu cầu cấp quyền Manager mới từ User B', time: new Date().setHours(new Date().getHours() - 3), role: 'ADMIN' },
    { id: 7, type: 'success', content: 'Sự kiện mới "Gây quỹ" chờ duyệt', time: new Date().setDate(new Date().getDate() - 5), role: 'ADMIN' },

    // Chung
    { id: 8, type: 'info', content: 'Bạn đã cập nhật hồ sơ cá nhân thành công', time: new Date().setHours(new Date().getHours() - 10), role: 'ALL' },
];

export const MOCK_PENDING_DATA = {
    VOLUNTEER: [
        { id: 'v1', type: 'EVENT_REG', title: 'Áo ấm cho em', status: 'Chờ duyệt', date: '2025-01-10' },
        { id: 'v2', type: 'POST', title: 'Bài viết: Cảm nhận về chuyến đi...', group: 'Nhóm Mùa Hè Xanh', status: 'Chờ duyệt', date: '2025-01-11' }
    ],
    MANAGER: {
        MANAGING: [
            { id: 'm1', type: 'JOIN_REQUEST', userName: 'Nguyễn Văn B', eventTitle: 'Dọn rác bãi biển', date: '2025-01-12' },
            { id: 'm2', type: 'JOIN_REQUEST', userName: 'Trần Thị C', eventTitle: 'Dọn rác bãi biển', date: '2025-01-13' }
        ],
        OTHER: [
            { id: 'mo1', type: 'EVENT_APPROVAL', title: 'Giải bóng đá thiện nguyện', status: 'Chờ admin duyệt', date: '2025-02-01' }
        ]
    },
    ADMIN: {
        EVENTS: [
            { id: 101, title: 'Ngày hội đọc sách', location: 'Thư viện Quốc gia', startTime: '2025-01-10T08:00:00', organizerName: 'CLB Sách', description: 'Sự kiện khuyến đọc...', image: '' },
            { id: 102, title: 'Giải cứu nông sản', location: 'Hà Dương', startTime: '2025-01-15T07:00:00', organizerName: 'Nhóm Thiện Nguyện X', description: 'Hỗ trợ bà con...', image: '' },
        ],
        UPGRADES: [
            { id: 'u1', type: 'UPGRADE_REQUEST', userName: 'Lê Văn Manager', reason: 'Tôi muốn đóng góp nhiều hơn cho cộng đồng qua việc tổ chức sự kiện.', date: '2025-01-09' }
        ]
    }
};
