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

    const inferredProvider = window.location.href.includes("vk")
      ? "vk"
      : window.location.href.includes("yandex")
      ? "yandex"
      : null;

    console.log("Определенный провайдер:", { inferredProvider });

    if (!code || (!provider && !inferredProvider)) {
      console.error("Отсутствует code или provider", { code, provider, inferredProvider });
      toast.error("Ошибка: отсутствует код авторизации или провайдер.");
      return;
    }
    if (provider === "vk" && !deviceId) {
      console.error("Отсутствует device_id для VK", { deviceId });
      toast.error("Ошибка: отсутствует device_id для VK.");
      return;
    }

    const finalProvider = provider || inferredProvider;
    console.log("Итоговый провайдер:", finalProvider);

    let action = "register";
    if (sessionId) {
      try {
        const parsedState = JSON.parse(sessionId);
        sessionId = parsedState.sessionId;
        action = parsedState.action || "register";
        console.log("Успешно распарсен state:", { sessionId, action });
      } catch (error) {
        console.warn("State не является валидным JSON, используем localStorage:", error);
        sessionId = localStorage.getItem(`${finalProvider}_session_id`);
        action = localStorage.getItem(`${finalProvider}_action`) || "register";
        console.log("Данные из localStorage:", { sessionId, action });
      }
    } else {
      sessionId = localStorage.getItem(`${finalProvider}_session_id`);
      action = localStorage.getItem(`${finalProvider}_action`) || "register";
      console.log("Данные из localStorage (без state):", { sessionId, action });
    }

    const exchangeToken = async () => {
      try {
        const codeVerifier = localStorage.getItem(`${finalProvider}_code_verifier_${sessionId}`);
        console.log("Получен codeVerifier из localStorage:", { codeVerifier });

        if (!codeVerifier) {
          console.error("Отсутствует code_verifier для", finalProvider);
          toast.error("Ошибка: отсутствует code_verifier.");
          return;
        }

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
        console.log("Извлеченные данные токена:", tokenData);

        if (!tokenData) {
          throw new Error("Ответ сервера пустой или не содержит данных");
        }

        const accessToken = tokenData.access_token;
        console.log("Получен accessToken:", accessToken);

        if (!accessToken) {
          console.error("Ошибка получения токена или неверный формат ответа", tokenData);
          throw new Error("Токен доступа отсутствует в ответе сервера");
        }

        if (action === "register") {
          console.log("Пользователь регистрируется...");
          await performRegistration(accessToken, finalProvider);
        } else if (action === "login") {
          console.log("Пользователь пытается войти...");
          await performLogin(accessToken, finalProvider);
        }
      } catch (error) {
        console.error("Ошибка обмена токена:", error);
        toast.error(`Ошибка обмена токена: ${error.message}`);
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
          const errorData = await registrationResponse.json().catch(() => ({
            status_code: registrationResponse.status,
            message: "Неизвестная ошибка",
          }));
          console.error("Ошибка в запросе регистрации:", errorData);

          // Обрабатываем случай, если пользователь уже зарегистрирован (500)
          if (registrationResponse.status === 500 && errorData.message === "Ошибка отправки") {
            const providerName = provider === "vk" ? "VK" : "Яндекс";
            console.log(`Пользователь уже зарегистрирован в ${providerName}, перенаправляем на profile...`);
            toast.success(`Вы уже зарегистрированы в ${providerName}!`, {
              duration: 3000,
              style: {
                background: "linear-gradient(to right, #d1fae5, #a7f3d0)",
                color: "#065f46",
                fontWeight: "bold",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              },
            });
            setTimeout(() => navigate("/profile"), 1500);
            return;
          }

          throw new Error(`Ошибка регистрации ${registrationResponse.status}: ${errorData.message || "Нет дополнительной информации"}`);
        }

        const registrationDataFull = await registrationResponse.json();
        console.log("Полный ответ на запрос регистрации:", registrationDataFull);

        const registrationData = registrationDataFull.body || registrationDataFull;
        console.log("Извлеченные данные регистрации:", registrationData);

        if (registrationDataFull.status_code === 201) {
          console.log("Регистрация успешна, выполняем логин...");
          await performLogin(accessToken, provider);
        } else if (registrationDataFull.status_code === 401) {
          console.log("Пользователь уже зарегистрирован, перенаправляем на profile...");
          const providerName = provider === "vk" ? "VK" : "Яндекс";
          toast.success(`Вы уже зарегистрированы в ${providerName}!`, {
            duration: 3000,
            style: {
              background: "linear-gradient(to right, #d1fae5, #a7f3d0)",
              color: "#065f46",
              fontWeight: "bold",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            },
          });
          setTimeout(() => navigate("/profile"), 1500);
        } else {
          console.error("Ошибка при регистрации", registrationData);
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
          console.error("Ошибка в запросе входа:", { status: loginResponse.status, errorText });
          throw new Error(`Ошибка входа ${loginResponse.status}: ${errorText || "Нет дополнительной информации"}`);
        }

        const loginDataFull = await loginResponse.json();
        console.log("Полный ответ на запрос входа:", loginDataFull);

        const loginData = loginDataFull.body || loginDataFull;
        console.log("Извлеченные данные входа:", loginData);

        if (loginData.access && loginData.refresh) {
          const finalAccess = loginData.access;
          const finalRefresh = loginData.refresh;
          console.log("Получены токены:", { finalAccess, finalRefresh });

          const setTokenUrl = `${REGISTRATION_BASE_URL}/set/token/${finalAccess}/${finalRefresh}`;
          console.log("URL для установки токенов:", setTokenUrl);

          const setTokenResponse = await fetch(setTokenUrl, {
            method: "GET",
            credentials: "include",
          });
          console.log("Статус ответа на установку токенов:", setTokenResponse.status);

          if (!setTokenResponse.ok) {
            const errorText = await setTokenResponse.text();
            console.error("Ошибка в запросе установки токенов:", { status: setTokenResponse.status, errorText });
            throw new Error(`Ошибка установки токена ${setTokenResponse.status}: ${errorText || "Нет дополнительной информации"}`);
          }

          const setTokenDataFull = await setTokenResponse.json();
          console.log("Полный ответ на установку токенов:", setTokenDataFull);

          const setTokenData = setTokenDataFull.body || setTokenDataFull;
          console.log("Извлеченные данные установки токенов:", setTokenData);

          document.cookie = `access=${finalAccess}; path=/; Secure; SameSite=Strict`;
          document.cookie = `refresh=${finalRefresh}; path=/; Secure; SameSite=Strict`;
          console.log("Токены сохранены в cookies:", { access: finalAccess, refresh: finalRefresh });

          toast.success("Вход выполнен успешно! Вы будете перенаправлены на profile...");
          setTimeout(() => {
            console.log("Перенаправление на /profile");
            navigate("/profile");
            window.location.reload();
          }, 500);
        } else {
          if (
            loginData.message === "Ошибка в методе get_user_email_vk класса CRUD" ||
            loginData.message === "Ошибка в методе get_user_email_yandex класса CRUD" ||
            loginData.message === "get_user_email_vk"
          ) {
            const providerName = provider === "vk" ? "VK" : "Яндекс";
            console.log("Ошибка: требуется регистрация в", providerName);
            toast.error(
              `Войдите в личный кабинет и зарегистрируйтесь в ${providerName}.`,
              {
                duration: 4000,
                style: {
                  background: "linear-gradient(to right, #fef3c7, #fee2e2)",
                  color: "#b91c1c",
                  fontWeight: "bold",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                },
              }
            );
            setTimeout(() => {
              console.log("Перенаправление на /login из-за необходимости регистрации");
              navigate("/login");
            }, 4000);
          } else {
            console.error("Ошибка при входе", loginData);
            throw new Error(loginData.message || "Неизвестная ошибка при входе");
          }
        }
      } catch (error) {
        console.error("Ошибка при входе:", error);
        toast.error(`Ошибка при входе: ${error.message}`);
        setTimeout(() => {
          console.log("Перенаправление на /login из-за ошибки входа");
          navigate("/login");
        }, 2000);
      }
    };

    console.log("Запуск exchangeToken");
    exchangeToken();
  }, [provider, navigate, searchParams]);

  let action = "register";
  if (searchParams.get("state")) {
    try {
      const parsedState = JSON.parse(searchParams.get("state"));
      action = parsedState.action || "register";
    } catch (error) {
      action = localStorage.getItem(`${provider}_action`) || "register";
    }
  } else {
    action = localStorage.getItem(`${provider}_action`) || "register";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Toaster position="top-right" />
      <div className="bg-white/95 backdrop-blur-lg p-8 sm:p-10 rounded-3xl shadow-2xl max-w-md w-full mx-4 border border-blue-100/50 transition-all duration-300 hover:shadow-blue-200/50 animate-slideIn">
        <div className="flex justify-center mb-6 sm:mb-8">
          <svg
            className="w-16 h-16 sm:w-20 sm:h-20 text-blue-600 animate-spin-slow"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 text-blue-900 tracking-tight animate-fadeIn">
          {action === "login" ? "Вход" : "Регистрация"} через{" "}
          {provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : "Неизвестный провайдер"}
        </h2>
        <p className="text-gray-600 text-center text-sm sm:text-base mb-6 sm:mb-8 animate-fadeIn">
          Пожалуйста, подождите, пока мы {action === "login" ? "выполняем вход" : "создаем ваш аккаунт"}...
        </p>
        <div className="relative w-full h-3 sm:h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-load" />
        </div>
        <div className="flex justify-center gap-2 sm:gap-3 mt-6 sm:mt-8">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: `${index * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;