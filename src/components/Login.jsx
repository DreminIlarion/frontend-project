import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useUser } from "../context/UserContext";
import Cookies from "js-cookie";

const Login = () => {
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isFormLoading, setIsFormLoading] = useState(false); // Для формы
  const [isVkLoading, setIsVkLoading] = useState(false); // Для VK
  const [isYandexLoading, setIsYandexLoading] = useState(false); // Для Яндекс
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser();

  // Проверка, чтобы избежать повторных вызовов OAuth после возвращения
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      setIsVkLoading(false);
      setIsYandexLoading(false);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsFormLoading(true);

    const body = isPhoneLogin
      ? { phone_number: phoneNumber, hash_password: password }
      : { email: email, hash_password: password };

    const loginEndpoint = isPhoneLogin
      ? "/api/v1/authorizations/login/phone/number"
      : "/api/v1/authorizations/login/email";

    try {
      const response = await fetch(`${process.env.REACT_APP_DOMAIN_REGISTRATION}${loginEndpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data1 = await response.json();
        const data = data1;
        const { access, refresh } = data;

        if (typeof access !== "string" || typeof refresh !== "string") {
          console.error("Ошибка: Токены должны быть строками!");
          toast.error("Ошибка авторизации: некорректные токены.");
          return;
        }

        Cookies.set("access", access);
        Cookies.set("refresh", refresh);

        login(access, refresh);
        toast.success("Вход выполнен успешно!");
        setTimeout(() => {
          navigate("/profile");
          // Убрали window.location.reload(), чтобы избежать лишней перезагрузки
        }, 100);
      } else {
        const errorData = await response.json();
        if (
          errorData.message === "Ошибка в методе get_user_phone_number класса CRUD" ||
          errorData.message === "Ошибка в методе get_user_email класса CRUD"
        ) {
          toast.error("Сначала зарегистрируйтесь.");
          setTimeout(() => {
            navigate("/register");
          }, 1500);
        } else {
          toast.error(errorData.message || "Ошибка авторизации.");
        }
      }
    } catch (error) {
      console.error("Ошибка при авторизации:", error);
      toast.error("Ошибка соединения с сервером.");
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleOAuthRedirect = async (provider) => {
    const setLoading = provider === "vk" ? setIsVkLoading : setIsYandexLoading;
    setLoading(true);

    // Проверяем, не возвращаемся ли мы с OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      setLoading(false);
      return;
    }

    try {
      const sessionId = Date.now().toString();
      const state = JSON.stringify({ sessionId, action: "login" });
      const response = await fetch(`${process.env.REACT_APP_LINK}${provider}/link?state=${state}`, {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403 || errorData.message === "User not registered") {
          toast.error("Войдите в аккаунт и зарегистрируйтесь в дополнительных сервисах.");
          return;
        }
        throw new Error(`Ошибка ${response.status}`);
      }

      const data1 = await response.json();
      const data = data1;

      if (data.url && data.code_verifier) {
        const urlParams = new URLSearchParams(new URL(data.url).search);
        const stateFromUrl = urlParams.get("state") || state;
        localStorage.setItem(`${provider}_code_verifier_${sessionId}`, data.code_verifier);
        localStorage.setItem(`${provider}_session_id`, sessionId);
        localStorage.setItem(`${provider}_action`, "login");
        
        window.location.href = data.url;
      } else {
        toast.error("Ошибка: Неверный формат ответа от сервера.");
      }
    } catch (error) {
      console.error("Ошибка при получении ссылки:", error);
      toast.error("Ошибка сети или сервера.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-500 to-indigo-100">
      <Toaster position="top-right" />
      <div className="bg-white/95 backdrop-blur-lg p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md sm:max-w-lg mx-4 transition-all duration-300 hover:shadow-blue-200/50 animate-fadeIn">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-10 text-blue-900 tracking-tight">
          Вход в аккаунт
        </h2>
        <form onSubmit={handleLogin}>
          <div className="flex justify-center mb-6 sm:mb-8 gap-2">
            <button
              type="button"
              className={`flex-1 py-3 px-4 sm:px-6 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 shadow-md ${
                !isPhoneLogin
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/50"
                  : "bg-gray-200 text-gray-700 hover:shadow-gray-300/50"
              }`}
              onClick={() => setIsPhoneLogin(false)}
            >
              Через Email
            </button>
            <button
              type="button"
              className={`flex-1 py-3 px-4 sm:px-6 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 shadow-md ${
                isPhoneLogin
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/50"
                  : "bg-gray-200 text-gray-700 hover:shadow-gray-300/50"
              }`}
              onClick={() => setIsPhoneLogin(true)}
            >
              Через Телефон
            </button>
          </div>

          {!isPhoneLogin ? (
            <div className="mb-6 sm:mb-8">
              <label htmlFor="email" className="block text-sm sm:text-base font-semibold mb-2 text-gray-800">
                Электронная почта
              </label>
              <input
                required
                id="email"
                type="email"
                className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl bg-gray-50/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 transition-all duration-300 hover:shadow-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введите ваш email"
              />
            </div>
          ) : (
            <div className="mb-6 sm:mb-8">
              <label htmlFor="phone_number" className="block text-sm sm:text-base font-semibold mb-2 text-gray-800">
                Номер телефона
              </label>
              <input
                required
                id="phone_number"
                type="tel"
                className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl bg-gray-50/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 transition-all duration-300 hover:shadow-md"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+79..."
              />
            </div>
          )}

          <div className="mb-8 sm:mb-10">
            <label htmlFor="password" className="block text-sm sm:text-base font-semibold mb-2 text-gray-800">
              Пароль
            </label>
            <input
              required
              id="password"
              type="password"
              className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl bg-gray-50/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 transition-all duration-300 hover:shadow-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
            />
          </div>

          <button
            type="submit"
            className={`w-full py-3 sm:py-4 text-white font-bold rounded-xl shadow-lg transition-all duration-300 ${
              isFormLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/50 hover:scale-105 active:scale-95"
            }`}
            disabled={isFormLoading}
          >
            {isFormLoading ? (
              <div className="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin mx-auto"></div>
            ) : (
              "Войти"
            )}
          </button>
        </form>

        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-sm sm:text-base font-medium mb-4 text-gray-700">Или войдите через:</p>
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            <button
              onClick={() => handleOAuthRedirect("vk")}
              className={`flex items-center justify-center gap-2 h-12 sm:h-14 rounded-xl font-bold text-white bg-[#0077FF] transition-all hover:bg-[#005BBF] hover:shadow-blue-500/50 active:scale-95 shadow-md ${
                isVkLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isVkLoading}
            >
              {isVkLoading ? (
                <div className="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
              ) : (
                "VK ID"
              )}
            </button>

            <button
              onClick={() => handleOAuthRedirect("yandex")}
              className={`flex items-center justify-center gap-2 h-12 sm:h-14 rounded-xl font-bold text-white bg-red-600 transition-all hover:bg-red-700 hover:shadow-red-500/50 active:scale-95 shadow-md ${
                isYandexLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isYandexLoading}
            >
              {isYandexLoading ? (
                <div className="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
              ) : (
                "Яндекс"
              )}
            </button>
          </div>
          <p className="mt-4 text-xs sm:text-sm text-gray-600 italic">
            Вход через VK или Яндекс доступен только после регистрации в этих сервисах. Зарегистрируйтесь в них в личном кабинете после входа в аккаунт.
          </p>
        </div>

        <p className="mt-6 sm:mt-8 text-center text-sm sm:text-base text-gray-700">
          Нет аккаунта?{" "}
          <span
            role="link"
            tabIndex={0}
            onClick={() => navigate("/registration")}
            className="cursor-pointer underline text-blue-600 font-semibold hover:text-blue-800 transition-colors duration-200"
          >
            Зарегистрируйтесь
          </span>
        </p>

        <div className="mt-4 sm:mt-6 text-center">
          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold py-2 sm:py-3 px-6 sm:px-8 rounded-xl shadow-md transition-all hover:bg-blue-600 hover:shadow-blue-400/50 hover:scale-105 active:scale-95"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;