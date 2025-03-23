import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { Link, useNavigate } from 'react-router-dom';

import Form from './Form';
import ClassifierForm from './MiniClassifier';
import Chat from './Chat';
import Cookies from "js-cookie";
import Events from './Events';
import DopRegister from './Register_dop_service';

const Profile = () => {
  const { user, setUser, logout } = useUser();
  const [activeSection, setActiveSection] = useState(null);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

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
      navigate("/login");
      window.location.reload();
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    }
  }, [logout, navigate]);

  useEffect(() => {
    const accessToken = Cookies.get("access");
    const refreshToken = Cookies.get("refresh");
    if (accessToken && refreshToken) {
      const fetchToken = async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_GET_TOKEN}${accessToken}/${refreshToken}`, {
            method: "GET",
            credentials: "include",
          });
          const data = await response.json();
          if (data.token) {
            // Устанавливаем пользователя в контекст
          }
        } catch (error) {
          console.error("Ошибка при получении нового токена:", error);
        }
      };
      fetchToken();
    }
  }, [setUser]);

  const handleClickOutside = (e) => {
    if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    // Используем mousedown и touchstart для лучшей совместимости с мобильными устройствами
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col font-sans min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-100">
      {/* Header */}
      <header className="w-full bg-blue-800 text-white shadow-lg fixed top-0 z-50 backdrop-blur-md border-b border-blue-700/50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <button
            className="text-white text-2xl hover:text-blue-300 transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation();
              setIsSidebarOpen(!isSidebarOpen);
            }}
          >
            
          </button>
          <h1 className="text-2xl font-bold flex-1 text-center tracking-tight fade-in">Личный кабинет</h1>
          <div className="hidden lg:flex space-x-6 text-sm font-medium">
            <Link to="/help" className="hover:text-blue-300 transition-colors duration-200">Помощь</Link>
            <Link to="/contact" className="hover:text-blue-300 transition-colors duration-200">Контакты</Link>
          </div>
        </div>
      </header>

      <div className="flex flex-grow mt-16">
        {/* Sidebar */}
        <aside
          ref={sidebarRef}
          className={`fixed top-16 left-0 w-64 bg-gradient-to-b from-blue-700 to-blue-500 text-white shadow-xl lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] z-50 border-r border-blue-600/30 rounded-r-2xl transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-blue-600/30">
            <div className="flex items-center">
              
              {user ? (
                <span className="text-lg font-semibold truncate">{user.email}</span>
              ) : (
                <Link to="/login" className="text-white hover:underline">Войти</Link>
              )}
            </div>
            {/* Добавляем кнопку закрытия для мобильных устройств */}
            <button
              className="lg:hidden text-white text-xl hover:text-blue-300 transition-colors duration-200"
              onClick={() => setIsSidebarOpen(false)}
            >
              
            </button>
          </div>
          <nav className="mt-4 space-y-1 px-2">
            {[
              { to: '/', label: 'Главная страница' },
              ...(user && user.loggedIn
                ? [
                    { action: () => setActiveSection('form'), label: 'Расширенный шанс поступления' },
                    { action: () => setActiveSection('events'), label: 'События' },
                    { action: () => setActiveSection('dopregister'), label: 'Регистрация через дополнительные сервисы' },
                    { action: () => setActiveSection('classifier'), label: 'Базовый шанс поступления' },
                    { action: handleLogout, label: 'Выход' },
                  ]
                : []),
            ].map((item, index) =>
              item.to ? (
                <Link
                  key={index}
                  to={item.to}
                  className="flex items-center px-4 py-3 text-white hover:bg-blue-500/70 rounded-xl transition-all duration-300"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <span className="text-lg mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ) : (
                <button
                  key={index}
                  onClick={() => {
                    item.action();
                    setIsSidebarOpen(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-3 text-white hover:bg-blue-500/70 rounded-xl transition-all duration-300"
                >
                  <span className="text-lg mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              )
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 min-h-screen flex justify-center">
          <div
            className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-blue-100/50 w-full max-w-7xl slide-in"
          >
            {activeSection === 'form' && <Form />}
            {activeSection === 'classifier' && <ClassifierForm />}
            {activeSection === 'events' && <Events />}
            {activeSection === 'dopregister' && <DopRegister />}
            {!activeSection && <ClassifierForm />}
          </div>
        </main>
      </div>

      {/* Chat */}
      {user && (
        <div className="fixed bottom-6 right-6 z-50">
          {!isChatVisible ? (
            <button
              onClick={() => setIsChatVisible(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-lg hover:shadow-blue-500/50 transition-all duration-300 w-16 h-16 flex items-center justify-center hover:scale-110 active:scale-95 fade-in"
            >
              <span className="text-2xl">💬</span>
            </button>
          ) : (
            <div
              className="w-[90vw] max-w-md bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-blue-100/50 overflow-hidden slide-in"
            >
              <div className="p-4 border-b border-blue-100/50 flex justify-between items-center bg-blue-500/50">
                <span className="text-sm font-medium text-gray-900">Чат</span>
                <button
                  onClick={() => setIsChatVisible(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 h-[calc(100%-3.5rem)]">
                <Chat />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;