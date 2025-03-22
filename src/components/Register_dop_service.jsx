import React, { useState } from "react";
import { FaVk, FaYandex } from "react-icons/fa";

const RegisterOAuth = () => {
  const [isChecked, setIsChecked] = useState(false);

  const handleOAuth = async (provider) => {
    if (!isChecked) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_LINK}${provider}/link`);
      const data = await response.json();

      if ( data.url) {
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
    <div className="flex flex-col items-center gap-4 p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-semibold text-gray-800 text-center">
        Регистрация через сервисы
      </h2>
      <div className="grid grid-cols-2 gap-3 w-full">
        <button
          onClick={() => handleOAuth("vk")}
          className={`flex items-center justify-center gap-2 h-10 rounded-md font-bold text-white bg-[#0077FF] transition-all hover:bg-[#005bbf] active:scale-95 shadow-md ${!isChecked ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!isChecked}
        >
          <FaVk size={20} /> VK ID
        </button>
        <button
          onClick={() => handleOAuth("yandex")}
          className={`flex items-center justify-center gap-2 h-10 rounded-md font-bold text-white bg-red-600 transition-all hover:bg-red-700 active:scale-95 shadow-md ${!isChecked ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!isChecked}
        >
          <FaYandex size={18} /> Яндекс
        </button>
      </div>
      <label className="flex items-center space-x-2 mt-4">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => setIsChecked(!isChecked)}
          className="form-checkbox h-4 w-4 text-blue-600"
        />
        <span className="text-sm text-gray-700">
        Я соглашаюсь с <a href="/privacy-policy" className="text-blue-600 underline">обработкой персональных данных</a>
        </span>
      </label>
    </div>
  );
};

export default RegisterOAuth;
