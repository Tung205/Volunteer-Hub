import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { IoSearch } from "react-icons/io5";
import InfoEvent from "../components/InfoEvent";
import EventCard from "../components/EventCard";
import bannerImage from "../assets/introDashboard.png";
import api from "../api/axios";

// Map object Event từ backend -> data cho UI
const mapApiEventToUiEvent = (ev) => {
  const startDate = ev.startTime ? new Date(ev.startTime) : null;
  const formattedDate = startDate
    ? startDate.toLocaleDateString("vi-VN")
    : "";

  let scale = "";
  if (typeof ev.maxParticipants === "number") {
    if (ev.maxParticipants === 0) scale = "large";
    else if (ev.maxParticipants < 20) scale = "small";
    else if (ev.maxParticipants <= 100) scale = "medium";
    else scale = "large";
  }

  return {
    id: ev._id,
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
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [locationFilter, setLocationFilter] = useState(
    searchParams.get("location") || ""
  );
  const [scaleFilter, setScaleFilter] = useState(
    searchParams.get("scale") || ""
  );

  // Gợi ý tìm kiếm
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  // Popup
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

      // ❗ CHỈ GỬI CÁC PARAM MÀ BACKEND CHO PHÉP:
      // status, location, search, startDate, endDate, page, limit, sort
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
        status: "OPENED", // chỉ lấy event đang mở
      };
      if (search) params.search = search;
      if (location) params.location = location;

      const res = await api.get("api/events", { params });
      // Controller trả { events, pagination } :contentReference[oaicite:3]{index=3}
      const apiEvents = res.data?.events || [];
      const pagination = res.data?.pagination || {};

      let mapped = apiEvents.map(mapApiEventToUiEvent);

      // Filter scale ở FE, KHÔNG gửi lên backend
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
      // /api/events/suggestions?q=... :contentReference[oaicite:4]{index=4}
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
      const ev = res.data?.event; // { event } :contentReference[oaicite:5]{index=5}
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eventIdFromUrl = params.get("eventId");
    const popup = params.get("popup") === "true";

    // Lấy từ localStorage nếu URL không có
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

    // Nếu có eventId & popup=true -> mở lại popup
    if (popup || eventIdFromStorage) {
      (async () => {
        // Nếu list events đã load rồi, thử tìm trong state trước
        let found = events.find((ev) => ev.id === targetEventId);

        // Nếu chưa có trong state, gọi API lấy chi tiết
        if (!found) {
          try {
            const res = await api.get(`/events/${targetEventId}`);
            const ev = res.data?.event;
            if (ev) {
              found = mapApiEventToUiEvent(ev);
            }
          } catch (err) {
            console.error("fetchEventById error:", err);
          }
        }

        if (found) {
          setSelectedEvent(found);
          setIsModalOpen(true);
        }

        // Dùng xong thì xóa dấu vết
        localStorage.removeItem("pendingEventRegistration");
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]); // chạy lại mỗi khi events load xong


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

  const handleSelectSuggestion = (suggestion) => {
    const title =
      typeof suggestion === "string"
        ? suggestion
        : suggestion.title || suggestion._id;

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

  const handlePrevPage = () => {
    if (currentPage > 1) {
      updateUrlAndFetch({ page: currentPage - 1 });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      updateUrlAndFetch({ page: currentPage + 1 });
    }
  };

  // ========== POPUP & ĐĂNG KÝ (tạm local) ==========

  const handleCardClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleRegister = () => {
    const isAuthenticated = localStorage.getItem("accessToken");
    if (!isAuthenticated) {
      if(selectedEvent?.id) {
        localStorage.setItem(
          "pendingEventRegistration",
          JSON.stringify({ 
            eventId: selectedEvent.id,
            createdAt: Date.now(),
           })
        )
      }
      setIsModalOpen(false);
      // const redirectUrl = `api/events?eventId=${selectedEvent.id}&popup=true&autoRegister=true`;
      const redirectUrl = `/events?eventId=${selectedEvent.id}&popup=true`;

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

    Swal.fire({
      title: "Đang xử lý...",
      didOpen: () => Swal.showLoading(),
      timer: 1000,
    }).then(() => {
      const updatedEvents = events.map((ev) =>
        ev.id === selectedEvent.id ? { ...ev, userStatus: "pending" } : ev
      );
      setEvents(updatedEvents);
      setSelectedEvent((prev) =>
        prev ? { ...prev, userStatus: "pending" } : prev
      );
      Swal.fire(
        "Thành công",
        "Đăng ký thành công! Vui lòng chờ duyệt.",
        "success"
      );
    });
  };

  const handleJoinChat = () => {
    navigate("/");
  };

  // Auto mở popup khi redirect về từ login
  useEffect(() => {
    const eventId = searchParams.get("eventId");
    const popup = searchParams.get("popup");
    const autoRegister = searchParams.get("autoRegister");
    const token = localStorage.getItem("accessToken");

    if (eventId && popup === "true") {
      (async () => {
        const ev = await fetchEventById(eventId);
        if (!ev) return;
        setSelectedEvent(ev);
        setIsModalOpen(true);

        if (autoRegister === "true" && token) {
          const updatedEvents = events.map((e) =>
            e.id === ev.id ? { ...e, userStatus: "pending" } : e
          );
          setEvents(updatedEvents);
          setSelectedEvent((prev) =>
            prev ? { ...prev, userStatus: "pending" } : prev
          );
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
          <h1 className="text-white text-2xl md:text-4xl font-bold mb-2">
            Xin chào,
          </h1>
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
                onChange={(e) =>
                  setLocationFilter(e.target.value)
                }
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
                : `Tìm thấy ${events.length} kết quả${
                    searchTerm ? ` cho "${searchTerm}"` : ""
                  }${
                    locationFilter ? ` tại "${locationFilter}"` : ""
                  }`}
            </p>
          )}
        </div>

        {error && (
          <div className="text-center text-red-500 mb-4">{error}</div>
        )}

        {loading ? (
          <div className="text-center py-10 text-gray-500">
            <p className="text-xl">Đang tải sự kiện...</p>
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((item) => (
              <div key={item.id} className="animate-fade-in">
                <EventCard event={item} onClick={handleCardClick} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p className="text-xl">Không tìm thấy sự kiện nào phù hợp.</p>
          </div>
        )}

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
