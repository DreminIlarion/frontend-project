import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import toast, { Toaster } from "react-hot-toast";

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
        const response = await fetch(`https://events-zisi.onrender.com/api/v1/events/get/`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
        const data1 = await response.json();

        if (!data1.body || !Array.isArray(data1.body.events)) {
          throw new Error("Неожиданная структура ответа API: events не найден или не является массивом");
        }

        const data = data1.body.events;
        setEvents((prevEvents) => {
          const newEventsSet = new Set(prevEvents.map((event) => event.id));
          const newEvents = data.filter((event) => !newEventsSet.has(event.id));
          return [...prevEvents, ...newEvents];
        });

        if (data.length < 10) setHasMore(false);
      } catch (error) {
        setError(error.message);
        console.error(error);
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
        const data1 = await response.json();

        if (!data1.body || !Array.isArray(data1.body)) {
          throw new Error("Неожиданная структура ответа API: body не найден или не является массивом");
        }

        const data = data1.body;
        const registeredIds = new Set(data.map((entry) => entry.event_id));
        setRegisteredEvents(registeredIds);
        const visitorMap = data.reduce((acc, entry) => {
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
      if (bottom && !loading && hasMore) setPage((prevPage) => prevPage + 1);
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

      const data1 = await response.json();
      const data = data1?.body;

      if (
        response.status === 200 &&
        data?.message === "create_visitor, Нельзя зарегестрироваться, нету мест"
      ) {
        toast.error("Нельзя зарегистрироваться: мест больше нет!");
        return;
      }

      if (!response.ok) {
        const errorMessage = data?.message || "Неизвестная ошибка на сервере";
        throw new Error(`Ошибка ${response.status}: ${errorMessage}`);
      }

      setRegisteredEvents((prev) => {
        const newSet = new Set(prev);
        if (isRegistered) newSet.delete(eventId);
        else newSet.add(eventId);
        return newSet;
      });

      toast.success(isRegistered ? "Вы отписались от события!" : "Вы записались на событие!");
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100">
        <div className="w-16 h-16 border-4 border-t-indigo-500 border-gray-200 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="bg-blue-800 text-white py-6 px-8 flex justify-between items-center shadow-lg sticky top-0 z-10">
        <h1 className="text-3xl font-extrabold tracking-tight animate-fade-in">События</h1>
        <nav>
          <Link
            to="/profile"
            className="bg-white text-indigo-600 px-6 py-2 rounded-full font-semibold shadow-md hover:bg-indigo-50 hover:shadow-lg transition-all duration-300"
          >
            Личный кабинет
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-12 bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100">
        <section className="text-center mb-16">
          <h2 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-4 animate-fade-in">
            Добро пожаловать!
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed animate-slide-in">
            Исследуйте актуальные мероприятия, записывайтесь и получайте уникальный опыт. Войдите, чтобы начать!
          </p>
        </section>

        {/* Events Section */}
        <section className="mb-12">
          <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center animate-fade-in">
            Актуальные мероприятия
          </h3>
          {error ? (
            <p className="text-center text-red-500 animate-fade-in">{error}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2 animate-slide-in"
                >
                  <div className="p-6 flex flex-col h-full">
                    <h4
                      onClick={() => openModal(event)}
                      className="text-xl font-semibold text-gray-900 mb-2 cursor-pointer hover:text-indigo-600 transition-colors duration-200 truncate"
                    >
                      {event.name_event}
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">
                      {event.date_time ? new Date(event.date_time).toLocaleString() : "Дата не указана"}
                    </p>
                    <div className="flex-1 space-y-3 text-gray-600 text-sm">
                      <p>
                        <span className="font-medium">Место:</span>{" "}
                        {event.location || "Не указано"}
                      </p>
                      <p>
                        <span className="font-medium">Лимит:</span>{" "}
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                            event.limit_people ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                          }`}
                        >
                          {event.limit_people ? `${event.limit_people} чел.` : "Без ограничений"}
                        </span>
                      </p>
                      <p className="line-clamp-2">
                        <span className="font-medium">Описание:</span>{" "}
                        {event.description || "Нет описания"}
                      </p>
                      <p className="line-clamp-2">
                        <span className="font-medium">Баллы:</span>{" "}
                        {event.points_for_the_event || "не предусмотрены"}
                      </p>
                    </div>
                    <div className="mt-4 flex justify-end">
                      {user?.loggedIn ? (
                        <button
                          onClick={() => handleRegistration(event.id)}
                          className={`px-4 py-2 rounded-full font-semibold text-white shadow-md transition-all duration-300 hover:shadow-lg ${
                            registeredEvents.has(event.id)
                              ? "bg-gradient-to-r from-red-500 to-red-600"
                              : "bg-gradient-to-r from-indigo-500 to-blue-500"
                          } ${loadingEventId === event.id ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
                          disabled={loadingEventId === event.id}
                        >
                          {loadingEventId === event.id ? (
                            <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
                          ) : registeredEvents.has(event.id) ? (
                            "Отписаться"
                          ) : (
                            "Записаться"
                          )}
                        </button>
                      ) : (
                        <Link
                          to="/login"
                          className="px-4 py-2 rounded-full font-semibold text-white bg-gradient-to-r from-indigo-500 to-blue-500 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                        >
                          Войти для записи
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {loading && (
            <div className="text-center mt-8">
              <div className="w-12 h-12 border-4 border-t-indigo-500 border-gray-200 rounded-full animate-spin mx-auto" />
            </div>
          )}
          {!hasMore && !loading && events.length > 0 && (
            <p className="text-center text-gray-500 mt-8 animate-fade-in">
              Все мероприятия загружены
            </p>
          )}
        </section>
      </main>

      {/* Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto p-8 animate-slide-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {selectedEvent.name_event}
            </h3>
            <div className="space-y-4 text-gray-700">
              <p>
                <span className="font-medium">Дата:</span>{" "}
                {selectedEvent.date_time ? new Date(selectedEvent.date_time).toLocaleString() : "Не указано"}
              </p>
              <p>
                <span className="font-medium">Место:</span>{" "}
                {selectedEvent.location || "Не указано"}
              </p>
              <p>
                <span className="font-medium">Лимит:</span>{" "}
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                    selectedEvent.limit_people ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                  }`}
                >
                  {selectedEvent.limit_people ? `${selectedEvent.limit_people} чел.` : "Без ограничений"}
                </span>
              </p>
              <p>
                <span className="font-medium">Описание:</span>{" "}
                {selectedEvent.description || "Нет описания"}
              </p>
              <p>
                <span className="font-medium">Баллы:</span>{" "}
                {selectedEvent.points_for_the_event || "Не указано"}
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-4">
              {user?.loggedIn && (
                <button
                  onClick={() => handleRegistration(selectedEvent.id)}
                  className={`px-4 py-2 rounded-full font-semibold text-white shadow-md transition-all duration-300 hover:shadow-lg ${
                    registeredEvents.has(selectedEvent.id)
                      ? "bg-gradient-to-r from-red-500 to-red-600"
                      : "bg-gradient-to-r from-indigo-500 to-blue-500"
                  } ${loadingEventId === selectedEvent.id ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
                  disabled={loadingEventId === selectedEvent.id}
                >
                  {loadingEventId === selectedEvent.id ? (
                    <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
                  ) : registeredEvents.has(selectedEvent.id) ? (
                    "Отписаться"
                  ) : (
                    "Записаться"
                  )}
                </button>
              )}
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-full font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-300"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      
    </div>
  );
};

export default Home;