import React from "react";
import { Link } from "react-router-dom";

const TelegramBotPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 relative overflow-hidden">
      {/* Декоративный фон с плавными кругами */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-blue-200/30 rounded-full -top-48 -left-48 blur-3xl animate-pulse-slow"></div>
        <div className="absolute w-96 h-96 bg-purple-200/30 rounded-full -bottom-48 -right-48 blur-3xl animate-pulse-slow delay-1000"></div>
      </div>

      {/* Основной контейнер */}
      <div className="relative bg-white/90 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl max-w-md w-full mx-4 border border-blue-100/20 text-center transform transition-all duration-500 ">
        {/* Вариант 1: Смайлик вместо иконки */}
        {/* <div className="flex justify-center mb-6 sm:mb-8">
          <span className="text-5xl sm:text-6xl animate-bounce">✈️</span>
        </div> */}

        {/* Вариант 2: Изображение с icons8 (раскомментируйте, чтобы использовать) */}
        
        <div className="flex justify-center mb-6 sm:mb-8">
          <img
            src="https://img.icons8.com/?size=100&id=oWiuH0jFiU0R&format=png&color=000000"
            alt="Telegram Icon"
            className="w-16 h-16 sm:w-20 sm:h-20 animate-bounce"
          />
        </div>
       

        {/* Заголовок */}
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 sm:mb-6 text-blue-900 tracking-tight animate-fadeIn">
          Наш Telegram-бот
        </h2>

        {/* Описание */}
        <p className="text-gray-600 text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed animate-fadeIn delay-200">
        Подключайтесь к Telegram-боту — вашему AI-помощнику. Узнавайте всё о поступлении, получайте уведомления о рейтингах и задавайте вопросы. Мы всегда на связи!
        </p>

        {/* Кнопка перехода в Telegram (без иконки) */}
        <a
          href="https://t.me/TyuiuAI_bot" // Замените на реальную ссылку вашего бота
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold py-3 sm:py-4 px-8 sm:px-10 rounded-xl shadow-lg transition-all duration-300 hover:from-blue-600 hover:to-indigo-600 hover:shadow-blue-500/50 hover:scale-105 active:scale-95 animate-fadeIn delay-400"
        >
          Перейти в Telegram
        </a>

        
      </div>
    </div>
  );
};

export default TelegramBotPage;