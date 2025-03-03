import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import Cookies from "js-cookie";

const UserContext = createContext();

export const UserProvider = ({ children, navigate }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Логика выхода
  const logout = useCallback(() => {
    setUser(null);  // Сбрасываем состояние пользователя
    Cookies.remove("access");
    Cookies.remove("refresh");
    if (navigate) navigate("/login");
  }, [navigate]);

  // Проверка токенов и авторизация пользователя
  const fetchToken = async () => {
    try {
      const accessToken = Cookies.get("access");
      const refreshToken = Cookies.get("refresh");

      if (!accessToken || !refreshToken) {
        console.log("⚠ Токены отсутствуют, разлогиниваем.");
        setUser(null);  // Если нет токенов, сбрасываем пользователя
        return;
      }

      const response = await fetch(
        `https://personal-account-fastapi.onrender.com/get/token/${accessToken}/${refreshToken}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();
      console.log("Полученные данные:", data);

      if (data.status_code === 200 && data.detail === "OK") {
        setUser({ loggedIn: true });  // Если токены валидны, устанавливаем пользователя
      } else {
        console.log("❌ Ошибка при проверке токенов, разлогиниваем.");
        setUser(null);  // Если токены не валидны, разлогиниваем
      }
    } catch (error) {
      console.error("Ошибка при проверке токенов:", error);
      setUser(null);  // В случае ошибки разлогиниваем
    }
  };

  // Проверка токенов при монтировании компонента
  useEffect(() => {
    fetchToken();
  }, []);

  // Логика входа
  const login = (access, refresh) => {
    Cookies.set("access", access, { path: "/", secure: true, sameSite: "None", expires: 1 });
    Cookies.set("refresh", refresh, { path: "/", secure: true, sameSite: "None", expires: 7 });
    setUser({ loggedIn: true });  // Устанавливаем пользователя как авторизованного
    if (navigate) navigate("/profile");
  };

  return (
    <UserContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
