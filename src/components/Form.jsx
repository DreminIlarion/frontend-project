import React, { useState } from 'react';
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from "chart.js";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const Form = () => {
  const [formData, setFormData] = useState({
    gender: '',
    gpa: 0,
    points: 0,
    bonus_points: 0,
    russian: '',
    math: '',
    physics: '',
    chemistry: '',
    history: '',
    informatics: '',
    social_science: '',
    year: ''
  });

  const [recommendations, setRecommendations] = useState([]);
  const [details, setDetails] = useState({});
  const [pointsHistory, setPointsHistory] = useState({});
  const [openSections, setOpenSections] = useState({});
  const [examScores, setExamScores] = useState({});
  const sortedRecommendations = [...recommendations].sort((a, b) => b.probability - a.probability);
  const [loading, setLoading] = useState(false);

  // Настройка графика
  const getChartData = (data) => ({
    labels: data.map((d) => d.year),
    datasets: [
      {
        label: 'Проходной балл',
        data: data.map((d) => d.points),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.4,
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
    try {
      const response = await fetch(`${process.env.REACT_APP_PREDICT_DIRECTION}${directionId}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
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
      } else {
        console.error('Ошибка загрузки информации:', await response.text());
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
        setPointsHistory((prev) => ({ ...prev, [directionId]: data.body }));
      } else {
        console.error('Ошибка загрузки динамики баллов:', await response.text());
      }
    } catch (error) {
      console.error('Ошибка загрузки динамики баллов:', error);
    }
  };

  const fetchExamScores = async (directionId) => {
    try {
      const response = await fetch(`https://personal-account-fastapi.onrender.com/api/v1/predict/exams/${directionId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await response.json();
      if (data.status_code === 200 && Array.isArray(data.body)) {
        setExamScores((prev) => ({ ...prev, [directionId]: data.body }));
      } else {
        console.error("Неверный формат данных:", data);
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
      { subject: 'russian', points: parseInt(formData.russian) || 0 },
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
          setRecommendations(data.body.recomendate.map((rec, index) => ({
            direction_id: rec.direction_id,
            name: rec.name,
            probability: data.body.classifier ? data.body.classifier[index] : 0,
          })));
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
    <div className="container mx-auto p-6 flex flex-col lg:flex-row lg:space-x-10">
      {/* Форма */}
      <div className="w-full lg:w-1/2 mb-6 lg:mb-0">
        <form
          onSubmit={handleSubmit}
          className="bg-white/90 backdrop-blur-lg p-8 shadow-xl rounded-2xl border border-blue-100/50 slide-in"
        >
          <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center fade-in">Расширенный шанс поступления</h1>
  
          <label className="block mb-4 text-sm font-semibold text-gray-800">Пол:</label>
          <div className="flex items-center gap-4 mb-6">
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
                className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                  formData.gender === 'male' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
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
                className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                  formData.gender === 'female' ? 'bg-pink-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Женский
              </span>
            </label>
          </div>
  
          <label className="block mb-2 text-sm font-semibold text-gray-800">Год:</label>
          <div className="grid grid-cols-3 gap-2 mb-6">
            {[2019, 2020, 2021, 2022, 2023, 2024].map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => handleChange({ target: { name: 'year', value: year } })}
                className={`px-3 py-2 text-sm rounded-md border transition-all duration-200 ${
                  formData.year === year
                    ? 'bg-blue-500 text-white font-semibold shadow-md'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
  
          <label className="block mb-4 text-sm font-semibold text-gray-800">
            Средний балл аттестата:
            <input
              type="number"
              step="0.01"
              min="2.0"
              max="5.0"
              name="gpa"
              value={formData.gpa}
              onChange={handleChange}
              className="w-full p-2 mt-2 border border-blue-200 rounded-lg bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
          </label>
  
          <label className="block mb-4 text-sm font-semibold text-gray-800">
            Баллы ЕГЭ (сумма):
            <input
              type="number"
              required
              max="310"
              name="points"
              value={formData.points}
              readOnly
              className={`w-full p-2 mt-2 border rounded-lg bg-gray-100/70 backdrop-blur-sm text-gray-900 ${
                formData.points > 310 ? 'border-red-500' : 'border-blue-200'
              }`}
            />
            {formData.points > 310 && (
              <p className="text-red-500 text-xs mt-1">Сумма баллов не должна превышать 310</p>
            )}
          </label>
  
          <label className="block mb-4 text-sm font-semibold text-gray-800">
            Дополнительные баллы:
            <input
              type="number"
              max="10"
              name="bonus_points"
              value={formData.bonus_points}
              onChange={handleChange}
              className="w-full p-2 mt-2 border border-blue-200 rounded-lg bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
          </label>
  
          <label className="block mb-4 text-sm font-semibold text-gray-800">
            Экзамены и баллы:
            {[
              { key: 'russian', label: 'Русский язык' },
              { key: 'math', label: 'Математика' },
              { key: 'physics', label: 'Физика' },
              { key: 'chemistry', label: 'Химия' },
              { key: 'history', label: 'История' },
              { key: 'informatics', label: 'Информатика' },
              { key: 'social_science', label: 'Обществознание' },
            ].map(({ key, label }) => (
              <div key={key} className="mt-2 flex items-center">
                <span className="w-40 text-gray-700">{label}:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  name={key}
                  value={formData[key] || ''}
                  onChange={handleChange}
                  className="ml-2 p-2 border border-blue-200 rounded-lg bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 transition-all duration-200 w-24"
                />
              </div>
            ))}
          </label>
  
          {loading && (
            <div className="flex justify-center my-4">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
  
          <button
            type="submit"
            className={`w-full py-2 rounded-lg shadow-md transition-transform duration-300 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-105 active:scale-95 hover:shadow-blue-500/50'
            }`}
            disabled={loading}
          >
            {loading ? 'Загрузка...' : 'Рассчитать'}
          </button>
        </form>
  
        <div className="mt-6 p-6 bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-blue-100/50 slide-in">
          <p className="text-sm text-gray-700 leading-relaxed">
            <span className="font-semibold text-blue-900">Расширенный шанс поступления</span> — это мощный инструмент
            для точной оценки ваших перспектив. Введите данные об экзаменах, баллах ЕГЭ, аттестате и дополнительных
            достижениях, чтобы получить персонализированные рекомендации по направлениям обучения. Мы анализируем
            статистику и динамику, чтобы помочь вам выбрать лучший путь к поступлению!
          </p>
        </div>
      </div>
  
      {/* Рекомендации */}
      <div className="w-full lg:w-1/2 p-6 bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-blue-100/50 overflow-y-auto slide-in" style={{ maxHeight: '95vh' }}>
        <h2 className="text-2xl font-semibold text-blue-900 mb-4 fade-in">Рекомендации</h2>
        {sortedRecommendations.length > 0 ? (
          sortedRecommendations.map((rec, index) => (
            <div key={index} className="p-4 mb-4 bg-blue-100/70 backdrop-blur-sm rounded-md slide-in">
              <p className="text-lg font-semibold text-blue-700">{rec.name}</p>
              <p className="text-lg mt-1 text-gray-600">
                <strong className="text-blue-600">Вероятность поступления:</strong>{' '}
                <span
                  className={`text-xl font-semibold ${
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
  
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    fetchDetails(rec.direction_id);
                    toggleSection(rec.direction_id, 'details');
                  }}
                  className={`px-2 py-1 rounded-lg transition-transform duration-300 hover:scale-105 active:scale-95 text-sm lg:text-base lg:px-4 lg:py-2 ${
                    openSections[rec.direction_id]?.includes('details')
                      ? 'bg-green-700 text-white'
                      : 'bg-green-500 text-white hover:shadow-green-500/50'
                  }`}
                >
                  Подробнее
                </button>
  
                <button
                  onClick={() => {
                    fetchPointsHistory(rec.direction_id);
                    toggleSection(rec.direction_id, 'points');
                  }}
                  className={`px-2 py-1 rounded-lg transition-transform duration-300 hover:scale-105 active:scale-95 text-sm lg:text-base lg:px-4 lg:py-2 ${
                    openSections[rec.direction_id]?.includes('points')
                      ? 'bg-purple-700 text-white'
                      : 'bg-purple-500 text-white hover:shadow-purple-500/50'
                  }`}
                >
                  <span className="block lg:hidden">Баллы</span>
                  <span className="hidden lg:block">Динамика баллов</span>
                </button>
  
                <button
                  onClick={() => {
                    fetchExamScores(rec.direction_id);
                    toggleSection(rec.direction_id, 'exams');
                  }}
                  className={`px-2 py-1 rounded-lg transition-transform duration-300 hover:scale-105 active:scale-95 text-sm lg:text-base lg:px-4 lg:py-2 ${
                    openSections[rec.direction_id]?.includes('exams')
                      ? 'bg-blue-700 text-white'
                      : 'bg-blue-500 text-white hover:shadow-blue-500/50'
                  }`}
                >
                  <span className="block lg:hidden">Экзамены</span>
                  <span className="hidden lg:block">Показать экзамены</span>
                </button>
              </div>
  
              {openSections[rec.direction_id]?.slice().reverse().map((section) => (
                <div key={section} className="mt-4 p-4 bg-gray-100/80 backdrop-blur-sm rounded-md relative slide-in">
                  <button
                    onClick={() => toggleSection(rec.direction_id, section)} // Исправлено: передаём переменную section
                    className="absolute top-2 right-2 text-red-600 hover:text-red-800 transition-colors duration-200"
                  >
                    ✕
                  </button>
                  {section === 'details' && details[rec.direction_id] && (
                    <>
                      <h3 className="text-md font-semibold text-gray-800">Подробности:</h3>
                      {details[rec.direction_id].split(/[;\n]/).map((block, i) => (
                        <p key={i} className="mt-1 text-sm text-gray-700">{block.trim()}</p>
                      ))}
                    </>
                  )}
                  {section === 'points' && pointsHistory[rec.direction_id] && (
                    <>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Динамика баллов</h3>
                      <div className="h-60">
                        <Line data={getChartData(pointsHistory[rec.direction_id])} options={chartOptions} />
                      </div>
                    </>
                  )}
                  {section === 'exams' && examScores[rec.direction_id] && (
                    <>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Минимальные баллы по экзаменам</h3>
                      <ul className="list-disc pl-5">
                        {examScores[rec.direction_id].map((exam, index) => (
                          <li key={index} className="text-sm text-gray-700">
                            {exam.name}: {exam.min_points}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))
        ) : (
          <p className="text-gray-600">Рекомендации пока отсутствуют. Введите параметры.</p>
        )}
      </div>
  
      <ToastContainer />
    </div>
  );
};

export default Form;