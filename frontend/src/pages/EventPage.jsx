import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { IoSearch } from "react-icons/io5";
import InfoEvent from "../components/event/InfoEvent";
import EventCard from "../components/event/EventCard";
import bannerImage from "../assets/introDashboard.png";
import api from "../api/axios";

// Map object Event từ backend -> data cho UI
const mapApiEventToUiEvent = (ev) => {
  const startDate = ev.startTime ? new Date(ev.startTime) : null;
  const formattedDate = startDate ? startDate.toLocaleDateString("vi-VN") : "";

  let scale = "";
  if (typeof ev.maxParticipants === "number") {
    if (ev.maxParticipants === 0) scale = "large";
    else if (ev.maxParticipants < 20) scale = "small";
    else if (ev.maxParticipants <= 100) scale = "medium";
    else scale = "large";
  }

  return {
    id: ev._id,

    // giữ nguyên field cũ dùng cho EventCard
    imageUrl:
      ev.coverImageUrl ||
      "https://storage.googleapis.com/agent-tools-public-content/image_a0b60e.png",
    title: ev.title,
    location: ev.location,
    date: formattedDate,
    organizer: ev.organizerName || "Ban tổ chức",
    description: ev.description,
    userStatus: ev.userStatus || null,
    scale,
    raw: ev,

    // field để InfoEvent match đúng cấu trúc
    startTime: ev.startTime || null,
    organizerName: ev.organizerName || "Ban tổ chức",
    image:
      ev.coverImageUrl ||
      "https://storage.googleapis.com/agent-tools-public-content/image_a0b60e.png",
  };
};

const ITEMS_PER_PAGE = 6;

const EventPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // List events + pagination
  const [events, setEvents] = useState([]);
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page")) || 1
  );
  const [totalPages, setTotalPages] = useState(1);

  // Loading / error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Search & filter
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [locationFilter, setLocationFilter] = useState(
    searchParams.get("location") || ""
  );
  const [scaleFilter, setScaleFilter] = useState(searchParams.get("scale") || "");

  // Gợi ý tìm kiếm
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null); // Để click ra ngoài thì đóng suggestion

  // Popup
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ===== Helpers =====
  const normalizeStatus = (s) => {
    if (!s) return null;
    const x = String(s).toLowerCase();
    return x;
  };

  const getAccessToken = () => {
    const t = localStorage.getItem("accessToken");
    if (!t || t === "null" || t === "undefined") return null;
    return t;
  };

  // ===== NEW API: GET /api/registrations/:eventId/status =====
  const fetchRegistrationStatusApi = async (eventId) => {
    const token = getAccessToken();
    const res = await api.get(`api/registrations/${eventId}/status`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    // res.data = { status: "NONE" | "PENDING" | "APPROVED" ... }
    return res.data?.status || "NONE";
  };

  // ========== API ==========

  const fetchEvents = async (opts = {}) => {
    const {
      page = currentPage,
      search = searchTerm,
      location = locationFilter,
      scale = scaleFilter, // chỉ dùng để filter local
    } = opts;

    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit: ITEMS_PER_PAGE,
        status: "OPENED",
      };
      if (search) params.search = search;
      if (location) params.location = location;

      const res = await api.get("api/events", { params });
      const apiEvents = res.data?.events || [];
      const pagination = res.data?.pagination || {};

      let mapped = apiEvents.map(mapApiEventToUiEvent);

      if (scale) {
        mapped = mapped.filter((ev) => ev.scale === scale);
      }

      setEvents(mapped);
      setCurrentPage(pagination.page || page);
      setTotalPages(pagination.totalPages || 1);
    } catch (err) {
      console.error("fetchEvents error:", err);
      setError("Không thể tải danh sách sự kiện. Vui lòng thử lại sau.");
      setEvents([]);
      setCurrentPage(1);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async (q) => {
    if (!q || !q.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await api.get("api/events/suggestions", {
        params: { q },
      });
      const list = res.data?.suggestions || [];
      setSuggestions(list.slice(0, 5));
    } catch (err) {
      console.error("fetchSuggestions error:", err);
    }
  };

  const fetchEventById = async (id) => {
    try {
      const res = await api.get(`api/events/${id}`);
      const ev = res.data?.event;
      if (!ev) return null;
      return mapApiEventToUiEvent(ev);
    } catch (err) {
      console.error("fetchEventById error:", err);
      return null;
    }
  };

  // ========== URL <-> STATE ==========

  useEffect(() => {
    const searchQ = searchParams.get("search") || "";
    const locQ = searchParams.get("location") || "";
    const scaleQ = searchParams.get("scale") || "";
    const pageQ = parseInt(searchParams.get("page")) || 1;

    setSearchTerm(searchQ);
    setLocationFilter(locQ);
    setScaleFilter(scaleQ);
    setCurrentPage(pageQ);

    fetchEvents({
      page: pageQ,
      search: searchQ,
      location: locQ,
      scale: scaleQ,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Giữ luồng “redirect login -> quay lại mở popup” như bạn đang có
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eventIdFromUrl = params.get("eventId");
    const popup = params.get("popup") === "true";

    const pendingRaw = localStorage.getItem("pendingEventRegistration");
    let eventIdFromStorage = null;
    if (pendingRaw) {
      try {
        const parsed = JSON.parse(pendingRaw);
        eventIdFromStorage = parsed.eventId;
      } catch (e) {
        console.error("Error parsing pendingEventRegistration:", e);
      }
    }

    const targetEventId = eventIdFromUrl || eventIdFromStorage;
    if (!targetEventId) return;

    if (popup || eventIdFromStorage) {
      (async () => {
        // luôn fetch chi tiết để popup full info
        const detail = await fetchEventById(targetEventId);
        if (!detail) return;

        // gọi API mới để lấy status đúng (guest => NONE)
        try {
          const st = await fetchRegistrationStatusApi(targetEventId);
          const uiStatus = st === "NONE" ? null : normalizeStatus(st);
          setSelectedEvent(uiStatus ? { ...detail, userStatus: uiStatus } : detail);
        } catch (e) {
          console.error("fetchRegistrationStatusApi error:", e);
          setSelectedEvent(detail);
        }

        setIsModalOpen(true);
        localStorage.removeItem("pendingEventRegistration");
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateUrlAndFetch = (override = {}) => {
    const newSearch = override.search ?? searchTerm;
    const newLocation = override.location ?? locationFilter;
    const newScale = override.scale ?? scaleFilter;
    const newPage = override.page ?? 1;

    const params = {};
    if (newSearch) params.search = newSearch;
    if (newLocation) params.location = newLocation;
    if (newScale) params.scale = newScale;
    if (newPage > 1) params.page = newPage;

    setSearchParams(params);
  };

  // ========== SEARCH HANDLERS ==========

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim()) {
      setShowSuggestions(true);
      fetchSuggestions(value);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleSearchClick = () => {
    updateUrlAndFetch({ page: 1 });
  };

  // 4. Chọn một gợi ý
  const handleSelectSuggestion = (suggestion) => {
    const title =
      typeof suggestion === "string" ? suggestion : suggestion.title || suggestion._id;

    setSearchTerm(title);
    setShowSuggestions(false);
    updateUrlAndFetch({ search: title, page: 1 });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- CÁC HÀM CŨ (Pagination, Modal, Auth) ---
  const handlePrevPage = () => {
    if (currentPage > 1) updateUrlAndFetch({ page: currentPage - 1 });
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) updateUrlAndFetch({ page: currentPage + 1 });
  };

  // ========== POPUP LOGIC (NEW: fetch detail + status) ==========
  const handleCardClick = async (event) => {
    try {
      // 1) fetch detail event cho popup đầy đủ info
      const res = await api.get(`api/events/${event.id}`);
      const ev = res.data?.event;
      const detail = ev ? mapApiEventToUiEvent(ev) : event;

      // 2) fetch status -> set userStatus cho InfoEvent đổi nút
      const st = await fetchRegistrationStatusApi(event.id);
      const uiStatus = st === "NONE" ? null : normalizeStatus(st);
      console.log(uiStatus);
      setSelectedEvent(uiStatus ? { ...detail, userStatus: uiStatus } : detail);
      setIsModalOpen(true);
    } catch (e) {
      console.error("handleCardClick error:", e);
      setSelectedEvent(event);
      setIsModalOpen(true);
    }
  };

  const registerEventApi = async (eventId) => {
    const token = getAccessToken();
    const res = await api.post(
      `api/registrations/${eventId}/register`,
      {},
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    );
    return res.data?.registration || res.data;
  };

  const handleRegister = async () => {

    const token = getAccessToken();

    if (!token) {
      if (selectedEvent?.id) {
        localStorage.setItem(
          "pendingEventRegistration",
          JSON.stringify({ eventId: selectedEvent.id, createdAt: Date.now() })
        );
      }

      setIsModalOpen(false);
      const redirectUrl = `/events?eventId=${selectedEvent.id}&popup=true&autoRegister=true`;

      Swal.fire({
        icon: "warning",
        title: "Bạn chưa đăng nhập",
        text: "Vui lòng đăng nhập để đăng ký sự kiện!",
        showCancelButton: true,
        confirmButtonText: "Đăng nhập ngay",
        cancelButtonText: "Hủy",
        confirmButtonColor: "#16a34a",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
        }
      });
      return;
    }

    if (!selectedEvent?.id) return;

    try {
      Swal.fire({
        title: "Đang đăng ký...",
        didOpen: () => Swal.showLoading(),
        allowOutsideClick: false,
      });

      const registration = await registerEventApi(selectedEvent.id);

      // update ngay theo response
      const newStatus = normalizeStatus(registration?.status || "PENDING");
      setSelectedEvent((prev) => (prev ? { ...prev, userStatus: newStatus } : prev));


      // optional: gọi API status mới để đảm bảo đúng tuyệt đối (nhất là case backend trả khác)
      try {
        const st = await fetchRegistrationStatusApi(selectedEvent.id);
        const uiStatus = st === "NONE" ? null : normalizeStatus(st);
        setSelectedEvent((prev) => (prev ? { ...prev, userStatus: uiStatus } : prev));
      } catch { }

      Swal.fire("Thành công", "Đăng ký thành công! Vui lòng chờ duyệt.", "success");
    } catch (err) {
      console.error("register error:", err);

      const status = err?.response?.status;
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.details ||
        "Đăng ký thất bại. Vui lòng thử lại.";

      if (status === 409) {
        // đã đăng ký trước đó -> gọi API status mới để cập nhật nút đúng (pending/approved)
        Swal.fire("Thông báo", "Bạn đã đăng ký sự kiện này trước đó.", "info");
        try {
          const st = await fetchRegistrationStatusApi(selectedEvent.id);
          const uiStatus = st === "NONE" ? null : normalizeStatus(st);
          setSelectedEvent((prev) => (prev ? { ...prev, userStatus: uiStatus } : prev));
        } catch { }
        return;
      }

      if (status === 401) {
        Swal.fire("Phiên đăng nhập hết hạn", "Vui lòng đăng nhập lại.", "warning");
        return;
      }

      if (status === 403) {
        Swal.fire(
          "Không có quyền",
          "Chỉ tài khoản tình nguyện viên mới được đăng ký sự kiện.",
          "error"
        );
        return;
      }

      Swal.fire("Lỗi", message, "error");
    }
  };

  const handleJoinChat = () => {
    // bạn sẽ bổ sung sau
    navigate("/");
  };

  // Auto mở popup khi redirect về từ login + autoRegister
  useEffect(() => {
    const eventId = searchParams.get("eventId");
    const popup = searchParams.get("popup");
    const autoRegister = searchParams.get("autoRegister");
    const token = getAccessToken();

    if (eventId && popup === "true") {
      (async () => {
        const detail = await fetchEventById(eventId);
        if (!detail) return;

        // set status trước khi hiện popup
        try {
          const st = await fetchRegistrationStatusApi(eventId);
          const uiStatus = st === "NONE" ? null : normalizeStatus(st);
          setSelectedEvent(uiStatus ? { ...detail, userStatus: uiStatus } : detail);
        } catch {
          setSelectedEvent(detail);
        }

        setIsModalOpen(true);

        // nếu cần autoRegister
        if (autoRegister === "true" && token) {
          try {
            const registration = await registerEventApi(eventId);
            const newStatus = normalizeStatus(registration?.status || "PENDING");
            setSelectedEvent((prev) => (prev ? { ...prev, userStatus: newStatus } : prev));

            Swal.fire("Thành công", "Đăng ký thành công! Vui lòng chờ duyệt.", "success");
          } catch (err) {
            console.error("autoRegister error:", err);
          }
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ========== RENDER ==========

  return (
    <div className="w-full bg-gray-50 min-h-screen pb-10">
      {/* BANNER + SEARCH */}
      <section className="w-full h-[450px] md:h-[550px] relative">
        <img
          src={bannerImage}
          alt="Search Banner"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center z-10">
          <h1 className="text-white text-2xl md:text-4xl font-bold mb-2">Xin chào,</h1>
          <h2 className="text-white text-2xl md:text-4xl font-bold mb-8">
            Hôm nay bạn muốn tham gia sự kiện nào?
          </h2>

          {/* SEARCH */}
          <div className="w-full max-w-3xl relative mb-6" ref={searchRef}>
            <div className="relative bg-white/80">
              <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === "Enter" && handleSearchClick()}
                onFocus={() => searchTerm && setShowSuggestions(true)}
                placeholder="Nhập sự kiện bạn muốn tham gia"
                className="w-full py-4 px-6 rounded-sm text-gray-700 outline-none focus:ring-2 focus:ring-green-500 shadow-lg text-lg"
              />
              <button
                onClick={handleSearchClick}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-600"
              >
                <IoSearch size={28} />
              </button>
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <ul className="absolute top-full left-0 right-0 bg-white rounded-b-md shadow-xl border-t border-gray-100 overflow-hidden z-50 text-left animate-fade-in">
                {suggestions.map((s, idx) => (
                  <li
                    key={s._id || idx}
                    onClick={() => handleSelectSuggestion(s)}
                    className="px-6 py-3 hover:bg-gray-50 cursor-pointer text-gray-700 flex items-center gap-3 transition-colors"
                  >
                    <IoSearch className="text-gray-400" />
                    {s.title || s}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* FILTERS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl mb-8">
            <div className="relative">
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full py-3 px-4 rounded-sm text-gray-600 bg-white border-none outline-none cursor-pointer text-center font-medium shadow-sm hover:bg-gray-50 appearance-none"
              >
                <option value="">-- Tất cả Địa điểm --</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
                <option value="Huế">Huế</option>
                <option value="Lào Cai">Lào Cai</option>
              </select>
            </div>

            <div className="relative">
              <select
                value={scaleFilter}
                onChange={(e) => setScaleFilter(e.target.value)}
                className="w-full py-3 px-4 rounded-sm text-gray-600 bg-white border-none outline-none cursor-pointer text-center font-medium shadow-sm hover:bg-gray-50 appearance-none"
              >
                <option value="">-- Tất cả Quy mô --</option>
                <option value="small">Nhóm nhỏ (&lt; 20 người)</option>
                <option value="medium">Vừa (20 - 100 người)</option>
                <option value="large">Lớn (&gt; 100 người)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSearchClick}
            className="bg-[#bfd200] hover:bg-[#a3b800] text-black font-bold py-3 px-16 rounded shadow-lg transition-transform transform hover:scale-105 text-lg uppercase tracking-wide"
          >
            Tìm kiếm
          </button>
        </div>
      </section>

      {/* LIST */}
      <section className="max-w-7xl mx-auto px-4 mt-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-green-700 inline-block border-b-4 border-green-500 pb-2">
            Một số sự kiện dành cho bạn!
          </h2>
          {(searchTerm || locationFilter) && (
            <p className="text-gray-500 mt-2">
              {loading
                ? "Đang tìm kiếm..."
                : `Tìm thấy ${events.length} kết quả${searchTerm ? ` cho "${searchTerm}"` : ""
                }${locationFilter ? ` tại "${locationFilter}"` : ""}`}
            </p>
          )}
        </div>

        {error && <div className="text-center text-red-500 mb-4">{error}</div>}

        <div className="min-h-[600px]">
          {loading ? (
            <div className="text-center py-10 text-gray-500 h-full flex items-center justify-center">
              <p className="text-xl">Đang tải sự kiện...</p>
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 content-start">
              {events.map((item) => (
                <div key={item.id} className="animate-fade-in">
                  <EventCard event={item} onClick={handleCardClick} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500 h-full flex items-center justify-center">
              <p className="text-xl">Không tìm thấy sự kiện nào phù hợp.</p>
            </div>
          )}
        </div>

        {events.length > 0 && totalPages > 1 && (
          <div className="flex justify-center items-center mt-10 space-x-4">
            {currentPage > 1 && (
              <button
                onClick={handlePrevPage}
                className="px-6 py-2 border border-gray-300 rounded hover:bg-green-600 hover:text-white transition font-medium"
              >
                Trước
              </button>
            )}

            <span className="text-gray-500 text-sm">
              Trang {currentPage} / {totalPages}
            </span>

            {currentPage < totalPages && (
              <button
                onClick={handleNextPage}
                className="px-6 py-2 border border-gray-300 rounded hover:bg-green-600 hover:text-white transition font-medium"
              >
                Sau
              </button>
            )}
          </div>
        )}
      </section>

      {/* POPUP */}
      <InfoEvent
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={selectedEvent}
        userStatus={selectedEvent?.userStatus || "guest"}
        onRegister={handleRegister}
        onJoinChat={handleJoinChat}
      />
    </div>
  );
};

export default EventPage;
