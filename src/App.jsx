import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Login from './components/Login';
import Profile from './components/Profile';

import Register from './components/Register';
import Chat from './components/Chat';

import MailCallback from "./components/MailCallback";
import YandexCallback from "./components/YandexCallback";
import VKCallback from "./components/VKCallback";

import PrivacyPolicy from "./components/PrivacyPolicy";
const App = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Перенаправление с корневого пути на страницу профиля */}
          <Route path="/" element={<Navigate to="/profile" replace />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/registration" element={<Register />} />

          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/chat" element={<Chat />} />

          <Route path="/vk/callback" element={<VKCallback />} />
          <Route path="/mail.ru/callback" element={<MailCallback />} />
          <Route path="/yandex/callback" element={<YandexCallback />} />
          
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
