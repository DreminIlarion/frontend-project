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
import Home from "./Home";

// Цветовая палитра
const colors = {
  primary: '#1b39ae',    // Основной синий
  secondary: '#6260d2',  // Фиолетово-синий
  accent1: '#9b60d2',    // Фиолетовый
  accent2: '#dad07e',    // Розово-фиолетовый
  accent3: '#b93793',    // Розовый
  success: '#1b8d1d',     // Зеленый
  gray:'#ffffff'
};

const Profile = () => {
  const { user, setUser, logout } = useUser();
  const [activeSection, setActiveSection] = useState(null);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(2);
  const navigate = useNavigate();

  // При переключении вкладок скроллим вверх
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeSection]);

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
    { action: () => setActiveSection("DashboardView"), label: "Главная", icon: <FiHome />, color: colors.primary },
    
    { action: () => setActiveSection("telegram-bot"), label: "Telegram-бот", icon: <RiRobot2Line />, color: colors.secondary },
    { action: () => setActiveSection("classifier"), label: "Анализ поступления", icon: <FiBarChart2 />, color: colors.accent1 },
    { action: () => setActiveSection("home"), label: "Мероприятия", icon: <FiCalendar />, color: colors.accent2 },
    ...(user?.loggedIn
      ? [
          { action: () => setActiveSection("form"), label: "Рекомендации", icon: <FiBook />, color: colors.accent3 },
          { action: () => setActiveSection("events"), label: "Мои мероприятия", icon: <FiCalendar />, color: colors.success },
          { action: () => setActiveSection("dopregister"), label: "Регистрация", icon: <FiUser />, color: colors.primary },
          { action: handleLogout, label: "Выход", icon: <FiLogOut />, color: '#d9534f' },
        ]
      : [
          { to: "/login", label: "Войти", icon: <FiLogIn />, color: colors.success },
        ]),
  ];

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
      case "home":
        return <Home />;
      case "DashboardView":
        return <DashboardView />;
      
      default:
        return <DashboardView />;
    }
  };

  // Компонент AuthWall
  const AuthWall = () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 max-w-md w-full">
        <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: colors.primary }}>
          <FiUser className="text-white text-2xl" />
        </div>
        <h3 className="text-xl font-medium mb-2 text-gray-800">Требуется авторизация</h3>
        <p className="text-gray-600 mb-6">
          Для доступа к этому разделу войдите в систему
        </p>
        <Link
          to="/login"
          className="inline-flex items-center justify-center text-white px-6 py-3 rounded-lg font-medium shadow-sm hover:shadow-md transition-all"
          style={{ backgroundColor: colors.success }}
        >
          <FiLogIn className="mr-2" /> Войти
        </Link>
      </div>
    </div>
  );

  // Компонент DashboardView
  const DashboardView = () => (
    <div className="p-6 max-w-6xl mx-auto space-y-8 bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100">
      <h2 className="text-2xl font-bold text-gray-800 fade-in">Добро пожаловать!</h2>
      
      {/* Основные функции */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {navLinks.slice(0, user?.loggedIn ? 6 : 3).map((item, index) => (
          <DashboardCard
            key={index}
            icon={React.cloneElement(item.icon, { className: "text-white" })}
            title={item.label}
            description={index === 0 ? "Вернуться на главную страницу" : 
                        index === 1 ? "Получайте уведомления и напоминания" :
                        index === 2 ? "Узнайте ваши шансы на поступление" :
                        index === 3 ? "Найдите подходящее направление обучения" :
                        index === 4 ? "Узнайте о событиях в ТИУ" : "Управляйте вашими данными"}
            onClick={() => item.action ? item.action() : navigate(item.to)}
            color={item.color}
          />
        ))}
      </div>

      {/* Полезные советы */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100" >
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Полезные советы</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tips.map((tip, index) => (
            <div key={index} className="p-4 rounded-lg border" style={{ 
              backgroundColor: index === 0 ? `${colors.primary}20` : 
                              index === 1 ? `${colors.secondary}20` : `${colors.accent1}20`,
              borderColor: index === 0 ? colors.primary : 
                          index === 1 ? colors.secondary : colors.accent1
            }}>
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2" style={{
                  backgroundColor: index === 0 ? colors.primary : 
                                  index === 1 ? colors.secondary : colors.accent1
                }}>
                  <FiInfo className="text-white" />
                </div>
                <h4 className="text-gray-800 font-medium">{tip.title}</h4>
              </div>
              <p className="text-gray-600 text-sm">{tip.description}</p>
            </div>
          ))}
        </div>
      </div>
{/* Полезные советы */}
<div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100" >
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Новости</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tips.map((tip, index) => (
            <div key={index} className="p-4 rounded-lg border" style={{ 
              backgroundColor: index === 0 ? `${colors.primary}20` : 
                              index === 1 ? `${colors.secondary}20` : `${colors.accent1}20`,
              borderColor: index === 0 ? colors.primary : 
                          index === 1 ? colors.secondary : colors.accent1
            }}>
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2" style={{
                  backgroundColor: index === 0 ? colors.primary : 
                                  index === 1 ? colors.secondary : colors.accent1
                }}>
                  <FiInfo className="text-white" />
                </div>
                <h4 className="text-gray-800 font-medium">{tip.title}</h4>
              </div>
              <p className="text-gray-600 text-sm">{tip.description}</p>
            </div>
          ))}
        </div>
      </div>
      

      {/* Контакты */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Контакты</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.map((contact, index) => (
            <div key={index} className="p-4 rounded-lg border" >
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2" style={{
                  backgroundColor: index === 0 ? colors.gray : colors.gray
                }}>
                  <FiPhone className="text-white-800" />
                </div>
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
  const DashboardCard = ({ icon, title, description, onClick, color }) => (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer p-6 rounded-xl shadow-md hover:shadow-lg transition-all"
      style={{ backgroundColor: `${color}20`, border: `1px solid ${color}` }}
    >
      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );

  return (
    <div className="flex flex-col font-sans min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100">
      {/* Мобильное меню - теперь всегда видно внизу экрана */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50 border-t border-gray-200 ">
        <div className="flex justify-around ">
          {navLinks.slice(0, 4).map((item, index) => (
            <button
              key={index}
              onClick={() => {
                if (item.action) item.action();
                else navigate(item.to);
              }}
              className="flex flex-col items-center justify-center p-3 w-full "
              style={{ color: item.color }}
            >
              <div className="text-xl">{item.icon}</div>
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden lg:flex w-full bg-white text-white fixed z-40 shadow-md" style={{ backgroundColor: colors.primary }}>
        <div className="container mx-auto px-6 py-3">
          <div className="flex space-x-1 justify-between">
            {navLinks.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  if (item.action) item.action();
                  else navigate(item.to);
                }}
                className="flex items-center px-4 py-2 rounded-lg transition-all duration-300 hover:bg-white/20"
                style={{ color: 'white' }}
              >
                <span className="mr-2">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 min-h-screen pt-16 pb-20 lg:pb-8 px-4">
        <div className="bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 rounded-xl w-full max-w-6xl mx-auto shadow-sm overflow-hidden">
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
        <div className="fixed bottom-20 lg:bottom-6 right-6 z-50">
          {!isChatVisible ? (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsChatVisible(true)}
              className="p-4 rounded-full shadow-lg transition-all duration-300 w-14 h-14 flex items-center justify-center fade-in"
              style={{ backgroundColor: colors.secondary }}
            >
              <FiMessageSquare className="text-2xl text-white" />
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-[90vw] max-w-md bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden slide-in"
            >
              <div className="p-4 border-b border-gray-200 flex justify-between items-center" style={{ backgroundColor: colors.secondary }}>
                <span className="text-sm font-medium text-white">Чат с поддержкой</span>
                <button
                  onClick={() => setIsChatVisible(false)}
                  className="text-white hover:text-gray-200 transition-colors duration-200"
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
      <footer className="w-full py-4 hidden lg:block" style={{ backgroundColor: colors.primary }}>
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-white">
            © 2025 Тюменский индустриальный университет. Все права защищены.
          </p>
          <div className="mt-2 flex justify-center space-x-4">
            <Link
              to="/help"
              className="text-sm text-white hover:text-gray-200 transition-colors duration-300"
            >
              Помощь
            </Link>
            <Link
              to="/contact"
              className="text-sm text-white hover:text-gray-200 transition-colors duration-300"
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