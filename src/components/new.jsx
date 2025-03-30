import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "../context/UserContext";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from "js-cookie";
import { 
  FiHome, FiUser, FiLogOut, FiLogIn, FiMessageSquare, 
  FiHelpCircle, FiMail, FiX, FiMenu, FiChevronRight,
  FiCalendar, FiBook, FiBarChart2, FiSettings, FiBell
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
  const { user, logout } = useUser();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const navigate = useNavigate();

  // Анимации
  const pageVariants = {
    initial: { opacity: 0, x: -30 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: 30 }
  };

  const sidebarLinks = [
    { id: "dashboard", icon: <FiHome />, label: "Главная" },
    { id: "classifier", icon: <FiBarChart2 />, label: "Анализ поступления" },
    { id: "telegram-bot", icon: <RiRobot2Line />, label: "Telegram бот" },
    { id: "events", icon: <FiCalendar />, label: "Мероприятия", auth: true },
    { id: "form", icon: <FiBook />, label: "Рекомендации", auth: true },
    { id: "dopregister", icon: <FiUser />, label: "Профиль", auth: true }
  ];

  const deleteAllCookies = () => {
    document.cookie.split(";").forEach((cookie) => {
      const [name] = cookie.split("=");
      document.cookie = `${name}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
    });
  };

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
  }, [user, handleLogout]);

  const renderContent = () => {
    switch(activeSection) {
      case "telegram-bot": return <TelegramBotPage />;
      case "form": return user?.loggedIn ? <Form /> : <AuthWall />;
      case "classifier": return <ClassifierForm />;
      case "events": return user?.loggedIn ? <Events /> : <AuthWall />;
      case "dopregister": return user?.loggedIn ? <DopRegister /> : <AuthWall />;
      default: return <DashboardView />;
    }
  };

  const AuthWall = () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg max-w-md w-full">
        <FiUser className="mx-auto text-4xl text-blue-400 mb-4" />
        <h3 className="text-xl font-medium mb-2">Требуется авторизация</h3>
        <p className="text-gray-600 mb-6">
          Для доступа к этому разделу войдите в систему
        </p>
        <Link 
          to="/login" 
          className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-teal-400 text-white px-6 py-3 rounded-lg font-medium shadow-sm hover:shadow-md transition-all"
        >
          <FiLogIn className="mr-2" /> Войти
        </Link>
      </div>
    </div>
  );

  const DashboardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <DashboardCard 
        icon={<FiBarChart2 className="text-blue-500" />}
        title="Анализ поступления"
        description="Узнайте ваши шансы на поступление"
        onClick={() => setActiveSection("classifier")}
        color="from-blue-50 to-blue-100"
      />
      <DashboardCard 
        icon={<RiRobot2Line className="text-teal-500" />}
        title="Telegram бот"
        description="Получайте уведомления в Telegram"
        onClick={() => setActiveSection("telegram-bot")}
        color="from-teal-50 to-blue-100"
      />
      {user?.loggedIn && (
        <>
          <DashboardCard 
            icon={<FiBook className="text-indigo-500" />}
            title="Рекомендации"
            description="Персональные рекомендации направлений"
            onClick={() => setActiveSection("form")}
            color="from-indigo-50 to-purple-100"
          />
          <DashboardCard 
            icon={<FiCalendar className="text-green-500" />}
            title="Мероприятия"
            description="Предстоящие события и встречи"
            onClick={() => setActiveSection("events")}
            color="from-green-50 to-teal-100"
          />
          <DashboardCard 
            icon={<FiUser className="text-purple-500" />}
            title="Профиль"
            description="Управление личными данными"
            onClick={() => setActiveSection("dopregister")}
            color="from-purple-50 to-indigo-100"
          />
        </>
      )}
    </div>
  );

  const DashboardCard = ({ icon, title, description, onClick, color }) => (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`cursor-pointer rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all bg-gradient-to-br ${color}`}
    >
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 text-gray-900 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="mr-4 p-2 rounded-lg hover:bg-gray-100 lg:hidden"
              >
                {isMobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
              <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                Uni<span className="font-extrabold">Portal</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="p-2 rounded-full hover:bg-gray-100 relative"
              >
                <FiMessageSquare size={20} className="text-blue-600" />
                {isChatOpen && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
                )}
              </button>
              
              <button className="p-2 rounded-full hover:bg-gray-100 relative">
                <FiBell size={20} className="text-blue-600" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </button>
              
              {user?.loggedIn ? (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center text-white font-medium">
                    {user.email?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="hidden md:inline text-sm font-medium text-gray-700">
                    {user.email || "User"}
                  </span>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="hidden md:flex items-center space-x-1 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-gray-100 text-blue-600"
                >
                  <FiLogIn size={16} />
                  <span>Войти</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-white/80 backdrop-blur-sm border-r border-gray-200/50 sticky top-16 h-[calc(100vh-4rem)]">
          <div className="p-4 h-full flex flex-col">
            <nav className="space-y-1 flex-1">
              {sidebarLinks.map((link) => {
                if (link.auth && !user?.loggedIn) return null;
                return (
                  <button
                    key={link.id}
                    onClick={() => setActiveSection(link.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                      activeSection === link.id 
                        ? "bg-blue-50 text-blue-600 font-medium border border-blue-100"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-lg mr-3">{link.icon}</span>
                      <span>{link.label}</span>
                    </div>
                    <FiChevronRight className="text-gray-400" />
                  </button>
                );
              })}
            </nav>
            
            {user?.loggedIn && (
              <button 
                onClick={handleLogout}
                className="mt-auto flex items-center p-3 rounded-lg hover:bg-gray-50 text-red-500 border border-transparent hover:border-red-100"
              >
                <FiLogOut className="mr-3" />
                Выйти
              </button>
            )}
          </div>
        </aside>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween' }}
              className="fixed inset-0 z-40 bg-white/95 backdrop-blur-sm lg:hidden"
            >
              <div className="p-4 h-full flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-blue-600">Меню</h2>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <FiX size={20} />
                  </button>
                </div>
                
                <nav className="space-y-1 flex-1">
                  {sidebarLinks.map((link) => {
                    if (link.auth && !user?.loggedIn) return null;
                    return (
                      <button
                        key={link.id}
                        onClick={() => {
                          setActiveSection(link.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                          activeSection === link.id 
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="text-lg mr-3">{link.icon}</span>
                          <span>{link.label}</span>
                        </div>
                        <FiChevronRight />
                      </button>
                    );
                  })}
                </nav>
                
                <div className="mt-auto space-y-2">
                  <Link 
                    to="/help" 
                    className="flex items-center p-3 rounded-lg hover:bg-gray-100 text-gray-700"
                  >
                    <FiHelpCircle className="mr-3 text-blue-500" />
                    Помощь
                  </Link>
                  <Link 
                    to="/contact" 
                    className="flex items-center p-3 rounded-lg hover:bg-gray-100 text-gray-700"
                  >
                    <FiMail className="mr-3 text-blue-500" />
                    Контакты
                  </Link>
                  {user?.loggedIn && (
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center p-3 rounded-lg hover:bg-gray-100 text-red-500"
                    >
                      <FiLogOut className="mr-3" />
                      Выйти
                    </button>
                  )}
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Chat Panel */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-0 right-0 w-full max-w-md h-[70vh] bg-white shadow-xl border-l border-t border-gray-200/50 rounded-tl-xl z-40"
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-cyan-50">
              <h3 className="font-medium text-blue-600">Чат поддержки</h3>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="h-[calc(100%-3.5rem)]">
              <Chat />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;