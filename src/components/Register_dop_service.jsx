import React, { useState } from "react";
import { FaVk, FaYandex } from "react-icons/fa";


const RegisterOAuth = () => {
  const [isChecked, setIsChecked] = useState(false);

  const handleOAuth = async (provider) => {
    if (!isChecked) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_LINK}${provider}/link`);
      const data = await response.json();
      console.log(data);
      if (data.url) {
        localStorage.setItem(`${provider}_code_verifier`, data.code_verifier);
        window.location.href = data.url;
      } else {
        console.error("Ошибка при получении ссылки", data.url);
      }
    } catch (error) {
      console.error("Ошибка запроса:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-blue-50">
      <div className="flex flex-col items-center gap-6 max-w-xl w-full mx-auto p-6">
        {/* Основной контейнер */}
        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-6 p-8 bg-white/90 backdrop-blur-lg shadow-xl rounded-2xl border border-blue-100/50 w-full"
        >
          {/* Заголовок */}
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent text-center">
            Регистрация через сервисы
          </h2>

          {/* Кнопки */}
          <div className="grid grid-cols-2 gap-4 w-full">
            <button
              onClick={() => handleOAuth("vk")}
              whileHover={isChecked ? { scale: 1.05 } : {}}
              whileTap={isChecked ? { scale: 0.95 } : {}}
              className={`flex items-center justify-center gap-2 h-12 rounded-full font-semibold text-white bg-gradient-to-r from-[#0077FF] to-[#005BBF] shadow-md transition-all duration-300 ${
                !isChecked ? "opacity-50 cursor-not-allowed" : "hover:shadow-blue-500/50"
              }`}
              disabled={!isChecked}
            >
              <FaVk size={20} /> VK ID
            </button>

            <button
              onClick={() => handleOAuth("yandex")}
              whileHover={isChecked ? { scale: 1.05 } : {}}
              whileTap={isChecked ? { scale: 0.95 } : {}}
              className={`flex items-center justify-center gap-2 h-12 rounded-full font-semibold text-white bg-gradient-to-r from-red-600 to-red-800 shadow-md transition-all duration-300 ${
                !isChecked ? "opacity-50 cursor-not-allowed" : "hover:shadow-red-500/50"
              }`}
              disabled={!isChecked}
            >
              <FaYandex size={18} /> Яндекс
            </button>
          </div>

          {/* Чекбокс */}
          <label className="flex items-center space-x-3 mt-2">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => setIsChecked(!isChecked)}
              className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
            <span className="text-sm text-gray-700">
              Я соглашаюсь с{" "}
              <a
                href="/privacy-policy"
                className="text-blue-600 hover:text-blue-800 underline transition-colors duration-200"
              >
                обработкой персональных данных
              </a>
            </span>
          </label>
        </div>

        {/* Описание */}
        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="p-6 bg-white/70 backdrop-blur-lg rounded-2xl shadow-md border border-blue-100/50 w-full text-center"
        >
          <p className="text-sm text-gray-700 leading-relaxed">
            <span className="font-semibold text-blue-900">Быстрая регистрация</span> через ваши любимые сервисы!
            Используйте VK ID или Яндекс, чтобы мгновенно создать аккаунт и начать пользоваться всеми возможностями
            нашего портала. Просто, удобно и безопасно!
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterOAuth;