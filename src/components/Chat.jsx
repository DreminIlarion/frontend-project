import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Загрузка сообщений из localStorage
  useEffect(() => {
    const savedMessages = JSON.parse(localStorage.getItem('chatMessages'));
    if (savedMessages) {
      setMessages(savedMessages);
    }
  }, []);

  // Сохранение сообщений в localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  // Скролл вниз при новом сообщении
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Отправка сообщения
  const sendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const newMessages = [...messages, { text: inputMessage, sender: 'user' }];
    setMessages(newMessages);
    setInputMessage('');
    setIsTyping(true);

    try {
      const encodedMessage = encodeURIComponent(inputMessage);
      const response = await fetch(
        `${process.env.REACT_APP_ANSWER}${encodedMessage}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Ошибка сервера');
      }

      const data = await response.json();
      console.log('Ответ от сервера:', data);

      if (data.body.answer) {
        setMessages([...newMessages, { text: data.body.answer, sender: 'bot' }]);
      } else {
        console.error("Ответ от сервера не содержит ключ 'answer'");
      }
    } catch (error) {
      console.error('Error:', error);
      setTimeout(() => {
        setMessages([
          ...newMessages,
          { text: 'Чтобы начать пользоваться чат-ботом, войдите в аккаунт', sender: 'bot' },
        ]);
      }, 1000);
    } finally {
      setTimeout(() => setIsTyping(false), 800);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-blue-100/50 overflow-hidden">
      {/* Блок с сообщениями */}
      <div className="flex-1 max-h-[45vh] overflow-y-auto space-y-3 p-4">

        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-xl text-sm shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                    : 'bg-gray-100/80 backdrop-blur-sm text-gray-900'
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex justify-start"
            >
              <div className="max-w-[70%] p-3 rounded-xl text-sm shadow-md bg-gray-100/80 backdrop-blur-sm text-gray-900 animate-pulse">
                Чат-бот печатает...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Поле ввода сообщения */}
      <div className="flex items-center gap-3 p-4 border-t border-blue-100/50 bg-blue-50/50">
        <input
          type="text"
          placeholder="Напишите сообщение..."
          className="flex-1 px-4 py-2 rounded-full border border-blue-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <motion.button
          onClick={sendMessage}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-md hover:shadow-blue-500/50 transition-all whitespace-nowrap"
        >
          Отправить
        </motion.button>
      </div>
    </div>
  );
};

export default Chat;