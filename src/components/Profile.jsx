import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from '../context/UserContext'; // Импортируем контекст
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import Form from './Form';
import ClassifierForm from './MiniClassifier';
import Chat from './Chat';
import Cookies from "js-cookie";
import Events from './Events';

const Profile = () => {
  const { user, setUser, logout } = useUser(); // Доступ к setUser через контекст
  const [activeSection, setActiveSection] = useState(null);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();





  const handleLogout = useCallback(async () => {
    try {
      // Удаляем куки с основного API
      await fetch("https://personal-account-fastapi.onrender.com/logout/", {
        method: "GET",
        credentials: "include",
      });
  
     
      // Принудительно очищаем куки на клиенте
      Cookies.remove("access", { path: "/", domain: "personal-account-fastapi.onrender.com" });
      Cookies.remove("refresh", { path: "/", domain: "personal-account-fastapi.onrender.com" });
  
      Cookies.remove("access", { path: "/", domain: "events-fastapi.onrender.com" });
      Cookies.remove("refresh", { path: "/", domain: "events-fastapi.onrender.com" });
  
      logout();
      navigate('/login');
      window.location.reload();
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    }
  }, [logout, navigate]);
  
  

  useEffect(() => {
    const accessToken = Cookies.get("access");
    const refreshToken = Cookies.get("refresh");
  
    if (accessToken && refreshToken) {
      console.log("✅ Токены найдены, пытаемся получить пользователя...");
      const fetchToken = async () => {
        try {
          const response = await fetch(`https://personal-account-fastapi.onrender.com/get/token/${accessToken}/${refreshToken}`);
          const data = await response.json();
          
          
  
          if (data.token) {
             // Устанавливаем пользователя в контекст
          } else {
             // Если нет токена, разлогиниваем
          }
        } catch (error) {
          console.error("Ошибка при получении нового токена:", error);
        }
      };
  
      fetchToken();
    } else {
      console.log("⚠ Токены не найдены.");
    }
  }, [setUser]);

  // Обработчик клика вне шторки
  const handleClickOutside = (e) => {
    if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    // Добавляем событие для клика вне шторки
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col font-sans min-h-screen">
      <header className="w-full bg-blue-800 text-white shadow-md fixed top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <button
            className="lg:hidden text-white text-2xl"
            onClick={(e) => {
              e.stopPropagation();
              setIsSidebarOpen(!isSidebarOpen);
            }}
          >
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
          <h1 className="text-2xl font-bold flex-1 text-center lg:flex-none">Личный кабинет</h1>
          <div className="hidden lg:flex space-x-4">
            <Link to="/help" className="hover:underline">
              Помощь
            </Link>
            <Link to="/contact" className="hover:underline">
              Контакты
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-grow mt-16">
        <div
          ref={sidebarRef}
          className={`fixed top-0 left-0 w-64 bg-gradient-to-b from-blue-700 to-blue-500 text-white shadow-lg transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0 h-full" : "-translate-x-full"} lg:translate-x-0 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] z-50`}
        >
          <div className="flex items-center px-6 py-4 border-b border-blue-600">
            <FaUserCircle className="text-3xl text-white mr-3" />
            {user ? <span className="text-xl font-semibold">{user.email}</span> : <Link to="/login" className="text-white hover:underline">Войти</Link>}
          </div>
          <ul className="mt-4">
            <li className="mb-2">
              <Link to="/" className="w-full text-left px-6 py-3 block hover:text-white">
                Главная страница
              </Link>
            </li>
            {user && user.loggedIn && (
              <>
                <li className="mb-2">
                  <button onClick={() => { setActiveSection("form"); setIsSidebarOpen(false); }} className="w-full text-left px-6 py-3 hover:text-white">
                    Расширенный шанс поступления
                  </button>
                </li>
                <li className="mb-2">
                  <button onClick={() => { setActiveSection("events"); setIsSidebarOpen(false); }} className="w-full text-left px-6 py-3 hover:text-white">
                    События
                  </button>
                </li>
                <li className="mb-2">
                  <button onClick={() => { setActiveSection("classifier"); setIsSidebarOpen(false); }} className="w-full text-left px-6 py-3 hover:text-white">
                    Базовый шанс поступления
                  </button>
                </li>
                <li className="mb-2">
                  <button onClick={() => { handleLogout(); setIsSidebarOpen(false); }} className="w-full text-left px-6 py-3 hover:text-white">
                    Выход
                  </button>
                </li>

              </>
            )}
          </ul>
        </div>

        <div className="flex-1 p-4 lg:ml-64 bg-white min-h-screen overflow-y-auto">
          {activeSection === "form" && <Form />}
          {activeSection === "classifier" && <ClassifierForm />}
          {activeSection === "events" && <Events />}
          {!activeSection && <ClassifierForm />}
        </div>
      </div>

      {user && (
        <div className="fixed bottom-4 right-4">
          {!isChatVisible ? (
            <button onClick={() => setIsChatVisible(true)} className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition duration-200 text-lg">
              Чат
            </button>
          ) : (
            <div className="fixed bottom-16 right-4 bg-white shadow-lg rounded-lg w-[90%] max-w-sm h-96 relative">
              <button onClick={() => setIsChatVisible(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-lg">
                ✕
              </button>
              <Chat />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
