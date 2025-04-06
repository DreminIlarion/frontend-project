import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const navigate = useNavigate();
  const { user, fetchWithAuth } = useUser();
  const newsContainerRef = useRef(null); // Реф для контейнера новостей

  const loadNews = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth(
        `https://events-zisi.onrender.com/api/v1/news/get/`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response) {
        
        return;
      }

      if (!response.ok) {
        throw new Error(`Ошибка загрузки новостей: ${response.status}`);
      }

      const data1 = await response.json();

      if (!data1.body || !Array.isArray(data1.body.news)) {
        throw new Error("Неожиданная структура ответа API: news не найден или не является массивом");
      }

      const newsData = data1.body.news;

      const decodedNews = newsData.map((item) => {
        let imageUrl = "";
        if (item.image) {
          try {
            imageUrl = `data:image/jpeg;base64,${item.image}`;
          } catch (err) {
            console.error(`Ошибка декодирования изображения для новости ${item.id}:`, err);
            imageUrl = "";
          }
        }
        return { ...item, image: imageUrl };
      });

      setNews(decodedNews);
    } catch (error) {
      setError(error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, [navigate, fetchWithAuth]);

  // Сбрасываем скролл контейнера при монтировании
  useEffect(() => {
    if (newsContainerRef.current) {
      newsContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []); // Срабатывает при монтировании компонента

  const openModal = (newsItem) => setSelectedNews(newsItem);
  const closeModal = () => setSelectedNews(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-blue-50">
        <p className="text-lg text-gray-600 backdrop-blur-md p-4 rounded-full shadow-md animate-pulse">
          Загрузка новостей...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-blue-50">
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-md text-center">
          <p className="text-lg text-red-600 mb-4">Ошибка: {error}</p>
          <button
            onClick={() => {
              setError(null);
              loadNews();
            }}
            className="py-2 px-4 text-white font-semibold rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:scale-105 transition-all duration-300"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 flex flex-col items-center p-6">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent text-center mb-10 fade-in">
          Новости
        </h2>

        <div
          ref={newsContainerRef} // Привязываем реф к контейнеру
          className="max-w-6xl w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-h-[80vh] overflow-y-auto"
        >
          {news.length > 0 ? (
            news.map((newsItem) => (
              <div
                key={newsItem.id}
                className="bg-white/90 backdrop-blur-lg shadow-xl rounded-2xl p-6 border border-blue-100/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 slide-in"
              >
                <div className="flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3
                      onClick={() => openModal(newsItem)}
                      className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-200 max-w-[70%] truncate cursor-pointer"
                      title={newsItem.title}
                    >
                      {newsItem.title}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {newsItem.created_at
                        ? new Date(newsItem.created_at).toLocaleString()
                        : "Дата не указана"}
                    </span>
                  </div>

                  {newsItem.image && (
                    <div className="mb-4">
                      <img
                        src={newsItem.image}
                        alt={newsItem.title}
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    </div>
                  )}

                  <div className="mt-4 space-y-2 text-gray-700">
                    <p className="line-clamp-3 text-sm">{newsItem.body || "Описание не доступно"}</p>
                  </div>

                  <div className="mt-6 text-right">
                    <button
                      onClick={() => openModal(newsItem)}
                      className="py-2 px-4 text-white font-semibold rounded-full shadow-md bg-gradient-to-r from-blue-500 to-indigo-500 transition-transform duration-300 hover:scale-105 active:scale-95 hover:shadow-blue-500/50"
                    >
                      Подробнее
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-lg animate-pulse-slow">
              <span className="text-5xl mb-4">📰</span>
              <p className="text-center text-gray-800 text-lg font-semibold mb-4">
                Новостей пока нет.
              </p>
              <p className="text-center text-gray-600">
                Следите за обновлениями, чтобы не пропустить важные объявления!
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedNews && (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 bg-black/30 flex items-center justify-center z-50 overflow-y-auto fade-in"
          onClick={closeModal}
        >
          <div
            className="bg-white w-full max-w-lg mx-4 my-8 p-6 rounded-2xl shadow-xl flex flex-col gap-4 sm:max-w-xl modal-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-semibold text-gray-900 break-words leading-tight">
              {selectedNews.title}
            </h3>
            <div className="space-y-3 text-gray-700 text-sm">
              <p>
                <strong>Дата:</strong>{" "}
                {selectedNews.created_at
                  ? new Date(selectedNews.created_at).toLocaleString()
                  : "Дата не указана"}
              </p>
              {selectedNews.image && (
                <img
                  src={selectedNews.image}
                  alt={selectedNews.title}
                  className="w-full h-64 object-cover rounded-lg"
                  onError={(e) => (e.target.style.display = "none")}
                />
              )}
              <p className="break-words">
                <strong>Описание:</strong> {selectedNews.body || "Описание не доступно"}
              </p>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={closeModal}
                className="py-2 px-4 text-gray-700 font-semibold rounded-full border border-gray-300 transition-all duration-300 hover:bg-gray-100"
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