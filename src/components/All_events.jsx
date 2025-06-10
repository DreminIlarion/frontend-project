import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

// Компонент карточки события
const EventCard = ({ event, registeredEvents, loadingEvents, handleRegistration, openModal, user }) => (
  <motion.div
    className="bg-white rounded-3xl shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 min-w-[380px] max-w-[480px] mx-auto border border-gray-100"
    whileHover={{ scale: 1.03 }}
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7 }}
  >
    <div className="p-8 flex flex-col h-full relative">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-green-500"></div>
      <span
        className={`px-4 py-2 rounded-full text-sm font-semibold bg-blue-50 text-blue-600 mt-6 mb-5 inline-block`}
      >
        {event.limit_people ? `${event.limit_people} мест` : "Без ограничений"}
      </span>
      <h4
        onClick={() => openModal(event)}
        className="text-3xl font-bold text-gray-900 mb-5 cursor-pointer hover:text-blue-500 transition-colors duration-300 line-clamp-2"
      >
        {event.name_event}
      </h4>
      <div className="flex-1 space-y-5 text-gray-600 text-lg">
        <p className="flex items-center gap-4">
          <svg className="w-7 h-7 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {event.date_time ? new Date(event.date_time).toLocaleString() : "Дата не указана"}
        </p>
        <p className="flex items-center gap-4">
          <svg className="w-7 h-7 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {event.location || "Не указано"}
        </p>
        <p className="line-clamp-3">
          <span className="font-semibold">Описание:</span> {event.description || "Нет описания"}
        </p>
        <p className="flex items-center gap-4">
          <svg className="w-7 h-7 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Баллы: {event.points_for_the_event || "не предусмотрены"}
        </p>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        {user?.loggedIn ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleRegistration(event.id)}
            className={`px-6 py-3 rounded-full font-semibold text-white shadow-lg transition-all duration-300 flex items-center justify-center min-w-[140px] ${
              registeredEvents.has(event.id)
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
            } ${loadingEvents.includes(event.id) ? "opacity-70 cursor-not-allowed" : ""}`}
            disabled={loadingEvents.includes(event.id)}
          >
            {loadingEvents.includes(event.id) ? (
              <div className="w-8 h-8 border-4 border-t-transparent border-white rounded-full animate-spin" />
            ) : registeredEvents.has(event.id) ? (
              "Отписаться"
            ) : (
              "Записаться"
            )}
          </motion.button>
        ) : (
          <Link
            to="/login"
            className="px-6 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 shadow-lg transition-all duration-300 hover:scale-105 min-w-[140px] text-center"
          >
            Войти для регистрации
          </Link>
        )}
      </div>
    </div>
  </motion.div>
);

