import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100 text-center p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* SVG иллюстрация */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 640 512"
          className="w-64 h-64 text-blue-500"
          fill="currentColor"
        >
          <path d="M320 32C146.3 32 0 178.3 0 352s146.3 320 320 320 320-146.3 320-320S493.7 32 320 32zm0 576c-141.4 0-256-114.6-256-256S178.6 96 320 96s256 114.6 256 256-114.6 256-256 256zM392 256c0-39.8-32.2-72-72-72s-72 32.2-72 72v64h-24c-13.3 0-24 10.7-24 24v128c0 13.3 10.7 24 24 24h192c13.3 0 24-10.7 24-24V344c0-13.3-10.7-24-24-24h-24v-64zm-48 64h-48v-64c0-13.3 10.7-24 24-24s24 10.7 24 24v64z" />
        </svg>
      </motion.div>

      <motion.h1
        className="text-6xl font-bold text-blue-600 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        404
      </motion.h1>
      <motion.h2
        className="text-2xl font-semibold mt-2 text-gray-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Страница не найдена
      </motion.h2>
      <motion.p
        className="text-gray-600 mt-4 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        Возможно, вы ошиблись в адресе или страница была удалена.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <Link
          to="/"
          className="px-6 py-3 text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 transition transform hover:scale-105"
        >
          Вернуться на главную
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
