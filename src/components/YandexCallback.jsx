import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const YandexCallback = () => {
  const navigate = useNavigate();
  const { updateUser } = useUser();

  useEffect(() => {
    const handleYandexCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      if (!code) {
        toast.error("Код авторизации не найден в URL.");
        navigate("/login");
        return;
      }

      try {
        toast.info("Запрашиваем access_token...");
        const tokenResponse = await fetch(
          `https://registration-fastapi.onrender.com/yandex/v1/get/token/${code}`,
          { credentials: "include" }
        );
        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok || !tokenData.access_token) {
          throw new Error("Не удалось получить access_token");
        }

        await loginWithYandex(tokenData.access_token);
      } catch (error) {
        console.error("Ошибка получения access_token:", error);
        toast.error("Ошибка получения access_token. Попробуйте снова.");
        navigate("/login");
      }
    };

    const loginWithYandex = async (accessToken) => {
      try {
        toast.info("Попытка входа...");
        const loginResponse = await fetch(
          `https://registration-fastapi.onrender.com/yandex/v1/login/${accessToken}`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }
        );
        const loginData = await loginResponse.json();

        if (!loginResponse.ok) throw new Error("Ошибка входа");

        await handleAuthSuccess(loginData);
      } catch (error) {
        console.error("Ошибка входа:", error);
        toast.error("Ошибка входа. Пробуем регистрацию...");
        await registerWithYandex(accessToken);
      }
    };

    const registerWithYandex = async (accessToken) => {
      try {
        toast.info("Попытка регистрации...");
        const registrationResponse = await fetch(
          `https://registration-fastapi.onrender.com/yandex/v1/registration/${accessToken}`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }
        );
        const registrationData = await registrationResponse.json();

        if (!registrationResponse.ok) throw new Error("Ошибка регистрации");

        await handleAuthSuccess(registrationData);
      } catch (error) {
        console.error("Ошибка регистрации:", error);
        toast.error("Ошибка регистрации. Попробуйте снова.");
        navigate("/login");
      }
    };

    const handleAuthSuccess = async (data) => {
      const { access, refresh, ...userData } = data;
      updateUser(userData);

      Cookies.set("access", access, { path: "/", secure: true, sameSite: "None", expires: 1 });
      Cookies.set("refresh", refresh, { path: "/", secure: true, sameSite: "None", expires: 7 });

      await fetch(
        `https://personal-account-fastapi.onrender.com/get/token/${access}/${refresh}`,
        { credentials: "include" }
      );

      toast.success("Успешный вход!");
      navigate("/profile");
    };

    handleYandexCallback();
  }, [navigate, updateUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-700">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-semibold text-center text-gray-800 mb-6">
          Обрабатываем авторизацию через Яндекс...
        </h2>
        <div className="flex justify-center items-center space-x-4">
          <div className="w-16 h-16 border-4 border-t-transparent border-gray-300 rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
};

export default YandexCallback;
