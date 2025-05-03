import React, { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate, Link } from "react-router-dom";

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
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const response = await fetchWithAuth(
        `https://events-zisi.onrender.com/api/v1/events/get?page=${page}`,
        { method: "GET", credentials: "include" }
      );

      if (!response) {
        navigate("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(`Ошибка загрузки событий: ${response.status}`);
      }

      const data1 = await response.json();
      console.log("Events data:", data1);

      if (!data1 || !Array.isArray(data1.event)) {
        throw new Error("Неожиданная структура ответа API: ожидается event");
      }

      const data = data1.event;
      setEvents((prevEvents) => {
        const newEventsSet = new Set(prevEvents.map((event) => event.id));
        const newEvents = data.filter((event) => !newEventsSet.has(event.id));
        return [...prevEvents, ...newEvents];
      });

      if (data.length === 0) {
        setHasMore(false);
      }
    } catch (error) {
      setError(error.message);
      console.error(error);
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
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response) {
          navigate("/login");
          return;
        }

        console.log("Visitor response status:", response.status);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Ошибка загрузки записей: ${response.status} ${errorData.message || ""}`);
        }

        const data1 = await response.json();
        console.log("Visitor data:", data1);

        if (!data1 || !Array.isArray(data1.user_event)) {
          console.log("Unexpected visitor data structure:", data1);
          setError("Неожиданная структура ответа API: ожидается user_event");
          return;
        }

        const data = data1.user_event;
        const registeredIds = new Set(data.map((entry) => entry.event_id));
        setRegisteredEvents(registeredIds);
        const visitorMap = data.reduce((acc, entry) => {
          acc[entry.event_id] = entry.unique_string;
          return acc;
        }, {});
        setVisitorData(visitorMap);
      } catch (error) {
        console.error("Ошибка загрузки записей:", error.message);
        setError(error.message);
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

      if (!response) {
        navigate("/login");
        return;
      }

      if (!response.ok) {
        const data1 = await response.json();
        throw new Error(`Ошибка ${response.status}: ${data1.message || "Неизвестная ошибка"}`);
      }

      setRegisteredEvents((prev) => {
        const newSet = new Set(prev);
        isRegistered ? newSet.delete(eventId) : newSet.add(eventId);
        return newSet;
      });
    } catch (error) {
      console.error("Ошибка при изменении записи:", error.message);
      setError(error.message);
    } finally {
      setRemovingEventId(null);
    }
  };

  const getQRCode = async (eventId) => {
    if (!user?.loggedIn) {
      navigate("/login");
      return;
    }

    const uniqueString = visitorData[eventId];
    if (!uniqueString) {
      setError("QR-код недоступен: уникальный идентификатор не найден");
      return;
    }

    try {
      const response = await fetchWithAuth(
        `${
          process.env.REACT_APP_VISITORS_MAKE_QR || "https://personal-account-c98o.onrender.com/api/v1/visitors/make/qr/"
        }${uniqueString}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      console.log("QR code response status:", response.status);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Ошибка загрузки QR-кода: ${response.status} ${errorData.message || ""}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setQrCodeUrl(url);

      return () => window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Ошибка при получении QR-кода:", error.message);
      setError(error.message);
    }
  };

  const openModal = (event) => setSelectedEvent(event);
  const closeModal = () => {
    setSelectedEvent(null);
    setQrCodeUrl(null);
  };

  const getEventIcon = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("лекция") || lowerName.includes("семинар")) return "🎓";
    if (lowerName.includes("концерт") || lowerName.includes("выступление")) return "🎤";
    if (lowerName.includes("спорт") || lowerName.includes("турнир")) return "⚽";
    if (lowerName.includes("выставка") || lowerName.includes("экспозиция")) return "🖼️";
    return "📅";
  };

  if (loading && page === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100">
        <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-md animate-pulse">
          <div className="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Загрузка событий...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100">
        <div className="p-4 bg-white rounded-lg shadow-md border-l-4 border-red-400 animate-pulse">
          <p className="text-red-600 font-medium">Ошибка: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 min-h-screen py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-semibold text-gray-800 text-center mb-12">
            Мои мероприятия
          </h2>

          {events.filter((event) => registeredEvents.has(event.id)).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {events
                .filter((event) => registeredEvents.has(event.id))
                .map((event) => (
                  <div
                    key={event.id}
                    className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-300 ${
                      removingEventId === event.id ? "animate-fadeOut" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <span className="text-2xl flex-shrink-0">{getEventIcon(event.name_event)}</span>
                      <div className="flex-1 min-w-0">
                        <h3
                          onClick={() => openModal(event)}
                          className="text-lg font-semibold text-gray-800 hover:text-blue-600 cursor-pointer transition-colors duration-200 break-words"
                          title={event.name_event}
                        >
                          {event.name_event}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {event.date_time
                            ? new Date(event.date_time).toLocaleDateString()
                            : "Дата не указана"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 text-gray-600 text-sm">
                      <p>
                        <span className="font-medium text-gray-700">Место:</span>{" "}
                        {event.location || "Не указано"}
                      </p>
                      <p>
                        <span className="font-medium text-gray-700">Лимит мест:</span>{" "}
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            event.limit_people
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {event.limit_people ? `${event.limit_people} чел.` : "Без ограничений"}
                        </span>
                      </p>
                      <p className="line-clamp-2">
                        <span className="font-medium text-gray-700">Описание:</span>{" "}
                        {event.description || "Описание отсутствует"}
                      </p>
                      <p>
                        <span className="font-medium text-gray-700">Баллы:</span>{" "}
                        {event.points_for_the_event || "0"}
                      </p>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRegistration(event.id);
                        }}
                        className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all duration-200 hover:scale-105"
                        disabled={removingEventId === event.id}
                      >
                        {removingEventId === event.id ? "Отписка..." : "Отписаться"}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          getQRCode(event.id);
                          openModal(event);
                        }}
                        className="py-2 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all duration-200 hover:scale-105"
                      >
                        QR-код
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 rounded-lg shadow-md animate-fadeIn">
              <span className="text-5xl mb-4 block">📅</span>
              <p className="text-lg font-semibold text-gray-800 mb-2">Нет мероприятий</p>
              <p className="text-gray-600 mb-6">Запишитесь на событие на главной странице</p>
              <Link
                to="/"
                className="inline-block py-2 px-6 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all duration-200 hover:scale-105"
              >
                На главную
              </Link>
            </div>
          )}

          {loading && (
            <div className="text-center mt-8 animate-fadeIn">
              <div className="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-600 font-medium">Загрузка...</p>
            </div>
          )}
        </div>
      </div>

      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-modalFadeIn"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl animate-modalScaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <span className="text-2xl flex-shrink-0">{getEventIcon(selectedEvent.name_event)}</span>
              <h3 className="text-xl font-semibold text-gray-800 break-words">
                {selectedEvent.name_event}
              </h3>
            </div>
            <div className="space-y-3 text-gray-600 text-sm">
              <p>
                <span className="font-medium text-gray-700">Дата:</span>{" "}
                {selectedEvent.date_time
                  ? new Date(selectedEvent.date_time).toLocaleString()
                  : "Не указано"}
              </p>
              <p className="break-words">
                <span className="font-medium text-gray-700">Место:</span>{" "}
                {selectedEvent.location || "Не указано"}
              </p>
              <p>
                <span className="font-medium text-gray-700">Лимит мест:</span>{" "}
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    selectedEvent.limit_people
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {selectedEvent.limit_people ? `${selectedEvent.limit_people} чел.` : "Без ограничений"}
                </span>
              </p>
              <p className="break-words">
                <span className="font-medium text-gray-700">Описание:</span>{" "}
                {selectedEvent.description || "Описание отсутствует"}
              </p>
              <p>
                <span className="font-medium text-gray-700">Баллы:</span>{" "}
                {selectedEvent.points_for_the_event || "0"}
              </p>
            </div>

            {qrCodeUrl && (
              <div className="mt-6 text-center">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Ваш QR-код</h4>
                <img
                  src={qrCodeUrl}
                  alt="QR-код мероприятия"
                  className="mx-auto max-w-[200px] w-full rounded-md shadow-md"
                />
              </div>
            )}

            <div className="flex flex-col gap-3 mt-6 sm:flex-row sm:justify-end">
              <button
                onClick={() => handleRegistration(selectedEvent.id)}
                className="py-2 px-4 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all duration-200 hover:scale-105"
                disabled={removingEventId === selectedEvent.id}
              >
                {removingEventId === selectedEvent.id ? "Отписка..." : "Отписаться"}
              </button>
              <button
                onClick={() => getQRCode(selectedEvent.id)}
                className="py-2 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all duration-200 hover:scale-105"
              >
                QR-код
              </button>
              <button
                onClick={closeModal}
                className="py-2 px-4 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 hover:scale-105"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeOut {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-10px);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalScaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeOut {
          animation: fadeOut 0.3s ease-out forwards;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in;
        }

        .animate-modalFadeIn {
          animation: modalFadeIn 0.3s ease-in;
        }

        .animate-modalScaleIn {
          animation: modalScaleIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Events;