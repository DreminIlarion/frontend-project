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
      const fullCode = urlParams.get("code"); // Получаем полный код из URL

      if (fullCode) {
        const code = fullCode.split("&")[0]; // Обрезаем до &state
        const deviceId = urlParams.get("device_id"); // Получаем device_id из URL

        try {
          // Получаем токены от ВКонтакте
          const tokenResponse = await axios.get(
            `https://registration-fastapi.onrender.com/vk/get/token?code=${code}&device_id=${deviceId}`
          );

          if (tokenResponse.status === 200) {
            const { access_token, refresh_token } = tokenResponse.data;

            // Пробуем выполнить вход через API
            const loginResponse = await axios.get(
              `https://registration-fastapi.onrender.com/vk/login?access_token=${access_token}`,
              { withCredentials: true }
            );

            if (loginResponse.status === 200) {
              // Если вход успешный, обновляем пользователя
              console.log("Успешный вход:", loginResponse.data);
              const userData = loginResponse.data;
              updateUser(userData);
              navigate("/profile");
            } else {
              throw new Error("Пользователь не найден, пробуем регистрацию");
            }
          } else {
            throw new Error("Ошибка получения токенов от ВКонтакте");
          }
        } catch (error) {
          console.error("Ошибка авторизации или регистрации:", error);

          try {
            // Получение токенов с другого сервера для регистрации
            const registrationResponse = await axios.get(
              `https://registration-fastapi.onrender.com/vk/registration?access_token=${error.response?.data?.access_token}`,
              { withCredentials: true }
            );

            if (registrationResponse.status === 200) {
              console.log("Пользователь зарегистрирован:", registrationResponse.data);
              const { access, refresh } = registrationResponse.data;

              // Отправляем токены на другой эндпоинт
              const tokenTransferResponse = await axios.get(
                `https://personal-account-fastapi.onrender.com/get/token/?access=${access}&refresh=${refresh}`
              );

              if (tokenTransferResponse.status === 200) {
                console.log("Токены успешно переданы.");
                navigate("/profile");
              } else {
                console.error("Ошибка передачи токенов.");
              }
            }
          } catch (registrationError) {
            console.error("Ошибка регистрации:", registrationError);
          }
        }
      } else {
        console.error("Код авторизации не найден в URL.");
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
