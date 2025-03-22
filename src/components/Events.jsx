import React, { useState, useEffect } from "react";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1); // Текущая страница
  const [hasMore, setHasMore] = useState(true); // Есть ли еще события для загрузки
  const [registeredEvents, setRegisteredEvents] = useState(new Set());
  const [visitorData, setVisitorData] = useState({});

  

  // Загрузка зарегистрированных событий для текущего пользователя
  useEffect(() => {
    fetch(`${process.env.REACT_APP_VISITORS_GET}`, {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        const registeredIds = new Set(data.map((entry) => entry.event_id));
        setRegisteredEvents(registeredIds);
        const visitorMap = data.reduce((acc, entry) => {
          acc[entry.event_id] = entry.unique_string;
          return acc;
        }, {});
        setVisitorData(visitorMap);
      })
      .catch((error) => console.error("Ошибка загрузки записей:", error.message));
  }, []);


  // Обработчик прокрутки для ленивой загрузки
  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;
    if (bottom && !loading && hasMore) {
      setPage((prevPage) => prevPage + 1); // Загружаем следующую страницу
    }
  };

  // Обработчик регистрации / отписки
  const handleRegistration = async (eventId) => {
    const isRegistered = registeredEvents.has(eventId);
    const url = `${process.env.REACT_APP_VISITORS}${isRegistered ? "delete" : "add"}/${eventId}`;
    const method = isRegistered ? "DELETE" : "POST";

    try {
      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
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

  // Генерация QR-кода
  const getQRCode = async (eventId) => {
    const uniqueString = visitorData[eventId];
    if (!uniqueString) return;
    const qrUrl = `${process.env.REACT_APP_VISITORS_MAKE_QR}${uniqueString}`;
    window.open(qrUrl, "_blank");
  };

  if (loading && page === 1) return <p className="text-center text-gray-500">Загрузка событий...</p>;
  if (error) return <p className="text-center text-red-500">Ошибка: {error}</p>;

  return (
    <div className="max-w-6xl mx-auto p-6" onScroll={handleScroll}>
      <h2 className="text-4xl font-bold text-center mb-8">События</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.filter(event => registeredEvents.has(event.id)).length > 0 ? (
  events
    .filter(event => registeredEvents.has(event.id)) // Оставляем только зарегистрированные события
    .map((event) => (
      <div
        key={event.id}
        className="bg-white shadow-lg rounded-lg p-6 transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl hover:bg-gray-100"
        style={{ cursor: "pointer" }}
      >
        <div className="flex flex-col">
          {/* Название и дата */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-500 truncate">
              {event.name_event}
            </h3>
            <span className="text-sm text-gray-500">
              {event.date_time ? new Date(event.date_time).toLocaleString() : "Не указано"}
            </span>
          </div>

          {/* Дополнительная информация */}
          <div className="mt-4 space-y-2 text-gray-700">
            <p><strong>Место:</strong> {event.location || "Не указано"}</p>
            <p><strong>Лимит людей:</strong> {event.limit_people || "Не ограничено"}</p>
            <p><strong>Описание:</strong> {event.description || "Описание не доступно"}</p>
          </div>
        </div>

        <div className="flex gap-4 mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRegistration(event.id);
            }}
            className="flex-1 py-3 text-white font-semibold rounded-lg transition-all transform hover:scale-105 bg-red-500 hover:bg-red-600"
          >
            Отписаться ❌
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              getQRCode(event.id);
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-5 rounded-lg transition-transform transform hover:scale-105"
          >
            QR-код 📲
          </button>
        </div>
      </div>
    ))
) : (
  <p className="text-center text-gray-500 col-span-2">Вы не записаны ни на одно событие.</p>
)}
      </div>

      {loading && <p className="text-center text-gray-500">Загрузка...</p>}
    </div>
  );
};

export default Events;
