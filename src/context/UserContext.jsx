import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom"; // Используем useNavigate внутри контекста

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Используем useNavigate внутри контекста

  const logout = useCallback(() => {
    setUser(null);
    Cookies.remove("access");
    Cookies.remove("refresh");
    navigate("/login"); // Перенаправление на страницу логина
  }, [navigate]);

  const checkAuth = useCallback(async () => {
    try {
      const access = Cookies.get("access");
      const refresh = Cookies.get("refresh");

      if (!access || !refresh) {
        console.log("⚠ Токены отсутствуют, разлогиниваем.");
        logout();
        return;
      }

      const response = await fetch(
        `https://personal-account-fastapi.onrender.com/get/token/${access}/${refresh}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          console.log("✅ Пользователь успешно загружен:", data.user);
          setUser(data.user);
          navigate("/profile"); // Автоматический вход
        }
      } else {
        console.log("❌ Ошибка авторизации, разлогиниваем.");
        logout();
      }
    } catch (error) {
      console.error("❌ Ошибка при проверке токенов:", error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [navigate, logout]);

  useEffect(() => {
    const access = Cookies.get("access");
    const refresh = Cookies.get("refresh");

    if (access && refresh) {
      console.log("✅ Найдены токены в cookies, проверяем пользователя...");
      checkAuth();
    } else {
      console.log("⚠ Нет токенов, требуется авторизация.");
      setLoading(false);
    }
  }, [checkAuth]);

  const login = (userData, access, refresh) => {
    setUser(userData);  // Устанавливаем пользователя в контексте
    Cookies.set("access", access, { path: "/", secure: true, sameSite: "None", expires: 1 });
    Cookies.set("refresh", refresh, { path: "/", secure: true, sameSite: "None", expires: 7 });
    navigate("/profile");  // Переход к профилю
  };
  

  return (
    <UserContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
