import React, { useState, useEffect } from "react";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState(new Set());
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("https://events-fastapi.onrender.com/events/v1/get/", {
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
        return response.json();
      })
      .then((data) => setEvents(data))
      .catch((error) => setError(error.message))
      .finally(() => setLoading(false));
  }, []);

  const handleRegistration = async (eventId) => {
    const isRegistered = registeredEvents.has(eventId);
    const url = `https://events-fastapi.onrender.com/visitors/v1/${isRegistered ? "delete" : "add"}/${eventId}`;
    const method = isRegistered ? "DELETE" : "POST";
  
    try {
      
  
     
  
      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          
        }
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
  
  

  const toggleEventDetails = (eventId) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId);
  };

  if (loading) return <p className="text-center text-gray-500">Загрузка событий...</p>;
  if (error) return <p className="text-center text-red-500">Ошибка: {error}</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-3xl font-bold text-center mb-6">События</h2>

      {events.length > 0 ? (
        events.map((event) => (
          <div
            key={event.id}
            className="bg-white shadow-lg rounded-lg p-5 mb-4 border transition-all"
          >
            <div
              className="flex justify-between items-center cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-all"
              onClick={() => toggleEventDetails(event.id)}
            >
              <h3 className="text-lg font-semibold flex items-center">
                {event.name_event}
                <span className="ml-2 text-gray-500 text-sm">
                  {expandedEvent === event.id ? "🔼" : "🔽"}
                </span>
              </h3>
              <span className="text-sm text-gray-500">
                {event.date_time ? new Date(event.date_time).toLocaleString() : "Не указано"}
              </span>
            </div>

            {expandedEvent === event.id && (
              <div className="mt-3 space-y-2 text-gray-700">
                <p><strong> Место:</strong> {event.location || "Не указано"}</p>
                <p><strong> Описание:</strong> {event.description || "Нет описания"}</p>
                <p><strong> Лимит:</strong> {event.limit_people > 0 ? event.limit_people : "Неограничено"}</p>
              </div>
            )}

            <button
              onClick={() => handleRegistration(event.id)}
              className={`mt-4 w-full py-2 text-white font-semibold rounded-lg transition-all ${
                registeredEvents.has(event.id) ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {registeredEvents.has(event.id) ? "Отписаться ❌" : "Записаться ✅"}
            </button>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500">Нет доступных событий.</p>
      )}
    </div>
  );
};

export default Events;
