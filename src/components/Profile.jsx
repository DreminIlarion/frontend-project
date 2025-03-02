import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { Link,Navigate } from 'react-router-dom';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import Form from './Form';
import ClassifierForm from './MiniClassifier';
import Chat from './Chat';
import Cookies from "js-cookie";
import Events from './Events';
const Profile = () => {
  const { user, logout, loading } = useUser();
  const [activeSection, setActiveSection] = useState(null);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const handleLogout = async () => {
    try {
      await fetch("https://personal-account-fastapi.onrender.com/logout/", {
        method: "GET",
        credentials: "include",
      });

      Cookies.remove("access", { path: "/" });
      Cookies.remove("refresh", { path: "/" });

      logout();
      
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    };
    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  console.log("Пользователь в Profile:", user);
if (loading) return <div>Загрузка...</div>;
if (!user) return <Navigate to="/login" />;


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
            {user && (
              <>
                <li className="mb-2">
                  <button onClick={() => setActiveSection("form")} className="w-full text-left px-6 py-3 hover:text-white">
                    Расширенный шанс поступления
                  </button>
                </li>
                <li className="mb-2">
                  <button onClick={() => setActiveSection("events")} className="w-full text-left px-6 py-3 hover:text-white">
                    События
                  </button>
                </li>
                <li className="mb-2">
                  <button onClick={() => setActiveSection("classifier")} className="w-full text-left px-6 py-3 hover:text-white">
                    Базовый шанс поступления
                  </button>
                </li>
                <li className="mb-2">
                  <button onClick={handleLogout} className="w-full text-left px-6 py-3 hover:text-white">
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