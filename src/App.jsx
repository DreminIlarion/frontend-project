import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Login from './components/Login';
import Profile from './components/Profile';
import Register from './components/Register';
import Chat from './components/Chat';
import OAuthCallback from "./components/OAuthCallback";
import PrivacyPolicy from "./components/PrivacyPolicy";
import Home from './components/Home';
import EnableCookies from './components/EnableCookiesPage';
import './App.css'; // Импорт стилей для анимаций

const AppWrapper = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Хук для получения текущего маршрута
  const [isBannerVisible, setIsBannerVisible] = useState(() => {
    // Проверяем, было ли уведомление закрыто ранее
    return localStorage.getItem('isBetaBannerVisible') !== 'false';
  });

  // Сохраняем состояние в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('isBetaBannerVisible', isBannerVisible.toString());
  }, [isBannerVisible]);

  // Не показываем уведомление на странице Profile
  const shouldShowBanner = isBannerVisible ;

  return (
    <UserProvider navigate={navigate}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/registration" element={<Register />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/oauth/:provider/callback" element={<OAuthCallback />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />

        <Route path="/enable-cookies" element={<EnableCookies />} />
      </Routes>

      {/* Уведомление о бета-тестировании внизу страницы */}
      {shouldShowBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-yellow-100 border-t border-yellow-300 text-yellow-800 p-2 text-center shadow-lg z-50 animate-slide-up">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs sm:text-sm font-medium">
              ⚙️ Это бета-версия приложения. Возможны баги и ошибки. Спасибо за ваше понимание!
            </span>
            <button
              onClick={() => setIsBannerVisible(false)}
              className="text-yellow-800 hover:text-yellow-900 font-bold text-xs sm:text-sm transition-colors duration-200"
            >
              ❌
            </button>
          </div>
        </div>
      )}
    </UserProvider>
  );
};

const App = () => {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
};

export default App;