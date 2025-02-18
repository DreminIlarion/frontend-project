import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">

      <header className="bg-blue-600 text-white py-4 px-6 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold">Главная страница</h1>
        <nav>
          <Link to="/profile" className="bg-white text-blue-600 px-4 py-2 rounded-lg shadow hover:bg-gray-200">Личный кабинет</Link>
        </nav>
      </header>
      

      <main className="flex flex-1 items-center justify-center text-center p-6">
        <div>
          <h2 className="text-4xl font-bold mb-4">Добро пожаловать!</h2>
          <p className="text-lg text-gray-700"> Войдите на сайт, чтобы получить доступ к функциям.</p>
        </div>
      </main>
      

      <section className="container mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="self-end flex-none max-w-[300px] lg:max-w-full group-link-underline group">
            <a href="https://events.tyuiu.ru/otkrytie-zala-istorii-tii-tiu-k-100-letiiu-pervogo-rektora-anatoliia-kosuxina" className="title text-xl md:text-2xl font-medium">Predict</a>
            <div className="relative">
              <a href="https://events.tyuiu.ru/otkrytie-zala-istorii-tii-tiu-k-100-letiiu-pervogo-rektora-anatoliia-kosuxina" target="_blank" rel="noopener noreferrer">
                <img src="https://avatars.dzeninfra.ru/get-zen_doc/271828/pub_658dc5fdebc22654eca5b5e4_658dc64feec8b90f65618c5b/scale_1200" className="h-[250px] md:h-[400px] w-full object-cover" alt="Событие" />
              </a>
              <div className="absolute w-full h-full top-0 left-0 flex flex-col items-center justify-center gap-4 backdrop-blur-sm bg-gray-700/50 opacity-0 group-hover:opacity-100 transition duration-300">
                <a href="https://events.tyuiu.ru/otkrytie-zala-istorii-tii-tiu-k-100-letiiu-pervogo-rektora-anatoliia-kosuxina" className="w-full max-w-[168px] text-center !no-underline border-[2px] border-white font-medium text-sm sm:text-base text-white rounded-full px-4 py-2 hover:border-blue-600 hover:bg-blue-600 hover:text-white transition-colors duration-150 cursor-pointer">
                  Подробнее
                </a>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Home;