// Компонент модального окна
const EventModal = ({ event, registeredEvents, loadingEvents, handleRegistration, closeModal, user }) => (
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
      className="bg-white rounded-3xl shadow-2xl w-11/12 max-w-2xl min-h-[400px] p-10 overflow-y-auto relative"
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-4xl font-bold text-gray-900 mb-6">{event.name_event}</h3>
      <div className="space-y-6 text-gray-600 text-lg">
        <p className="flex items-center gap-4">
          <svg className="w-7 h-7 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Дата: {event.date_time ? new Date(event.date_time).toLocaleString() : "Не указано"}
        </p>
        <p className="flex items-center gap-4">
          <svg className="w-7 h-7 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Место: {event.location || "Не указано"}
        </p>
        <p className="flex items-center gap-4">
          <svg className="w-7 h-7 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Лимит: {event.limit_people ? `${event.limit_people} мест` : "Без ограничений"}
        </p>
        <p>
          <span className="font-semibold">Описание:</span> {event.description || "Нет описания"}
        </p>
        <p className="flex items-center gap-4">
          <svg className="w-7 h-7 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Баллы: {event.points_for_the_event || "не предусмотрены"}
        </p>
      </div>
      <div className="mt-10 flex gap-4 justify-end">
        {user?.loggedIn && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleRegistration(event.id)}
            className={`py-4 px-8 rounded-full font-semibold text-white shadow-md transition-all duration-300 flex items-center justify-center min-w-[160px] z-10 ${
              registeredEvents.has(event.id)
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
            } ${loadingEvents.includes(event.id) ? "opacity-70 cursor-not-allowed" : ""}`}
            disabled={loadingEvents.includes(event.id)}
          >
            {loadingEvents.includes(event.id) ? (
              <div className="w-8 h-8 border-4 border-t-transparent border-white rounded-full animate-spin" />
            ) : registeredEvents.has(event.id) ? (
              "Отменить регистрацию"
            ) : (
              "Зарегистрироваться"
            )}
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            navigator.clipboard.writeText(
              `Событие: ${event.name_event} | Дата: ${event.date_time ? new Date(event.date_time).toLocaleString() : "Не указано"} | Место: ${event.location || "Не указано"}`
            );
            toast.success("Скопировано в буфер обмена");
          }}
          className="py-4 px-8 rounded-full font-semibold text-white bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 shadow-md transition-all duration-300 min-w-[160px] z-10"
        >
          Поделиться
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
const Home = () => {
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState(new Set());
  const [visitorData, setVisitorData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState([]);
  const navigate = useNavigate();
  const { user, loading: userLoading, fetchWithAuth } = useUser();
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Загрузка мероприятий
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://events-zisi.onrender.com/api/v1/events/get/`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Ошибка сервера: ${response.status}`);
        }

        const data1 = await response.json();

        if (!data1 || !Array.isArray(data1.event)) {
          throw new Error("Неожиданная структура ответа API: events не найден или не является массивом");
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
        console.error("[Home] Ошибка загрузки мероприятий:", error.message);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [page]);

  // Загрузка зарегистрированных событий
  useEffect(() => {
    if (!user?.loggedIn) {
      setRegisteredEvents(new Set());
      setVisitorData({});
      return;
    }

    const loadRegisteredEvents = async () => {
      try {
        const response = await fetchWithAuth(`https://personal-account-c98o.onrender.com/api/v1/visitors/get`, {
          method: "GET",
        });

        if (!response) {
          console.error("[Home] Ошибка: сервер не отвечает (возможно, CORS или сетевая ошибка)");
          throw new Error("Сервер не отвечает. Проверьте CORS или сеть.");
        }

        const contentType = response.headers.get("Content-Type") || "";

        if (!contentType.includes("application/json")) {
          const errorText = await response.text();
          console.error("[Home] Ответ не JSON:", {
            status: response.status,
            contentType,
            errorText: errorText.slice(0, 1000) + (errorText.length > 1000 ? "..." : ""),
          });
          throw new Error("Ответ сервера не является JSON");
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error("[Home] Ошибка сервера:", {
            status: response.status,
            errorText: errorText.slice(0, 1000) + (errorText.length > 1000 ? "..." : ""),
          });
          throw new Error(`Ошибка сервера: ${response.status}`);
        }

        let data1;
        try {
          data1 = await response.json();
        } catch (jsonError) {
          const errorText = await response.text();
          console.error("[Home] Ошибка парсинга JSON:", {
            jsonError: jsonError.message,
            errorText: errorText.slice(0, 1000) + (errorText.length > 1000 ? "..." : ""),
          });
          throw new Error("Не удалось разобрать JSON: " + jsonError.message);
        }

        let data;
        if (data1 && Array.isArray(data1.user_event)) {
          data = data1.user_event;
        } else if (Array.isArray(data1)) {
          data = data1;
        } else {
          console.error("[Home] Неожиданная структура ответа:", data1);
          throw new Error("Данные не содержат user_event или не являются массивом");
        }

        const registeredIds = new Set(data.map((entry) => entry.event_id));
        const visitorMap = data.reduce((acc, entry) => {
          acc[entry.event_id] = entry.unique_string;
          return acc;
        }, {});

        setRegisteredEvents(registeredIds);
        setVisitorData(visitorMap);
      } catch (error) {
        console.error("[Home] Ошибка загрузки зарегистрированных событий:", error.message);
        setError(error.message);
        toast.error(`Не удалось загрузить ваши записи: ${error.message}`);
      }
    };

    loadRegisteredEvents();
  }, [user, fetchWithAuth]);

  // Бесконечная прокрутка
  useEffect(() => {
    const handleScroll = () => {
      const bottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1;
      if (bottom && !loading && hasMore) {
        setPage((prevPage) => prevPage + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, page]);

  // Обработка регистрации
  const handleRegistration = async (eventId) => {
    if (!user?.loggedIn) {
      toast.error("Пожалуйста, войдите в систему для регистрации");
      navigate("/login");
      return;
    }

    setLoadingEvents((prev) => [...prev, eventId]);
    const isRegistered = registeredEvents.has(eventId);

    try {
      const response = await fetchWithAuth(
        `https://personal-account-c98o.onrender.com/api/v1/visitors/${isRegistered ? "delete" : "add"}/${eventId}`,
        {
          method: isRegistered ? "DELETE" : "POST",
        }
      );

      if (!response) {
        console.error("[Home] Ошибка: сервер не отвечает (CORS или сеть)");
        throw new Error("Сервер не отвечает. Проверьте CORS или сеть.");
      }

      const contentType = response.headers.get("Content-Type") || "";

      if (response.status === 204) {
        setRegisteredEvents((prev) => {
          const newSet = new Set(prev);
          newSet.delete(eventId);
          return newSet;
        });
        toast.success("Регистрация отменена");
        return;
      }

      if (response.status === 201) {
        let body = null;
        if (contentType && contentType.includes("application/json")) {
          try {
            body = await response.json();
          } catch (jsonError) {
            console.error("[Home] Ошибка парсинга JSON для 201:", jsonError.message);
          }
        }
        setRegisteredEvents((prev) => {
          const newSet = new Set(prev);
          newSet.add(eventId);
          return newSet;
        });
        toast.success("Вы зарегистрированы на событие");
        return;
      }

      let body;
      if (contentType && contentType.includes("application/json")) {
        try {
          body = await response.json();
        } catch (jsonError) {
          console.error("[Home] Ошибка парсинга JSON:", {
            jsonError: jsonError.message,
          });
          throw new Error("Не удалось разобрать JSON: " + jsonError.message);
        }
      } else {
        body = await response.text();
        console.error("[Home] Ответ не JSON:", {
          status: response.status,
          contentType,
          body: body.slice(0, 1000) + (body.length > 1000 ? "..." : ""),
        });
        throw new Error("Ответ сервера не является JSON");
      }

      if (
        response.status === 200 &&
        body?.message === "create_visitor, Нельзя зарегестрироваться, нету мест"
      ) {
        toast.error("Нельзя зарегистрироваться: мест больше нет");
        return;
      }

      if (response.status === 400) {
        toast.error("Вы уже отписаны от этого события");
        return;
      }

      if (response.status === 409) {
        toast.error("Вы уже зарегистрированы на это событие");
        return;
      }

      if (!response.ok) {
        const errorMessage = body?.message || "Неизвестная ошибка на сервере";
        console.error("[Home] Ошибка сервера:", { status: response.status, errorMessage });
        throw new Error(`Ошибка ${response.status}: ${errorMessage}`);
      }

      console.error("[Home] Необработанный статус ответа:", response.status);
      throw new Error(`Необработанный статус: ${response.status}`);
    } catch (error) {
      console.error("[Home] Ошибка при изменении записи:", error.message);
      toast.error(error.message || "Произошла ошибка при регистрации");
    } finally {
      setLoadingEvents((prev) => prev.filter((id) => id !== eventId));
    }
  };

  const openModal = (event) => {
    setSelectedEvent(event);
  };

  const closeModal = () => {
    setSelectedEvent(null);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "white",
            color: "#1E3A8A",
            borderRadius: "0.5rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            padding: "12px",
            border: "1px solid #3B82F6",
          },
          success: {
            iconTheme: {
              primary: "#3B82F6",
              secondary: "white",
            },
          },
          error: {
            iconTheme: {
              primary: "#EF4444",
              secondary: "white",
            },
          },
        }}
      />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <section className="mb-16">
          <motion.h2
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-5xl font-bold text-gray-900 mb-4 text-center"
          >
            Мероприятия ТИУ
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl text-gray-500 mb-12 text-center"
          >
            Исследуйте уникальные события и станьте частью нашего сообщества
          </motion.p>
          {error ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-red-500 bg-red-50 p-4 rounded-lg"
            >
              Ошибка: {error}
            </motion.p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-12">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  registeredEvents={registeredEvents}
                  loadingEvents={loadingEvents}
                  handleRegistration={handleRegistration}
                  openModal={openModal}
                  user={user}
                />
              ))}
            </div>
          )}
          {loading && (
            <div className="text-center mt-12">
              <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto" />
              <p className="text-gray-500 mt-3">Загрузка мероприятий...</p>
            </div>
          )}
          {!hasMore && !loading && events.length > 0 && (
            <p className="text-center text-gray-500 mt-12">
              Все мероприятия загружены
            </p>
          )}
        </section>
      </main>
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          registeredEvents={registeredEvents}
          loadingEvents={loadingEvents}
          handleRegistration={handleRegistration}
          closeModal={closeModal}
          user={user}
        />
      )}
    </div>
  );
};

export default Home;