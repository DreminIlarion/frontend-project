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
  
      console.log("Access Token из Cookies:", accessToken);
      console.log("Refresh Token из Cookies:", refreshToken);
  
      // Проверяем, что токены существуют и являются строками
      if (!accessToken || !refreshToken) {
        console.error("❌ Ошибка: Токены отсутствуют!");
        setUser(null);
        return;
      }
  
      if (typeof accessToken !== "string" || typeof refreshToken !== "string") {
        console.error("❌ Ошибка: Токены должны быть строками.");
        setUser(null);
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
      console.log("Ответ сервера:", data);
  
      if (data.status_code === 200 && data.detail === "OK") {
        setUser({ loggedIn: true });
      } else {
        console.log("❌ Ошибка проверки токенов, разлогиниваем.");
        setUser(null);
      }
    } catch (error) {
      console.error("❌ Ошибка при проверке токенов:", error);
      setUser(null);
    }
  };
  

  // Проверка токенов при монтировании компонента
  useEffect(() => {
    fetchToken();
  }, []);

  // Логика входа
  const login = (access, refresh) => {
    console.log("Access Token до сохранения:", access);
    console.log("Refresh Token до сохранения:", refresh);
  
    // Убедимся, что это строки, а не объекты
    if (typeof access !== "string") {
      console.error("❌ Ошибка: accessToken не является строкой!");
    }
    if (typeof refresh !== "string") {
      console.error("❌ Ошибка: refreshToken не является строкой!");
    }
  
    Cookies.set("access", access, { path: "/", secure: true, sameSite: "None", expires: 1 });
    Cookies.set("refresh", refresh, { path: "/", secure: true, sameSite: "None", expires: 7 });
  
    setUser({ loggedIn: true });
    if (navigate) navigate("/profile");
  };
  
  
  
  
  return (
    <UserContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
