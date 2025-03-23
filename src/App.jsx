import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Login from './components/Login';
import Profile from './components/Profile';
import Register from './components/Register';
import Chat from './components/Chat';
import MailCallback from "./components/MailCallback";
import YandexCallback from "./components/YandexCallback";
import OAuthCallback from "./components/OAuthCallback";
import PrivacyPolicy from "./components/PrivacyPolicy";
import Home from './components/Home';
import Test from './components/Cht';

import './App.css'; // Импорт стилей для анимаций

const AppWrapper = () => {
  const navigate = useNavigate();

  return (
    <UserProvider navigate={navigate}>
     
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
            <Route path='/test' element={<Test />} />

          </Routes>

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
