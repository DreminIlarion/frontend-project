import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useUser } from "../context/UserContext";
import { EnvelopeIcon, PhoneIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const Login = () => {
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isVkLoading, setIsVkLoading] = useState(false);
  const [isYandexLoading, setIsYandexLoading] = useState(false);
  const [isPhoneLogin, setIsPhoneLogin] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");

    if (code && state) {
      handleOAuthCallback(code, state);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsFormLoading(true);

    const body = isPhoneLogin
      ? { phone_number: phoneNumber, hash_password: password }
      : { email, hash_password: password };

    const loginEndpoint = isPhoneLogin
      ? "/api/v1/authorizations/login/phone/number"
      : "/api/v1/authorizations/login/email";

    try {
      const response = await fetch(
        `${process.env.REACT_APP_DOMAIN_REGISTRATION}${loginEndpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

     
      if (!response.ok) {
        const errorData = await response.json();
        console.error("[Login] Ошибка сервера:", errorData);
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
        return;
      }

      const data = await response.json();

      const { access, refresh } = data;
      if (typeof access !== "string" || typeof refresh !== "string") {
        console.error("[Login] Ошибка: Токены должны быть строками:", { access, refresh });
        toast.error("Некорректные токены.");
        return;
      }

      
      const loginSuccess = await login(access, refresh);

      if (loginSuccess) {
        toast.success("Вход выполнен успешно!");
        setTimeout(() => {
          navigate("/");
        }, 100);
      } else {
        console.error("[Login] Функция login вернула false");
        toast.error("Ошибка авторизации. Попробуйте снова.");
      }
    } catch (error) {
      console.error("[Login] Ошибка при авторизации:", error.message);
      toast.error("Ошибка при вводе почты, проверьте данные");
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleOAuthRedirect = async (provider) => {
    const setLoading = provider === "vk" ? setIsVkLoading : setIsYandexLoading;
    setLoading(true);

    try {
      const sessionId = Date.now().toString();
      const state = JSON.stringify({ sessionId, action: "login", provider });

      const response = await fetch(
        `inheritance${process.env.REACT_APP_DOMAIN_REGISTRATION}/api/v1/${provider}/link?state=${state}`,
        { method: "GET" }
      );

        

      if (!response.ok) {
        const errorData = await response.json();
        console.error("[Login] Ошибка получения ссылки:", errorData);
        if (response.status === 403 || errorData.message === "User not registered") {
          toast.error("Войдите и зарегистрируйтесь в дополнительных сервисах.");
        } else {
          toast.error(`Ошибка ${response.status}`);
        }
        return;
      }

      const data = await response.json();

      if (data.url && data.code_verifier) {
        localStorage.setItem(`${provider}_code_verifier_${sessionId}`, data.code_verifier);
        localStorage.setItem(`${provider}_session_id`, sessionId);
        localStorage.setItem(`${provider}_action`, "login");

        window.location.href = data.url;
      } else {
        console.error("[Login] Неверный формат ответа:", data);
        toast.error("Ошибка: Неверный формат ответа от сервера.");
      }
    } catch (error) {
      console.error("[Login] Ошибка при получении ссылки OAuth:", error.message);
      toast.error("Ошибка сети или сервера.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthCallback = async (code, state) => {
    let provider, sessionId;
    try {
      const stateObj = JSON.parse(state);
      provider = stateObj.provider;
      sessionId = stateObj.sessionId;
    } catch (error) {
      console.error("[Login] Ошибка парсинга state:", error.message);
      toast.error("Ошибка обработки OAuth.");
      return;
    }

    const setLoading = provider === "vk" ? setIsVkLoading : setIsYandexLoading;
    setLoading(true);

    try {
      const codeVerifier = localStorage.getItem(`${provider}_code_verifier_${sessionId}`);
      const action = localStorage.getItem(`${provider}_action`);
      
      if (!codeVerifier || action !== "login") {
        console.error("[Login] Отсутствует code_verifier или неверное action");
        toast.error("Ошибка OAuth: Неверные параметры.");
        return;
      }

      const deviceId = provider === "vk" ? sessionId : undefined;
      const tokenEndpoint =
        provider === "vk"
          ? `/api/v1/vk/get/token/${code}/${deviceId}/${codeVerifier}`
          : `/api/v1/yandex/get/token/${code}/${codeVerifier}`;

      const response = await fetch(
        `${process.env.REACT_APP_DOMAIN_REGISTRATION}${tokenEndpoint}`,
        { method: "GET" }
      );

     

      if (!response.ok) {
        const errorData = await response.json();
        console.error("[Login] Ошибка получения токенов:", errorData);
        toast.error(errorData.message || "Ошибка OAuth.");
        return;
      }

      const data = await response.json();

      const { access, refresh } = data;
      if (typeof access !== "string" || typeof refresh !== "string") {
        console.error("[Login] Ошибка: Токены должны быть строками:", { access, refresh });
        toast.error("Некорректные токены.");
        return;
      }

        
      const loginSuccess = await login(access, refresh);

      if (loginSuccess) {
        toast.success("Вход через " + provider + " успешен!");
        localStorage.removeItem(`${provider}_code_verifier_${sessionId}`);
        localStorage.removeItem(`${provider}_session_id`);
        localStorage.removeItem(`${provider}_action`);
        setTimeout(() => {
          navigate("/");
        }, 100);
      } else {
        console.error("[Login] Функция login вернула false");
        toast.error("Ошибка авторизации через " + provider + ".");
      }
    } catch (error) {
      console.error("[Login] Ошибка в OAuth callback:", error.message);
      toast.error("Ошибка обработки OAuth.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-blue-900">
      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-slideIn {
            animation: slideIn 0.5s ease-out;
          }
        `}
      </style>
      <Toaster position="top-right" />
      <div className="bg-blue-50 p-8 rounded-xl shadow-xl w-full max-w-md mx-4 border border-blue-500 animate-slideIn">
        <h2 className="text-3xl font-semibold text-center mb-8 text-blue-900">
          Авторизация
        </h2>
        <form onSubmit={handleLogin}>
          <div className="flex justify-center mb-6">
            <div className="flex bg-blue-100 rounded-lg p-1">
              <button
                type="button"
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  !isPhoneLogin
                    ? "bg-blue-600 text-white"
                    : "bg-transparent text-blue-600"
                }`}
                onClick={() => setIsPhoneLogin(false)}
              >
                Email
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                  isPhoneLogin
                    ? "bg-blue-600 text-white"
                    : "bg-transparent text-blue-600"
                }`}
                onClick={() => setIsPhoneLogin(true)}
              >
                Телефон
              </button>
            </div>
          </div>

          {!isPhoneLogin ? (
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-blue-900">
                Электронная почта
              </label>
              <div className="relative">
                <EnvelopeIcon className="w-5 h-5 text-blue-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  required
                  id="email"
                  type="email"
                  className="w-full pl-10 p-3 border border-blue-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 transition-all duration-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Введите email"
                />
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <label htmlFor="phone_number" className="block text-sm font-medium mb-2 text-blue-900">
                Номер телефона
              </label>
              <div className="relative">
                <PhoneIcon className="w-5 h-5 text-blue-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  required
                  id="phone_number"
                  type="tel"
                  className="w-full pl-10 p-3 border border-blue-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 transition-all duration-200"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+79..."
                />
              </div>
            </div>
          )}

          <div className="mb-8">
            <label htmlFor="password" className="block text-sm font-medium mb-2 text-blue-900">
              Пароль
            </label>
            <div className="relative">
              <LockClosedIcon className="w-5 h-5 text-blue-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                required
                id="password"
                type={showPassword ? "text" : "password"}
                className="w-full pl-10 pr-12 p-3 border border-blue-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 transition-all duration-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-600"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-3 bg-blue-600 text-white font-medium rounded-lg transition-all duration-200 hover:bg-blue-700 hover:scale-105 shadow-blue-500/20 ${
              isFormLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isFormLoading}
          >
            {isFormLoading ? (
              <div className="w-5 h-5 border-3 border-t-transparent border-white rounded-full animate-spin mx-auto"></div>
            ) : (
              "Войти"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm font-medium mb-4 text-gray-600">Или войдите через:</p>
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => handleOAuthRedirect("vk")}
              className={`flex items-center justify-center h-12 rounded-lg font-medium text-white bg-blue-500 transition-all duration-200 hover:bg-blue-600 shadow-blue-500/20 ${
                isVkLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isVkLoading}
            >
              {isVkLoading ? (
                <div className="w-5 h-5 border-3 border-t-transparent border-white rounded-full animate-spin"></div>
              ) : (
                <>
                  
                  VK ID
                </>
              )}
            </button>

            <button
              onClick={() => handleOAuthRedirect("yandex")}
              className={`flex items-center justify-center h-12 rounded-lg font-medium text-white bg-red-500 transition-all duration-200 hover:bg-red-600 shadow-blue-500/20 ${
                isYandexLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isYandexLoading}
            >
              {isYandexLoading ? (
                <div className="w-5 h-5 border-3 border-t-transparent border-white rounded-full animate-spin"></div>
              ) : (
                <>
                  
                  Яндекс
                </>
              )}
            </button>
          </div>
          <p className="mt-4 text-xs text-gray-600">
            Вход через VK или Яндекс доступен после регистрации в сервисах в личном кабинете.
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Нет аккаунта?{" "}
          <span
            role="link"
            tabIndex={0}
            onClick={() => navigate("/register")}
            className="cursor-pointer text-blue-600 font-medium hover:text-blue-700 transition-colors duration-200"
          >
            Зарегистрируйтесь
          </span>
        </p>

        <div className="mt-4 text-center">
          <button
            onClick={() => navigate("/")}
            className="py-3 px-6 bg-blue-600 text-white font-medium rounded-lg transition-all duration-200 hover:bg-blue-700 hover:scale-105 shadow-blue-500/20"
          >
            На главную
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;