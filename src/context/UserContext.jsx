import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import Cookies from "js-cookie";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasCheckedTokens = useRef(false);

  const logout = useCallback(async () => {
    console.log("⛔ Выполняем выход...");

    try {
      const response = await fetch("https://personal-account-c98o.onrender.com/logout/", {
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
      Cookies.remove(name, { path: "/" });
    });

    setUser(null);
  }, []);

  const setTokens = useCallback(async (accessToken, refreshToken) => {
    try {
      const setTokenUrl = `https://personal-account-c98o.onrender.com/set/token/${accessToken}/${refreshToken}`;
      const response = await fetch(setTokenUrl, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка установки токенов: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("✅ Токены успешно установлены на сервере:", data);
      return true;
    } catch (error) {
      console.error("❌ Ошибка при установке токенов:", error);
      return false;
    }
  }, []);

  const refreshAccessToken = useCallback(
    async (refreshToken) => {
      if (!refreshToken) {
        console.warn("❌ Refresh токен отсутствует. Выход...");
        await logout();
        return null;
      }

      try {
        console.log("🔄 Обновляем access токен...");
        const response = await fetch(
          `https://registration-s6rk.onrender.com/validate/jwt/refresh/${refreshToken}`,
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

        Cookies.set("access", newAccessToken, { path: "/", secure: true, sameSite: "Strict" });

        const success = await setTokens(newAccessToken, refreshToken);
        if (!success) {
          throw new Error("Не удалось установить токены на сервере.");
        }

        setUser({ loggedIn: true });
        return newAccessToken;
      } catch (error) {
        console.error("❌ Ошибка при обновлении access токена:", error);
        await logout();
        return null;
      }
    },
    [logout, setTokens]
  );

  const fetchWithAuth = useCallback(
    async (url, options = {}) => {
      let accessToken = Cookies.get("access");
      const refreshToken = Cookies.get("refresh");

      if (!accessToken || !refreshToken) {
        console.warn("❌ Токены отсутствуют. Пытаемся выйти...");
        await logout();
        return null;
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
        const newAccessToken = await refreshAccessToken(refreshToken);

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
    [refreshAccessToken, logout]
  );

  const checkTokens = useCallback(
    async () => {
      if (hasCheckedTokens.current) {
        console.log("ℹ️ checkTokens уже был вызван, пропускаем...");
        return;
      }
      hasCheckedTokens.current = true;

      setLoading(true);

      try {
        const accessToken = Cookies.get("access");
        const refreshToken = Cookies.get("refresh");

        if (!refreshToken || !accessToken) {
          console.log("ℹ️ Токены отсутствуют, пользователь не авторизован.");
          setUser(null);
          setLoading(false);
          return;
        }

        // Проверяем токены только через setTokens, без /validate/jwt/access
        const success = await setTokens(accessToken, refreshToken);
        if (success) {
          setUser({ loggedIn: true });
        } else {
          console.warn("⚠️ Ошибка при установке токенов в checkTokens. Пытаемся обновить...");
          const newAccessToken = await refreshAccessToken(refreshToken);
          if (newAccessToken) {
            setUser({ loggedIn: true });
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        console.error("❌ Ошибка при проверке токенов:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    },
    [refreshAccessToken, setTokens]
  );

  useEffect(() => {
    checkTokens();

    const interval = setInterval(() => {
      console.log("🔄 Периодическая проверка токенов...");
      checkTokens();
    }, 5 * 60 * 1000);

    return () => {
      console.log("🛑 Очищаем интервал проверки токенов...");
      clearInterval(interval);
    };
  }, [checkTokens]);

  const login = useCallback(
    async (access, refresh) => {
      if (typeof access !== "string" || typeof refresh !== "string") {
        throw new Error("Токены должны быть строками!");
      }

      Cookies.set("access", access, { path: "/", secure: true, sameSite: "Strict", expires: 1 });
      const currentRefresh = Cookies.get("refresh");
      if (!currentRefresh || currentRefresh !== refresh) {
        Cookies.set("refresh", refresh, { path: "/", secure: true, sameSite: "Strict", expires: 7 });
      } else {
        console.log("ℹ️ Refresh токен не изменился, пропускаем обновление.");
      }

      const success = await setTokens(access, refresh);
      if (success) {
        setUser({ loggedIn: true });
      } else {
        console.error("❌ Не удалось установить токены после логина.");
        await logout();
      }
    },
    [logout, setTokens]
  );

  return (
    <UserContext.Provider value={{ user, login, logout, loading, fetchWithAuth }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);