import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserFromCookies = async () => {
      const access = Cookies.get("access");
      const refresh = Cookies.get("refresh");

      if (access && refresh) {
        try {
          const response = await fetch(
            `https://personal-account-fastapi.onrender.com/get/token/${access}/${refresh}`,
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
      }
      setLoading(false);
    };

    loadUserFromCookies();
  }, []); // Убрал сложные зависимости

  const login = (userData, access, refresh) => {
    setUser(userData);
    Cookies.set("access", access, { path: "/", secure: true, sameSite: "None", expires: 1 });
    Cookies.set("refresh", refresh, { path: "/", secure: true, sameSite: "None", expires: 7 });
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
