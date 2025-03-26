import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useUser } from "../context/UserContext";

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const body = {
      first_name: firstName,
      last_name: lastName,
      phone_number: phoneNumber,
      email: email,
      hash_password: password,
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_REGISTRATION}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Ответ сервера после регистрации:', data);

        let access, refresh;
        if (data.access && data.refresh) {
          access = data.access;
          refresh = data.refresh;
        } else if (data.body && data.body.access && data.body.refresh) {
          access = data.body.access;
          refresh = data.body.refresh;
        } else {
          throw new Error('Токены не найдены в ответе сервера.');
        }

        const tokenResponse = await fetch(
          `https://personal-account-fastapi.onrender.com/set/token/${access}/${refresh}`,
          {
            method: 'GET',
            credentials: 'include',
          }
        );

        if (tokenResponse.ok) {
          login(access, refresh);
          toast.success('Регистрация успешна! Вы вошли в аккаунт.');
          setTimeout(() => navigate('/'), 1500);
        } else {
          const tokenError = await tokenResponse.json();
          toast.error(`Ошибка при установке токенов: ${tokenError.message || 'Попробуйте снова.'}`);
        }
      } else if (response.status === 500) {
        toast.error('Пользователь с таким email уже зарегистрирован.');
      } else {
        const errorData = await response.json();
        toast.error(`Ошибка регистрации: ${errorData.message || 'Попробуйте снова.'}`);
      }
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      toast.error(error.message || 'Ошибка сети. Проверьте соединение.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-500 to-indigo-100">
      <Toaster position="top-right" />
      <div className="bg-white/95 backdrop-blur-lg p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md sm:max-w-lg mx-4 transition-all duration-300 hover:shadow-blue-200/50 animate-fadeIn">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-10 text-blue-900 tracking-tight">
          Регистрация
        </h2>
        <form onSubmit={handleRegister}>
          <div className="mb-6 sm:mb-8">
            <label className="block text-sm sm:text-base font-semibold mb-2 text-gray-800">Имя</label>
            <input
              required
              type="text"
              className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl bg-gray-50/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 transition-all duration-300 hover:shadow-md"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Введите ваше имя"
            />
          </div>

          <div className="mb-6 sm:mb-8">
            <label className="block text-sm sm:text-base font-semibold mb-2 text-gray-800">Фамилия</label>
            <input
              required
              type="text"
              className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl bg-gray-50/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 transition-all duration-300 hover:shadow-md"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Введите вашу фамилию"
            />
          </div>

          <div className="mb-6 sm:mb-8">
            <label className="block text-sm sm:text-base font-semibold mb-2 text-gray-800">Электронная почта</label>
            <input
              required
              type="email"
              className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl bg-gray-50/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 transition-all duration-300 hover:shadow-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введите ваш email"
            />
          </div>

          <div className="mb-6 sm:mb-8">
            <label className="block text-sm sm:text-base font-semibold mb-2 text-gray-800">Номер телефона</label>
            <input
              required
              type="tel"
              className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl bg-gray-50/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 transition-all duration-300 hover:shadow-md"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+79..."
            />
          </div>

          <div className="mb-6 sm:mb-8">
            <label className="block text-sm sm:text-base font-semibold mb-2 text-gray-800">Пароль</label>
            <input
              required
              type="password"
              className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl bg-gray-50/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 transition-all duration-300 hover:shadow-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
            />
          </div>

          <div className="mb-6 sm:mb-8 flex items-center">
            <input
              required
              id="agree"
              type="checkbox"
              className="mr-2 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={isChecked}
              onChange={() => setIsChecked(!isChecked)}
            />
            <label htmlFor="agree" className="text-sm sm:text-base text-gray-700">
              Я соглашаюсь с{' '}
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800 transition-colors duration-200"
              >
                обработкой персональных данных
              </a>
            </label>
          </div>

          <button
            type="submit"
            className={`w-full py-3 sm:py-4 text-white font-bold rounded-xl shadow-lg transition-all duration-300 ${
              isLoading || !isChecked
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/50 hover:scale-105 active:scale-95"
            }`}
            disabled={isLoading || !isChecked}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin mx-auto"></div>
            ) : (
              "Зарегистрироваться"
            )}
          </button>
        </form>

        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-sm sm:text-base text-gray-700">
            Уже есть аккаунт?{' '}
            <span
              role="link"
              tabIndex={0}
              onClick={() => navigate('/login')}
              className="cursor-pointer underline text-blue-600 font-semibold hover:text-blue-800 transition-colors duration-200"
            >
              Войдите
            </span>
          </p>
          <div className="mt-4 sm:mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold py-2 sm:py-3 px-6 sm:px-8 rounded-xl shadow-md transition-all hover:bg-blue-600 hover:shadow-blue-400/50 hover:scale-105 active:scale-95"
            >
              Вернуться на главную
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;