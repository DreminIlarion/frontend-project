import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { Link } from 'react-router-dom';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import Form from './Form';
import ClassifierForm from './MiniClassifier';
import Chat from './Chat';

const Profile = () => {
  const { user, logout } = useUser();
  const [activeSection, setActiveSection] = useState(null);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("https://personal-account-fastapi.onrender.com/logout/", { method: "GET", credentials: "include" });
      logout();
      window.location.reload();
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    }
  };

  return (
    <div className="flex flex-col font-sans min-h-screen">
      {/* Header */}
      <header className="w-full bg-blue-800 text-white shadow-md fixed top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <button className="lg:hidden text-white text-2xl" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
          <h1 className="text-2xl font-bold flex-1 text-center lg:flex-none">Личный кабинет</h1>
          <div className="hidden lg:flex space-x-4">
            <Link to="/help" className="hover:underline">Помощь</Link>
            <Link to="/contact" className="hover:underline">Контакты</Link>
          </div>
        </div>
      </header>

      <div className="flex flex-grow mt-16">
        {/* Sidebar */}
        <div
          className={`fixed top-0 left-0 w-64 h-full bg-gradient-to-b from-blue-900 to-blue-600 text-white shadow-lg transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 transition-transform duration-300 ease-in-out z-50 lg:relative lg:h-screen`}
        >
          <div className="flex items-center px-6 py-4 border-b border-blue-700">
            <FaUserCircle className="text-3xl text-white mr-3" />
            {user ? <span className="text-xl font-semibold">{user.email}</span> : <Link to="/login" className="text-white hover:underline">Войти</Link>}
          </div>
          <ul className="mt-4">
            {user && (
              <>
                <li className="mb-2">
                  <button onClick={() => { setActiveSection('form'); setIsSidebarOpen(false); }} className="w-full text-left px-6 py-3 hover:text-white">
                    Расширенный шанс поступления
                  </button>
                </li>
                <li className="mb-2">
                  <button onClick={() => { setActiveSection('classifier'); setIsSidebarOpen(false); }} className="w-full text-left px-6 py-3 hover:text-white">
                    Базовый шанс поступления
                  </button>
                </li>
                <li className="mb-2">
                  <button onClick={handleLogout} className="w-full text-left px-6 py-3 hover:text-white">Выход</button>
                </li>
              </>
            )}
          </ul>
          <div className="absolute bottom-4 w-full text-center text-sm text-gray-300">
            <p>© 2025 TyuIU</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:ml-64 min-h-screen bg-white overflow-auto">
          {activeSection === 'form' && (
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-6 text-center text-black">Расширенный шанс поступления</h2>
              <div className="overflow-auto max-h-[calc(100vh-200px)] lg:max-h-full">
                <Form />
              </div>
            </div>
          )}
          {activeSection === 'classifier' && (
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-6 text-center text-black">Базовый шанс поступления</h2>
              <ClassifierForm />
            </div>
          )}
          {!activeSection && (
            <div className="flex items-center justify-center min-h-screen text-black text-center">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-6 text-center text-black">Базовый шанс поступления</h2>
                <ClassifierForm />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Button */}
      <div className="fixed bottom-4 right-4">
        {!isChatVisible ? (
          <button onClick={() => setIsChatVisible(true)} className="bg-blue-500 text-white rounded-full p-4 shadow-lg hover:bg-blue-600 transition duration-200 text-lg">
            Чат
          </button>
        ) : (
          <div className="fixed bottom-16 right-4 bg-white shadow-lg rounded-lg w-80 h-96 p-4 relative">
            <button onClick={() => setIsChatVisible(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-lg">
              ✕
            </button>
            <Chat />
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
