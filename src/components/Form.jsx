import React, { useState, useRef, useEffect } from 'react';
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from "chart.js";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const Form = () => {
  const [formData, setFormData] = useState({
    gender: '',
    gpa: 0,
    points: 1,
    bonus_points: 0,
    russian: '',
    math: '',
    physics: '',
    chemistry: '',
    history: '',
    informatics: '',
    social_science: '',
    year: '2024'
  });

  const [recommendations, setRecommendations] = useState([]);
  const [details, setDetails] = useState({});
  const [pointsHistory, setPointsHistory] = useState({});
  const [openSections, setOpenSections] = useState({});
  const [examScores, setExamScores] = useState({});
  const [noDataDirections, setNoDataDirections] = useState({});
  const sortedRecommendations = [...recommendations].sort((a, b) => b.probability - a.probability);
  const [loading, setLoading] = useState(false);

  const recommendationsRef = useRef(null);

  const getChartData = (data) => ({
    labels: data.map((d) => d.year),
    datasets: [
      {
        label: 'Проходной балл',
        data: data.map((d) => d.points),
        borderColor: 'rgb(2, 33, 170)',
        backgroundColor: 'rgba(87, 194, 194, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBorderWidth: 2,
        pointBackgroundColor: 'rgb(2, 33, 170)',
        pointBorderColor: 'white',
      },
    ],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { title: { display: true, text: 'Год' } },
      y: { title: { display: true, text: 'Баллы' }, beginAtZero: false },
    },
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (['gender', 'year', 'foreign_citizenship', 'military_service'].includes(name)) {
        return { ...prev, [name]: value };
      }

      const parsedValue = name === 'gpa' || name === 'bonus_points' ? value : parseInt(value) || '';
      const newFormData = { ...prev, [name]: parsedValue };

      const totalPoints =
        (parseInt(newFormData.russian) || 0) +
        (parseInt(newFormData.math) || 0) +
        (parseInt(newFormData.physics) || 0) +
        (parseInt(newFormData.chemistry) || 0) +
        (parseInt(newFormData.history) || 0) +
        (parseInt(newFormData.informatics) || 0) +
        (parseInt(newFormData.social_science) || 0) +
        (parseInt(newFormData.bonus_points) || 0);

      return { ...newFormData, points: totalPoints };
    });
  };

  const toggleSection = (directionId, section) => {
    if (noDataDirections[directionId]) return;

    setOpenSections((prev) => {
      const newState = { ...prev };
      if (!newState[directionId]) newState[directionId] = [];
      newState[directionId] = newState[directionId].includes(section)
        ? newState[directionId].filter((s) => s !== section)
        : [...newState[directionId], section];
      return newState;
    });
  };

  const fetchDetails = async (directionId) => {
    if (noDataDirections[directionId]) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_PREDICT_DIRECTION}${directionId}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.body && data.body.trim() !== '') {
          setDetails((prev) => ({
            ...prev,
            [directionId]: data.body
              .replace(/\\n/g, ' ')
              .replace(/\s+/g, ' ')
              .replace(/([а-яА-Я]):([А-Я])/g, '$1: $2')
              .replace(/([а-яА-Я])([А-Я])/g, '$1 $2')
              .replace(/-\s+/g, '- ')
              .replace(/(\.)([^\s])/g, '. $2')
              .trim()
          }));
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки информации:', error);
    }
  };

  const fetchPointsHistory = async (directionId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_PREDICT_POINTS}${directionId}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        if (data.body && Array.isArray(data.body) && data.body.length > 0) {
          setPointsHistory((prev) => ({ ...prev, [directionId]: data.body }));
        } else {
          setNoDataDirections((prev) => ({ ...prev, [directionId]: "Данные отсутствуют. Это лишь бета-тестирование, возможны ошибки." }));
        }
      } else {
        setNoDataDirections((prev) => ({ ...prev, [directionId]: "Данные отсутствуют. Это лишь бета-тестирование, возможны ошибки." }));
      }
    } catch (error) {
      setNoDataDirections((prev) => ({ ...prev, [directionId]: "Данные отсутствуют. Это лишь бета-тестирование, возможны ошибки." }));
    }
  };

  const fetchExamScores = async (directionId) => {
    if (noDataDirections[directionId]) return;

    try {
      const response = await fetch(`https://personal-account-fastapi.onrender.com/api/v1/predict/exams/${directionId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await response.json();
      if (data.status_code === 200 && Array.isArray(data.body) && data.body.length > 0) {
        setExamScores((prev) => ({ ...prev, [directionId]: data.body }));
      }
    } catch (error) {
      console.error("Ошибка загрузки баллов экзаменов:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.gender) {
      toast.error("Пожалуйста, выберите пол.");
      return;
    }
    if (!formData.year) {
      toast.error("Пожалуйста, выберите год.");
      return;
    }
    if (formData.points > 310) {
      toast.error("Сумма баллов ЕГЭ превышает максимум (310). Исправьте данные.");
      return;
    }

    const examsArray = [
      { subject: 'russian', points: parseInt(formData.russian) || 1 },
      { subject: 'math', points: parseInt(formData.math) || 0 },
      { subject: 'physics', points: parseInt(formData.physics) || 0 },
      { subject: 'chemistry', points: parseInt(formData.chemistry) || 0 },
      { subject: 'history', points: parseInt(formData.history) || 0 },
      { subject: 'informatics', points: parseInt(formData.informatics) || 0 },
      { subject: 'social_science', points: parseInt(formData.social_science) || 0 },
    ].filter(exam => exam.points > 0);

    const dataToSend = {
      gender: formData.gender,
      foreign_citizenship: formData.foreign_citizenship,
      military_service: formData.military_service,
      gpa: parseFloat(formData.gpa) || 0,
      points: formData.points,
      bonus_points: parseInt(formData.bonus_points) || 0,
      exams: examsArray,
      year: parseInt(formData.year)
    };

    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_PREDICT}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.body.recomendate && Array.isArray(data.body.recomendate)) {
          setOpenSections({});
          setDetails({});
          setPointsHistory({});
          setExamScores({});
          setNoDataDirections({});
          setRecommendations(data.body.recomendate.map((rec, index) => ({
            direction_id: rec.direction_id,
            name: rec.name,
            probability: data.body.classifier ? data.body.classifier[index] : 0,
          })));
          setTimeout(() => {
            recommendationsRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      } else {
        const errorText = await response.text();
        toast.error(`Ошибка сервера: ${errorText}`);
        console.error('Ошибка при отправке данных:', errorText);
      }
    } catch (error) {
      toast.error("Ошибка отправки данных. Проверьте подключение.");
      console.error('Ошибка отправки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 flex flex-col space-y-6 max-w-full">
      {/* Форма */}
      <div className="w-full sm:max-w-3xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-white/90 backdrop-blur-lg p-6 sm:p-8 shadow-xl rounded-2xl border border-blue-100/50 slide-in"
        >
          <h1 className="text-xl sm:text-2xl font-bold text-blue-900 mb-4 text-center fade-in">Рекомендация направлений</h1>
  
          <label className="block text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4">
  Укажите ваш пол:
  <div className="flex items-center justify-center gap-4 sm:gap-6 mt-2 sm:mt-3">
    <label className="flex items-center cursor-pointer">
      <input
        type="radio"
        name="gender"
        value="male"
        checked={formData.gender === 'male'}
        onChange={handleChange}
        className="hidden"
      />
      <span
        className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base text-white transition-all duration-300 shadow-lg animate-fadeIn ${
          formData.gender === 'male'
            ? 'bg-gradient-to-r from-blue-800 to-indigo-800 hover:shadow-blue-500/60'
            : 'bg-gradient-to-r from-blue-300 to-indigo-300 opacity-70 hover:shadow-blue-400/10'
        } hover:scale-105 active:scale-95`}
      >
        Мужской
      </span>
    </label>
    <label className="flex items-center cursor-pointer">
      <input
        type="radio"
        name="gender"
        value="female"
        checked={formData.gender === 'female'}
        onChange={handleChange}
        className="hidden"
      />
      <span
        className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base text-white transition-all duration-300 shadow-lg animate-fadeIn ${
          formData.gender === 'female'
            ? 'bg-gradient-to-r from-pink-800 to-rose-800 hover:shadow-pink-500/60'
            : 'bg-gradient-to-r from-pink-300 to-rose-300 opacity-70 hover:shadow-pink-400/10'
        } hover:scale-105 active:scale-95`}
      >
        Женский
      </span>
    </label>
  </div>
</label>
  
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <label className="block text-sm sm:text-base font-semibold text-gray-800">
              Средний балл аттестата:
              <input
                type="number"
                step="0.01"
                min="3.0"
                max="5.0"
                name="gpa"
                value={formData.gpa}
                onChange={handleChange}
                className="w-full p-2 sm:p-3 mt-1 border border-blue-200 rounded-lg bg-white/70 backdrop-blur-sm foci:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm sm:text-base"
              />
            </label>
  
            <label className="block text-sm sm:text-base font-semibold text-gray-800">
              Дополнительные баллы:
              <input
                type="number"
                min="0"
                max="10"
                name="bonus_points"
                value={formData.bonus_points}
                onChange={handleChange}
                className="w-full p-2 sm:p-3 mt-1 border border-blue-200 rounded-lg bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm sm:text-base"
              />
            </label>
          </div>
  
          <label className="block mb-2 text-sm sm:text-base font-semibold text-gray-800">Экзамены и баллы:</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            {[
              { key: 'russian', label: 'Русский язык' },
              { key: 'math', label: 'Математика' },
              { key: 'physics', label: 'Физика' },
              { key: 'chemistry', label: 'Химия' },
              { key: 'history', label: 'История' },
              { key: 'informatics', label: 'Информатика' },
              { key: 'social_science', label: 'Обществознание' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center">
                <span className="w-28 sm:w-32 text-gray-700 text-sm sm:text-base">{label}:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  name={key}
                  value={formData[key] || ''}
                  onChange={handleChange}
                  className="ml-2 sm:ml-3 p-2 sm:p-3 border border-blue-200 rounded-lg bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 transition-all duration-200 w-20 sm:w-24 text-sm sm:text-base"
                />
              </div>
            ))}
          </div>

          <div className="mb-3 text-center">
            <label className="block mb-1 text-sm sm:text-base font-semibold text-gray-800">
              Итоговая сумма баллов ЕГЭ (включая доп. баллы):
            </label>
            <div
              className={`inline-block px-3 sm:px-4 py-1 rounded-lg border ${
                formData.points > 310
                  ? 'bg-red-100 border-red-300 text-red-800'
                  : 'bg-blue-100 border-blue-300 text-blue-800'
              } font-semibold text-sm sm:text-base`}
            >
              {formData.points} баллов
            </div>
            {formData.points > 310 &&    (
              <p className="text-red-500 text-sm mt-1">
                Сумма баллов не должна превышать 310
              </p>
            )}
          </div>
  
          {loading && (
            <div className="flex justify-center my-3">
              <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
  
          <button
            type="submit"
            className={`w-full py-2 sm:py-3 rounded-lg shadow-md transition-transform duration-300 text-sm sm:text-base ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-105 active:scale-95 hover:shadow-blue-500/50'
            }`}
            disabled={loading}
          >
            {loading ? 'Загрузка...' : 'Рассчитать'}
          </button>
        </form>
      </div>
  
      {/* Рекомендации */}
      <div className="w-full sm:max-w-3xl mx-auto">
        <div
          ref={recommendationsRef}
          className="p-6 sm:p-8 bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-blue-100/50 slide-in"
        >
          <h2 className="text-xl sm:text-2xl font-semibold text-blue-900 mb-4 text-center fade-in">Рекомендации</h2>
          {sortedRecommendations.length > 0 ? (
            <div className="space-y-4">
              {sortedRecommendations.map((rec, index) => (
                <div
                  key={index}
                  className="p-4 sm:p-5 bg-blue-100/70 backdrop-blur-sm rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 slide-in"
                >
                  <p className="text-base sm:text-lg font-semibold text-blue-700">{rec.name}</p>
                  <p className="text-base sm:text-lg mt-1 text-gray-600">
                    <strong className="text-blue-600">Вероятность поступления:</strong>{' '}
                    <span
                      className={`text-lg sm:text-xl font-semibold ${
                        rec.probability >= 0.5
                          ? 'text-green-600'
                          : rec.probability >= 0.3
                          ? 'text-orange-500'
                          : 'text-red-600'
                      }`}
                    >
                      {Math.round(rec.probability * 100)}%
                    </span>
                  </p>

                  {noDataDirections[rec.direction_id] ? (
                    <p className="text-sm sm:text-base text-gray-700 italic mt-2">{noDataDirections[rec.direction_id]}</p>
                  ) : (
                    <>
                      <div className="mt-3 flex flex-wrap gap-2 sm:gap-3">
                        <button
                          onClick={() => {
                            fetchDetails(rec.direction_id);
                            toggleSection(rec.direction_id, 'details');
                          }}
                          className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-transform duration-300 hover:scale-105 active:scale-95 text-sm sm:text-base ${
                            openSections[rec.direction_id]?.includes('details')
                              ? 'bg-green-700 text-white'
                              : 'bg-green-500 text-white hover:shadow-green-500/50'
                          }`}
                          disabled={noDataDirections[rec.direction_id]}
                        >
                          Подробнее
                        </button>
  
                        <button
                          onClick={() => {
                            fetchPointsHistory(rec.direction_id);
                            toggleSection(rec.direction_id, 'points');
                          }}
                          className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-transform duration-300 hover:scale-105 active:scale-95 text-sm sm:text-base ${
                            openSections[rec.direction_id]?.includes('points')
                              ? 'bg-purple-700 text-white'
                              : 'bg-purple-500 text-white hover:shadow-purple-500/50'
                          }`}
                          disabled={noDataDirections[rec.direction_id]}
                        >
                          <span className="block sm:hidden">Баллы</span>
                          <span className="hidden sm:block">Динамика баллов</span>
                        </button>
  
                        <button
                          onClick={() => {
                            fetchExamScores(rec.direction_id);
                            toggleSection(rec.direction_id, 'exams');
                          }}
                          className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-transform duration-300 hover:scale-105 active:scale-95 text-sm sm:text-base ${
                            openSections[rec.direction_id]?.includes('exams')
                              ? 'bg-blue-700 text-white'
                              : 'bg-blue-500 text-white hover:shadow-blue-500/50'
                          }`}
                          disabled={noDataDirections[rec.direction_id]}
                        >
                          <span className="block sm:hidden">Экзамены</span>
                          <span className="hidden sm:block">Показать экзамены</span>
                        </button>
                      </div>
  
                      {openSections[rec.direction_id]?.slice().reverse().map((section) => (
                        <div key={section} className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-100/80 backdrop-blur-sm rounded-md relative slide-in">
                          <button
                            onClick={() => toggleSection(rec.direction_id, section)}
                            className="absolute top-1 right-1 text-red-600 hover:text-red-800 transition-colors duration-200 text-sm"
                          >
                            ✕
                          </button>
                          {section === 'details' && details[rec.direction_id] && (
                            <>
                              <h3 className="text-sm sm:text-base font-semibold text-gray-800">Подробности:</h3>
                              {details[rec.direction_id].split(/[;\n]/).map((block, i) => (
                                <p key={i} className="mt-1 text-sm sm:text-base text-gray-700">{block.trim()}</p>
                              ))}
                            </>
                          )}
                          {section === 'points' && pointsHistory[rec.direction_id] && (
                            <>
                              <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4">Динамика баллов</h3>
                              <div className="h-56 sm:h-64">
                                <Line data={getChartData(pointsHistory[rec.direction_id])} options={chartOptions} />
                              </div>
                            </>
                          )}
                          {section === 'exams' && examScores[rec.direction_id] && (
                            <>
                              <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 sm:mb-4">Минимальные баллы по экзаменам</h3>
                              <ul className="list-disc pl-4 sm:pl-5">
                                {examScores[rec.direction_id].map((exam, index) => (
                                  <li key={index} className="text-sm sm:text-base text-gray-700">
                                    {exam.name}: {exam.min_points}
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center text-sm sm:text-base">Рекомендации пока отсутствуют. Введите параметры.</p>
          )}
        </div>

        {/* Описание */}
        <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-blue-100/50 slide-in">
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
            <span className="font-semibold text-blue-900">Рекомендация направлений</span> — это мощный инструмент
            для точной оценки ваших перспектив. Введите данные об экзаменах, баллах ЕГЭ, аттестате и дополнительных
            достижениях, чтобы получить персонализированные рекомендации по направлениям обучения. Мы анализируем
            статистику и динамику, чтобы помочь вам выбрать лучший путь к поступлению!
          </p>
        </div>
      </div>
  
      <ToastContainer />
    </div>
  );
};

export default Form;