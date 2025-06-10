import React, { useState, useEffect, useMemo, memo } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

// Компонент карточки события
const EventCard = memo(({ event, registeredEvents, removingEventId, handleRegistration, openModal, getQRCode }) => {
  const getEventIcon = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("лекция") || lowerName.includes("семинар")) return "🎓";
    if (lowerName.includes("концерт") || lowerName.includes("выступление")) return "🎤";
    if (lowerName.includes("спорт") || lowerName.includes("турнир")) return "⚽";
    if (lowerName.includes("выставка") || lowerName.includes("экспозиция")) return "🖼️";
    return "📅";
  };

  return (
    <motion.div
      className={`bg-white rounded-3xl shadow-xl border border-gray-100 p-8 min-w-[380px] max-w-[480px] mx-auto relative transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${
        removingEventId === event.id ? "opacity-0 -translate-y-10" : ""
      }`}
      whileHover={{ scale: 1.03 }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-green-500"></div>
      <div className="flex items-start gap-4 mt-6 mb-5">
        <span className="text-3xl flex-shrink-0">{getEventIcon(event.name_event)}</span>
        <div className="flex-1 min-w-0">
          <h3
            onClick={() => openModal(event)}
            className="text-2xl font-bold text-gray-900 hover:text-blue-500 cursor-pointer transition-colors duration-300 line-clamp-2"
            title={event.name_event}
          >
            {event.name_event}
          </h3>
          <p className="text-base text-gray-500 mt-2">
            {event.date_time ? new Date(event.date_time).toLocaleString() : "Дата не указана"}
          </p>
        </div>
      </div>
      <div className="space-y-4 text-gray-600 text-lg">
        <p className="flex items-center gap-3">
          <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {event.location || "Не указано"}
        </p>
        <p className="flex items-center gap-3">
          <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              event.limit_people ? "bg-yellow-50 text-yellow-700" : "bg-green-50 text-green-700"
            }`}
          >
            {event.limit_people ? `${event.limit_people} чел.` : "Без ограничений"}
          </span>
        </p>
        <p className="line-clamp-3">
          <span className="font-semibold">Описание:</span> {event.description || "Описание отсутствует"}
        </p>
        <p className="flex items-center gap-3">
          <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Баллы: {event.points_for_the_event || "0"}
        </p>
      </div>
      <div className="flex gap-4 mt-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            handleRegistration(event.id);
          }}
          className={`flex-1 py-3 px-6 rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 shadow-lg transition-all duration-300 flex items-center justify-center min-w-[140px] ${
            removingEventId === event.id ? "opacity-70 cursor-not-allowed" : ""
          }`}
          disabled={removingEventId === event.id}
        >
          {removingEventId === event.id ? (
            <div className="w-8 h-8 border-4 border-t-transparent border-white rounded-full animate-spin" />
          ) : (
            "Отписаться"
          )}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            getQRCode(event.id);
            openModal(event);
          }}
          className="py-3 px-6 rounded-full font-semibold text-white bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 shadow-lg transition-all duration-300 min-w-[140px]"
        >
          QR-код
        </motion.button>
      </div>
    </motion.div>
  );
});

// Компонент модального окна
const EventModal = ({ event, removingEventId, handleRegistration, getQRCode, closeModal, qrCodeUrl }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.4 }}
    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
    onClick={closeModal}
  >
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 60 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-10 min-h-[400px] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start gap-4 mb-8">
        <span className="text-4xl flex-shrink-0">
          {(() => {
            const lowerName = event.name_event.toLowerCase();
            if (lowerName.includes("лекция") || lowerName.includes("семинар")) return "🎓";
            if (lowerName.includes("концерт") || lowerName.includes("выступление")) return "🎤";
            if (lowerName.includes("спорт") || lowerName.includes("турнир")) return "⚽";
            if (lowerName.includes("выставка") || lowerName.includes("экспозиция")) return "🖼️";
            return "📅";
          })()}
        </span>
        <h3 className="text-3xl font-bold text-gray-900 break-words">{event.name_event}</h3>
      </div>
      <div className="space-y-6 text-gray-600 text-lg">
        <p className="flex items-center gap-3">
          <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {event.date_time ? new Date(event.date_time).toLocaleString() : "Не указано"}
        </p>
        <p className="flex items-center gap-3 break-words">
          <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {event.location || "Не указано"}
        </p>
        <p className="flex items-center gap-3">
          <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              event.limit_people ? "bg-yellow-50 text-yellow-700" : "bg-green-50 text-green-700"
            }`}
          >
            {event.limit_people ? `${event.limit_people} чел.` : "Без ограничений"}
          </span>
        </p>
        <p className="break-words">
          <span className="font-semibold">Описание:</span> {event.description || "Описание отсутствует"}
        </p>
        <p className="flex items-center gap-3">
          <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Баллы: {event.points_for_the_event || "0"}
        </p>
      </div>
      {qrCodeUrl && (
        <div className="mt-8 text-center">
          <h4 className="text-base font-semibold text-gray-700 mb-4">Ваш QR-код</h4>
          <img
            src={qrCodeUrl}
            alt="QR-код мероприятия"
            className="mx-auto max-w-[200px] w-full rounded-lg shadow-md"
          />
        </div>
      )}
      <div className="flex gap-4 mt-10 justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleRegistration(event.id)}
          className={`py-4 px-8 rounded-full font-semibold text-white bg-red-600 hover:bg-red-700 shadow-md transition-all duration-300 min-w-[160px] flex items-center justify-center z-10 ${
            removingEventId === event.id ? "opacity-70 cursor-not-allowed" : ""
          }`}
          disabled={removingEventId === event.id}
        >
          {removingEventId === event.id ? (
            <div className="w-8 h-8 border-4 border-t-transparent border-white rounded-full animate-spin" />
          ) : (
            "Отписаться"
          )}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => getQRCode(event.id)}
          className="py-4 px-8 rounded-full font-semibold text-white bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 shadow-md transition-all duration-300 min-w-[160px] z-10"
        >
          QR-код
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={closeModal}
          className="py-4 px-8 rounded-full font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 shadow-md transition-all duration-300 min-w-[160px] z-10"
        >
          Закрыть
        </motion.button>
      </div>
    </motion.div>
  </motion.div>
);

