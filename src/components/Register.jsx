import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { FaVk, FaYandex, FaEnvelope } from 'react-icons/fa';


const Register = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isChecked, setIsChecked] = useState(false); // Состояние для чекбокса
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const body = {
            phone_number: phoneNumber,
            email: email,
            hash_password: password
        };

        try {
            const response = await fetch(
                `https://registration-fastapi.onrender.com/authorization/registration`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                }
            );

            if (response.ok) {
                toast.success('Регистрация успешна!');
                setTimeout(() => navigate('/login'), 1500);
            } else {
                const errorData = await response.json();
                toast.error(`Ошибка регистрации: ${errorData.message || 'Попробуйте снова'}`);
            }
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            toast.error('Ошибка сети. Проверьте соединение.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOAuthRedirect = async (provider) => {
        if (!isChecked) return; // Блокируем OAuth-кнопки без согласия

        setIsLoading(true);
        try {
            const response = await fetch(
                `https://registration-fastapi.onrender.com/${provider}/link`,
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
                <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Регистрация</h2>
                <form onSubmit={handleRegister}>
                    <div className="mb-6">
                        <label htmlFor="email" className="block text-sm font-semibold mb-2 text-gray-700">
                            Электронная почта
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Введите ваш email"
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="phone_number" className="block text-sm font-semibold mb-2 text-gray-700">
                            Номер телефона
                        </label>
                        <input
                            id="phone_number"
                            type="tel"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+79.."
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="password" className="block text-sm font-semibold mb-2 text-gray-700">
                            Пароль
                        </label>
                        <input
                            id="password"
                            type="password"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Введите пароль"
                        />
                    </div>

                    {/* Чекбокс для согласия */}
                    <div className="mb-6 flex items-center">
                        <input
                            id="agree"
                            type="checkbox"
                            className="mr-2"
                            checked={isChecked}
                            onChange={() => setIsChecked(!isChecked)}
                        />
                        <label htmlFor="agree" className="text-sm text-gray-700">
                            Я соглашаюсь с{' '}
                            <a
                                href="/privacy-policy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline"
                            >
                                обработкой персональных данных
                            </a>
                        </label>
                    </div>

                    {!isChecked && (
                        <p className="text-xs text-red-500 mb-4">
                            Пожалуйста, поставьте галочку для согласия с обработкой персональных данных.
                        </p>
                    )}

                    <button
                        type="submit"
                        className={`w-full py-3 text-white font-bold rounded-lg transition 
                            ${isLoading || !isChecked ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                        disabled={isLoading || !isChecked}
                    >
                        {isLoading ? 'Загрузка...' : 'Зарегистрироваться'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm font-medium mb-4 text-gray-700">Или зарегистрируйтесь через:</p>
                    <div className="grid grid-cols-1 gap-4">
                        <button
                            onClick={() => handleOAuthRedirect('vk')}
                            className={`flex items-center justify-center py-4 w-full text-white font-semibold rounded-lg transition
                                ${!isChecked ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                            disabled={!isChecked}
                        >
                            <FaVk size={24} className="mr-2" />
                            ВКонтакте
                        </button>
                        <button
                            onClick={() => handleOAuthRedirect('mail.ru')}
                            className={`flex items-center justify-center py-4 w-full text-white font-semibold rounded-lg transition
                                ${!isChecked ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-400 hover:bg-blue-500'}`}
                            disabled={!isChecked}
                        >
                            <FaEnvelope size={24} className="mr-2" />
                            Mail.ru
                        </button>
                        <button
                            onClick={() => handleOAuthRedirect('yandex')}
                            className={`flex items-center justify-center py-4 w-full text-white font-semibold rounded-lg transition
                                ${!isChecked ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#F50000] hover:bg-[#D40000]'}`}
                            disabled={!isChecked}
                        >
                            <FaYandex size={24} className="mr-2" />
                            Яндекс
                        </button>
                    </div>
                </div>

                <p className="mt-6 text-center text-sm text-gray-700">
                    Уже есть аккаунт?{' '}
                    <span
                        role="link"
                        tabIndex={0}
                        onClick={() => navigate('/login')}
                        className="cursor-pointer underline text-blue-600 font-semibold"
                    >
                        Войдите
                    </span>
                </p>
            </div>
        </div>
    );
};

export default Register;
