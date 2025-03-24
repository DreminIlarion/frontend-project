import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ClassifierForm = () => {
  const [formData, setFormData] = useState({
    year: "",
    gender: "",
    gpa: "",
    points: "",
    direction: "",
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

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
      } else {
        setPrediction(null);
        toast.error("Ошибка: сервер не вернул ожидаемое предсказание.");
      }
    } catch (error) {
      console.error("Ошибка запроса:", error.message);
      toast.error(`Произошла ошибка: ${error.message}`);
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
    <div className="container mx-auto p-6 text-center">
      <form
        onSubmit={handleSubmit}
        className="p-6 bg-white/90 backdrop-blur-lg border border-blue-100/50 rounded-2xl shadow-xl max-w-lg mx-auto"
      >
        {/* Название */}
        <h1 className="text-3xl font-bold text-blue-900 mb-6">Базовый шанс поступления</h1>

        <fieldset className="flex-grow space-y-6">
          {/* Выбор пола через кнопки */}
          <label className="block text-sm font-semibold text-gray-800">
            Пол:
            <div className="flex gap-4 mt-2 justify-center">
              <button
                type="button"
                onClick={() => handleGenderChange("male")}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold text-white transition-transform duration-300 hover:scale-105 active:scale-95 shadow-md ${
                  formData.gender === "male"
                    ? "bg-gradient-to-r from-blue-500 to-blue-700 hover:shadow-blue-500/50"
                    : "bg-gradient-to-r from-blue-500 to-blue-700 opacity-50 hover:shadow-blue-500/30"
                }`}
              >
                Мужской
              </button>
              <button
                type="button"
                onClick={() => handleGenderChange("female")}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold text-white transition-transform duration-300 hover:scale-105 active:scale-95 shadow-md ${
                  formData.gender === "female"
                    ? "bg-gradient-to-r from-pink-500 to-pink-700 hover:shadow-pink-500/50"
                    : "bg-gradient-to-r from-pink-500 to-pink-700 opacity-50 hover:shadow-pink-500/30"
                }`}
              >
                Женский
              </button>
            </div>
          </label>

          <label className="block text-sm font-semibold text-gray-800">
            Средний балл аттестата:
            <input
              type="number"
              step="0.01"
              min="2.0"
              max="5.0"
              value={formData.gpa}
              name="gpa"
              onChange={handleChange}
              className="w-full p-2 mt-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white/70 backdrop-blur-sm text-gray-900"
              required
            />
          </label>

          <label className="block text-sm font-semibold text-gray-800">
            Общее количество баллов (ЕГЭ):
            <input
              type="range"
              min="0"
              max="310"
              step="1"
              value={formData.points}
              onChange={handleRangeChange}
              className="w-full mt-2 accent-blue-500"
            />
            <span className="text-sm text-gray-600">{formData.points} баллов</span>
          </label>

          <label className="block text-sm font-semibold text-gray-800">
            Год:
            <input
              type="range"
              step="1"
              min="2019"
              max="2024"
              value={formData.year}
              name="year"
              onChange={handleChange}
              className="w-full mt-2 accent-blue-500"
              required
            />
            <span className="text-sm text-gray-600">{formData.year} год</span>
          </label>

          <label className="block text-sm font-semibold text-gray-800">
            Направление:
            <select
              value={formData.direction}
              onChange={handleDirectionChange}
              className="w-full p-2 mt-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white/70 backdrop-blur-sm text-gray-900"
              required
            >
              <option value="">Выберите направление</option>
              <option value="08.03.01 Строительство">08.03.01 Строительство</option>
              <option value="21.03.01 Нефтегазовое дело">21.03.01 Нефтегазовое дело</option>
              <option value="15.03.04 Автоматизация технологических процессов и производств">
                15.03.04 Автоматизация технологических процессов и производств
              </option>
              <option value="20.03.01 Техносферная безопасность">20.03.01 Техносферная безопасность</option>
              <option value="13.03.02 Электроэнергетика и электротехника">
                13.03.02 Электроэнергетика и электротехника
              </option>
              <option value="21.05.00 Прикладная геология, горное дело, нефтегазовое дело и геодезия">
                21.05.00 Прикладная геология, горное дело, нефтегазовое дело и геодезия
              </option>
              <option value="09.03.00 Информатика и вычислительная техника">
                09.03.00 Информатика и вычислительная техника
              </option>
              <option value="21.03.02 Землеустройство и кадастры">21.03.02 Землеустройство и кадастры</option>
              <option value="09.03.02 Информационные системы и технологии">
                09.03.02 Информационные системы и технологии
              </option>
              <option value="15.03.01 Машиностроение">15.03.01 Машиностроение</option>
              <option value="13.03.01 Теплоэнергетика и теплотехника">
                13.03.01 Теплоэнергетика и теплотехника
              </option>
              <option value="05.03.01 Геология">05.03.01 Геология</option>
              <option value="21.05.06 Нефтегазовые техника и технологии">
                21.05.06 Нефтегазовые техника и технологии
              </option>
              <option value="27.03.04 Управление в технических системах">
                27.03.04 Управление в технических системах
              </option>
              <option value="08.05.00 Техника и технологии строительства">
                08.05.00 Техника и технологии строительства
              </option>
              <option value="01.03.02 Прикладная математика и информатика">
                01.03.02 Прикладная математика и информатика
              </option>
              <option value="23.03.01 Технология транспортных процессов">
                23.03.01 Технология транспортных процессов
              </option>
              <option value="27.03.03 Системный анализ и управление">
                27.03.03 Системный анализ и управление
              </option>
              <option value="07.03.01 Архитектура">07.03.01 Архитектура</option>
              <option value="12.03.01 Приборостроение">12.03.01 Приборостроение</option>
              <option value="21.05.02 Прикладная геология">21.05.02 Прикладная геология</option>
              <option value="07.03.03 Дизайн архитектурной среды">07.03.03 Дизайн архитектурной среды</option>
              <option value="15.03.06 Мехатроника и робототехника">15.03.06 Мехатроника и робототехника</option>
              <option value="23.03.03 Эксплуатация транспортно-технологических машин и комплексов">
                23.03.03 Эксплуатация транспортно-технологических машин и комплексов
              </option>
              <option value="43.03.00 Сервис и туризм">43.03.00 Сервис и туризм</option>
              <option value="27.03.00 Управление в технических системах">
                27.03.00 Управление в технических системах
              </option>
              <option value="23.05.01 Наземные транспортно-технологические средства">
                23.05.01 Наземные транспортно-технологические средства
              </option>
              <option value="18.03.01 Химическая технология">18.03.01 Химическая технология</option>
              <option value="21.05.01 Прикладная геодезия">21.05.01 Прикладная геодезия</option>
              <option value="02.03.01 Математика и компьютерные науки">
                02.03.01 Математика и компьютерные науки
              </option>
              <option value="12.03.04 Биотехнические системы и технологии">
                12.03.04 Биотехнические системы и технологии
              </option>
              <option value="42.03.01 Реклама и связи с общественностью">
                42.03.01 Реклама и связи с общественностью
              </option>
              <option value="18.03.00 Химические технологии">18.03.00 Химические технологии</option>
            </select>
          </label>
        </fieldset>

        <button
          type="submit"
          className="w-[175px] mx-auto mt-6 p-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl shadow-md hover:shadow-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex justify-center transition-all"
          disabled={loading}
        >
          {loading ? "Загрузка..." : "Предсказать"}
        </button>
      </form>

      {/* Результат предсказания */}
      {prediction !== null && (
        <div
          className={`mt-6 p-6 ${
            prediction === 0 ? "bg-gray-100/90 border-gray-200" : getBackground(prediction)
          } border rounded-3xl shadow-xl max-w-lg mx-auto animate-fadeIn`}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Результат</h2>
          {prediction === 0 ? (
            <p className="text-lg text-gray-800">
              Извините, но для таких параметров у нас нет данных. Попробуйте изменить параметры.
            </p>
          ) : (
            <>
              <p className="text-lg text-gray-800 mb-2">
                Ваш шанс на поступление: <span className="font-semibold">{(prediction * 100).toFixed(0)}%</span>
              </p>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
                <div
                  className={`h-4 rounded-full bg-gradient-to-r ${getGradient(prediction)} animate-progress`}
                  style={{ width: `${prediction * 100}%` }}
                />
              </div>
              <p className="text-sm italic text-gray-600">{getDescription(prediction)}</p>
            </>
          )}
        </div>
      )}

      {/* Описание */}
      <div className="mt-6 p-6 bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-blue-100/50 max-w-lg mx-auto">
        <p className="text-sm text-gray-700 leading-relaxed">
          <span className="font-semibold text-blue-900">Базовый шанс поступления</span> — это ваш первый шаг к оценке возможностей поступления в вуз. Укажите свои данные — пол, средний балл аттестата, баллы ЕГЭ, год и направление — и получите мгновенный прогноз, основанный на статистике прошлых лет. Узнайте, насколько вы близки к своей мечте, и планируйте следующий шаг с уверенностью!
        </p>
      </div>

      {/* Контейнер для Toast */}
      <ToastContainer />
    </div>
  );
};

export default ClassifierForm;