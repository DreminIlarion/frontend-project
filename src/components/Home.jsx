import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import toast, { Toaster } from 'react-hot-toast'; // Импортируем react-hot-toast

const Home = () => {
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState(new Set());
  const [visitorData, setVisitorData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingEventId, setLoadingEventId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const navigate = useNavigate();
  const { user, loading: userLoading } = useUser();

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

  useEffect(() => {
    if (!user?.loggedIn) {
      setRegisteredEvents(new Set());
      setVisitorData({});
      return;
    }

    const loadRegisteredEvents = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_VISITORS_GET}`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
        const data = await response.json();

        const registeredIds = new Set(data.body.map((entry) => entry.event_id));
        setRegisteredEvents(registeredIds);
        const visitorMap = data.body.reduce((acc, entry) => {
          acc[entry.event_id] = entry.unique_string;
          return acc;
        }, {});
        setVisitorData(visitorMap);
      } catch (error) {
        console.error("Ошибка загрузки записей:", error.message);
      }
    };

    loadRegisteredEvents();
  }, [user]);

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
  }, [loading, hasMore]);

  const handleRegistration = async (eventId) => {
    if (!user?.loggedIn) {
      toast.error("Пожалуйста, войдите в систему, чтобы записаться на событие.");
      navigate("/login");
      return;
    }

    setLoadingEventId(eventId);
    const isRegistered = registeredEvents.has(eventId);
    const url = `${process.env.REACT_APP_VISITORS}${isRegistered ? "delete" : "add"}/${eventId}`;
    const method = isRegistered ? "DELETE" : "POST";

    try {
      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      // Проверяем, есть ли сообщение о том, что мест нет
      if (
        response.status === 200 &&
        data.body?.message === "create_visitor, Нельзя зарегестрироваться, нету мест"
      ) {
        toast.error("Нельзя зарегистрироваться: мест больше нет!");
        return;
      }

      if (!response.ok) {
        throw new Error(`Ошибка ${response.status}: ${data.message || 'Неизвестная ошибка'}`);
      }

      // Если регистрация или отмена успешна, обновляем состояние
      setRegisteredEvents((prev) => {
        const newSet = new Set(prev);
        if (isRegistered) {
          newSet.delete(eventId);
          
        } else {
          newSet.add(eventId);
          
        }
        return newSet;
      });
    } catch (error) {
      console.error("Ошибка при изменении записи:", error.message);
      toast.error(error.message || "Произошла ошибка при записи на мероприятие.");
    } finally {
      setLoadingEventId(null);
    }
  };

  const openModal = (event) => setSelectedEvent(event);
  const closeModal = () => setSelectedEvent(null);

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-blue-100">
      {/* Добавляем Toaster для уведомлений */}
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white py-6 px-8 flex justify-between items-center shadow-lg backdrop-blur-md bg-opacity-90 sticky top-0 z-10">
        <h1 className="text-3xl font-bold fade-in">Главная страница</h1>
        <nav>
          <Link
            to="/profile"
            className="bg-white text-blue-700 px-6 py-3 rounded-full shadow-md hover:bg-blue-100 transition-all duration-300 hover:scale-105"
          >
            Личный кабинет
          </Link>
        </nav>
      </header>

      {/* Main Section */}
      <main className="flex flex-col items-center justify-center text-center py-12 px-6">
        <h2 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6 fade-in">
          Добро пожаловать!
        </h2>
        <p className="text-lg text-gray-700 mb-12 max-w-2xl slide-in">
          Откройте для себя мир возможностей! Войдите, чтобы записаться на интересные мероприятия и управлять своим аккаунтом.
        </p>

        {/* Events Section */}
        <section className="container mx-auto px-6 py-12">
          <h3 className="text-4xl font-bold text-gray-800 mb-10 text-center fade-in">Мероприятия</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {events.length > 0 ? (
              events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white/95 backdrop-blur-lg shadow-lg rounded-2xl p-6 border border-blue-200/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col slide-in"
                >
                  <div className="mb-4">
                    <div className="flex justify-between items-start gap-4">
                      <h3
                        onClick={() => openModal(event)}
                        className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200 cursor-pointer leading-tight truncate"
                        title={event.name_event}
                      >
                        {event.name_event}
                      </h3>
                      <p className="text-sm text-gray-600 whitespace-nowrap">
                        {event.date_time ? new Date(event.date_time).toLocaleString() : "Не указано"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 text-gray-700 flex-grow">
                    <div className="space-y-2">
                      <p className="break-words">
                        <strong>Место:</strong> {event.location || "Не указано"}
                      </p>
                      <p>
                        <span className={`badge ${event.limit_people ? "bg-danger" : "bg-success"}`}>
                          <strong>Лимит:</strong> {event.limit_people ? `${event.limit_people} человек` : "Без ограничений"}
                        </span>
                      </p>
                    </div>
                    <p className="text-sm break-words">
                      <strong>Описание:</strong> {event.description || "Описание не доступно"}
                    </p>
                    <p className="line-clamp-3 text-sm">
                        <strong>Баллы за посещение:</strong> {event.points_for_the_event || "Баллы не доступны"}
                      
                      </p>
                  </div>

                  <div className="mt-6 text-right">
                    {user?.loggedIn ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRegistration(event.id);
                        }}
                        className={`inline-flex py-2 px-6 text-white font-semibold rounded-full shadow-md transition-transform duration-300 hover:scale-105 active:scale-95 ${
                          registeredEvents.has(event.id)
                            ? "bg-gradient-to-r from-red-500 to-red-700 hover:shadow-red-500/50"
                            : "bg-gradient-to-r from-green-500 to-teal-500 hover:shadow-green-500/50"
                        }`}
                        disabled={loadingEventId === event.id}
                      >
                        {loadingEventId === event.id ? (
                          <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
                        ) : registeredEvents.has(event.id) ? (
                          "Отписаться ❌"
                        ) : (
                          "Записаться ✅"
                        )}
                      </button>
                    ) : (
                      <Link
                        to="/login"
                        className="inline-flex py-2 px-6 text-white font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-md transition-transform duration-300 hover:scale-105 active:scale-95 hover:shadow-blue-500/50 items-center justify-center"
                      >
                        Войдите, чтобы записаться 🔑
                      </Link>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 col-span-full slide-in">
                {loading ? "Загрузка..." : "События не найдены"}
              </p>
            )}
          </div>
          {!hasMore && !loading && (
            <p className="text-center text-gray-500 mt-6 slide-in">Больше мероприятий нет.</p>
          )}
          <p className="text-gray-600 mt-10 max-w-2xl text-center mx-auto slide-in">
            Здесь вы найдете список актуальных мероприятий. Нажмите на название для подробностей или войдите, чтобы записаться!
          </p>
        </section>
      </main>

      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 fade-in"
          onClick={closeModal}
        >
          <div
            className="bg-white p-8 rounded-3xl shadow-xl w-[85%] max-w-5xl max-h-[90vh] overflow-y-auto modal-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-3xl font-semibold text-gray-900 mb-6 break-words leading-tight">
              {selectedEvent.name_event}
            </h3>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>Дата:</strong>{" "}
                {selectedEvent.date_time ? new Date(selectedEvent.date_time).toLocaleString() : "Не указано"}
              </p>
              <p className="break-words">
                <strong>Место:</strong> {selectedEvent.location || "Не указано"}
              </p>
              <p>
                <span className={`badge ${selectedEvent.limit_people ? "bg-danger" : "bg-success"}`}>
                  <strong>Лимит:</strong> {selectedEvent.limit_people ? `${selectedEvent.limit_people} человек` : "Без ограничений"}
                </span>
              </p>
              <p className="break-words">
                <strong>Описание:</strong> {selectedEvent.description || "Описание не доступно"}
              </p>
              <p className="line-clamp-3 text-sm">
                        <strong>Баллы за посещение:</strong> {selectedEvent.points_for_the_event || "Баллы не доступны"}
                      
                      </p>
            </div>
            <div className="flex justify-end gap-4 mt-8">
              {user?.loggedIn && (
                <button
                  onClick={() => handleRegistration(selectedEvent.id)}
                  className={`py-3 px-6 text-white font-semibold rounded-full shadow-md transition-transform duration-300 hover:scale-105 active:scale-95 ${
                    registeredEvents.has(selectedEvent.id)
                      ? "bg-gradient-to-r from-red-500 to-red-700 hover:shadow-red-500/50"
                      : "bg-gradient-to-r from-green-500 to-teal-500 hover:shadow-green-500/50"
                  }`}
                  disabled={loadingEventId === selectedEvent.id}
                >
                  {loadingEventId === selectedEvent.id ? (
                    <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
                  ) : registeredEvents.has(selectedEvent.id) ? (
                    "Отписаться ❌"
                  ) : (
                    "Записаться ✅"
                  )}
                </button>
              )}
              <button
                onClick={closeModal}
                className="py-3 px-6 text-gray-700 font-semibold rounded-full border border-gray-300 hover:bg-gray-100 transition-all duration-300"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;