import { useEffect } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { provider } = useParams(); // "vk" или "yandex"

  useEffect(() => {
    const code = searchParams.get("code");
    const deviceId = searchParams.get("device_id"); // Извлекаем device_id из query-параметров

    console.log("OAuthCallback: Начало выполнения");
    console.log("Provider из useParams:", provider);
    console.log("Code из searchParams:", code);
    console.log("Device ID из searchParams:", deviceId);
    console.log("Полный URL:", window.location.href);
    console.log("Search Params:", Object.fromEntries(searchParams));

    // Fallback для provider
    const inferredProvider = window.location.href.includes("vk") ? "vk" : window.location.href.includes("yandex") ? "yandex" : null;

    if (!code || (!provider && !inferredProvider)) {
      console.error("Отсутствует code или provider", { code, provider, inferredProvider });
      return;
    }
    if (provider === "vk" && !deviceId) {
      console.error("Отсутствует device_id для VK", { deviceId });
      return;
    }

    const finalProvider = provider || inferredProvider;
    console.log("Используемый provider:", finalProvider);

    const exchangeToken = async () => {
      try {
        console.log("Запуск exchangeToken для провайдера:", finalProvider);
        const codeVerifier = localStorage.getItem(`${finalProvider}_code_verifier`);
        console.log("Code Verifier из localStorage:", codeVerifier);
        if (!codeVerifier) {
          console.error("Отсутствует code_verifier для", finalProvider);
          return;
        }

        // Шаг 1: Получение токена от провайдера
        const tokenUrl =
          finalProvider === "vk"
            ? `https://personal-account-fastapi.onrender.com/api/v1/vk/get/token/${code}/${deviceId}/${codeVerifier}`
            : `https://personal-account-fastapi.onrender.com/api/v1/yandex/get/token/${code}/${codeVerifier}`;
        console.log("Запрос токена по URL:", tokenUrl);
        const tokenResponse = await fetch(tokenUrl, {
          method: "GET",
          credentials: "include", // Куки для personal-account-fastapi
        });
        const tokenData = await tokenResponse.json();
        console.log("Ответ от /get/token:", tokenData);

        if (tokenData.status_code === 200 && tokenData.body && tokenData.body.access_token) {
          const accessToken = tokenData.body.access_token; // Извлекаем access_token из body
          console.log("Access Token получен:", accessToken);

          // Шаг 2: Попытка логина
          const loginUrl = `https://registration-fastapi.onrender.com/api/v1/${finalProvider}/login/${accessToken}`;
          console.log("Запрос логина по URL:", loginUrl);
          const loginResponse = await fetch(loginUrl, { method: "POST" });
          const loginData = await loginResponse.json();
          console.log("Ответ от /login:", loginData);
          let finalAccess, finalRefresh;

          if (loginData.status_code === 200 && loginData.access && loginData.refresh) {
            console.log("Успешный вход");
            finalAccess = loginData.access;
            finalRefresh = loginData.refresh;
          } else {
            console.warn("Пользователь не найден, пробуем регистрацию...");

            // Шаг 3: Регистрация
            const registrationUrl = `https://personal-account-fastapi.onrender.com/api/v1/${finalProvider}/registration/${accessToken}`;
            console.log("Запрос регистрации по URL:", registrationUrl);
            const registrationResponse = await fetch(registrationUrl, {
              method: "POST",
              credentials: "include", // Куки для personal-account-fastapi
            });
            const registrationData = await registrationResponse.json();
            console.log("Ответ от /registration:", registrationData);

            if (registrationData.status_code === 200) {
              console.log("Регистрация успешна, выполняем логин для получения токенов...");

              // Шаг 4: Повторный вызов /login после регистрации
              const retryLoginResponse = await fetch(loginUrl, { method: "POST" });
              const retryLoginData = await retryLoginResponse.json();
              console.log("Ответ от повторного /login:", retryLoginData);

              if (retryLoginData.status_code === 200 && retryLoginData.access && retryLoginData.refresh) {
                finalAccess = retryLoginData.access;
                finalRefresh = retryLoginData.refresh;
              } else {
                console.error("Ошибка при повторном логине после регистрации", retryLoginData);
                return;
              }
            } else {
              console.error("Ошибка при регистрации", registrationData);
              return;
            }
          }

          // Шаг 5: Установка токенов
          if (finalAccess && finalRefresh) {
            const setTokenUrl = `https://personal-account-fastapi.onrender.com/set/token/${finalAccess}/${finalRefresh}`;
            console.log("Установка токенов по URL:", setTokenUrl);
            await fetch(setTokenUrl, {
              method: "POST",
              credentials: "include", // Куки для personal-account-fastapi
            });

            console.log("Сохранение токенов в куки:", { finalAccess, finalRefresh });
            document.cookie = `access=${finalAccess}; path=/; Secure; SameSite=Strict`;
            document.cookie = `refresh=${finalRefresh}; path=/; Secure; SameSite=Strict`;

            console.log("Перенаправление на /dashboard");
            navigate("/dashboard");
          } else {
            console.error("Токены не получены после всех шагов");
          }
        } else {
          console.error("Ошибка получения токена или неверный формат ответа", tokenData);
        }
      } catch (error) {
        console.error("Ошибка обмена токена:", error);
      }
    };

    exchangeToken();
  }, [provider, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-indigo-100">
      <div className="bg-white/90 backdrop-blur-lg p-8 rounded-3xl shadow-2xl max-w-md w-full mx-4 border border-blue-200/50 slide-in">
        <div className="flex justify-center mb-6">
          <svg
            className="w-16 h-16 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 11c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4m-8 0c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4m-4-8c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4 fade-in">
          Авторизация через{" "}
          {provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : "Неизвестный провайдер"}
        </h2>
        <p className="text-gray-600 text-center mb-6 slide-in">
          Пожалуйста, подождите, пока мы проверяем ваши данные...
        </p>
        <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-load" />
        </div>
        <div className="flex justify-center gap-2 mt-6">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: `${index * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;