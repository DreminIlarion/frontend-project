import React, { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MailCallback = () => {
  const navigate = useNavigate();
  const { updateUser } = useUser();

  useEffect(() => {
    const handleMailCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      if (code) {
        try {
          toast.info("Запрашиваем access_token...");
          const tokenResponse = await axios.get(
            `https://registration-fastapi.onrender.com/mail.ru/get/token?code=${code}`,
            { withCredentials: true }
          );

          if (tokenResponse.status === 200 && tokenResponse.data.access_token) {
            const accessToken = tokenResponse.data.access_token;
            
            try {
              toast.info("Попытка входа...");
              const loginResponse = await axios.get(
                `https://registration-fastapi.onrender.com/mail.ru/login?access_token=${accessToken}`,
                { withCredentials: true }
              );

              if (loginResponse.status === 200) {
                toast.success("Успешный вход!");
                const { access, refresh, ...userData } = loginResponse.data;
                updateUser(userData);

                Cookies.set("access", access, { path: "/", secure: true, sameSite: "None", expires: 1 });
                Cookies.set("refresh", refresh, { path: "/", secure: true, sameSite: "None", expires: 7 });
                
                await axios.get(
                  `https://personal-account-fastapi.onrender.com/get/token/?access=${access}&refresh=${refresh}`,
                  { withCredentials: true }
                );
                
                navigate("/profile");
              } else {
                throw new Error("Ошибка входа");
              }
            } catch (loginError) {
              console.error("Ошибка входа:", loginError);
              toast.error("Ошибка входа. Пробуем регистрацию...");

              try {
                const registrationResponse = await axios.get(
                  `https://registration-fastapi.onrender.com/mail.ru/registration?access_token=${accessToken}`,
                  { withCredentials: true }
                );

                if (registrationResponse.status === 200) {
                  toast.success("Регистрация успешна!");
                  const { access, refresh, ...userData } = registrationResponse.data;
                  updateUser(userData);

                  Cookies.set("access", access, { path: "/", secure: true, sameSite: "None", expires: 1 });
                  Cookies.set("refresh", refresh, { path: "/", secure: true, sameSite: "None", expires: 7 });
                  
                  await axios.get(
                    `https://personal-account-fastapi.onrender.com/get/token/?access=${access}&refresh=${refresh}`,
                    { withCredentials: true }
                  );
                  
                  navigate("/profile");
                } else {
                  throw new Error("Ошибка регистрации");
                }
              } catch (registrationError) {
                console.error("Ошибка регистрации:", registrationError);
                toast.error("Ошибка регистрации. Попробуйте снова.");
                navigate("/login");
              }
            }
          } else {
            throw new Error("Не удалось получить access_token");
          }
        } catch (tokenError) {
          console.error("Ошибка получения access_token:", tokenError);
          toast.error("Ошибка получения access_token. Попробуйте снова.");
          navigate("/login");
        }
      } else {
        console.error("Код авторизации не найден в URL.");
        toast.error("Код авторизации не найден в URL.");
        navigate("/login");
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