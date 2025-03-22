import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

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

        // Получаем access-токен
        const tokenResponse = await fetch(
          `https://personal-account-fastapi.onrender.com/api/v1/${provider}/get/token/${code}/randomDeviceId/${codeVerifier}`
        );
        const tokenData = await tokenResponse.json();

        if (tokenData.status_code === 200) {
          const accessToken = tokenData.body.access;

          // Пробуем логин
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

            // Если логин не удался — делаем регистрацию
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
            // Отправляем токены на set/token
            await fetch(
              `https://personal-account-fastapi.onrender.com/set/token/${finalAccess}/${finalRefresh}`,
              { method: "POST" }
            );

            // Сохраняем токены в cookies
            document.cookie = `access=${finalAccess}; path=/; Secure; HttpOnly`;
            document.cookie = `refresh=${finalRefresh}; path=/; Secure; HttpOnly`;

            navigate("/dashboard"); // Перенаправляем на личный кабинет
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

  return <div>Авторизация...</div>;
};

export default OAuthCallback;
