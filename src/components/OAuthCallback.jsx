import { useEffect } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { provider } = useParams(); // "vk" или "yandex" из URL (/oauth/vk/callback или /oauth/yandex/callback)
  const code = searchParams.get("code");

  useEffect(() => {
    if (!code || !provider) {
      console.error("Отсутствует code или provider");
      return;
    }

    const exchangeToken = async () => {
      try {
        const codeVerifier = localStorage.getItem(`${provider}_code_verifier`);
        if (!codeVerifier) {
          console.error("Отсутствует code_verifier");
          return;
        }

        // Шаг 1: Получение токена от провайдера (на personal-account-fastapi)
        const tokenUrl =
          provider === "vk"
            ? `https://personal-account-fastapi.onrender.com/api/v1/vk/get/token/${code}/randomDeviceId/${codeVerifier}`
            : `https://personal-account-fastapi.onrender.com/api/v1/yandex/get/token/${code}/${codeVerifier}`;
        const tokenResponse = await fetch(tokenUrl, { method: "GET" });
        const tokenData = await tokenResponse.json();

        if (tokenData.status_code === 200) {
          const accessToken = tokenData.body.access;

          // Шаг 2: Попытка логина (на registration-fastapi)
          const loginUrl = `https://registration-fastapi.onrender.com/api/v1/${provider}/login/${accessToken}`;
          const loginResponse = await fetch(loginUrl, { method: "POST" });
          const loginData = await loginResponse.json();
          let finalAccess, finalRefresh;

          if (loginData.status_code === 200) {
            console.log("Успешный вход");
            finalAccess = loginData.body.access;
            finalRefresh = loginData.body.refresh;
          } else {
            console.warn("Пользователь не найден, пробуем регистрацию...");

            // Шаг 3: Регистрация, если логин не удался (на personal-account-fastapi)
            const registrationUrl = `https://personal-account-fastapi.onrender.com/api/v1/${provider}/registration/${accessToken}`;
            const registrationResponse = await fetch(registrationUrl, { method: "POST" });
            const registrationData = await registrationResponse.json();

            if (registrationData.status_code === 200) {
              console.log("Регистрация успешна");
              finalAccess = registrationData.body.access;
              finalRefresh = registrationData.body.refresh;
            } else {
              console.error("Ошибка при регистрации", registrationData);
              return;
            }
          }

          // Шаг 4: Установка токенов и сохранение в куки
          if (finalAccess && finalRefresh) {
            const setTokenUrl = `https://personal-account-fastapi.onrender.com/set/token/${finalAccess}/${finalRefresh}`;
            await fetch(setTokenUrl, { method: "POST", credentials: "include" });

            // Сохранение токенов в куки
            document.cookie = `access=${finalAccess}; path=/; Secure; SameSite=Strict`;
            document.cookie = `refresh=${finalRefresh}; path=/; Secure; SameSite=Strict`;

            navigate("/dashboard");
          }
        } else {
          console.error("Ошибка получения токена", tokenData);
        }
      } catch (error) {
        console.error("Ошибка обмена токена:", error);
      }
    };

    exchangeToken();
  }, [code, provider, navigate]);

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
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-load"
          />
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