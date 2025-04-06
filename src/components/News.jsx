import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const navigate = useNavigate();
  const newsContainerRef = useRef(null);

  const loadNews = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://events-zisi.onrender.com/api/v1/news/get/?is_paginated=true&page=1&limit=10`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(`Ошибка загрузки новостей: ${response.status}`);
      }

      const data = await response.json();

      if (!data.body || !Array.isArray(data.body.news)) {
        throw new Error("Неожиданная структура ответа API");
      }

      const newsData = data.body.news.map((item) => ({
        ...item,
        image: item.image && item.image !== "absent" ? `data:image/jpeg;base64,${item.image}` : null,
      }));

      setNews(newsData);
    } catch (error) {
      setError(error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, [navigate]);

  useEffect(() => {
    if (newsContainerRef.current) {
      newsContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  const openModal = (newsItem) => setSelectedNews(newsItem);
  const closeModal = () => setSelectedNews(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-blue-100">
        <div className="flex items-center space-x-3 p-4 bg-white/80 backdrop-blur-md rounded-full shadow-lg animate-pulse">
          <svg className="w-6 h-6 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h-8z" />
          </svg>
          <p className="text-lg text-gray-700">Загрузка новостей...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-blue-100">
        <div className="bg-white/90 backdrop-blur-lg p-6 rounded-2xl shadow-xl text-center max-w-md">
          <p className="text-lg text-red-600 mb-4 font-medium">{error}</p>
          <button
            onClick={() => {
              setError(null);
              loadNews();
            }}
            className="py-2 px-6 text-white font-semibold rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Повторить попытку
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center p-6">
        <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent text-center mb-12 animate-fade-in">
          Новости
        </h2>

        <div
          ref={newsContainerRef}
          className="max-w-7xl w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-h-[80vh] overflow-y-auto px-4 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-100"
        >
          {news.length > 0 ? (
            news.map((newsItem) => (
              <div
                key={newsItem.id}
                className="bg-white/95 backdrop-blur-md shadow-md rounded-2xl p-6 border border-gray-100/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                onClick={() => openModal(newsItem)}
              >
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 max-w-[70%] line-clamp-2">
                      {newsItem.title}
                    </h3>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {new Date(newsItem.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {newsItem.image && (
                    <div className="mb-4">
                      <img
                        src={newsItem.image}
                        alt={newsItem.title}
                        className="w-full h-48 object-cover rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    </div>
                  )}

                  <p className="text-gray-600 text-sm line-clamp-3 flex-grow">
                    {newsItem.body || "Описание отсутствует"}
                  </p>

                  <div className="mt-4 text-right">
                    <span className="text-blue-500 text-sm font-medium group-hover:underline">
                      Подробнее →
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center bg-white/80 backdrop-blur-md p-10 rounded-2xl shadow-lg">
              <span className="text-6xl mb-4 animate-bounce">📰</span>
              <p className="text-xl text-gray-800 font-semibold mb-2">Новостей пока нет</p>
              <p className="text-gray-600 text-center max-w-md">
                Следите за обновлениями, чтобы быть в курсе последних событий!
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedNews && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={closeModal}
        >
          <div
            className="bg-white w-full max-w-2xl p-8 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-gray-100 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 break-words">
              {selectedNews.title}
            </h3>
            <div className="space-y-4 text-gray-700">
              <p className="text-sm">
                <span className="font-medium">Дата:</span>{" "}
                {new Date(selectedNews.created_at).toLocaleString()}
              </p>
              {selectedNews.image && (
                <img
                  src={selectedNews.image}
                  alt={selectedNews.title}
                  className="w-full h-72 object-cover rounded-lg shadow-md"
                  onError={(e) => (e.target.style.display = "none")}
                />
              )}
              <p className="text-base leading-relaxed break-words">
                {selectedNews.body || "Описание отсутствует"}
              </p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="py-2 px-6 text-white font-semibold rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
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

export default News;