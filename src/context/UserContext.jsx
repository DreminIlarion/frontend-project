import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const access = Cookies.get("access");
      const refresh = Cookies.get("refresh");

      if (!access || !refresh) {
        console.log("⚠ Токены отсутствуют, требуется авторизация.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://personal-account-fastapi.onrender.com/get/token/${access}/${refresh}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );

        const data = await response.json();
        console.log("🔍 Ответ от сервера при проверке токена:", data);

        if (response.ok && data.user) {
          setUser(data.user);
        } else {
          console.log("❌ Сервер не вернул пользователя, разлогиниваем.");
          logout();
        }
      } catch (error) {
        console.error("❌ Ошибка при проверке токенов:", error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData, access, refresh) => {
    setUser(userData);
    Cookies.set("access", access, {
      path: "/",
      secure: true,
      sameSite: "None",
      expires: 1,
    });
    Cookies.set("refresh", refresh, {
      path: "/",
      secure: true,
      sameSite: "None",
      expires: 7,
    });
  };

  const logout = () => {
    setUser(null);
    Cookies.remove("access");
    Cookies.remove("refresh");
  };

  return (
    <UserContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
