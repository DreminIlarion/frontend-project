import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useUser } from "../context/UserContext";
import { UserIcon, EnvelopeIcon, PhoneIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser();

  const handlePhoneInput = (e) => {
    const value = e.target.value.replace(/[^\d]/g, ''); // Только цифры
    setPhoneNumber(value);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formattedPhoneNumber = `+7${phoneNumber}`;
    const body = {
      first_name: firstName,
      last_name: lastName,
      phone_number: formattedPhoneNumber,
      email: email,
      hash_password: password,
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_REGISTRATION}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });


      if (response.status === 201) {
        const data = await response.json();

        const { access, refresh } = data;
        if (typeof access !== 'string' || typeof refresh !== 'string') {
          console.error("[Register] Ошибка: Токены должны быть строками:", { access, refresh });
          toast.error("Некорректные токены.");
          return;
        }

        
        const loginSuccess = await login(access, refresh);

        if (loginSuccess) {
          toast.success('Регистрация успешна!');
          setTimeout(() => navigate('/'), 1500);
        } else {
          console.error("[Register] Функция login вернула false");
          toast.error("Ошибка авторизации после регистрации.");
        }
      } else if (response.status === 409) {
        console.error("[Register] Пользователь с таким email уже зарегистрирован");
        toast.error("Пользователь с таким email уже зарегистрирован.");
      } else {
        const errorData = await response.json();
        console.error("[Register] Ошибка сервера:", errorData);
        toast.error(errorData.message || "Ошибка регистрации. Попробуйте снова.");
      }
    } catch (error) {
      console.error("[Register] Ошибка при регистрации:", error.message);
      toast.error("Пользователь с такими данными уже зарегистрирован");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-blue-900">
      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-slideIn {
            animation: slideIn 0.5s ease-out;
          }
        `}
      </style>
      <Toaster position="top-right" />
      <div className="bg-blue-50 p-8 rounded-xl shadow-xl w-full max-w-md mx-4 border border-blue-500 animate-slideIn">
        <h2 className="text-3xl font-semibold text-center mb-8 text-blue-900">
          Регистрация
        </h2>
        <form onSubmit={handleRegister}>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-blue-900">Имя</label>
            <div className="relative">
              <UserIcon className="w-5 h-5 text-blue-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                required
                type="text"
                className="w-full pl-10 p-3 border border-blue-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 transition-all duration-200"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Введите ваше имя"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-blue-900">Фамилия</label>
            <div className="relative">
              <UserIcon className="w-5 h-5 text-blue-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                required
                type="text"
                className="w-full pl-10 p-3 border border-blue-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 transition-all duration-200"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Введите вашу фамилию"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-blue-900">Электронная почта</label>
            <div className="relative">
              <EnvelopeIcon className="w-5 h-5 text-blue-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                required
                type="email"
                className="w-full pl-10 p-3 border border-blue-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 transition-all duration-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введите ваш email"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-blue-900">Номер телефона</label>
            <div className="relative">
              <PhoneIcon className="w-5 h-5 text-blue-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <div className="flex items-center w-full border border-blue-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-500 transition-all duration-200">
                <span className="pl-10 pr-1 py-3 text-gray-900">+7</span>
                <input
                  required
                  type="tel"
                  className="flex-1 p-3 bg-transparent focus:outline-none text-gray-900"
                  value={phoneNumber}
                  onChange={handlePhoneInput}
                  placeholder="9123456789"
                  pattern="[0-9]*"
                  inputMode="numeric"
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-blue-900">Пароль</label>
            <div className="relative">
              <LockClosedIcon className="w-5 h-5 text-blue-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                required
                type={showPassword ? "text" : "password"}
                className="w-full pl-10 pr-12 p-3 border border-blue-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 transition-all duration-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-600"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="mb-6 flex items-center">
            <div className="relative">
              <input
                required
                id="agree"
                type="checkbox"
                className="mr-2 h-5 w-5 text-blue-600 focus:ring-blue-500 border-blue-300 rounded"
                checked={isChecked}
                onChange={() => setIsChecked(!isChecked)}
              />
              
            </div>
            <label htmlFor="agree" className="text-sm text-gray-600">
              Я соглашаюсь с{' '}
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-medium hover:text-blue-700 transition-colors duration-200"
              >
                обработкой персональных данных
              </a>
            </label>
          </div>

          <button
            type="submit"
            className={`w-full py-3 bg-blue-600 text-white font-medium rounded-lg transition-all duration-200 hover:bg-blue-700 hover:scale-105 shadow-blue-500/20 ${
              isLoading || !isChecked ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading || !isChecked}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-3 border-t-transparent border-white rounded-full animate-spin mx-auto"></div>
            ) : (
              "Зарегистрироваться"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Уже есть аккаунт?{' '}
            <span
              role="link"
              tabIndex={0}
              onClick={() => navigate('/login')}
              className="cursor-pointer text-blue-600 font-medium hover:text-blue-700 transition-colors duration-200"
            >
              Войдите
            </span>
          </p>
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/')}
              className="py-3 px-6 bg-blue-600 text-white font-medium rounded-lg transition-all duration-200 hover:bg-blue-700 hover:scale-105 shadow-blue-500/20"
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