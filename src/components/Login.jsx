import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useUser } from "../context/UserContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isFormLoading, setIsFormLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsFormLoading(true);

    try {
      const response = await fetch(
        "https://registration-s6rk.onrender.com/api/v1/authorizations/login/email",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, hash_password: password }),
          credentials: "include",
        }
      );

      if (response.ok) {
        login(); // Просто вызываем login для установки состояния
        toast.success("Вход выполнен успешно!");
        setTimeout(() => navigate("/profile"), 100);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Ошибка авторизации.");
        if (errorData.message.includes("Сначала зарегистрируйтесь")) {
          setTimeout(() => navigate("/register"), 1500);
        }
      }
    } catch (error) {
      console.error("Ошибка:", error);
      toast.error("Ошибка соединения.");
    } finally {
      setIsFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-500 to-indigo-100">
      <Toaster position="top-right" />
      <div className="bg-white/95 p-8 rounded-3xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-8 text-blue-900">Вход</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-semibold mb-2 text-gray-800">
              Email
            </label>
            <input
              required
              id="email"
              type="email"
              className="w-full p-3 border rounded-xl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введите email"
            />
          </div>
          <div className="mb-8">
            <label htmlFor="password" className="block text-sm font-semibold mb-2 text-gray-800">
              Пароль
            </label>
            <input
              required
              id="password"
              type="password"
              className="w-full p-3 border rounded-xl"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
            />
          </div>
          <button
            type="submit"
            className={`w-full py-3 text-white rounded-xl ${
              isFormLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={isFormLoading}
          >
            {isFormLoading ? "..." : "Войти"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-700">
          Нет аккаунта?{" "}
          <span
            role="link"
            onClick={() => navigate("/registration")}
            className="underline text-blue-600"
          >
            Зарегистрируйтесь
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;