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

    const inferredProvider = window.location.href.includes("vk")
      ? "vk"
      : window.location.href.includes("yandex")
      ? "yandex"
      : null;

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
        
        const codeVerifier = localStorage.getItem(`${finalProvider}_code_verifier_${sessionId}`);
        
        if (!codeVerifier) {
          console.error("Отсутствует code_verifier для", finalProvider);
          toast.error("Ошибка: отсутствует code_verifier.");
          return;
        }

        // Получаем токен
        const tokenUrl =
          finalProvider === "vk"
            ? `https://personal-account-c98o.onrender.com//api/v1/vk/get/token/${code}/${deviceId}/${codeVerifier}`
            : `https://personal-account-c98o.onrender.com//api/v1/yandex/get/token/${code}/${codeVerifier}`;
        
        const tokenResponse = await fetch(tokenUrl, {
          method: "GET",
          credentials: "include",
        });
        const tokenData1 = await tokenResponse.json();
        const tokenData = tokenData1.body;

        // Проверяем наличие access_token
        if (tokenData.access_token || (tokenData.status_code === 200 && tokenData.body && tokenData.body.access_token)) {
          const accessToken = tokenData.access_token || tokenData.body.access_token;
         

          if (action === "register") {
            // Выполняем регистрацию
            const registrationUrl = `https://personal-account-c98o.onrender.com/api/v1/${finalProvider}/registration/${accessToken}`;
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
           

            if (registrationData.status_code === 200) {
              console.log("Регистрация успешна, выполняем логин для получения токенов...");
              await performLogin(accessToken, finalProvider);
            } else if (registrationData.status_code === 401) {
              console.log("Пользователь уже зарегистрирован, перенаправляем на profile...");
              toast.success(`ТЫ ЗАРЕГИСТРИРОВАН В ${finalProvider.toUpperCase()}`);
              setTimeout(() => {
                navigate("/profile");
              }, 500);
            } else {
              console.error("Ошибка при регистрации", registrationData);
              toast.error("Ошибка при регистрации: " + (registrationData.message || "Неизвестная ошибка."));
            }
          } else if (action === "login") {
            // Выполняем вход
            console.log("Пользователь пытается войти, выполняем вход...");
            await performLogin(accessToken, finalProvider);
          }
        } else {
          console.error("Ошибка получения токена или неверный формат ответа", tokenData);
          toast.error("Ошибка получения токена.");
        }
      } catch (error) {
        console.error("Ошибка обмена токена:", error);
        toast.error("Ошибка обмена токена: " + error.message);
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
        const loginUrl = `https://personal-account-c98o.onrender.com//api/v1/${provider}/login/${accessToken}`;
        const loginResponse = await fetch(loginUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
        });
        const loginData1 = await loginResponse.json();
        const loginData = loginData1.body;

        if (loginData.access && loginData.refresh) {
          const finalAccess = loginData.access;
          const finalRefresh = loginData.refresh;

          const setTokenUrl = `https://personal-account-c98o.onrender.com/set/token/${finalAccess}/${finalRefresh}`;
          const setTokenResponse = await fetch(setTokenUrl, {
            method: "GET",
            credentials: "include",
          });
          const setTokenData = await setTokenResponse.json();
         

          document.cookie = `access=${finalAccess}; path=/; Secure; SameSite=Strict`;
          document.cookie = `refresh=${finalRefresh}; path=/; Secure; SameSite=Strict`;

          toast.success("Вход выполнен успешно! Вы будете перенаправлены на profile...");
          setTimeout(() => {
            navigate("/profile");
            window.location.reload();
          }, 500);
        } else {
          // Проверяем, если пользователь не зарегистрирован
          if (
            loginData.message === "Ошибка в методе get_user_email_yandex класса CRUD" ||
            loginData.message === "Ошибка в методе get_user_email_vk класса CRUD"
          ) {
            const providerName = provider === "vk" ? "VK" : "Яндекс";
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
              navigate("/login");
            }, 4000);
          } else {
            console.error("Ошибка при входе", loginData);
            toast.error("Ошибка при входе: " + (loginData.message || "Неизвестная ошибка."));
            setTimeout(() => {
              navigate("/login");
            }, 2000);
          }
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
          {searchParams.get("state")?.includes("login") ? "Вход" : "Регистрация"} через{" "}
          {provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : "Неизвестный провайдер"}
        </h2>
        <p className="text-gray-600 text-center text-sm sm:text-base mb-6 sm:mb-8 animate-fadeIn">
          Пожалуйста, подождите, пока мы {searchParams.get("state")?.includes("login") ? "выполняем вход" : "создаем ваш аккаунт"}...
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