import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cookieCheckDone, setCookieCheckDone] = useState(false); // Флаг для проверки куки
  const [cookiesBlocked, setCookiesBlocked] = useState(false); // Флаг для блокировки куки
  const hasCheckedTokens = useRef(false);
  const hasShownCookieWarning = useRef(false);

  // Проверка поддержки куки (синхронная)
  const areCookiesEnabled = () => {
    try {
      Cookies.set("testcookie", "test", { expires: 1 });
      const cookieEnabled = Cookies.get("testcookie") === "test";
      Cookies.remove("testcookie");
      return cookieEnabled;
    } catch (e) {
      return false;
    }
  };

  // Определение, используется ли Safari на iPhone
  const isSafariOnIPhone = () => {
    const userAgent = navigator.userAgent;
    return (
      /iPhone/i.test(userAgent) &&
      /Safari/i.test(userAgent) &&
      !/CriOS/i.test(userAgent) &&
      !/FxiOS/i.test(userAgent)
    );
  };

  // Проверка куки выполняется синхронно при инициализации
  const cookiesEnabled = areCookiesEnabled();
  if (!cookiesEnabled && !hasShownCookieWarning.current) {
    hasShownCookieWarning.current = true;
    setCookiesBlocked(true);
    setUser(null);
    setCookieCheckDone(true);

    const isIPhoneSafari = isSafariOnIPhone();
    const message = isIPhoneSafari ? (
      <div>
        Для корректной работы сайта необходимо отключить настройку "Предотвращение межсайтового отслеживания" в Safari:
        <br />
        1. Откройте <strong>Настройки</strong> → <strong>Safari</strong>.
        <br />
        2. Выключите <strong>"Предотвращение межсайтового отслеживания"</strong>.
        <br />
        Подробная инструкция{" "}
        <a
          href="https://support.apple.com/ru-ru/guide/safari/sfri40596/mac"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-blue-600 hover:text-blue-800"
        >
          здесь
        </a>.
      </div>
    ) : (
      "Для корректной работы сайта разрешите куки в настройках браузера."
    );

    toast.error(message, {
      duration: 10000,
      style: {
        background: "linear-gradient(to right, #fef3c7, #fee2e2)",
        color: "#b91c1c",
        fontWeight: "bold",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        maxWidth: "90%",
        padding: "12px 16px",
        fontSize: "14px",
        lineHeight: "1.5",
      },
    });
  } else if (!cookieCheckDone) {
    setCookieCheckDone(true);
  }

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
    if (hasCheckedTokens.current) {
      console.log("ℹ️ checkTokens уже был вызван, пропускаем...");
      return;
    }
    hasCheckedTokens.current = true;

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
          const validationResponse = await fetch(
            "https://registration-fastapi.onrender.com/validate/jwt/access",
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${newAccessToken}`,
              },
              credentials: "include",
            }
          );

          if (validationResponse.ok) {
            setUser({ loggedIn: true });
          } else {
            console.warn("❌ Новый access токен недействителен.");
            await logout();
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } else {
        const validationResponse = await fetch(
          "https://registration-fastapi.onrender.com/validate/jwt/access",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            credentials: "include",
          }
        );

        if (validationResponse.ok) {
          setUser({ loggedIn: true });
        } else {
          console.warn("⚠️ Access токен недействителен. Пытаемся обновить...");
          const newAccessToken = await refreshAccessToken();

          if (newAccessToken) {
            setUser({ loggedIn: true });
          } else {
            setUser(null);
          }
        }
      }
    } catch (error) {
      console.error("❌ Ошибка при проверке токенов:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [refreshAccessToken]);

  useEffect(() => {
    if (!cookiesBlocked) {
      checkTokens();

      const interval = setInterval(() => {
        console.log("🔄 Периодическая проверка токенов...");
        checkTokens();
      }, 5 * 60 * 1000);

      return () => {
        console.log("🛑 Очищаем интервал проверки токенов...");
        clearInterval(interval);
      };
    }
  }, [checkTokens, cookiesBlocked]);

  const login = (access, refresh) => {
    if (typeof access !== "string" || typeof refresh !== "string") {
      throw new Error("Токены должны быть строками!");
    }

    Cookies.set("access", access, { path: "/", secure: true, sameSite: "None", expires: 1 });
    const currentRefresh = Cookies.get("refresh");
    if (!currentRefresh || currentRefresh !== refresh) {
      Cookies.set("refresh", refresh, { path: "/", secure: true, sameSite: "None", expires: 7 });
    } else {
      console.log("ℹ️ Refresh токен не изменился, пропускаем обновление.");
    }

    setUser({ loggedIn: true });
  };

  // Если куки заблокированы, показываем только уведомление
  if (cookiesBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white/95 backdrop-blur-lg p-8 sm:p-10 rounded-3xl shadow-2xl max-w-md w-full mx-4 border border-blue-100/50 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-blue-900 tracking-tight">
            Необходимо разрешить куки
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8">
            {isSafariOnIPhone() ? (
              <>
                Для корректной работы сайта необходимо отключить настройку "Предотвращение межсайтового отслеживания" в Safari:
                <br />
                1. Откройте <strong>Настройки</strong> → <strong>Safari</strong>.
                <br />
                2. Выключите <strong>"Предотвращение межсайтового отслеживания"</strong>.
                <br />
                Подробная инструкция{" "}
                <a
                  href="https://support.apple.com/ru-ru/guide/safari/sfri40596/mac"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-blue-600 hover:text-blue-800"
                >
                  здесь
                </a>.
              </>
            ) : (
              "Для корректной работы сайта разрешите куки в настройках браузера."
            )}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold py-2 sm:py-3 px-6 sm:px-8 rounded-xl shadow-md transition-all hover:bg-blue-600 hover:shadow-blue-400/50 hover:scale-105 active:scale-95"
          >
            Обновить страницу
          </button>
        </div>
      </div>
    );
  }

  // Если проверка куки ещё не завершена, показываем загрузку
  if (!cookieCheckDone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white/95 backdrop-blur-lg p-8 sm:p-10 rounded-3xl shadow-2xl max-w-md w-full mx-4 border border-blue-100/50 text-center">
          <div className="flex justify-center mb-6 sm:mb-8">
            <svg
              className="w-16 h-16 sm:w-20 sm:h-20 text-blue-600 animate-spin-slow"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 text-blue-900 tracking-tight">
            Проверка настроек...
          </h2>
          <div className="relative w-full h-3 sm:h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-load" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ user, login, logout, loading, fetchWithAuth }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);