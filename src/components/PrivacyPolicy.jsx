import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex justify-center items-center bg-gray-50 p-6">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-3xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Политика конфиденциальности</h1>
                
                <p className="text-gray-700 mb-4 leading-relaxed">
                    Мы ценим вашу конфиденциальность и обязуемся защищать ваши персональные данные. Настоящая политика объясняет, какие данные мы собираем, как их используем и какие у вас права.
                </p>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">1. Какие данные мы собираем</h2>
                    <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                        <li>Электронная почта</li>
                        <li>Номер телефона</li>
                        <li>Имя пользователя</li>
                        <li>Техническая информация (IP-адрес, тип устройства, браузер)</li>
                        <li>Данные от сторонних сервисов (ВКонтакте, Mail.ru, Яндекс)</li>
                    </ul>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">2. Как мы используем ваши данные</h2>
                    <p className="text-gray-700 mt-2 leading-relaxed">
                        Ваши данные используются для регистрации, авторизации, поддержки пользователей и улучшения работы сервиса.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">3. Передача данных третьим лицам</h2>
                    <p className="text-gray-700 mt-2 leading-relaxed">
                        Мы не передаем ваши данные третьим лицам без вашего согласия, за исключением случаев, предусмотренных законом.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">4. Регистрация через сторонние сервисы</h2>
                    <p className="text-gray-700 mt-2 leading-relaxed">
                        Если вы регистрируетесь через ВКонтакте, Mail.ru или Яндекс, мы получаем от них ограниченные данные, такие как имя, email и ID пользователя. Эти данные используются только для создания аккаунта и входа.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">5. Безопасность данных</h2>
                    <p className="text-gray-700 mt-2 leading-relaxed">
                        Мы применяем современные технологии защиты данных, но помните, что передача данных через интернет не может быть абсолютно безопасной.
                    </p>
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">6. Ваши права</h2>
                    <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                        <li>Запросить доступ к своим данным</li>
                        <li>Изменить или удалить свои данные</li>
                        <li>Отозвать согласие на обработку данных</li>
                    </ul>
                </section>

                <p className="text-gray-700 mt-6 text-center">
                    Если у вас есть вопросы, свяжитесь с нами: <span className="font-semibold">support@example.com</span>
                </p>

                <div className="mt-8 flex justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
                    >
                        Назад
                    </button>
                    </div>

            </div>
        </div>
    );
};

export default PrivacyPolicy;
