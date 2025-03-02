import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(Cookies.get("access"));
  const [refreshToken, setRefreshToken] = useState(Cookies.get("refresh"));

  // Загружаем пользователя из cookies
  const loadUserFromCookies = useCallback(async () => {
    if (accessToken && refreshToken) {
      try {
        const response = await fetch(
          `https://personal-account-fastapi.onrender.com/get/token/${accessToken}/${refreshToken}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          console.log("Токен недействителен. Нужно перелогиниться.");
          logout();
        }
      } catch (error) {
        console.error("Ошибка при проверке токенов:", error);
        logout();
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [accessToken, refreshToken]);

  // Следим за изменением access и refresh токенов
  useEffect(() => {
    loadUserFromCookies();
  }, [loadUserFromCookies]);

  // Логин: сохраняем токены в Cookies и состояние
  const login = (userData, access, refresh) => {
    setUser(userData);
    Cookies.set("access", access, { path: "/", secure: true, sameSite: "None", expires: 1 });
    Cookies.set("refresh", refresh, { path: "/", secure: true, sameSite: "None", expires: 7 });

    // Обновляем локальное состояние токенов
    setAccessToken(access);
    setRefreshToken(refresh);
  };

  // Выход: удаляем токены
  const logout = () => {
    setUser(null);
    Cookies.remove("access");
    Cookies.remove("refresh");

    // Сбрасываем локальное состояние токенов
    setAccessToken(null);
    setRefreshToken(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
