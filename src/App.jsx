import React, { useState, useEffect, Suspense, lazy, useMemo } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation, Link } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import './App.css'; // Импорт стилей

// Ленивая загрузка компонентов
const Login = lazy(() => import('./components/Login'));
const Profile = lazy(() => import('./components/Profile'));
const Register = lazy(() => import('./components/Register'));
const Chat = lazy(() => import('./components/Chat'));
const OAuthCallback = lazy(() => import('./components/OAuthCallback'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const Home = lazy(() => import('./components/All_events'));
const TelegramBotPage = lazy(() => import('./components/TelegramBotPage'));


// Основной компонент приложения
const AppWrapper = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isBannerVisible, setIsBannerVisible] = useState(() => {
    return localStorage.getItem('isBetaBannerVisible') !== 'false';
  });

  useEffect(() => {
    localStorage.setItem('isBetaBannerVisible', isBannerVisible.toString());
  }, [isBannerVisible]);

  // Список маршрутов с memoization
  const routes = useMemo(
    () => [
      
      { path: '/', element: <Profile /> },
      { path: '/registration', element: <Register /> },
      { path: '/register', element: <Register /> },
      { path: '/login', element: <Login /> },
      { path: '/chat', element: <Chat /> },
      { path: '/oauth/:provider/callback', element: <OAuthCallback /> },
      { path: '/privacy-policy', element: <PrivacyPolicy /> },
      { path: '/telegram-bot', element: <TelegramBotPage /> },
    ],
    []
  );

  return (
    <UserProvider navigate={navigate}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'white',
              color: '#1E3A8A',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              padding: '12px',
              border: '1px solid #3B82F6',
            },
            success: { iconTheme: { primary: '#3B82F6', secondary: 'white' } },
            error: { iconTheme: { primary: '#EF4444', secondary: 'white' } },
          }}
        />
        <main className="flex-1 ">
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin" />
              </div>
            }
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <Routes>
                  {routes.map(({ path, element }) => (
                    <Route key={path} path={path} element={element} />
                  ))}
                </Routes>
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </main>
        {isBannerVisible && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-xl p-4 max-w-lg w-full mx-4 z-50 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-800">
                Это бета-версия приложения. Возможны баги. Спасибо за участие!
              </span>
            </div>
            <button
              onClick={() => setIsBannerVisible(false)}
              className="text-gray-600 hover:text-gray-800 font-bold text-sm transition-colors duration-200"
            >
              ✕
            </button>
          </motion.div>
        )}
      </div>
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