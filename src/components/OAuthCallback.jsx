import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";

const REGISTRATION_BASE_URL = "https://personal-account-c98o.onrender.com";
const LOGIN_BASE_URL = "https://registration-s6rk.onrender.com";

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { provider } = useParams();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    console.log("Начало выполнения useEffect в OAuthCallback");

    const code = searchParams.get("code");
    const deviceId = searchParams.get("device_id");
    let sessionId = searchParams.get("state");

    console.log("Полученные параметры из URL:", { code, deviceId, sessionId, provider });

    const inferredProvider = window.location.href.includes("vk") ? "vk" : window.location.href.includes("yandex") ? "yandex" : null;
    const finalProvider = provider || inferredProvider;

    if (!code || !finalProvider) {
      console.error("Отсутствует code или provider", { code, provider, inferredProvider });
      toast.error("Ошибка: отсутствует код авторизации или провайдер.");
      return;
    }
    if (finalProvider === "vk" && !deviceId) {
      console.error("Отсутствует device_id для VK", { deviceId });
      toast.error("Ошибка: отсутствует device_id для VK.");
      return;
    }

    let action = "register";
    if (sessionId) {
      try {
        const parsedState = JSON.parse(sessionId);
        sessionId = parsedState.sessionId;
        action = parsedState.action || "register";
      } catch (error) {
        console.warn("State не является валидным JSON, используем localStorage:", error);
        sessionId = localStorage.getItem(`${finalProvider}_session_id`);
        action = localStorage.getItem(`${finalProvider}_action`) || "register";
      }
    } else {
      sessionId = localStorage.getItem(`${finalProvider}_session_id`);
      action = localStorage.getItem(`${finalProvider}_action`) || "register";
    }
    console.log("Данные из localStorage:", { sessionId, action });

    const exchangeToken = async () => {
      try {
        const codeVerifier = localStorage.getItem(`${finalProvider}_code_verifier_${sessionId}`);
        console.log("Получен codeVerifier из localStorage:", { codeVerifier });

        if (!codeVerifier) {
          throw new Error("Отсутствует code_verifier в localStorage");
        }

        // Выбор базового URL в зависимости от действия
        const baseUrl = action === "login" ? LOGIN_BASE_URL : REGISTRATION_BASE_URL;
        const tokenUrl =
          finalProvider === "vk"
            ? `${baseUrl}/api/v1/vk/get/token/${code}/${deviceId}/${codeVerifier}`
            : `${baseUrl}/api/v1/yandex/get/token/${code}/${codeVerifier}`;
        console.log("URL для запроса токена:", tokenUrl);

        const tokenResponse = await fetch(tokenUrl, {
          method: "GET",
          credentials: "include",
        });
        console.log("Статус ответа на запрос токена:", tokenResponse.status);

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json().catch(() => tokenResponse.text());
          console.error("Ошибка в запросе токена:", errorData);
          throw new Error(`Сервер вернул ошибку ${tokenResponse.status}: ${JSON.stringify(errorData)}`);
        }

        const tokenDataFull = await tokenResponse.json();
        console.log("Полный ответ на запрос токена:", tokenDataFull);

        const tokenData = tokenDataFull.body || tokenDataFull;
        const accessToken = tokenData.access_token;

        if (!accessToken) {
          throw new Error("Токен доступа отсутствует в ответе сервера");
        }

        if (action === "register") {
          await performRegistration(accessToken, finalProvider);
        } else if (action === "login") {
          await performLogin(accessToken, finalProvider);
        }
      } catch (error) {
        console.error("Ошибка обмена токена:", error);
        toast.error(`Ошибка авторизации: ${error.message}`);
        setTimeout(() => navigate("/login"), 2000);
      } finally {
        if (sessionId) {
          console.log("Очистка localStorage для sessionId:", sessionId);
          localStorage.removeItem(`${finalProvider}_code_verifier_${sessionId}`);
        }
        console.log("Очистка localStorage для провайдера:", finalProvider);
        localStorage.removeItem(`${finalProvider}_session_id`);
        localStorage.removeItem(`${finalProvider}_action`);
      }
    };

    const performRegistration = async (accessToken, provider) => {
      try {
        const registrationUrl = `${REGISTRATION_BASE_URL}/api/v1/${provider}/registration/${accessToken}`;
        console.log("URL для регистрации:", registrationUrl);

        const registrationResponse = await fetch(registrationUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          credentials: "include",
          body: JSON.stringify({ access_token: accessToken }),
        });
        console.log("Статус ответа на запрос регистрации:", registrationResponse.status);

        if (!registrationResponse.ok) {
          const errorText = await registrationResponse.text();
          throw new Error(`Ошибка регистрации ${registrationResponse.status}: ${errorText}`);
        }

        const registrationData = await registrationResponse.json();
        console.log("Данные регистрации:", registrationData);

        if (registrationData.status_code === 200) {
          await performLogin(accessToken, provider); // После регистрации выполняем вход
        } else {
          throw new Error(registrationData.message || "Неизвестная ошибка при регистрации");
        }
      } catch (error) {
        console.error("Ошибка при регистрации:", error);
        toast.error(`Ошибка регистрации: ${error.message}`);
        setTimeout(() => navigate("/login"), 2000);
      }
    };

    const performLogin = async (accessToken, provider) => {
      try {
        const loginUrl = `${LOGIN_BASE_URL}/api/v1/${provider}/login/${accessToken}`;
        console.log("URL для входа:", loginUrl);

        const loginResponse = await fetch(loginUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          credentials: "include",
          body: JSON.stringify({ access_token: accessToken }),
        });
        console.log("Статус ответа на запрос входа:", loginResponse.status);

        if (!loginResponse.ok) {
          const errorText = await loginResponse.text();
          throw new Error(`Ошибка входа ${loginResponse.status}: ${errorText}`);
        }

        const loginDataFull = await loginResponse.json();
        console.log("Полный ответ на запрос входа:", loginDataFull);

        const loginData = loginDataFull.body || loginDataFull;

        if (loginData.access && loginData.refresh) {
          const finalAccess = loginData.access;
          const finalRefresh = loginData.refresh;

          const setTokenUrl = `${REGISTRATION_BASE_URL}/set/token/${finalAccess}/${finalRefresh}`;
          console.log("URL для установки токенов:", setTokenUrl);

          const setTokenResponse = await fetch(setTokenUrl, {
            method: "GET",
            credentials: "include",
          });

          if (!setTokenResponse.ok) {
            const errorText = await setTokenResponse.text();
            throw new Error(`Ошибка установки токенов ${setTokenResponse.status}: ${errorText}`);
          }

          document.cookie = `access=${finalAccess}; path=/; Secure; SameSite=Strict`;
          document.cookie = `refresh=${finalRefresh}; path=/; Secure; SameSite=Strict`;
          console.log("Токены сохранены в cookies:", { access: finalAccess, refresh: finalRefresh });

          toast.success("Вход выполнен успешно! Перенаправляем на профиль...");
          setTimeout(() => navigate("/profile"), 500);
        } else {
          throw new Error(loginData.message || "Неверный формат ответа при входе");
        }
      } catch (error) {
        console.error("Ошибка при входе:", error);
        toast.error(`Ошибка при входе: ${error.message}`);
        setTimeout(() => navigate("/login"), 2000);
      }
    };

    console.log("Запуск exchangeToken");
    exchangeToken();
  }, [provider, navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Toaster position="top-right" />
      <div className="bg-white/95 backdrop-blur-lg p-8 rounded-3xl shadow-2xl max-w-md w-full">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-900">
          {searchParams.get("state")?.includes("login") ? "Вход" : "Регистрация"} через{" "}
          {provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : "Неизвестный провайдер"}
        </h2>
        <p className="text-gray-600 text-center mb-8">
          Пожалуйста, подождите...
        </p>
      </div>
    </div>
  );
};

export default OAuthCallback;