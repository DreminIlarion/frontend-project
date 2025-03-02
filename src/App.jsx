import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { UserProvider, useUser } from "./context/UserContext";
import Login from "./components/Login";
import Profile from "./components/Profile";
import Register from "./components/Register";
import Chat from "./components/Chat";
import MailCallback from "./components/MailCallback";
import YandexCallback from "./components/YandexCallback";
import VKCallback from "./components/VKCallback";
import PrivacyPolicy from "./components/PrivacyPolicy";
import Home from "./components/Home";
import Test from "./components/Cht";

const ProtectedRoute = ({ element }) => {
  const { user, loading } = useUser();

  if (loading) return <div>Загрузка...</div>;
  if (!user) return <Navigate to="/login" />;

};

const App = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
          <Route path="/registration" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/chat" element={<ProtectedRoute element={<Chat />} />} />
          <Route path="/vk/callback" element={<VKCallback />} />
          <Route path="/mail.ru/callback" element={<MailCallback />} />
          <Route path="/yandex/callback" element={<YandexCallback />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/test" element={<Test />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
