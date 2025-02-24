import React, { useState } from 'react';
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
      ? '/authorization/login/phone/number'
      : '/authorization/login/email';
  
    try {
      // Запрос авторизации
      const response = await fetch(
        `https://registration-fastapi.onrender.com${loginEndpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            
          },
          body: JSON.stringify(body),
        }
      );
  
      if (response.ok) {
        const data = await response.json();
        
  
        const { access, refresh } = data;
  
        // Сохраняем токены в куки через js-cookie
        Cookies.set('access', access, {
          path: '/',
          secure: true,
          sameSite: 'None',
          expires: 1, // 1 день
        });
        Cookies.set('refresh', refresh, {
          path: '/',
          secure: true,
          sameSite: 'None',
          expires: 7, // 7 дней
        });
        const accessToken = getTokenFromCookies('access');  // Получение access токена из cookies
        const refreshToken = getTokenFromCookies('refresh');
        try {
            const response = await fetch(
              `https://personal-account-fastapi.onrender.com/get/token/?access=${accessToken}&refresh=${refreshToken}`,
              {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include',  // Это позволяет отправлять куки с запросом
              }
            );
        
            if (response.ok) {
              const data = await response.json();
              
              // Обработка ответа от сервера
            } else {
              console.log('Ошибка HTTP:', response.status);
            }
          } catch (error) {
            console.error('Ошибка при отправке GET запроса:', error);
          }
        // Авторизуем пользователя через UserContext
        const userData = { email: email, hash_password: password }; // Пример данных пользователя
        login(userData, access, refresh); // Используем метод login из контекста
  
        if (Cookies.get()) {
          
  
          toast.success('Вход выполнен успешно!');
          setTimeout(() => navigate('/profile'), 1500);
        } else {
          toast.error('Ошибка при добавлении куки. Попробуйте снова.');
        }
      } else {
        const errorData = await response.json();
        toast.error(
          errorData.message || 'Убедитесь что вы зарегистрированны.'
        );
      }
    } catch (error) {
      console.error('Ошибка при авторизации:', error);
      toast.error('Проверьте правильность ввода данных пользователя.');
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleOAuthRedirect = async (provider) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://registration-fastapi.onrender.com/${provider}/v1/link`,
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
              onClick={() => handleOAuthRedirect('vk')}
              className="flex items-center justify-center py-4 w-full bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              <FaVk size={24} className="mr-2" />
              Войти через ВКонтакте
            </button>
            
            {/* Mail.ru button */}
            <button
              onClick={() => handleOAuthRedirect('mail.ru')}
              className="flex items-center justify-center py-4 w-full bg-blue-400 text-white font-semibold rounded-lg hover:bg-blue-500 transition"
            >
              <FaEnvelope size={24} className="mr-2" />
              Войти через Mail.ru
            </button>
            
            {/* Yandex button */}
            <button
              onClick={() => handleOAuthRedirect('yandex')}
              className="flex items-center justify-center py-4 w-full bg-[#F50000] text-white font-semibold rounded-lg hover:bg-[#D40000] transition"
            >
              <FaYandex size={24} className="mr-2" />
              Войти через Яндекс
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
      </div>
    </div>
  );

};

export default Login;
