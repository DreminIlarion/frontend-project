import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasCheckedTokens = useRef(false);

  const refreshAccessToken = useCallback(async () => {
    try {
      console.log("🔄 Обновляем access токен...");
      const response = await fetch(
        "https://registration-s6rk.onrender.com/validate/jwt/refresh",
        {
          method: "GET",
          credentials: "include", // Куки refresh отправятся автоматически
        }
      );

      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }

      const data = await response.json();
      if (data === false) {
        throw new Error("Refresh токен недействителен.");
      }

      setUser({ loggedIn: true });
      return true; // Успешное обновление
    } catch (error) {
      console.error("❌ Ошибка обновления токена:", error);
      await logout();
      return false;
    }
  }, []);

  const fetchWithAuth = useCallback(
    async (url, options = {}) => {
      const response = await fetch(url, {
        ...options,
        credentials: "include", // Куки отправляются автоматически
      });

      if (response.status === 401) {
        console.warn("⚠️ Ошибка 401. Обновляем токен...");
        const success = await refreshAccessToken();
        if (!success) {
          console.error("❌ Не удалось обновить токен.");
          return null;
        }
        return fetch(url, { ...options, credentials: "include" });
      }

      return response;
    },
    [refreshAccessToken]
  );

  const logout = useCallback(async () => {
    console.log("⛔ Выход...");
    try {
      const response = await fetch("https://personal-account-c98o.onrender.com/logout/", {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        console.warn("⚠️ Ошибка logout:", response.status);
      }
    } catch (error) {
      console.error("❌ Ошибка logout:", error);
    }

    setUser(null);
  }, []);

  const checkTokens = useCallback(async () => {
    if (hasCheckedTokens.current) return;
    hasCheckedTokens.current = true;

    setLoading(true);
    try {
      const response = await fetch(
        "https://registration-s6rk.onrender.com/validate/jwt/access",
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (response.ok) {
        setUser({ loggedIn: true });
      } else {
        console.warn("⚠️ Access токен недействителен. Обновляем...");
        const success = await refreshAccessToken();
        if (!success) setUser(null);
      }
    } catch (error) {
      console.error("❌ Ошибка проверки токенов:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [refreshAccessToken]);

  useEffect(() => {
    checkTokens();
    const interval = setInterval(() => {
      console.log("🔄 Проверка токенов...");
      checkTokens();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkTokens]);

  const login = useCallback(() => {
    setUser({ loggedIn: true });
  }, []);

  return (
    <UserContext.Provider value={{ user, login, logout, loading, fetchWithAuth }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);