import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [registeredEvents, setRegisteredEvents] = useState(new Set());
  const [visitorData, setVisitorData] = useState({});

  const loadEvents = async (page) => {
    setLoading(true);
    try {
      const response = await fetch(`https://events-fastapi.onrender.com/api/v1/events/get/?page=${page}&limit=10`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error(`Ошибка загрузки событий: ${response.status}`);
      const data = await response.json();

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents(page);
  }, [page]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_VISITORS_GET}`, { credentials: "include" })
      .then((response) => response.json())
      .then((data) => {
        const registeredIds = new Set(data.body.map((entry) => entry.event_id));
        setRegisteredEvents(registeredIds);
        const visitorMap = data.body.reduce((acc, entry) => {
          acc[entry.event_id] = entry.unique_string;
          return acc;
        }, {});
        setVisitorData(visitorMap);
      })
      .catch((error) => console.error("Ошибка загрузки записей:", error.message));
  }, []);

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;
    if (bottom && !loading && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleRegistration = async (eventId) => {
    const isRegistered = registeredEvents.has(eventId);
    const url = `${process.env.REACT_APP_VISITORS}${isRegistered ? "delete" : "add"}/${eventId}`;
    const method = isRegistered ? "DELETE" : "POST";

    try {
      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error(`Ошибка ${response.status}`);
      setRegisteredEvents((prev) => {
        const newSet = new Set(prev);
        isRegistered ? newSet.delete(eventId) : newSet.add(eventId);
        return newSet;
      });
    } catch (error) {
      console.error("Ошибка при изменении записи:", error.message);
    }
  };

  const getQRCode = async (eventId) => {
    const uniqueString = visitorData[eventId];
    if (!uniqueString) return;
    const qrUrl = `${process.env.REACT_APP_VISITORS_MAKE_QR}${uniqueString}`;
    window.open(qrUrl, "_blank");
  };

  if (loading && page === 1)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-blue-50">
        <p className="text-lg text-gray-600 bg-white/80 backdrop-blur-md p-4 rounded-full shadow-md">
          Загрузка событий...
        </p>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-blue-50">
        <p className="text-lg text-red-600 bg-white/80 backdrop-blur-md p-4 rounded-full shadow-md">
          Ошибка: {error}
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 flex flex-col items-center p-6">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent text-center mb-10"
      >
        Мои события
      </motion.h2>

      <div
        className="max-w-6xl w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-h-[80vh] overflow-y-auto"
        onScroll={handleScroll}
      >
        {events.filter((event) => registeredEvents.has(event.id)).length > 0 ? (
          events
            .filter((event) => registeredEvents.has(event.id))
            .map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/90 backdrop-blur-lg shadow-xl rounded-2xl p-6 border border-blue-100/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
              >
                <div className="flex flex-col">
                  {/* Название и дата */}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200 max-w-[70%] truncate">
                      {event.name_event}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {event.date_time ? new Date(event.date_time).toLocaleString() : "Не указано"}
                    </span>
                  </div>

                  {/* Дополнительная информация */}
                  <div className="mt-4 space-y-2 text-gray-700">
                    <p>
                      <strong>Место:</strong> {event.location || "Не указано"}
                    </p>
                    <p>
                      <strong>Лимит:</strong> {event.limit_people || "Не ограничено"}
                    </p>
                    <p className="line-clamp-3 text-sm">
                      <strong>Описание:</strong> {event.description || "Описание не доступно"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRegistration(event.id);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 py-3 text-white font-semibold rounded-full shadow-md bg-gradient-to-r from-red-500 to-red-700 transition-all duration-300 hover:shadow-red-500/50"
                  >
                    Отписаться ❌
                  </motion.button>

                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      getQRCode(event.id);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="py-3 px-5 text-white font-semibold rounded-full shadow-md bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 hover:shadow-blue-500/50"
                  >
                    QR-код 📲
                  </motion.button>
                </div>
              </motion.div>
            ))
        ) : (
          <p className="text-center text-gray-600 col-span-full bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-md">
            Вы не записаны ни на одно событие.
          </p>
        )}
      </div>

      {loading && (
        <p className="text-center text-gray-600 mt-6 bg-white/80 backdrop-blur-md p-4 rounded-full shadow-md">
          Загрузка...
        </p>
      )}
    </div>
  );
};

export default Events;