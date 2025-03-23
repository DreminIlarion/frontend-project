import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import './App.css'; // Импорт стилей для анимаций

// Ленивая загрузка компонентов
const Login = lazy(() => import('./components/Login'));
const Profile = lazy(() => import('./components/Profile'));
const Register = lazy(() => import('./components/Register'));
const Chat = lazy(() => import('./components/Chat'));
const MailCallback = lazy(() => import('./components/MailCallback'));
const YandexCallback = lazy(() => import('./components/YandexCallback'));
const OAuthCallback = lazy(() => import('./components/OAuthCallback'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const Home = lazy(() => import('./components/Home'));
const Test = lazy(() => import('./components/Cht'));

const AppWrapper = () => {
  const navigate = useNavigate();

  return (
    <UserProvider navigate={navigate}>
      {/* Suspense оборачивает маршруты, показывая заглушку, пока компоненты загружаются */}
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-100">Загрузка...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/registration" element={<Register />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/OAuthCallback" element={<OAuthCallback />} />
          <Route path="/mail.ru/callback" element={<MailCallback />} />
          <Route path="/yandex/callback" element={<YandexCallback />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/test" element={<Test />} />
        </Routes>
      </Suspense>
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