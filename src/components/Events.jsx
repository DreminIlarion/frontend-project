import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext"; // Убедитесь, что путь правильный
import { useNavigate } from "react-router-dom";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [registeredEvents, setRegisteredEvents] = useState(new Set());
  const [visitorData, setVisitorData] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);

  const { user, fetchWithAuth } = useUser();
  const navigate = useNavigate();

  const loadEvents = async (page) => {
    if (!user?.loggedIn) {
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const response = await fetchWithAuth(
        `https://events-fastapi.onrender.com/api/v1/events/get/?page=${page}&limit=10`,
        {
          method: "GET",
        }
      );

      if (!response) {
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(`Ошибка загрузки событий: ${response.status}`);
      }

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
        const response = await fetchWithAuth(process.env.REACT_APP_VISITORS_GET, {
          method: "GET",
        });

        if (!response) {
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(`Ошибка загрузки записей: ${response.status}`);
        }

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

    fetchVisitorData();
  }, [user, navigate, fetchWithAuth]);

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;
    if (bottom && !loading && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleRegistration = async (eventId) => {
    if (!user?.loggedIn) {
      navigate("/login");
      return;
    }

    const isRegistered = registeredEvents.has(eventId);
    const url = `${process.env.REACT_APP_VISITORS}${isRegistered ? "delete" : "add"}/${eventId}`;
    const method = isRegistered ? "DELETE" : "POST";

    try {
      const response = await fetchWithAuth(url, {
        method,
        headers: { "Content-Type": "application/json" },
      });

      if (!response) {
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(`Ошибка ${response.status}`);
      }

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
    if (!user?.loggedIn) {
      navigate("/login");
      return;
    }

    const uniqueString = visitorData[eventId];
    if (!uniqueString) return;

    // Проверяем авторизацию перед открытием QR-кода
    try {
      const response = await fetchWithAuth(process.env.REACT_APP_VISITORS_GET, {
        method: "GET",
      });

      if (!response) {
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Ошибка авторизации перед получением QR-кода");
      }

      const qrUrl = `${process.env.REACT_APP_VISITORS_MAKE_QR}${uniqueString}`;
      window.open(qrUrl, "_blank");
    } catch (error) {
      console.error("Ошибка при проверке авторизации для QR-кода:", error.message);
      navigate("/login");
    }
  };

  const openModal = (event) => setSelectedEvent(event);
  const closeModal = () => setSelectedEvent(null);

  if (loading && page === 1)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-blue-50">
        <p className="text-lg text-gray-600 bg-white/80 backdrop-blur-md p-4 rounded-full shadow-md animate-pulse">
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
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 flex flex-col items-center p-6">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent text-center mb-10 fade-in">
          Мои события
        </h2>

        <div
          className="max-w-6xl w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-h-[80vh] overflow-y-auto"
          onScroll={handleScroll}
        >
          {events.filter((event) => registeredEvents.has(event.id)).length > 0 ? (
            events
              .filter((event) => registeredEvents.has(event.id))
              .map((event) => (
                <div
                  key={event.id}
                  className="bg-white/90 backdrop-blur-lg shadow-xl rounded-2xl p-6 border border-blue-100/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 slide-in"
                >
                  <div className="flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <h3
                        onClick={() => openModal(event)}
                        className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200 max-w-[70%] truncate cursor-pointer"
                        title={event.name_event}
                      >
                        {event.name_event}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {event.date_time ? new Date(event.date_time).toLocaleString() : "Не указано"}
                      </span>
                    </div>

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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRegistration(event.id);
                      }}
                      className="flex-1 py-3 text-white font-semibold rounded-full shadow-md bg-gradient-to-r from-red-500 to-red-700 transition-transform duration-300 hover:scale-105 active:scale-95 hover:shadow-red-500/50"
                    >
                      Отписаться ❌
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        getQRCode(event.id);
                      }}
                      className="py-3 px-5 text-white font-semibold rounded-full shadow-md bg-gradient-to-r from-blue-500 to-indigo-500 transition-transform duration-300 hover:scale-105 active:scale-95 hover:shadow-blue-500/50"
                    >
                      QR-код 📲
                    </button>
                  </div>
                </div>
              ))
          ) : (
            <p className="text-center text-gray-600 col-span-full bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-md">
              Вы не записаны ни на одно событие.
            </p>
          )}
        </div>

        {loading && (
          <p className="text-center text-gray-600 mt-6 bg-white/80 backdrop-blur-md p-4 rounded-full shadow-md animate-pulse">
            Загрузка...
          </p>
        )}
      </div>

      {/* Модальное окно */}
      {selectedEvent && (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 bg-black/30 flex items-center justify-center z-50 overflow-y-auto fade-in"
          onClick={closeModal}
        >
          <div
            className="bg-white w-full max-w-lg mx-4 my-8 p-6 rounded-2xl shadow-xl flex flex-col gap-4 sm:max-w-xl modal-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-semibold text-gray-900 break-words leading-tight">
              {selectedEvent.name_event}
            </h3>
            <div className="space-y-3 text-gray-700 text-sm">
              <p>
                <strong>Дата:</strong>{" "}
                {selectedEvent.date_time ? new Date(selectedEvent.date_time).toLocaleString() : "Не указано"}
              </p>
              <p className="break-words">
                <strong>Место:</strong> {selectedEvent.location || "Не указано"}
              </p>
              <p>
                <strong>Лимит:</strong> {selectedEvent.limit_people || "Не ограничено"}
              </p>
              <p className="break-words">
                <strong>Описание:</strong> {selectedEvent.description || "Описание не доступно"}
              </p>
            </div>
            <div className="flex flex-col gap-3 mt-4 sm:flex-row sm:gap-4 sm:justify-end">
              <button
                onClick={() => handleRegistration(selectedEvent.id)}
                className="w-full sm:w-auto py-2 px-4 text-white font-semibold rounded-full shadow-md bg-gradient-to-r from-red-500 to-red-700 transition-transform duration-300 hover:scale-105 active:scale-95 hover:shadow-red-500/50"
              >
                Отписаться ❌
              </button>
              <button
                onClick={() => getQRCode(selectedEvent.id)}
                className="w-full sm:w-auto py-2 px-4 text-white font-semibold rounded-full shadow-md bg-gradient-to-r from-blue-500 to-indigo-500 transition-transform duration-300 hover:scale-105 active:scale-95 hover:shadow-blue-500/50"
              >
                QR-код 📲
              </button>
              <button
                onClick={closeModal}
                className="w-full sm:w-auto py-2 px-4 text-gray-700 font-semibold rounded-full border border-gray-300 transition-all duration-300 hover:bg-gray-100"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Events;