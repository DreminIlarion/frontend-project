import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "../context/UserContext";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";
import {
  FiHome, FiUser, FiLogOut, FiLogIn, FiMessageSquare,
  FiHelpCircle, FiMail, FiX, FiMenu, FiCalendar,
  FiBook, FiBarChart2, FiBell, FiClock, FiLink,
  FiPhone, FiInfo
} from "react-icons/fi";
import { RiRobot2Line } from "react-icons/ri";

// Импорт компонентов
import Form from "./Form";
import ClassifierForm from "./MiniClassifier";
import Chat from "./Chat";
import Events from "./Events";
import DopRegister from "./Register_dop_service";
import TelegramBotPage from "./TelegramBotPage";


const Profile = () => {
  const { user, setUser, logout } = useUser();
  const [activeSection, setActiveSection] = useState(null);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(2);
  const navigate = useNavigate();

  // Функция для удаления всех cookies
  const deleteAllCookies = () => {
    document.cookie.split(";").forEach((cookie) => {
      const [name] = cookie.split("=");
      document.cookie = `${name}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
    });
  };

  // Обработчик выхода
  const handleLogout = useCallback(async () => {
    try {
      await fetch(`${process.env.REACT_APP_LOGOUT}`, {
        method: "GET",
        credentials: "include",
      });
      localStorage.clear();
      sessionStorage.clear();
      deleteAllCookies();
      logout();
      navigate("/profile");
      window.location.reload();
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    }
  }, [logout, navigate]);

  // Проверка токенов при загрузке
  useEffect(() => {
    const accessToken = Cookies.get("access");
    const refreshToken = Cookies.get("refresh");
    if (accessToken && refreshToken && user?.loggedIn) {
      const fetchToken = async () => {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_GET_TOKEN}${accessToken}/${refreshToken}`,
            {
              method: "GET",
              credentials: "include",
            }
          );
          const data = await response.json();
          if (data.token) {
            // Устанавливаем пользователя в контекст, если нужно
          }
        } catch (error) {
          console.error("Ошибка при получении нового токена:", error);
          handleLogout();
        }
      };
      fetchToken();
    }
  }, [setUser, user, handleLogout]);

  // Переключение меню
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Навигационные ссылки
  const navLinks = [
    { to: "/", label: "Главная", icon: <FiHome /> },
    { action: () => setActiveSection("telegram-bot"), label: "Telegram-бот", icon: <RiRobot2Line /> },
    { action: () => setActiveSection("classifier"), label: "Вероятность поступления", icon: <FiBarChart2 /> },
    ...(user?.loggedIn
      ? [
          { action: () => setActiveSection("form"), label: "Рекомендации", icon: <FiBook /> },
          { action: () => setActiveSection("events"), label: "Мероприятия", icon: <FiCalendar /> },
          { action: () => setActiveSection("dopregister"), label: "Профиль", icon: <FiUser /> },
          { action: handleLogout, label: "Выход", icon: <FiLogOut /> },
        ]
      : [
          { to: "/login", label: "Войти", icon: <FiLogIn /> },
        ]),
  ];

  // Полезные ссылки для студентов ТИУ
 
  // Контакты
  const contacts = [
    { label: "Приёмная комиссия", phone: "+7 (3452) 28-36-60", email: "pk@tyuiu.ru" },
    { label: "Деканат", phone: "+7 (3452) 28-36-61", email: "dekanat@tyuiu.ru" },
  ];


  // Советы для студентов
  const tips = [
    { title: "Как подготовиться к экзаменам", description: "Составьте расписание, начните с самых сложных предметов и делайте перерывы каждые 45 минут." },
    { title: "Подача документов", description: "Убедитесь, что у вас есть все необходимые документы: паспорт, аттестат, результаты ЕГЭ." },
    { title: "Выбор направления", description: "Ориентируйтесь на свои интересы и рынок труда. Пройдите тест на профориентацию!" },
  ];

  // Компонент для отображения контента
  const renderContent = () => {
    switch (activeSection) {
      case "telegram-bot":
        return <TelegramBotPage />;
      case "form":
        return user?.loggedIn ? <Form /> : <AuthWall />;
      case "classifier":
        return <ClassifierForm />;
      case "events":
        return user?.loggedIn ? <Events /> : <AuthWall />;
      case "dopregister":
        return user?.loggedIn ? <DopRegister /> : <AuthWall />;
      default:
        return <DashboardView />;
    }
  };

  // Компонент AuthWall
  const AuthWall = () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 max-w-md w-full">
        <FiUser className="mx-auto text-4xl text-blue-600 mb-4" />
        <h3 className="text-xl font-medium mb-2 text-gray-800">Требуется авторизация</h3>
        <p className="text-gray-600 mb-6">
          Для доступа к этому разделу войдите в систему
        </p>
        <Link
          to="/login"
          className="inline-flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-lg font-medium shadow-sm hover:bg-blue-700 transition-all"
        >
          <FiLogIn className="mr-2" /> Войти
        </Link>
      </div>
    </div>
  );

  // Компонент DashboardView
  const DashboardView = () => (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-gray-800 fade-in">Добро пожаловать, {user?.loggedIn ? "Пользователь" : "Гость"}!</h2>
      
      {/* Основные функции */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          icon={<FiBarChart2 className="text-blue-600" />}
          title="Вероятность поступления"
          description="Узнайте ваши шансы на поступление в ТИУ"
          onClick={() => setActiveSection("classifier")}
        />
        <DashboardCard
          icon={<RiRobot2Line className="text-blue-600" />}
          title="Telegram-бот"
          description="Получайте уведомления и напоминания"
          onClick={() => setActiveSection("telegram-bot")}
        />
        {user?.loggedIn && (
          <>
            <DashboardCard
              icon={<FiBook className="text-blue-600" />}
              title="Рекомендация направлений"
              description="Найдите подходящее направление обучения"
              onClick={() => setActiveSection("form")}
            />
            <DashboardCard
              icon={<FiCalendar className="text-blue-600" />}
              title="Мероприятия"
              description="Узнайте о событиях в ТИУ"
              onClick={() => setActiveSection("events")}
            />
            <DashboardCard
              icon={<FiUser className="text-blue-600" />}
              title="Профиль"
              description="Управляйте вашими данными"
              onClick={() => setActiveSection("dopregister")}
            />
          </>
        )}
      </div>



      {/* Полезные советы */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Полезные советы</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tips.map((tip, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-2">
                <FiInfo className="text-blue-600 mr-2" />
                <h4 className="text-gray-800 font-medium">{tip.title}</h4>
              </div>
              <p className="text-gray-600 text-sm">{tip.description}</p>
            </div>
          ))}
        </div>
      </div>

     
      

      {/* Контакты */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Контакты</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.map((contact, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-2">
                <FiPhone className="text-blue-600 mr-2" />
                <h4 className="text-gray-800 font-medium">{contact.label}</h4>
              </div>
              <p className="text-gray-600 text-sm">Телефон: {contact.phone}</p>
              <p className="text-gray-600 text-sm">Email: {contact.email}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Компонент DashboardCard
  const DashboardCard = ({ icon, title, description, onClick }) => (
    <div
      onClick={onClick}
      className="cursor-pointer p-6 bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all"
    >
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );


  return (
    <div className="flex flex-col font-sans min-h-screen bg-gray-50">
      

      {/* Header */}
      <header className="w-full bg-blue-800 text-white shadow-md fixed top-0 z-50 border-b border-blue-700/20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight fade-in">
            Личный кабинет ТИУ
          </h1>
          
        </div>
      </header>

      {/* Navigation Menu */}
      <nav className="w-full bg-blue-600 text-white fixed top-16 z-40 shadow-md">
        <div className="container mx-auto px-6 py-3">
          {/* Desktop Menu */}
          <div className="hidden lg:flex space-x-6 justify-center">
            {navLinks.map((item, index) =>
              item.to ? (
                <Link
                  key={index}
                  to={item.to}
                  className="flex items-center px-4 py-2 text-white hover:bg-blue-500 rounded-lg transition-all duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="mr-2">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ) : (
                <button
                  key={index}
                  onClick={() => {
                    item.action();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center px-4 py-2 text-white hover:bg-blue-500 rounded-lg transition-all duration-300"
                >
                  <span className="mr-2">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              )
            )}
          </div>
          {/* Mobile Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden overflow-hidden"
              >
                <div className="flex flex-col space-y-2">
                  {navLinks.map((item, index) =>
                    item.to ? (
                      <Link
                        key={index}
                        to={item.to}
                        className="flex items-center px-4 py-2 text-white hover:bg-blue-500 rounded-lg transition-all duration-300"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <span className="mr-2">{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    ) : (
                      <button
                        key={index}
                        onClick={() => {
                          item.action();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center px-4 py-2 text-white hover:bg-blue-500 rounded-lg transition-all duration-300"
                      >
                        <span className="mr-2">{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    )
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 min-h-screen pt-48 pb-8 px-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 w-full max-w-6xl mx-auto slide-in">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection || "default"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Chat */}
      {user?.loggedIn && (
        <div className="fixed bottom-6 right-6 z-50">
          {!isChatVisible ? (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsChatVisible(true)}
              className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 w-16 h-16 flex items-center justify-center fade-in"
            >
              <FiMessageSquare className="text-2xl" />
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-[90vw] max-w-md bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden slide-in"
            >
              <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-blue-50">
                <span className="text-sm font-medium text-gray-800">Чат с поддержкой</span>
                <button
                  onClick={() => setIsChatVisible(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  <FiX />
                </button>
              </div>
              <div className="p-4 h-[calc(100%-3.5rem)]">
                <Chat />
              </div>
            </motion.div>
          )}
        </div>
      )}


      {/* Footer */}
      <footer className="w-full bg-blue-800 text-white py-4">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm">
            © 2025 Тюменский индустриальный университет. Все права защищены.
          </p>
          <div className="mt-2 flex justify-center space-x-4">
            <Link
              to="/help"
              className="text-sm hover:text-blue-200 transition-colors duration-300"
            >
              Помощь
            </Link>
            <Link
              to="/contact"
              className="text-sm hover:text-blue-200 transition-colors duration-300"
            >
              Контакты
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Profile;