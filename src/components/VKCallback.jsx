import React, { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const VKCallback = () => {
  const navigate = useNavigate();
  const { updateUser } = useUser();

  useEffect(() => {
    const handleVKCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const fullCode = urlParams.get("code");

      if (fullCode) {
        const code = fullCode.split("&")[0]; // Получаем только код
        const deviceId = urlParams.get("device_id");

        try {
          // Получаем токен от ВКонтакте
          const tokenResponse = await axios.get(
            `https://registration-fastapi.onrender.com/vk/get/token?code=${code}&device_id=${deviceId}`
          );

          if (tokenResponse.status === 200) {
            const { access_token } = tokenResponse.data;
            console.log("Получен access_token:", access_token);

            if (!access_token) {
              throw new Error("Access token отсутствует");
            }

            // Логируем значение перед отправкой
            console.log("Перед отправкой на вход: access_token", access_token);

            // Пробуем авторизоваться с помощью полученного токена
            const loginResponse = await axios.get(
              `https://registration-fastapi.onrender.com/vk/login`, {
                params: { access_token }, // Параметры передаем через params
                withCredentials: true
              }
            );

            if (loginResponse.status === 200) {
              console.log("Авторизация успешна:", loginResponse.data);
              const userData = loginResponse.data;
              updateUser(userData);
              navigate("/profile");
            } else {
              throw new Error("Ошибка авторизации. Попробуем регистрацию.");
            }
          } else {
            throw new Error("Ошибка получения токенов от ВКонтакте");
          }
        } catch (error) {
          console.error("Ошибка при авторизации или регистрации:", error);

          // Проверка, если access_token доступен для регистрации
          try {
            const access_token_for_registration = error.response?.data?.access_token;
            console.log("Пробуем регистрацию с access_token:", access_token_for_registration);

            if (access_token_for_registration) {
              const registrationResponse = await axios.post(
                `https://registration-fastapi.onrender.com/vk/registration`,
                { access_token: access_token_for_registration }, // Отправка на регистрацию
                { withCredentials: true }
              );

              if (registrationResponse.status === 200) {
                console.log("Регистрация успешна:", registrationResponse.data);
                const { access_token: newAccessToken } = registrationResponse.data;
                console.log("Новый access_token после регистрации:", newAccessToken);

                // Логируем новый токен перед повторной попыткой входа
                console.log("Перед отправкой на вход новый токен:", newAccessToken);

                const loginResponse = await axios.get(
                  `https://registration-fastapi.onrender.com/vk/login`, {
                    params: { access_token: newAccessToken },
                    withCredentials: true
                  }
                );

                if (loginResponse.status === 200) {
                  console.log("Вход выполнен успешно.");
                  const userData = loginResponse.data;
                  updateUser(userData);
                  navigate("/profile");
                } else {
                  console.error("Ошибка входа после регистрации.");
                }
              } else {
                console.error("Ошибка регистрации: ", registrationResponse.status);
              }
            } else {
              throw new Error("Ошибка: access_token не найден для регистрации.");
            }
          } catch (registrationError) {
            console.error("Ошибка регистрации: ", registrationError);
          }
        }
      } else {
        console.error("Не найден код авторизации в URL.");
      }
    };

    handleVKCallback();
  }, [navigate, updateUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-700">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-semibold text-center text-gray-800 mb-6">
          Обрабатываем авторизацию через ВКонтакте...
        </h2>
        <div className="flex justify-center items-center space-x-4">
          <div className="w-16 h-16 border-4 border-t-transparent border-gray-300 rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
};

export default VKCallback;
