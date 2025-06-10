import React, { useState, useCallback, Suspense, lazy } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX, FiCalendar, FiFileText, FiBell, FiLogIn, FiLogOut, FiUsers, FiMessageSquare } from "react-icons/fi";
import { Toaster, toast } from "react-hot-toast";

// Ленивая загрузка компонентов
const Form = lazy(() => import("./Form"));
const ClassifierForm = lazy(() => import("./MiniClassifier"));
const Chat = lazy(() => import("./Chat"));
const Events = lazy(() => import("./My_events"));
const DopRegister = lazy(() => import("./Register_dop_service"));
const TelegramBotPage = lazy(() => import("./TelegramBotPage"));
const News = lazy(() => import("./News"));
const AllEvents = lazy(() => import("./All_events"));

// Компонент профиля
const Profile = () => {
  const { user, logout, fetchWithAuth } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState("news");
  const navigate = useNavigate();

  // Выход из аккаунта
  const handleLogout = useCallback(async () => {
    try {
      const response = await fetchWithAuth(`${process.env.REACT_APP_DOMAIN_PERSONAL}/logout/`, {
        method: "GET",
      });
      if (response?.ok) {
        toast.success("Вы успешно вышли!");
      } else {
        toast.success("Вы успешно вышли!");
      }
    } catch (error) {
      console.error("Ошибка при выходе:", error);
      toast.error("Ошибка при выходе!");
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      logout();
      navigate("/");
    }
  }, [logout, navigate, fetchWithAuth]);

  // Переключение меню
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Выбор секции
  const handleSectionOpen = useCallback((section) => {
    setSelectedSection(section);
    setIsMenuOpen(false);
  }, []);

  // Элементы навигации
  const navItems = [
    { section: "allevents", label: "Мероприятия", icon: <FiCalendar /> },
    { section: "news", label: "Новости", icon: <FiBell /> },
    { section: "telegram-bot", label: "Telegram-бот", icon: <FiMessageSquare /> },
    { section: "classifier", label: "Вероятность поступления", icon: <FiFileText /> },
    ...(user?.loggedIn
      ? [
          { section: "form", label: "Рекомендации", icon: <FiFileText /> },
          { section: "events", label: "Мои мероприятия", icon: <FiUsers /> },
          { section: "dopregister", label: "Регистрация", icon: <FiFileText /> },
          { action: handleLogout, label: "Выход", icon: <FiLogOut /> },
        ]
      : [{ to: "/login", label: "Войти", icon: <FiLogIn /> }]),
  ];

  // Компоненты для секций
  const sectionComponents = {
    allevents: AllEvents,
    news: News,
    "telegram-bot": TelegramBotPage,
    classifier: ClassifierForm,
    chat: Chat,
    form: Form,
    events: Events,
    dopregister: DopRegister,
  };

  return (
    <div className="min-h-screen bg-blue-50 font-sans text-gray-900 flex flex-col">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "white",
            color: "#1E40AF",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            padding: "8px",
            border: "1px solid #3B82F6",
          },
          success: { iconTheme: { primary: "#10B981", secondary: "white" } },
          error: { iconTheme: { primary: "#EF4444", secondary: "white" } },
        }}
      />

      {/* Шапка */}
      <header className="sticky top-0 z-50 bg-blue-900 text-white shadow-md shrink-0">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="text-xl font-bold"
          >
            ТИУ: Помощник абитуриента
          </motion.h1>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="md:hidden p-2 rounded-md bg-blue-600 hover:bg-blue-700"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
          >
            {isMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </motion.button>
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="hidden md:flex space-x-2"
          >
            {navItems.map((item, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => (item.to ? navigate(item.to) : item.action ? item.action() : handleSectionOpen(item.section))}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  selectedSection === item.section
                    ? "bg-blue-600 text-white"
                    : "text-white hover:bg-blue-700"
                } ${item.action ? "bg-red-500 hover:bg-red-600" : ""}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </motion.button>
            ))}
          </motion.nav>
        </div>
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-blue-900 text-white shadow-md"
            >
              <nav className="flex flex-col p-4 space-y-2">
                {navItems.map((item, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => {
                      if (item.to) navigate(item.to);
                      else if (item.action) item.action();
                      else handleSectionOpen(item.section);
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                      selectedSection === item.section
                        ? "bg-blue-600 text-white"
                        : "text-white hover:bg-blue-700"
                    } ${item.action ? "bg-red-500 hover:bg-red-600" : ""}`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </motion.button>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Основной контент */}
      <main className="container mx-auto px-4 py-6 flex-1">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-blue-100 flex flex-col"
          style={{ maxHeight: selectedSection === 'chat' ? '80vh' : '100%' }}
        >
          <Suspense fallback={<div className="w-6 h-6 border-2 border-t-blue-600 border-gray-200 rounded-full animate-spin mx-auto" />}>
            {React.createElement(sectionComponents[selectedSection], {
              ...(selectedSection === "classifier" || selectedSection === "form" || selectedSection === "events" || selectedSection === "dopregister"
                ? { tabState: { formData: {} } }
                : {}),
            })}
          </Suspense>
        </motion.section>
      </main>

      {/* Кнопка чата */}
      {user?.loggedIn && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleSectionOpen("chat")}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 w-12 h-12 flex items-center justify-center z-50"
          aria-label="Открыть чат"
        >
          <FiMessageSquare size={20} />
        </motion.button>
      )}

      {/* Футер */}
      {selectedSection !== "chat" && (
        <footer className="bg-blue-900 text-white py-3 shrink-0">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xs">© 2025 ТИУ. Все права защищены.</p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Profile;