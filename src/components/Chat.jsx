import React, { useState, useEffect, useRef } from 'react';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const savedMessages = JSON.parse(localStorage.getItem('chatMessages'));
    if (savedMessages) {
      setMessages(savedMessages);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  // Скролл вниз при добавлении нового сообщения
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const newMessages = [...messages, { text: inputMessage, sender: 'user' }];
    setMessages(newMessages);
    setInputMessage('');
    setIsTyping(true);

    try {
      const encodedMessage = encodeURIComponent(inputMessage);
      const response = await fetch(
        `https://personal-account-fastapi.onrender.com/answer/?message=${encodedMessage}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Ошибка сервера');
      }

      const data = await response.json();
      setMessages([...newMessages, { text: data.answer, sender: 'bot' }]);
    } catch (error) {
      console.error('Error:', error);
      setTimeout(() => {
        setMessages([
          ...newMessages,
          { text: 'Чтобы начать пользоваться чат-ботом, войдите в аккаунт', sender: 'bot' },
        ]);
      }, 1000); // Появляется спустя 1 сек после "печати"
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
    <div className="flex flex-col h-[400px] max-w-[500px] w-full bg-white shadow-lg rounded-lg p-4 border border-gray-200">
      <div className="flex-1 overflow-y-auto space-y-2 p-2">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[70%] p-3 rounded-xl text-sm shadow ${
                msg.sender === 'user' ? 'bg-blue-500 text-white animate-slideInRight' : 'bg-gray-200 text-black animate-slideInLeft'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-[70%] p-3 rounded-xl text-sm shadow bg-gray-200 text-black animate-pulse">
              Чат-бот печатает...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center mt-2 border-t pt-2 border-gray-300">
        <input
          type="text"
          placeholder="Напишите сообщение..."
          className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={sendMessage}
          className="ml-2 px-3 py-2 bg-blue-500 text-white rounded-full shadow hover:bg-blue-600 transition"
        >
          Отправить
        </button>
      </div>
    </div>
  );
};

export default Chat;
