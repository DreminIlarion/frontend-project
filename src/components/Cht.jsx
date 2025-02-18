import React, { useState, useEffect, useRef } from 'react';
import { FaArrowLeft, FaPaperPlane } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ChatPage = () => {
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
        { method: 'GET', credentials: 'include' }
      );
      
      if (!response.ok) throw new Error('Ошибка сервера');
      
      const data = await response.json();
      if (data.answer) {
        setMessages([...newMessages, { text: data.answer, sender: 'bot' }]);
      }
    } catch (error) {
      setMessages([...newMessages, { text: 'Ошибка связи с сервером', sender: 'bot' }]);
    } finally {
      setTimeout(() => setIsTyping(false), 800);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Шапка */}
      <header className="flex items-center p-4 bg-blue-600 text-white shadow-md">
        <Link to="/profile" className="text-white text-2xl">
          <FaArrowLeft />
        </Link>
        <h1 className="ml-4 text-xl font-semibold">Чат поддержки</h1>
      </header>
      
      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] p-3 rounded-xl text-sm shadow ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-[75%] p-3 rounded-xl text-sm shadow bg-gray-200 text-black animate-pulse">
              Чат-бот печатает...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Поле ввода */}
      <div className="p-4 bg-white shadow-md flex items-center gap-2">
        <input
          type="text"
          placeholder="Напишите сообщение..."
          className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white p-3 rounded-full shadow hover:bg-blue-600 transition"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
