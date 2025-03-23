import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";

const OAuthCallback = ({ provider }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get("code");

  useEffect(() => {
    if (!code) return;

    const exchangeToken = async () => {
      try {
        const codeVerifier = localStorage.getItem(`${provider}_code_verifier`);
        if (!codeVerifier) {
          console.error("Отсутствует code_verifier");
          return;
        }

        const tokenResponse = await fetch(
          `https://personal-account-fastapi.onrender.com/api/v1/${provider}/get/token/${code}/randomDeviceId/${codeVerifier}`
        );
        const tokenData = await tokenResponse.json();

        if (tokenData.status_code === 200) {
          const accessToken = tokenData.body.access;

          const loginResponse = await fetch(
            `https://registration-fastapi.onrender.com/api/v1/${provider}/login/${accessToken}`,
            { method: "POST" }
          );

          const loginData = await loginResponse.json();
          let finalAccess, finalRefresh;

          if (loginData.status_code === 200) {
            console.log("Успешный вход");
            finalAccess = loginData.body.access;
            finalRefresh = loginData.body.refresh;
          } else {
            console.warn("Пользователь не найден, пробуем регистрацию...");

            const registrationResponse = await fetch(
              `https://personal-account-fastapi.onrender.com/api/v1/${provider}/registration/${accessToken}`,
              { method: "POST" }
            );

            const registrationData = await registrationResponse.json();
            if (registrationData.status_code === 200) {
              console.log("Регистрация успешна, теперь можно войти");
              finalAccess = registrationData.body.access;
              finalRefresh = registrationData.body.refresh;
            } else {
              console.error("Ошибка при регистрации", registrationData);
              return;
            }
          }

          if (finalAccess && finalRefresh) {
            await fetch(
              `https://personal-account-fastapi.onrender.com/set/token/${finalAccess}/${finalRefresh}`,
              { method: "POST" }
            );

            document.cookie = `access=${finalAccess}; path=/; Secure; HttpOnly`;
            document.cookie = `refresh=${finalRefresh}; path=/; Secure; HttpOnly`;

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
      <div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white/90 backdrop-blur-lg p-8 rounded-3xl shadow-2xl max-w-md w-full mx-4 border border-blue-200/50"
      >
        {/* Логотип или иконка */}
        <div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="flex justify-center mb-6"
        >
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

        {/* Заголовок */}
        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-4">
          Авторизация через {provider.charAt(0).toUpperCase() + provider.slice(1)}
        </h2>

        {/* Текст состояния */}
        <p className="text-gray-600 text-center mb-6">
          Пожалуйста, подождите, пока мы проверяем ваши данные...
        </p>

        {/* Полоса загрузки */}
        <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Дополнительная анимация точек */}
        <div
          className="flex justify-center gap-2 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="w-3 h-3 bg-blue-500 rounded-full"
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: index * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;