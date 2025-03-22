import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

import { useUser } from '../context/UserContext';  // Импортируем контекст
import { FaVk, FaYandex, FaEnvelope } from 'react-icons/fa';
import Cookies from 'js-cookie';

const Login = () => {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPhoneLogin, setIsPhoneLogin] = useState(false); // Для переключения между входом по телефону или email
  const navigate = useNavigate();
  const { login } = useUser();  // Получаем метод login из контекста

  const API_URL = process.env.REACT_APP1_GET_TOKEN;

  const getTokenFromCookies = (tokenName) => {
    return Cookies.get(tokenName);
  };

  

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    const body = isPhoneLogin
      ? { phone_number: phoneNumber, hash_password: password }
      : { email: email, hash_password: password };
  
    const loginEndpoint = isPhoneLogin
      ? "/api/v1/authorizations/login/phone/number"
      : "/api/v1/authorizations/login/email";
  
    try {
      const response = await fetch(
        `${process.env.REACT_APP_DOMAIN_REGISTRATION}${loginEndpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
  
      if (response.ok) {
        const data = await response.json();
        
        const { access, refresh } = data;
  
        if (typeof access !== "string" || typeof refresh !== "string") {
          console.error("Ошибка: Токены должны быть строками!");
          toast.error("Ошибка авторизации: некорректные токены.");
          setIsLoading(false);
          return;
        }
  
        Cookies.set("access", access, { path: "/", secure: true, sameSite: "None", expires: 1 });
        Cookies.set("refresh", refresh, { path: "/", secure: true, sameSite: "None", expires: 7 });
  
        login(access, refresh); // ✅ Передаем правильные данные
  
        toast.success("Вход выполнен успешно!");
        setTimeout(() => {
          navigate("/profile");
          window.location.reload();  // 🔄 Принудительно обновляем страницу
        }, 1500);

      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Ошибка авторизации.");
      }
    } catch (error) {
      console.error("Ошибка при авторизации:", error);
      toast.error("Ошибка соединения с сервером.");
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleOAuthRedirect = async (provider) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_LINK}${provider}/link`,
        { method: 'GET' }
      );

      const textResponse = await response.text();

      if (response.ok && textResponse) {
        const cleanLink = textResponse.replace(/^"|"$/g, '');
        window.location.href = cleanLink;
      } else {
        toast.error('Ошибка получения ссылки.');
      }
    } catch (error) {
      console.error('Ошибка при получении ссылки:', error);
      toast.error('Ошибка сети. Проверьте соединение.');
    } finally {
      setIsLoading(false);
    }
  };

  

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-blue-500 to-purple-600">
      <Toaster position="top-right" />
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Вход</h2>
        <form onSubmit={handleLogin}>
          <div className="flex justify-center mb-6">
            <button
              type="button"
              className={`px-6 py-3 font-semibold rounded-l-lg ${!isPhoneLogin ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-800'} text-lg`}
              onClick={() => setIsPhoneLogin(false)}
            >
              Вход через Email
            </button>
            <button
              type="button"
              className={`px-6 py-3 font-semibold rounded-r-lg ${isPhoneLogin ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-800'} text-lg`}
              onClick={() => setIsPhoneLogin(true)}
            >
              Вход через Телефон
            </button>
          </div>
  
          {!isPhoneLogin ? (
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-semibold mb-2 text-gray-700">
                Электронная почта
              </label>
              <input
              required
                id="email"
                type="email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введите ваш email"
              />
            </div>
          ) : (
            <div className="mb-6">
              <label htmlFor="phone_number" className="block text-sm font-semibold mb-2 text-gray-700">
                Номер телефона
              </label>
              <input
              required
                id="phone_number"
                type="tel"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+79.."
              />
            </div>
          )}
  
          <div className="mb-8">
            <label htmlFor="password" className="block text-sm font-semibold mb-2 text-gray-700">
              Пароль
            </label>
            <input
            required
              id="password"
              type="password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
            />
          </div>
  
          <button
            type="submit"
            className={`w-full py-3 text-white font-bold rounded-lg transition ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            disabled={isLoading}
          >
            {isLoading ? 'Загрузка...' : 'Войти'}
          </button>
        </form>
  
        <div className="mt-6 text-center">
          <p className="text-sm font-medium mb-4 text-gray-700">Или войдите через:</p>
          <div className="grid grid-cols-1 gap-4">
           {/* VK button */}
            <button
                      onClick={() => handleOAuthRedirect("vk")}
                      className={`flex items-center justify-center gap-2 h-10 rounded-md font-bold text-white bg-[#0077FF] transition-all hover:bg-[#005bbf] active:scale-95 shadow-md `}
                      
                    >
                      <FaVk size={20} /> VK ID
                    </button>

            {/* Yandex button */}
            <button
                      onClick={() => handleOAuthRedirect("yandex")}
                      className={`flex items-center justify-center gap-2 h-10 rounded-md font-bold text-white bg-red-600 transition-all hover:bg-red-700 active:scale-95 shadow-md`}
                      
                    >
                      <FaYandex size={18} /> Яндекс
                    </button>


          </div>
        </div>
  
        <p className="mt-6 text-center text-sm text-gray-700">
          Нет аккаунта?{' '}
          <span
            role="link"
            tabIndex={0}
            onClick={() => navigate('/registration')}
            className="cursor-pointer underline text-blue-600 font-semibold"
          >
            Зарегистрируйтесь
          </span>
        </p>

        {/* Button to return to home */}
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all hover:bg-blue-600 hover:shadow-lg"
          >
            Вернуться на главную
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;
