import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshAccessToken = useCallback(async () => {
    const refreshToken = Cookies.get("refresh");

    if (!refreshToken) {
      console.warn("❌ Refresh токен отсутствует. Выход...");
      await logout();
      return null;
    }

    try {
      console.log("🔄 Обновляем access токен...");
      const response = await fetch(
        `https://registration-fastapi.onrender.com/validate/jwt/refresh/${refreshToken}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`Ошибка при обновлении токена: ${response.status}`);
      }

      const data = await response.json();

      if (data === false) {
        console.warn("❌ Refresh токен недействителен (сервер вернул false). Выход...");
        throw new Error("Refresh токен недействителен.");
      }

      const newAccessToken = data.access;

      if (!newAccessToken) {
        throw new Error("Новый access токен не получен.");
      }

      Cookies.set("access", newAccessToken, { path: "/", secure: true, sameSite: "None", expires: 1 });
      console.log("✅ Новый access токен сохранён:", newAccessToken);

      setUser({ loggedIn: true });

      return newAccessToken;
    } catch (error) {
      console.error("❌ Ошибка при обновлении access токена:", error);
      await logout();
      return null;
    }
  }, []);

  const fetchWithAuth = useCallback(
    async (url, options = {}) => {
      let accessToken = Cookies.get("access");

      if (!accessToken) {
        console.warn("❌ Access токен отсутствует. Пытаемся обновить...");
        accessToken = await refreshAccessToken();
        if (!accessToken) {
          console.error("❌ Не удалось обновить access токен. Выход...");
          return null;
        }
      }

      const headers = new Headers(options.headers || {});
      headers.set("Authorization", `Bearer ${accessToken}`);

      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
      });

      if (response.status === 401) {
        console.warn("⚠️ Получена ошибка 401. Пытаемся обновить токен...");
        const newAccessToken = await refreshAccessToken();

        if (!newAccessToken) {
          console.error("❌ Не удалось обновить токен. Выход...");
          return null;
        }

        headers.set("Authorization", `Bearer ${newAccessToken}`);
        return fetch(url, {
          ...options,
          headers,
          credentials: "include",
        });
      }

      return response;
    },
    [refreshAccessToken]
  );

  const logout = useCallback(async () => {
    console.log("⛔ Выполняем выход...");

    try {
      const response = await fetch("https://personal-account-fastapi.onrender.com/logout/", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        console.warn("⚠️ Ошибка при вызове logout:", response.status);
      } else {
        console.log("✅ Сессия завершена на сервере.");
      }
    } catch (error) {
      console.error("❌ Ошибка при вызове logout:", error);
    }

    console.log("⛔ Удаляем все куки...");
    const cookies = document.cookie.split("; ");
    cookies.forEach((cookie) => {
      const [name] = cookie.split("=");
      Cookies.remove(name, { path: "/", domain: "personal-account-fastapi.onrender.com" });
      Cookies.remove(name, { path: "/" });
    });

    setUser(null);
  }, []);

  const checkTokens = useCallback(async () => {
    setLoading(true);

    try {
      const accessToken = Cookies.get("access");
      const refreshToken = Cookies.get("refresh");

      if (!refreshToken) {
        console.warn("❌ Refresh токен отсутствует.");
        setUser(null);
        setLoading(false);
        return;
      }

      if (!accessToken) {
        console.warn("⚠️ Access токен отсутствует. Пытаемся обновить...");
        const newAccessToken = await refreshAccessToken();

        if (newAccessToken) {
          setUser({ loggedIn: true });
        } else {
          setUser(null);
        }
      } else {
        setUser({ loggedIn: true });
      }
    } catch (error) {
      console.error("❌ Ошибка при проверке токенов:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [refreshAccessToken]);

  useEffect(() => {
    checkTokens();
    const interval = setInterval(checkTokens, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkTokens]);

  const login = (access, refresh) => {
    if (typeof access !== "string" || typeof refresh !== "string") {
      throw new Error("Токены должны быть строками!");
    }

    Cookies.set("access", access, { path: "/", secure: true, sameSite: "None", expires: 1 });
    const currentRefresh = Cookies.get("refresh");
    if (!currentRefresh || currentRefresh !== refresh) {
      Cookies.set("refresh", refresh, { path: "/", secure: true, sameSite: "None", expires: 7 });
      console.log("✅ Refresh токен обновлён:", refresh);
    } else {
      console.log("ℹ️ Refresh токен не изменился, пропускаем обновление.");
    }

    setUser({ loggedIn: true });
  };

  return (
    <UserContext.Provider value={{ user, login, logout, loading, fetchWithAuth }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);