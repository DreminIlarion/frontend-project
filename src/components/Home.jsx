import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
  const [events, setEvents] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState(new Set());
  const [visitorData, setVisitorData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Загрузка событий с пагинацией
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://events-fastapi.onrender.com/api/v1/events/get/`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
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

    loadEvents();
  }, [page]);

  // Загрузка зарегистрированных событий
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

  // Проверка авторизации
  useEffect(() => {
    fetch(`${process.env.REACT_APP_VISITORS_GET}`, { credentials: "include" })
      .then((response) => {
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch((error) => console.error("Ошибка авторизации:", error.message));
  }, []);

  const handleRegistration = async (eventId) => {
    if (!isAuthenticated) {
      alert("Пожалуйста, войдите в систему, чтобы записаться на событие.");
      return;
    }

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

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;
    if (bottom && !loading && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white py-6 px-8 flex justify-between items-center shadow-lg backdrop-blur-md bg-opacity-90 sticky top-0 z-10">
        <h1 className="text-3xl font-bold">Главная страница</h1>
        <nav>
          <Link
            to="/profile"
            className="bg-white text-blue-700 px-6 py-3 rounded-full shadow-md hover:bg-blue-100 transition-all duration-300 transform hover:scale-105"
          >
            Личный кабинет
          </Link>
        </nav>
      </header>

      {/* Main Section */}
      <main className="flex flex-col items-center justify-center text-center py-12 px-6">
        <h2 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
          Добро пожаловать!
        </h2>
        <p className="text-lg text-gray-700 mb-8 max-w-2xl">
          Откройте для себя мир возможностей! Войдите, чтобы записаться на интересные события и управлять своим аккаунтом.
        </p>

        {/* Events Section */}
        <section
          className="container mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-h-[70vh] overflow-y-auto"
          onScroll={handleScroll}
        >
          {events.length > 0 ? (
            events.map((event) => (
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
                  {isAuthenticated ? (
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRegistration(event.id);
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex-1 py-3 text-white font-semibold rounded-full shadow-md transition-all duration-300 ${
                        registeredEvents.has(event.id)
                          ? "bg-gradient-to-r from-red-500 to-red-700 hover:shadow-red-500/50"
                          : "bg-gradient-to-r from-green-500 to-teal-500 hover:shadow-green-500/50"
                      }`}
                    >
                      {registeredEvents.has(event.id) ? "Отписаться ❌" : "Записаться ✅"}
                    </motion.button>
                  ) : (
                    <Link
                      to="/login"
                      className="flex-1 py-3 text-center text-white font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-md hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
                    >
                      Войдите, чтобы записаться 🔑
                    </Link>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-center text-gray-500 col-span-full">
              {loading ? "Загрузка..." : "События не найдены"}
            </p>
          )}
        </section>

        {!hasMore && !loading && (
          <p className="text-center text-gray-500 mt-6">Больше событий нет.</p>
        )}
      </main>
    </div>
  );
};

export default Home;