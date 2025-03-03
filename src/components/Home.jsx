import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const [events, setEvents] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Статус авторизации
  const [registeredEvents, setRegisteredEvents] = useState(new Set());
  const [visitorData, setVisitorData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1); // Страница для пагинации
  const [hasMore, setHasMore] = useState(true); // Есть ли еще события для загрузки

  // Загрузка событий с пагинацией
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://events-fastapi.onrender.com/api/v1/events/get/?page=${page}&limit=10`,
          {
            credentials: "include",
          }
        );
        if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
        const data = await response.json();

        // Добавляем новые события только если их еще нет в списке
        setEvents((prevEvents) => {
          const newEventsSet = new Set(prevEvents.map((event) => event.id)); // Множество с id уже загруженных событий
          const newEvents = data.filter((event) => !newEventsSet.has(event.id)); // Фильтруем уже загруженные события
          return [...prevEvents, ...newEvents];
        });

        // Если загружено меньше 10 событий, это последняя страница
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

  // Загрузка зарегистрированных событий для текущего пользователя
  useEffect(() => {
    fetch("https://personal-account-fastapi.onrender.com/api/v1/visitors/get", {
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

  // Проверка авторизации
  useEffect(() => {
    fetch("https://personal-account-fastapi.onrender.com/api/v1/visitors/get", {
      credentials: "include",
    })
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
    const url = `https://personal-account-fastapi.onrender.com/api/v1/visitors/${isRegistered ? "delete" : "add"}/${eventId}`;
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
    const qrUrl = `https://personal-account-fastapi.onrender.com/api/v1/visitors/make/qr/${uniqueString}`;
    window.open(qrUrl, "_blank");
  };

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;
    if (bottom && !loading && hasMore) {
      setPage((prevPage) => prevPage + 1); // Загружаем следующую страницу
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white py-6 px-8 flex justify-between items-center shadow-md">
        <h1 className="text-3xl font-bold">Главная страница</h1>
        <nav>
          <Link
            to="/profile"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg shadow-md hover:bg-gray-100 transition duration-200"
          >
            Личный кабинет
          </Link>
        </nav>
      </header>

      {/* Main Section */}
      <main className="flex flex-col items-center justify-center text-center py-12 px-6">
        <h2 className="text-5xl font-extrabold text-blue-600 mb-6">Добро пожаловать!</h2>
        <p className="text-lg text-gray-600 mb-8">
          Войдите, чтобы записаться на события и управлять своим аккаунтом.
        </p>

        {/* Events Section */}
        <section
          className="container mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          onScroll={handleScroll}
        >
          {events.length > 0 ? (
            events.map((event) => (
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
                  {isAuthenticated ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRegistration(event.id);
                      }}
                      className={`flex-1 py-3 text-white font-semibold rounded-lg transition-all transform hover:scale-105 ${
                        registeredEvents.has(event.id) ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                      }`}
                    >
                      {registeredEvents.has(event.id) ? "Отписаться ❌" : "Записаться ✅"}
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="flex-1 py-3 text-center text-white font-semibold bg-blue-500 hover:bg-blue-600 rounded-lg transition-all transform hover:scale-105"
                    >
                      Войдите, чтобы записаться 🔑
                    </Link>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 col-span-2">Загрузка...</p>
          )}
        </section>
        {loading && <p className="text-center text-gray-500">Загрузка...</p>}
        {!hasMore && !loading && <p className="text-center text-gray-500">Больше событий нет.</p>}
      </main>
    </div>
  );
};

export default Home;
