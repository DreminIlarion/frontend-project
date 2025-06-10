import React, { useState, useEffect, useRef } from 'react';
import { FiUser, FiSend, FiTrash2, FiStar, FiCopy, FiMoon, FiSun } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Компонент чата
const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Динамическое изменение высоты textarea
  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = '40px'; // Начальная высота
      const maxHeight = 120; // Максимальная высота
      if (textarea.scrollHeight > textarea.clientHeight && textarea.scrollHeight <= maxHeight) {
        textarea.style.height = `${textarea.scrollHeight}px`;
      } else if (textarea.scrollHeight > maxHeight) {
        textarea.style.height = `${maxHeight}px`;
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.overflowY = 'hidden';
      }
    }
  }, [inputMessage]);

  // Загрузка данных из localStorage
  useEffect(() => {
    try {
      const savedMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
      const savedFavorites = JSON.parse(localStorage.getItem('chatFavorites') || '[]');
      const savedTheme = localStorage.getItem('chatTheme');
      if (Array.isArray(savedMessages)) setMessages(savedMessages);
      if (Array.isArray(savedFavorites)) setFavorites(savedFavorites);
      if (savedTheme !== null) setIsDarkMode(savedTheme === 'dark');
      setIsLoaded(true);
      setTimeout(() => inputRef.current?.focus(), 0);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      toast.error('Ошибка загрузки чата');
      setMessages([]);
      setFavorites([]);
      setIsLoaded(true);
    }
  }, []);

  // Сохранение данных в localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
      localStorage.setItem('chatFavorites', JSON.stringify(favorites));
      localStorage.setItem('chatTheme', isDarkMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      toast.error('Ошибка сохранения чата');
    }
  }, [messages, favorites, isDarkMode, isLoaded]);

  // Автоскролл к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Отправка сообщения
  const sendMessage = async (text) => {
    if (!text || text.trim() === '') {
      toast.error('Введите сообщение!');
      inputRef.current?.focus();
      return;
    }

    const newMessage = {
      id: Date.now(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInputMessage('');
    setIsTyping(true);

    try {
      const encodedMessage = encodeURIComponent(text);
      const response = await fetch(
        `${process.env.REACT_APP_ANSWER}${encodedMessage}`,
        {
          method: 'GET',
          credentials: 'include',
          signal: AbortSignal.timeout(5000),
        }
      );

      if (!response.ok) throw new Error('Ошибка сервера');

      const data = await response.json();
      const botMessage = data.body?.answer;
      if (!botMessage) throw new Error('Нет текста в ответе');

      const botResponse = {
        id: Date.now(),
        text: botMessage,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...updatedMessages, botResponse]);
    } catch (error) {
      console.error('Ошибка чата:', error);
      const errorMessage = {
        id: Date.now(),
        text: 'Ошибка! Попробуйте снова.',
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setTimeout(() => setIsTyping(false), 500);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  // Очистка чата
  const clearChat = () => {
    setMessages([]);
    setFavorites([]);
    try {
      localStorage.removeItem('chatMessages');
      localStorage.removeItem('chatFavorites');
      toast.success('Чат очищен!');
    } catch (error) {
      console.error('Ошибка очистки:', error);
      toast.error('Ошибка очистки чата');
    }
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // Копирование сообщения
  const copyMessage = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Сообщение скопировано!');
    }).catch(() => {
      toast.error('Ошибка копирования');
    });
  };

  // Добавление/удаление в избранное
  const toggleFavorite = (messageId) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(messageId)
        ? prev.filter((id) => id !== messageId)
        : [...prev, messageId];
      return newFavorites;
    });
    toast.info(favorites.includes(messageId) ? 'Удалено из избранного' : 'Добавлено в избранное');
  };

  // Обработка нажатия клавиш
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && inputMessage.trim()) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  // Быстрые вопросы
  const quickQuestions = [
    { text: 'Как подать документы на поступление?', label: 'Документы' },
    { text: 'Когда ближайшая олимпиада?', label: 'Олимпиады' },
    { text: 'Где находится приемная комиссия?', label: 'Комиссия' },
  ];

  return (
    <div className={`flex flex-col h-full w-full font-sans ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'} transition-all duration-500`}>
      {/* Кастомный CSS */}
      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: ${isDarkMode ? '#6EE7B7' : '#3B82F6'};
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: ${isDarkMode ? '#374151' : '#F3F4F6'};
        }
        .message-bubble {
          max-width: 70%;
          word-wrap: break-word;
        }
        textarea {
          transition: height 0.2s ease;
        }
      `}</style>

      {/* Заголовок */}
      <header className={`p-4 sm:p-5 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b flex justify-between items-center z-10 shadow-sm shrink-0`}>
        <div className="flex items-center gap-3 sm:gap-4">
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
            className="rounded-full bg-blue-600 p-2 sm:p-2.5"
          >
            <span className="text-white font-semibold text-sm sm:text-base">ТИУ</span>
          </motion.div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold">Помощник ТИУ</h2>
            <p className="text-xs sm:text-sm text-gray-400">Задайте свой вопрос</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-all duration-300`}
            aria-label={isDarkMode ? 'Светлая тема' : 'Темная тема'}
          >
            {isDarkMode ? <FiSun size={18} className="text-yellow-400" /> : <FiMoon size={18} className="text-gray-600" />}
          </motion.button>
          {messages.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearChat}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-all duration-300`}
              aria-label="Очистить чат"
            >
              <FiTrash2 size={18} className="text-red-500" />
            </motion.button>
          )}
        </div>
      </header>

      {/* Сообщения */}
      <main className={`p-4 sm:p-5 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} overflow-y-auto scrollbar-thin`} style={{ maxHeight: '50vh' }}>
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mt-8 sm:mt-12"
          >
            <h3 className={`text-base sm:text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              Начните диалог
            </h3>
            <p className={`mt-2 text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Задайте вопрос или выберите популярный:
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-4">
              {quickQuestions.map((q, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => sendMessage(q.text)}
                  className={`px-4 sm:px-5 py-1.5 rounded-full text-xs sm:text-sm font-medium ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'} transition-all duration-300`}
                >
                  {q.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-3 px-2 sm:px-3`}
              >
                <div className="flex items-start gap-2 sm:gap-3 message-bubble">
                  {msg.sender === 'bot' && (
                    <div className="mt-2 rounded-full bg-blue-600 p-1.5 sm:p-2">
                      <FiUser className="text-white" size={14} />
                    </div>
                  )}
                  <div
                    className={`p-3 sm:p-4 rounded-2xl text-sm shadow-md ${
                      msg.sender === 'user'
                        ? 'bg-blue-500 text-white'
                        : isDarkMode
                        ? 'bg-gray-700 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span
                        className={`text-xs ${msg.sender === 'user' ? 'text-blue-200' : isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                      >
                        {msg.timestamp}
                      </span>
                      {msg.sender === 'bot' && (
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => copyMessage(msg.text)}
                            className={`${isDarkMode ? 'text-gray-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-500'} transition-colors duration-200`}
                            aria-label="Скопировать сообщение"
                          >
                            <FiCopy size={12} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toggleFavorite(msg.id)}
                            className={`${favorites.includes(msg.id) ? 'text-yellow-400' : isDarkMode ? 'text-gray-400' : 'text-gray-500'} hover:text-yellow-400 transition-colors duration-200`}
                            aria-label="Добавить в избранное"
                          >
                            <FiStar size={12} />
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="flex justify-start mb-3 px-2 sm:px-3"
              >
                <div className="flex items-start gap-2 sm:gap-3 message-bubble">
                  <div className="mt-2 rounded-full bg-blue-600 p-1.5 sm:p-2">
                    <FiUser className="text-white" size={14} />
                  </div>
                  <div
                    className={`p-3 sm:p-4 rounded-2xl text-sm shadow-md ${isDarkMode ? 'bg-gray-700' : 'bg-white border border-gray-200'}`}
                  >
                    <div className="flex items-center gap-1">
                      <motion.span
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.5 }}
                        className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                      ></motion.span>
                      <motion.span
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }}
                        className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                      ></motion.span>
                      <motion.span
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.5, delay: 0.4 }}
                        className="w-1.5 h-1.5 bg-blue-400 rounded-full"
                      ></motion.span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Поле ввода */}
      <footer
        className={`p-4 sm:p-5 ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-t flex items-center gap-2 sm:gap-3 z-10 shrink-0`}
      >
        <textarea
          placeholder="Ваш вопрос..."
          className={`flex-1 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'} border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 text-sm resize-none`}
          style={{ minHeight: '40px', maxHeight: '120px' }}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          ref={inputRef}
          aria-label="Введите сообщение"
        />
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => sendMessage(inputMessage)}
          disabled={!inputMessage.trim()}
          className={`p-2 sm:p-2.5 rounded-full ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300`}
          aria-label="Отправить сообщение"
        >
          <FiSend className="w-4 h-4 sm:w-5 sm:h-5" />
        </motion.button>
      </footer>
      <ToastContainer
        position="bottom-right"
        autoClose={1500}
        hideProgressBar
        theme={isDarkMode ? 'dark' : 'light'}
        toastStyle={{
          background: isDarkMode ? '#374151' : '#fff',
          color: isDarkMode ? '#fff' : '#1F2937',
          border: `1px solid ${isDarkMode ? '#4B5563' : '#E5E7EB'}`,
          borderRadius: '8px',
        }}
      />
    </div>
  );
};

export default Chat;