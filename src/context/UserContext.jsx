import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Функция для обновления access токена с использованием refresh токена
  const refreshAccessToken = useCallback(async () => {
    const refreshToken = Cookies.get("refresh");
    const oldAccessToken = Cookies.get("access");

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

      // Проверяем, вернул ли сервер false (истёкший или недействительный refresh токен)
      if (data === false) {
        console.warn("❌ Refresh токен недействителен (сервер вернул false). Выход...");
        throw new Error("Refresh токен недействителен.");
      }

      const newAccessToken = data.access;

      if (!newAccessToken) {
        throw new Error("Новый access токен не получен.");
      }

      // Сохраняем новый access токен в куки
      Cookies.set("access", newAccessToken, { path: "/", secure: true, sameSite: "None", expires: 1 });
      console.log("✅ Новый access токен сохранён:", newAccessToken);

      // Обновляем токены на сервере
      const setTokenResponse = await fetch(
        `https://personal-account-fastapi.onrender.com/set/token/${newAccessToken}/${refreshToken}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const setTokenData = await setTokenResponse.json();
      if (setTokenData.status_code !== 200 || setTokenData.message !== "Выполненно") {
        throw new Error("Не удалось обновить токены на сервере.");
      }

      console.log("✅ Токены успешно обновлены на сервере.");

      // Проверяем, была ли уже перезагрузка после обновления токена
      const hasReloaded = localStorage.getItem("hasReloadedAfterTokenRefresh");
      if (!hasReloaded) {
        console.log("🔄 Перезагружаем страницу после обновления токена...");
        localStorage.setItem("hasReloadedAfterTokenRefresh", "true");
        window.location.reload();
      }

      return newAccessToken;
    } catch (error) {
      console.error("❌ Ошибка при обновлении access токена:", error);
      await logout();
      return null;
    }
  }, []);

  // Обёртка для запросов с автоматическим обновлением токена при 401
  const fetchWithAuth = useCallback(
    async (url, options = {}) => {
      const accessToken = Cookies.get("access");

      if (!accessToken) {
        console.warn("❌ Access токен отсутствует. Выход...");
        await logout();
        return null;
      }

      // Добавляем заголовок авторизации, если он не указан
      const headers = new Headers(options.headers || {});
      if (!headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }

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

        // Повторяем запрос с новым токеном
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

  // Функция выхода с вызовом эндпоинта logout
  const logout = useCallback(async () => {
    console.log("⛔ Выполняем выход...");

    try {
      // Вызываем эндпоинт выхода
      const response = await fetch("https://personal-account-fastapi.onrender.com/logout/", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        console.warn("⚠️ Ошибка при вызове эндпоинта выхода:", response.status);
      } else {
        console.log("✅ Сессия завершена на сервере.");
      }
    } catch (error) {
      console.error("❌ Ошибка при вызове эндпоинта выхода:", error);
    }

    // Удаляем все куки
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
        setUser(null);
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
        console.warn("⚠️ Токены недействительны. Пытаемся обновить...");
        const newAccessToken = await refreshAccessToken();

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
  }, [refreshAccessToken]);

  // Проверяем токены при загрузке + каждые 10 минут
  useEffect(() => {
    fetchToken();
    const interval = setInterval(fetchToken, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchToken]);

  // Очищаем флаг перезагрузки при монтировании компонента
  useEffect(() => {
    localStorage.removeItem("hasReloadedAfterTokenRefresh");
  }, []);

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
    <UserContext.Provider value={{ user, login, logout, loading, fetchWithAuth }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);