import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Login from './components/Login';
import Profile from './components/Profile';
import Register from './components/Register';
import Chat from './components/Chat';

import OAuthCallback from "./components/OAuthCallback";
import PrivacyPolicy from "./components/PrivacyPolicy";
import Home from './components/Home';


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
            <Route path="/oauth/:provider/callback" element={<OAuthCallback />} />

            <Route path="/privacy-policy" element={<PrivacyPolicy />} />


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