// Основной компонент
const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [registeredEvents, setRegisteredEvents] = useState(new Set());
  const [visitorData, setVisitorData] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [removingEventId, setRemovingEventId] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);

  const { user, fetchWithAuth } = useUser();
  const navigate = useNavigate();

  const loadEvents = async (page) => {
    if (!user?.loggedIn) {
      toast.error("Пожалуйста, войдите в систему");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const response = await fetchWithAuth(
        `https://events-zisi.onrender.com/api/v1/events/get?page=${page}`,
        { method: "GET", credentials: "include" }
      );

      if (!response?.ok) {
        throw new Error(`Ошибка загрузки событий: ${response?.status || "Сервер не отвечает"}`);
      }

      const data1 = await response.json();
      if (!data1 || !Array.isArray(data1.event)) {
        throw new Error("Неожиданная структура ответа API");
      }

      const data = data1.event;
      setEvents((prevEvents) => {
        const newEventsSet = new Set(prevEvents.map((event) => event.id));
        const newEvents = data.filter((event) => !newEventsSet.has(event.id));
        return [...prevEvents, ...newEvents];
      });

      if (data.length < 10) {
        setHasMore(false);
      }
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.loggedIn) {
      loadEvents(page);
    } else {
      navigate("/login");
    }
  }, [page, user, navigate, fetchWithAuth]);

  useEffect(() => {
    if (!user?.loggedIn) {
      navigate("/login");
      return;
    }

    const fetchVisitorData = async () => {
      try {
        const response = await fetchWithAuth(
          process.env.REACT_APP_VISITORS_GET || "https://personal-account-c98o.onrender.com/api/v1/visitors/get",
          { method: "GET", credentials: "include" }
        );

        if (!response?.ok) {
          throw new Error(`Ошибка загрузки записей: ${response?.status || "Сервер не отвечает"}`);
        }

        const data1 = await response.json();
        if (!data1 || !Array.isArray(data1.user_event)) {
          throw new Error("Неожиданная структура ответа API");
        }

        const data = data1.user_event;
        setRegisteredEvents(new Set(data.map((entry) => entry.event_id)));
        setVisitorData(
          data.reduce((acc, entry) => {
            acc[entry.event_id] = entry.unique_string;
            return acc;
          }, {})
        );
      } catch (error) {
        setError(error.message);
        toast.error(error.message);
      }
    };

    fetchVisitorData();
  }, [user, navigate, fetchWithAuth]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 100 &&
        !loading &&
        hasMore
      ) {
        setPage((prevPage) => prevPage + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  const handleRegistration = async (eventId) => {
    if (!user?.loggedIn) {
      toast.error("Пожалуйста, войдите в систему");
      navigate("/login");
      return;
    }

    const isRegistered = registeredEvents.has(eventId);
    const url = `${
      process.env.REACT_APP_VISITORS || "https://personal-account-c98o.onrender.com/api/v1/visitors/"
    }${isRegistered ? "delete" : "add"}/${eventId}`;
    const method = isRegistered ? "DELETE" : "POST";

    try {
      if (isRegistered) {
        setRemovingEventId(eventId);
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      const response = await fetchWithAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response?.ok) {
        const data1 = await response.json();
        throw new Error(data1.message || "Неизвестная ошибка");
      }

      setRegisteredEvents((prev) => {
        const newSet = new Set(prev);
        isRegistered ? newSet.delete(eventId) : newSet.add(eventId);
        return newSet;
      });

      toast.success(isRegistered ? "Регистрация отменена" : "Вы зарегистрированы");
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setRemovingEventId(null);
    }
  };

  const getQRCode = async (eventId) => {
    if (!user?.loggedIn) {
      toast.error("Пожалуйста, войдите в систему");
      navigate("/login");
      return;
    }

    const uniqueString = visitorData[eventId];
    if (!uniqueString) {
      toast.error("QR-код недоступен: уникальный идентификатор не найден");
      return;
    }

    try {
      const response = await fetchWithAuth(
        `${
          process.env.REACT_APP_VISITORS_MAKE_QR || "https://personal-account-c98o.onrender.com/api/v1/visitors/make/qr/"
        }${uniqueString}`,
        { method: "GET", credentials: "include" }
      );

      if (!response?.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Ошибка загрузки QR-кода");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setQrCodeUrl(url);

      toast.success("QR-код загружен");
      return () => window.URL.revokeObjectURL(url);
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    }
  };

  const openModal = (event) => setSelectedEvent(event);
  const closeModal = () => {
    setSelectedEvent(null);
    setQrCodeUrl(null);
  };

  const filteredEvents = useMemo(() => events.filter((event) => registeredEvents.has(event.id)), [events, registeredEvents]);

  if (loading && page === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-xl">
          <div className="w-10 h-10 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
          <p className="text-lg text-gray-700 font-semibold">Загрузка событий...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-6 bg-white rounded-2xl shadow-xl border-l-4 border-red-500">
          <p className="text-lg text-red-600 font-semibold">Ошибка: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "white",
            color: "#1E3A8A",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            padding: "12px",
            border: "1px solid #3B82F6",
          },
          success: { iconTheme: { primary: "#3B82F6", secondary: "white" } },
          error: { iconTheme: { primary: "#EF4444", secondary: "white" } },
        }}
      />
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl font-bold text-gray-900 text-center mb-12"
        >
          Мои мероприятия
        </motion.h2>
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-12">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                registeredEvents={registeredEvents}
                removingEventId={removingEventId}
                handleRegistration={handleRegistration}
                openModal={openModal}
                getQRCode={getQRCode}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center py-16 bg-white rounded-3xl shadow-xl"
          >
            <span className="text-6xl mb-6 block">📅</span>
            <p className="text-2xl font-semibold text-gray-800 mb-4">Нет мероприятий</p>
            <p className="text-lg text-gray-600 mb-8">Запишитесь на событие на главной странице</p>
            <Link
              to="/"
              className="inline-block py-3 px-8 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-full font-semibold hover:from-blue-600 hover:to-green-600 transition-all duration-300 hover:scale-105"
            >
              На главную
            </Link>
          </motion.div>
        )}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-12"
          >
            <div className="w-10 h-10 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-lg text-gray-600 font-semibold">Загрузка...</p>
          </motion.div>
        )}
      </div>
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          removingEventId={removingEventId}
          handleRegistration={handleRegistration}
          getQRCode={getQRCode}
          closeModal={closeModal}
          qrCodeUrl={qrCodeUrl}
        />
      )}
    </div>
  );
};

export default Events;