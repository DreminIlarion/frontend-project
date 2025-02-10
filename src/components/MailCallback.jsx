import React, { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const MailCallback = () => {
  const navigate = useNavigate();
  const { updateUser } = useUser();

  useEffect(() => {
    const handleMailCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      if (code) {
        try {
          // 1. Получение access_token с помощью /mail.ru/get/token
          const tokenResponse = await axios.get(
            `https://registration-fastapi.onrender.com/mail.ru/get/token?code=${code}`,
            { withCredentials: true }
          );

          if (tokenResponse.status === 200 && tokenResponse.data.access_token) {
            const accessToken = tokenResponse.data.access_token;

            try {
              // 2. Попытка входа через /mail.ru/login
              const loginResponse = await axios.get(
                `https://registration-fastapi.onrender.com/mail.ru/login?access_token=${accessToken}`,
                { withCredentials: true }
              );

              if (loginResponse.status === 200) {
                console.log("Успешный вход:", loginResponse.data);

                const userData = loginResponse.data;
                updateUser(userData);

                navigate("/profile");
              } else {
                throw new Error("Ошибка входа");
              }
            } catch (loginError) {
              console.error("Ошибка входа:", loginError);

              // 3. Если вход не удался, попытка регистрации через /mail.ru/registration
              try {
                const registrationResponse = await axios.get(
                  `https://registration-fastapi.onrender.com/mail.ru/registration?access_token=${accessToken}`,
                  { withCredentials: true }
                );

                if (registrationResponse.status === 200) {
                  console.log("Пользователь зарегистрирован:", registrationResponse.data);
                  const userData = registrationResponse.data;
                  updateUser(userData);

                  navigate("/profile");
                } else {
                  throw new Error("Ошибка регистрации");
                }
              } catch (registrationError) {
                console.error("Ошибка регистрации:", registrationError);
              }
            }
          } else {
            throw new Error("Не удалось получить access_token");
          }
        } catch (tokenError) {
          console.error("Ошибка получения access_token:", tokenError);
        }
      } else {
        console.error("Код авторизации не найден в URL.");
      }
    };

    handleMailCallback();
  }, [navigate, updateUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-700">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-semibold text-center text-gray-800 mb-6">
          Обрабатываем авторизацию через Mail.ru...
        </h2>
        <div className="flex justify-center items-center space-x-4">
          <div className="w-16 h-16 border-4 border-t-transparent border-gray-300 rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
};

export default MailCallback;
