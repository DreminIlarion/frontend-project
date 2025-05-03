import React, { useState, useRef, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ClassifierForm = ({ tabState, setTabState }) => {
  const formData = tabState.formData || {
    year: "2024",
    gender: "male",
    gpa: "4.2",
    points: "",
    direction: "",
  };
  const prediction = tabState.prediction || null;
  const loading = tabState.loading || false;

  const resultRef = useRef(null);

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
    setTabState({
      ...tabState,
      formData: { ...formData, [name]: value },
    });
  };

  const handleGenderChange = (gender) => {
    setTabState({
      ...tabState,
      formData: { ...formData, gender },
    });
  };

  const handleRangeChange = (e) => {
    const { value } = e.target;
    setTabState({
      ...tabState,
      formData: { ...formData, points: value },
    });
  };

  const handleDirectionChange = (e) => {
    const { value } = e.target;
    setTabState({
      ...tabState,
      formData: { ...formData, direction: value },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTabState({ ...tabState, loading: true, prediction: null });

    const dataToSend = {
      ...formData,
      gpa: parseFloat(formData.gpa),
      year: parseInt(formData.year, 10),
      points: parseInt(formData.points, 10),
    };

    if (
      !dataToSend.gender ||
      !dataToSend.gpa ||
      !dataToSend.points ||
      !dataToSend.year ||
      !dataToSend.direction
    ) {
      toast.error("Пожалуйста, заполните все поля формы.");
      setTabState({ ...tabState, loading: false });
      return;
    }

    if (isNaN(dataToSend.gpa) || isNaN(dataToSend.year) || isNaN(dataToSend.points)) {
      toast.error("Проверьте правильность введённых числовых данных.");
      setTabState({ ...tabState, loading: false });
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_PREDICT_FREE}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error(`Сервер вернул ошибку: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (result === 0) {
        setTabState({
          ...tabState,
          prediction: "no-data",
          loading: false,
        });
      } else if (typeof result === "number") {
        setTabState({
          ...tabState,
          prediction: result,
          loading: false,
        });
      } else {
        throw new Error("Неожиданный формат ответа от сервера");
      }

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Ошибка запроса:", error);
      toast.error("Произошла ошибка при обработке запроса");
      setTabState({ ...tabState, loading: false });
    }
  };

  const getBackground = (prediction) => {
    if (prediction === "no-data") return "bg-gray-100/90 border-gray-200";
    if (prediction <= 0.25) return "bg-gradient-to-r from-red-100 to-orange-100 border-red-200";
    if (prediction <= 0.4) return "bg-gradient-to-r from-orange-100 to-yellow-100 border-orange-200";
    if (prediction <= 0.6) return "bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-200";
    if (prediction <= 0.75) return "bg-gradient-to-r from-teal-100 to-cyan-100 border-teal-200";
    return "bg-gradient-to-r from-green-100 to-teal-100 border-green-200";
  };

  const getGradient = (prediction) => {
    if (prediction <= 0.25) return "from-red-500 to-red-700";
    if (prediction <= 0.4) return "from-orange-500 to-orange-700";
    if (prediction <= 0.6) return "from-blue-500 to-indigo-500";
    if (prediction <= 0.75) return "from-teal-500 to-cyan-500";
    return "from-green-500 to-teal-500";
  };

  const getDescription = (prediction) => {
    if (prediction === "no-data")
      return "Извините, но для таких данных у нас информации нет. Поменяйте вводимую информацию (это всего лишь бета-версия, возможны ошибки).";
    if (prediction <= 0.25)
      return "К сожалению, шансы на поступление очень низкие. Попробуйте улучшить свои баллы или рассмотреть другие направления.";
    if (prediction <= 0.4)
      return "Шансы на поступление невысоки. Возможно, стоит подтянуть баллы или выбрать менее конкурентное направление.";
    if (prediction <= 0.6)
      return "У вас есть шансы на поступление, но конкуренция может быть высокой. Удачи!";
    if (prediction <= 0.75)
      return "Хорошие шансы на поступление! Продолжайте в том же духе.";
    return "Отличные шансы на поступление! Вы на правильном пути!";
  };

  return (
    <div className="container mx-auto p-6 sm:p-8 text-center bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="p-6 sm:p-8 bg-white/95 backdrop-blur-lg border border-blue-100/50 rounded-3xl shadow-2xl w-full max-w-2xl mx-auto transition-all duration-300 hover:shadow-blue-200/50"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-6 sm:mb-8 tracking-tight animate-fadeIn">
          Вероятность поступления
        </h1>

        <fieldset className="flex-grow space-y-6 sm:space-y-8">
          <div className="block text-sm sm:text-base font-semibold text-gray-800">
            <label className="block mb-3 sm:mb-4 text-center text-lg sm:text-xl font-bold text-blue-900 tracking-tight animate-fadeIn">
              Общее количество баллов (ЕГЭ)
            </label>
            <div className="relative flex justify-center mb-6 sm:mb-8">
              <input
                type="number"
                min="1"
                max="310"
                value={formData.points === 0 ? "" : formData.points}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    setTabState({
                      ...tabState,
                      formData: { ...formData, points: 0 },
                    });
                  } else {
                    const parsedValue = parseInt(value);
                    setTabState({
                      ...tabState,
                      formData: {
                        ...formData,
                        points: Math.min(Math.max(1, parsedValue), 310),
                      },
                    });
                  }
                }}
                onBlur={(e) => {
                  if (e.target.value === "" || parseInt(e.target.value) < 1) {
                    setTabState({
                      ...tabState,
                      formData: { ...formData, points: 1 },
                    });
                  }
                }}
                className="w-28 sm:w-32 p-3 sm:p-4 text-center border border-blue-200 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-xl sm:text-2xl font-bold text-blue-900 shadow-md hover:shadow-lg focus:shadow-xl"
                placeholder="0"
              />
            </div>
            <div className="relative w-full max-w-xs mx-auto h-2 sm:h-3 rounded-full bg-gray-200 overflow-hidden mb-4">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${(formData.points / 310) * 100}%` }}
              ></div>
            </div>
            {formData.points > 310 && (
              <p className="text-red-500 text-sm mt-2 animate-fadeIn">
                Максимальное значение — 310 баллов
              </p>
            )}
          </div>

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

      {prediction !== null && (
        <div
          ref={resultRef}
          className={`mt-8 sm:mt-10 p-6 sm:p-8 border rounded-3xl shadow-2xl w-full max-w-2xl mx-auto animate-fadeIn transition-all duration-500 hover:shadow-xl ${getBackground(
            prediction
          )} relative overflow-hidden`}
        >
          <div className="absolute inset-0 opacity-20">
            <div className="absolute w-64 h-64 bg-white/30 rounded-full -top-32 -left-32 blur-3xl"></div>
            <div className="absolute w-64 h-64 bg-white/30 rounded-full -bottom-32 -right-32 blur-3xl"></div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight mb-4 sm:mb-6 text-center">
            Результат
          </h2>

          {prediction === "no-data" ? (
            <div className="text-center">
              <p className="text-lg sm:text-xl text-gray-800 leading-relaxed mb-4">
              Информация по указанным данным не найдена. Возможно, данные введены некорректно или таких данных нет в системе. 
              </p>
              <p className="text-sm sm:text-base text-gray-600 italic">
              Учтите, что это бета-версия, в работе возможны неточности.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center mb-4 sm:mb-6">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      className="fill-none stroke-gray-200 stroke-[3]"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={`fill-none stroke-[3] transition-all duration-1000 bg-gradient-to-r ${getGradient(
                        prediction
                      )}`}
                      strokeDasharray={`${prediction * 100}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                      {(prediction * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-lg sm:text-xl text-gray-800">
                  Ваш шанс на поступление
                </p>
              </div>
              <p className="text-sm sm:text-base italic text-gray-600 leading-relaxed text-center animate-fadeIn delay-200">
                {getDescription(prediction)}
              </p>
            </>
          )}
        </div>
      )}

      <div className="mt-8 sm:mt-10 p-6 sm:p-8 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-blue-100/50 w-full max-w-2xl mx-auto transition-all duration-300 hover:shadow-blue-200/50">
        <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
          <span className="font-semibold text-blue-900">Вероятность поступления</span> — это ваш первый шаг к оценке возможностей поступления в вуз. Укажите свои данные — баллы ЕГЭ и направление — и получите мгновенный прогноз, основанный на статистике прошлых лет. Узнайте, насколько вы близки к своей мечте, и планируйте следующий шаг с уверенностью!
        </p>
      </div>

      <ToastContainer />
    </div>
  );
};

export default ClassifierForm;