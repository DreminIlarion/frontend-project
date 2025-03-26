import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { provider } = useParams();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const code = searchParams.get("code");
    const deviceId = searchParams.get("device_id");
    let sessionId = searchParams.get("state");

    const inferredProvider = window.location.href.includes("vk") ? "vk" : window.location.href.includes("yandex") ? "yandex" : null;

    if (!code || (!provider && !inferredProvider)) {
      console.error("Отсутствует code или provider", { code, provider, inferredProvider });
      toast.error("Ошибка: отсутствует код авторизации или провайдер.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      return;
    }
    if (provider === "vk" && !deviceId) {
      console.error("Отсутствует device_id для VK", { deviceId });
      toast.error("Ошибка: отсутствует device_id для VK.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      return;
    }

    const finalProvider = provider || inferredProvider;

    // Парсим state, если он есть и является валидным JSON
    let action = "register"; // По умолчанию считаем, что это регистрация
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

    const exchangeToken = async () => {
      try {
        console.log("Запуск exchangeToken для провайдера:", finalProvider);
        const codeVerifier = localStorage.getItem(`${finalProvider}_code_verifier_${sessionId}`);
        console.log("Code Verifier из localStorage:", codeVerifier);
        if (!codeVerifier) {
          console.error("Отсутствует code_verifier для", finalProvider);
          toast.error("Ошибка: отсутствует code_verifier.");
          setTimeout(() => {
            navigate("/login");
          }, 2000);
          return;
        }

        // /get/token должен отправляться на registration-fastapi
        const tokenUrl =
          finalProvider === "vk"
            ? `https://registration-fastapi.onrender.com/api/v1/vk/get/token/${code}/${deviceId}/${codeVerifier}`
            : `https://registration-fastapi.onrender.com/api/v1/yandex/get/token/${code}/${codeVerifier}`;

        const tokenResponse = await fetch(tokenUrl, {
          method: "GET",
          credentials: "include",
        });

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json();
          // Проверяем, связана ли ошибка с отсутствием регистрации
          if (
            tokenResponse.status === 403 || // Пример: статус, указывающий на отсутствие регистрации
            errorData.message === "User not registered" // Пример: сообщение об ошибке
          ) {
            toast.error("Войдите в аккаунт и зарегистрируйтесь в дополнительных сервисах.");
            setTimeout(() => {
              navigate("/register");
            }, 1500);
            return;
          }
          throw new Error(errorData.message || "Ошибка получения токена");
        }

        const tokenData = await tokenResponse.json();

        // Проверяем наличие access_token
        if (tokenData.access_token || (tokenData.status_code === 200 && tokenData.body && tokenData.body.access_token)) {
          const accessToken = tokenData.access_token || tokenData.body.access_token;

          if (action === "register") {
            // Выполняем регистрацию на personal-account-fastapi
            const registrationUrl = `https://personal-account-fastapi.onrender.com/api/v1/${finalProvider}/registration/${accessToken}`;

            const registrationResponse = await fetch(registrationUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
              },
              credentials: "include",
              body: JSON.stringify({ access_token: accessToken }),
            });

            const registrationData = await registrationResponse.json();

            if (!registrationResponse.ok) {
              // Проверяем, связана ли ошибка с отсутствием регистрации
              if (
                registrationResponse.status === 403 || // Пример: статус, указывающий на отсутствие регистрации
                registrationData.message === "User not registered" // Пример: сообщение об ошибке
              ) {
                toast.error("Войдите в аккаунт и зарегистрируйтесь в дополнительных сервисах.");
                setTimeout(() => {
                  navigate("/register");
                }, 1500);
                return;
              }
              throw new Error(registrationData.message || "Ошибка при регистрации");
            }

            if (registrationData.status_code === 200) {
              console.log("Регистрация успешна, выполняем логин для получения токенов...");
              await performLogin(accessToken, finalProvider);
            } else if (registrationData.status_code === 401) {
              console.log("Пользователь уже зарегистрирован, перенаправляем на profile...");
              toast.success(`ТЫ ЗАРЕГИСТРИРОВАН В ${finalProvider.toUpperCase()}`);
              setTimeout(() => {
                navigate("/profile");
                window.location.reload();
              }, 500);
            } else {
              console.error("Ошибка при регистрации", registrationData);
              toast.error("Ошибка при регистрации: " + (registrationData.message || "Неизвестная ошибка."));
              setTimeout(() => {
                navigate("/login");
              }, 2000);
            }
          } else if (action === "login") {
            // Выполняем вход
            console.log("Пользователь пытается войти, выполняем вход...");
            await performLogin(accessToken, finalProvider);
          }
        } else {
          console.error("Ошибка получения токена или неверный формат ответа", tokenData);
          toast.error("Ошибка получения токена.");
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        }
      } catch (error) {
        console.error("Ошибка обмена токена:", error);
        toast.error("Ошибка обмена токена: " + error.message);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } finally {
        if (sessionId) {
          localStorage.removeItem(`${finalProvider}_code_verifier_${sessionId}`);
        }
        localStorage.removeItem(`${finalProvider}_session_id`);
        localStorage.removeItem(`${finalProvider}_action`);
      }
    };

    const performLogin = async (accessToken, provider) => {
      try {
        // /login должен отправляться на registration-fastapi
        const loginUrl = `https://registration-fastapi.onrender.com/api/v1/${provider}/login/${accessToken}`;

        const loginResponse = await fetch(loginUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ access_token: accessToken }),
        });

        if (!loginResponse.ok) {
          const loginData = await loginResponse.json();
          // Проверяем, связана ли ошибка с отсутствием регистрации
          if (
            loginResponse.status === 403 || // Пример: статус, указывающий на отсутствие регистрации
            loginData.message === "User not registered" // Пример: сообщение об ошибке
          ) {
            toast.error("Войдите в аккаунт и зарегистрируйтесь в дополнительных сервисах.");
            setTimeout(() => {
              navigate("/register");
            }, 1500);
            return;
          }
          throw new Error(loginData.message || "Ошибка при входе");
        }

        const loginData = await loginResponse.json();

        // Проверяем наличие access и refresh токенов
        if (loginData.access && loginData.refresh) {
          const finalAccess = loginData.access;
          const finalRefresh = loginData.refresh;

          // /set/token отправляется на personal-account-fastapi
          const setTokenUrl = `https://personal-account-fastapi.onrender.com/set/token/${finalAccess}/${finalRefresh}`;

          const setTokenResponse = await fetch(setTokenUrl, {
            method: "GET",
            credentials: "include",
          });

          if (!setTokenResponse.ok) {
            throw new Error("Ошибка установки токенов");
          }

          const setTokenData = await setTokenResponse.json();

          document.cookie = `access=${finalAccess}; path=/; Secure; SameSite=Strict`;
          document.cookie = `refresh=${finalRefresh}; path=/; Secure; SameSite=Strict`;

          toast.success("Вход выполнен успешно! Вы будете перенаправлены на profile...");
          setTimeout(() => {
            navigate("/profile");
            window.location.reload();
          }, 500);
        } else {
          console.error("Ошибка при входе", loginData);
          toast.error("Ошибка при входе: " + (loginData.message || "Неизвестная ошибка."));
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        }
      } catch (error) {
        console.error("Ошибка при выполнении входа:", error);
        toast.error("Ошибка при входе: " + error.message);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    };

    exchangeToken();
  }, [provider, navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-indigo-100">
      <Toaster position="top-right" />
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
          {searchParams.get("state")?.includes("login") ? "Вход" : "Регистрация"} через{" "}
          {provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : "Неизвестный провайдер"}
        </h2>
        <p className="text-gray-600 text-center mb-6 slide-in">
          Пожалуйста, подождите, пока мы {searchParams.get("state")?.includes("login") ? "выполняем вход" : "создаем ваш аккаунт"}...
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