import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    setUser(null);
    Cookies.remove("access");
    Cookies.remove("refresh");
    navigate("/login");
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
          navigate("/profile"); // Автоматический переход в профиль
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
    setUser(userData);
    Cookies.set("access", access, { path: "/", secure: true, sameSite: "None", expires: 1 });
    Cookies.set("refresh", refresh, { path: "/", secure: true, sameSite: "None", expires: 7 });
    navigate("/profile"); // После логина сразу в профиль
  };

  return (
    <UserContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
