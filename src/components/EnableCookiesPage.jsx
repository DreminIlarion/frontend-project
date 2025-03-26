import { useNavigate } from "react-router-dom";

const EnableCookiesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white/95 backdrop-blur-lg p-8 sm:p-10 rounded-3xl shadow-2xl max-w-md w-full mx-4 border border-blue-100/50 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-blue-900 tracking-tight">
          Необходимо разрешить куки
        </h2>
        <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8">
          Для корректной работы сайта, пожалуйста, разрешите куки в настройках вашего браузера.
        </p>
        <p className="text-gray-600 text-sm sm:text-base mb-4">
          Если вы используете Safari на iPhone, следуйте этой{" "}
          <a
            href="https://support.apple.com/ru-ru/guide/safari/ibrw850f6c51/18.0/mac/15.0"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-blue-600 hover:text-blue-800"
          >
            инструкции
          </a>.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold py-2 sm:py-3 px-6 sm:px-8 rounded-xl shadow-md transition-all hover:bg-blue-600 hover:shadow-blue-400/50 hover:scale-105 active:scale-95"
        >
          Вернуться на страницу входа
        </button>
      </div>
    </div>
  );
};

export default EnableCookiesPage;