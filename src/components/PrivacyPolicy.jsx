import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-100 p-6">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-3xl">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Политика конфиденциальности</h1>
                
                <p className="text-gray-700 mb-4">
                    Мы ценим вашу конфиденциальность и обязуемся защищать ваши персональные данные. Настоящая Политика
                    конфиденциальности объясняет, какие данные мы собираем, как мы их используем и какие у вас права.
                </p>

                <h2 className="text-xl font-semibold text-gray-800 mt-6">1. Какие данные мы собираем</h2>
                <ul className="list-disc list-inside text-gray-700 mt-2 mb-4">
                    <li>Электронная почта</li>
                    <li>Номер телефона</li>
                    <li>Имя пользователя</li>
                    <li>Техническая информация (IP-адрес, тип устройства и браузера)</li>
                    <li>Данные, полученные через сторонние сервисы (ВКонтакте, Mail.ru, Яндекс)</li>
                </ul>

                <h2 className="text-xl font-semibold text-gray-800 mt-6">2. Как мы используем ваши данные</h2>
                <p className="text-gray-700 mt-2">
                    Мы используем ваши персональные данные для регистрации, авторизации, поддержки пользователей и
                    улучшения сервиса.
                </p>

                <h2 className="text-xl font-semibold text-gray-800 mt-6">3. Передача данных третьим лицам</h2>
                <p className="text-gray-700 mt-2">
                    Мы не передаем ваши персональные данные третьим лицам без вашего согласия, за исключением случаев,
                    предусмотренных законодательством.
                </p>

                <h2 className="text-xl font-semibold text-gray-800 mt-6">4. Регистрация через сторонние сервисы</h2>
                <p className="text-gray-700 mt-2">
                    Если вы регистрируетесь через ВКонтакте, Mail.ru или Яндекс, мы получаем от этих сервисов
                    ограниченные данные, включая ваше имя, электронную почту и идентификатор пользователя. Эти данные
                    используются исключительно для создания учетной записи и авторизации.
                </p>

                <h2 className="text-xl font-semibold text-gray-800 mt-6">5. Безопасность данных</h2>
                <p className="text-gray-700 mt-2">
                    Мы принимаем все необходимые меры для защиты ваших данных, но помните, что ни один метод передачи
                    данных через интернет не является абсолютно безопасным.
                </p>

                <h2 className="text-xl font-semibold text-gray-800 mt-6">6. Ваши права</h2>
                <ul className="list-disc list-inside text-gray-700 mt-2 mb-4">
                    <li>Запросить доступ к своим данным</li>
                    <li>Исправить или удалить свои данные</li>
                    <li>Отозвать согласие на обработку данных</li>
                </ul>

                <p className="text-gray-700 mt-6">
                    Если у вас есть вопросы, свяжитесь с нами по электронной почте: <span className="font-semibold">support@example.com</span>
                </p>

                <div className="mt-8 flex justify-center">
                    <button onClick={() => navigate('/register')}
                        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">
                        Назад
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
