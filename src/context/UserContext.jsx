import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";

const UserContext = createContext();

export const UserProvider = ({ children, navigate }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedAccessToken = localStorage.getItem("accessToken");
      const storedRefreshToken = localStorage.getItem("refreshToken");

      

      if (!storedAccessToken || !storedRefreshToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      setAccessToken(storedAccessToken);
      setRefreshToken(storedRefreshToken);

      try {
        const validateResponse = await fetch(
          `${process.env.REACT_APP_DOMAIN_REGISTRATION}/validate/jwt/user/${storedAccessToken}/${storedRefreshToken}`,
          { method: "GET" }
        );

       

        if (!validateResponse.ok) {
          throw new Error(`Ошибка проверки токенов: ${validateResponse.status}`);
        }

        const validateData = await validateResponse.json();

        if (validateData.result === false) {
          throw new Error("Токены недействительны");
        }

        const userId = validateData.user_id;
        if (!userId) {
          throw new Error("user_id не получен");
        }

        setUser({
          loggedIn: true,
          id: userId,
        });
      } catch (error) {
        console.error("[UserContext] Ошибка в initializeAuth:", error.message);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
        toast.error("Сессия истекла. Пожалуйста, войдите снова.");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const fetchWithAuth = useCallback(
    async (url, options = {}, tempAccessToken = accessToken, tempRefreshToken = refreshToken) => {
      const headers = {
        ...options.headers,
        "Content-Type": "application/json",
        "X-Access-Token": tempAccessToken,
        "X-Refresh-Token": tempRefreshToken,
      };

      

      try {
        const response = await fetch(url, {
          ...options,
          headers,
        });

         

        if (response.status === 401) {
          console.error("[UserContext] Ошибка 401: Недействительные токены");
          logout();
          return null;
        }

        return response;
      } catch (error) {
        console.error("[UserContext] Ошибка fetchWithAuth:", error.message);
        return null;
      }
    },
    [accessToken, refreshToken]
  );

  const login = useCallback(
    async (access, refresh) => {
       

      if (typeof access !== "string" || typeof refresh !== "string") {
        console.error("[UserContext] Ошибка: Токены должны быть строками");
        toast.error("Некорректные токены.");
        return false;
      }

      try {
        const validateResponse = await fetch(
          `${process.env.REACT_APP_DOMAIN_REGISTRATION}/validate/jwt/user/${access}/${refresh}`,
          { method: "GET" }
        );

        

        if (!validateResponse.ok) {
          throw new Error(`Ошибка проверки токенов: ${validateResponse.status}`);
        }

        const validateData = await validateResponse.json();

        if (validateData.result === false) {
          throw new Error("Недействительные токены");
        }

        const userId = validateData.user_id;
        if (!userId) {
          throw new Error("user_id не получен");
        }

        localStorage.setItem("accessToken", access);
        localStorage.setItem("refreshToken", refresh);
        setAccessToken(access);
        setRefreshToken(refresh);

        setUser({
          loggedIn: true,
          id: userId,
        });

        toast.success("Авторизация успешна!");
        return true;
      } catch (error) {
        console.error("[UserContext] Ошибка логина:", error.message);
        toast.error("Ошибка авторизации: " + error.message);
        return false;
      }
    },
    [fetchWithAuth]
  );

  const logout = useCallback(async () => {
    try {
      const response = await fetchWithAuth(
        `${process.env.REACT_APP_DOMAIN_PERSONAL}/logout/`,
        { method: "GET" }
      );
      
      if (response && response.ok) {
        toast.success("Вы успешно вышли!");
      }
    } catch (error) {
      console.error("[UserContext] Ошибка логаута:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      navigate("/");
    }
  }, [navigate, fetchWithAuth]);

  return (
    <UserContext.Provider
      value={{ user, loading, login, logout, fetchWithAuth }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);