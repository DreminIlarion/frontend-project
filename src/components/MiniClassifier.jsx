import React, { useState, useRef, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ClassifierForm = () => {
  const [formData, setFormData] = useState({
    year: "2024",
    gender: "",
    gpa: "",
    points: "",
    direction: "",
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const resultRef = useRef(null); // Ссылка на блок результата

  const directions = [
    "01.03.02 Прикладная математика и информатика",
    "02.03.01 Математика и компьютерные науки",
    "05.03.01 Геология",
    "07.03.01 Архитектура",
    "07.03.03 Дизайн архитектурной среды",
    "08.03.01 Строительство",
    "08.05.00 Техника и технологии строительства",
    "09.03.00 Информатика и вычислительная техника",
    "09.03.02 Информационные системы и технологии",
    "12.03.01 Приборостроение",
    "12.03.04 Биотехнические системы и технологии",
    "13.03.01 Теплоэнергетика и теплотехника",
    "13.03.02 Электроэнергетика и электротехника",
    "15.03.01 Машиностроение",
    "15.03.04 Автоматизация технологических процессов и производств",
    "15.03.06 Мехатроника и робототехника",
    "18.03.00 Химические технологии",
    "18.03.01 Химическая технология",
    "20.03.01 Техносферная безопасность",
    "21.03.01 Нефтегазовое дело",
    "21.03.02 Землеустройство и кадастры",
    "21.05.00 Прикладная геология, горное дело, нефтегазовое дело и геодезия",
    "21.05.01 Прикладная геодезия",
    "21.05.02 Прикладная геология",
    "21.05.06 Нефтегазовые техника и технологии",
    "23.03.01 Технология транспортных процессов",
    "23.03.03 Эксплуатация транспортно-технологических машин и комплексов",
    "23.05.01 Наземные транспортно-технологические средства",
    "27.03.00 Управление в технических системах",
    "27.03.03 Системный анализ и управление",
    "27.03.04 Управление в технических системах",
    "42.03.01 Реклама и связи с общественностью",
    "43.03.00 Сервис и туризм",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleGenderChange = (gender) => {
    setFormData((prevState) => ({
      ...prevState,
      gender,
    }));
  };

  const handleRangeChange = (e) => {
    const { value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      points: value,
    }));
  };

  const handleDirectionChange = (e) => {
    const { value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      direction: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPrediction(null); // Сбрасываем предыдущее предсказание

    const dataToSend = {
      ...formData,
      gpa: parseFloat(formData.gpa),
      year: parseInt(formData.year, 10),
      points: parseInt(formData.points, 10),
    };

    // Проверка данных перед отправкой
    if (!dataToSend.gender || !dataToSend.gpa || !dataToSend.points || !dataToSend.year || !dataToSend.direction) {
      toast.error("Пожалуйста, заполните все поля формы.");
      setLoading(false);
      return;
    }

    if (isNaN(dataToSend.gpa) || isNaN(dataToSend.year) || isNaN(dataToSend.points)) {
      toast.error("Проверьте правильность введённых числовых данных.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_PREDICT_FREE}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error(`Сервер вернул ошибку: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      // Проверяем, является ли result.body числом (включая 0)
      if (typeof result.body === "number") {
        setPrediction(result.body); // Устанавливаем prediction, даже если это 0
        // Прокручиваем к блоку результата
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        setPrediction(null);
        toast.error("Ошибка: сервер не вернул ожидаемое предсказание.");
      }
    } catch (error) {
      console.error("Ошибка запроса:");
      toast.error(`Произошла ошибка`);
    } finally {
      setLoading(false);
    }
  };

  // Функция для получения фона в зависимости от prediction
  const getBackground = (prediction) => {
    if (prediction <= 0.25) return "bg-red-100/90 border-red-200";
    if (prediction <= 0.4) return "bg-red-50/90 border-red-100";
    if (prediction <= 0.6) return "bg-blue-50/90 border-blue-100";
    if (prediction <= 0.75) return "bg-teal-50/90 border-teal-100";
    return "bg-green-50/90 border-green-100";
  };

  // Функция для получения градиента прогресс-бара
  const getGradient = (prediction) => {
    if (prediction <= 0.25) return "from-red-500 to-red-700";
    if (prediction <= 0.4) return "from-red-400 to-red-600";
    if (prediction <= 0.6) return "from-blue-400 to-blue-600";
    if (prediction <= 0.75) return "from-teal-500 to-teal-700";
    return "from-green-500 to-green-700";
  };

  // Функция для получения дополнительного описания
  const getDescription = (prediction) => {
    if (prediction <= 0.25) return "К сожалению, шансы на поступление очень низкие. Попробуйте улучшить свои баллы или рассмотреть другие направления.";
    if (prediction <= 0.4) return "Шансы на поступление невысоки. Возможно, стоит подтянуть баллы или выбрать менее конкурентное направление.";
    if (prediction <= 0.6) return "У вас есть шансы на поступление, но конкуренция может быть высокой. Удачи!";
    if (prediction <= 0.75) return "Хорошие шансы на поступление! Продолжайте в том же духе.";
    return "Отличные шансы на поступление! Вы на правильном пути!";
  };

  return (
    <div className="container mx-auto p-6 sm:p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="p-6 sm:p-8 bg-white/95 backdrop-blur-lg border border-blue-100/50 rounded-3xl shadow-2xl w-full max-w-2xl mx-auto transition-all duration-300 hover:shadow-blue-200/50"
      >
        {/* Название */}
        <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-6 sm:mb-8 tracking-tight animate-fadeIn">
          Вероятность поступления
        </h1>

        <fieldset className="flex-grow space-y-6 sm:space-y-8">
          {/* Выбор пола через кнопки */}
          <label className="block text-sm sm:text-base font-semibold text-gray-800">
            Укажите ваш пол:
            <div className="flex gap-4 mt-2 sm:mt-3 justify-center">
              <button
                type="button"
                onClick={() => handleGenderChange("male")}
                className={`flex-1 py-2 px-4 sm:px-6 rounded-xl font-semibold text-white transition-transform duration-300 hover:scale-105 active:scale-95 shadow-lg ${
                  formData.gender === "male"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-500/50"
                    : "bg-gradient-to-r from-blue-400 to-indigo-400 opacity-70 hover:shadow-blue-400/30"
                }`}
              >
                Мужской
              </button>
              <button
                type="button"
                onClick={() => handleGenderChange("female")}
                className={`flex-1 py-2 px-4 sm:px-6 rounded-xl font-semibold text-white transition-transform duration-300 hover:scale-105 active:scale-95 shadow-lg ${
                  formData.gender === "female"
                    ? "bg-gradient-to-r from-pink-600 to-rose-600 hover:shadow-pink-500/50"
                    : "bg-gradient-to-r from-pink-400 to-rose-400 opacity-70 hover:shadow-pink-400/30"
                }`}
              >
                Женский
              </button>
            </div>
          </label>

          <label className="block text-sm sm:text-base font-semibold text-gray-800">
            Средний балл аттестата:
            <input
              type="number"
              step="0.01"
              min="3.0"
              max="5.0"
              value={formData.gpa}
              name="gpa"
              onChange={handleChange}
              className="w-full p-3 sm:p-4 mt-2 border border-blue-200 rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 text-gray-900 transition-all duration-300 hover:shadow-md"
              required
            />
          </label>

          <label className="block text-sm sm:text-base font-semibold text-gray-800">
            Общее количество баллов (ЕГЭ):
            <input
              type="range"
              min="1"
              max="310"
              step="1"
              value={formData.points}
              onChange={handleRangeChange}
              className="w-full mt-3 sm:mt-4 h-3 sm:h-4 rounded-full appearance-none cursor-pointer bg-gradient-to-r from-gray-200 to-gray-300 focus:outline-none"
            />
            <div className="flex items-center justify-center mt-3 sm:mt-4 gap-2">
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text animate-pulse">
                {formData.points}
              </span>
              <span className="text-sm sm:text-base text-gray-600">баллов</span>
            </div>
          </label>

          <label className="block text-sm sm:text-base font-semibold text-gray-800 mb-1">
            Направление:
          </label>
          <div className="relative">
            <select
              value={formData.direction}
              onChange={handleDirectionChange}
              className="w-full p-3 sm:p-4 border border-gray-300 rounded-xl shadow-md bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 appearance-none focus:ring-4 focus:ring-blue-300 focus:outline-none hover:shadow-lg transition-all duration-300"
              required
            >
              <option value="">Выберите направление</option>
              {directions.map((direction) => (
                <option key={direction} value={direction}>
                  {direction}
                </option>
              ))}
            </select>
            {/* Кастомная стрелочка справа */}
            <div className="absolute inset-y-0 right-3 sm:right-4 flex items-center pointer-events-none text-gray-500">
              ▼
            </div>
          </div>
        </fieldset>

        <button
          type="submit"
          className="w-[200px] sm:w-[250px] mx-auto mt-6 sm:mt-8 p-3 sm:p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl shadow-lg hover:shadow-blue-500/50 focus:outline-none focus:ring-4 focus:ring-blue-400 flex justify-center transition-all duration-300 hover:scale-105 active:scale-95"
          disabled={loading}
        >
          {loading ? (
            <div className="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
          ) : (
            "Предсказать"
          )}
        </button>
      </form>

      {/* Результат предсказания */}
      {prediction !== null && (
        <div
          ref={resultRef}
          className={`mt-8 sm:mt-10 p-6 sm:p-8 ${
            prediction === 0 ? "bg-gray-100/90 border-gray-200" : getBackground(prediction)
          } border rounded-3xl shadow-2xl w-full max-w-2xl mx-auto animate-fadeIn transition-all duration-300 hover:shadow-lg`}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Результат</h2>
          {prediction === 0 ? (
            <p className="text-lg sm:text-xl text-gray-800">
              Извините, но для таких параметров у нас нет данных. Попробуйте изменить параметры.
            </p>
          ) : (
            <>
              <p className="text-lg sm:text-xl text-gray-800 mb-3 sm:mb-4">
                Ваш шанс на поступление: <span className="font-semibold text-blue-900">{(prediction * 100).toFixed(0)}%</span>
              </p>
              <div className="w-full bg-gray-200 rounded-full h-5 sm:h-6 mb-4 sm:mb-6 overflow-hidden shadow-inner">
                <div
                  className={`h-5 sm:h-6 rounded-full bg-gradient-to-r ${getGradient(prediction)} animate-progress shadow-md`}
                  style={{ width: `${prediction * 100}%` }}
                />
              </div>
              <p className="text-sm sm:text-base italic text-gray-600 leading-relaxed">{getDescription(prediction)}</p>
            </>
          )}
        </div>
      )}

      {/* Описание */}
      <div className="mt-8 sm:mt-10 p-6 sm:p-8 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-blue-100/50 w-full max-w-2xl mx-auto transition-all duration-300 hover:shadow-blue-200/50">
        <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
          <span className="font-semibold text-blue-900">Вероятность поступления</span> — это ваш первый шаг к оценке возможностей поступления в вуз. Укажите свои данные — пол, средний балл аттестата, баллы ЕГЭ и направление — и получите мгновенный прогноз, основанный на статистике прошлых лет. Узнайте, насколько вы близки к своей мечте, и планируйте следующий шаг с уверенностью!
        </p>
      </div>

      {/* Контейнер для Toast */}
      <ToastContainer />
    </div>
  );
};

export default ClassifierForm;