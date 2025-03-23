import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Функция выхода без автоматического редиректа
  const logout = useCallback(() => {
    console.log("⛔ Удаляем все куки...");

    const cookies = document.cookie.split("; ");
    cookies.forEach((cookie) => {
      const [name] = cookie.split("=");
      Cookies.remove(name, { path: "/", domain: "personal-account-fastapi.onrender.com" });
      Cookies.remove(name, { path: "/" });
    });

    setUser(null);
    // Убрано navigate("/") — редирект будет в компонентах при необходимости
  }, []);

  // Проверка токенов
  const fetchToken = useCallback(async () => {
    setLoading(true);

    try {
      const accessToken = Cookies.get("access");
      const refreshToken = Cookies.get("refresh");

      if (!accessToken || !refreshToken) {
        console.warn("❌ Токены отсутствуют.");
        setUser(null); // Просто сбрасываем пользователя, не вызываем logout
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://personal-account-fastapi.onrender.com/set/token/${accessToken}/${refreshToken}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.status_code === 200 && data.message === "Выполненно") {
        setUser({ loggedIn: true });
      } else {
        console.warn("⚠️ Токены недействительны.");
        setUser(null); // Сбрасываем пользователя, но не перенаправляем
      }
    } catch (error) {
      console.error("❌ Ошибка при проверке токенов:", error);
      setUser(null); // Сбрасываем, но не перенаправляем
    } finally {
      setLoading(false);
    }
  }, []);

  // Проверяем токены при загрузке + каждые 10 минут
  useEffect(() => {
    fetchToken();
    const interval = setInterval(fetchToken, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchToken]);

  // Функция входа
  const login = (access, refresh) => {
    if (typeof access !== "string" || typeof refresh !== "string") {
      console.error("❌ Ошибка: Токены должны быть строками!");
      return;
    }

    Cookies.set("access", access, { path: "/", secure: true, sameSite: "None", expires: 1 });
    Cookies.set("refresh", refresh, { path: "/", secure: true, sameSite: "None", expires: 7 });

    setUser({ loggedIn: true });
  };

  return (
    <UserContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);