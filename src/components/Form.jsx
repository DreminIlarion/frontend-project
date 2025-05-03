import React, { useState, useRef, useEffect } from 'react';
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from "chart.js";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// import { FiStar, FiBook, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import Particles from 'react-tsparticles';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const Form = () => {
  const [formData, setFormData] = useState({
    gender: '',
    gpa: '',
    points: 0,
    bonus_points: '',
    russian: '',
    math: '',
    physics: '',
    chemistry: '',
    history: '',
    informatics: '',
    social_science: '',
    year: '2024',
  });

  const [recommendations, setRecommendations] = useState([]);
  const [details, setDetails] = useState({});
  const [pointsHistory, setPointsHistory] = useState({});
  const [openSections, setOpenSections] = useState({});
  const [examScores, setExamScores] = useState({});
  const [noDataDirections, setNoDataDirections] = useState({});
  const [loading, setLoading] = useState(false);

  const recommendationsRef = useRef(null);

  const sortedRecommendations = [...recommendations].sort((a, b) => b.probability - a.probability);

  const getChartData = (data) => ({
    labels: data.map((d) => d.year),
    datasets: [
      {
        label: 'Проходной балл',
        data: data.map((d) => d.points),
        borderColor: 'linear-gradient(to right, #4f46e5, #06b6d4)',
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBorderWidth: 2,
        pointBackgroundColor: '#4f46e5',
        pointBorderColor: 'white',
      },
    ],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { title: { display: true, text: 'Год', color: '#1f2937' }, grid: { display: false } },
      y: { title: { display: true, text: 'Баллы', color: '#1f2937' }, beginAtZero: false, grid: { color: 'rgba(0,0,0,0.05)' } },
    },
    plugins: {
      legend: { labels: { color: '#1f2937' } },
      tooltip: { backgroundColor: '#4f46e5', titleColor: '#fff', bodyColor: '#fff' },
    },
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (['gender', 'year'].includes(name)) {
        return { ...prev, [name]: value };
      }

      let newValue;
      if (value === '') {
        newValue = '';
      } else {
        const parsedValue = name === 'gpa' ? parseFloat(value) : parseInt(value, 10);
        if (name === 'gpa') {
          newValue = Math.min(Math.max(3.0, parsedValue), 5.0);
        } else if (name === 'bonus_points') {
          newValue = Math.min(Math.max(0, parsedValue), 10);
        } else {
          newValue = Math.min(Math.max(0, parsedValue), 100);
        }
      }

      const newFormData = { ...prev, [name]: newValue };

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

  const handleBlur = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      let newValue;
      if (value === '' || parseFloat(value) < 0) {
        if (name === 'gpa') newValue = '';
        else if (name === 'bonus_points') newValue = '';
        else newValue = '';
      } else {
        const parsedValue = name === 'gpa' ? parseFloat(value) : parseInt(value, 10);
        if (name === 'gpa') {
          newValue = Math.min(Math.max(3.0, parsedValue), 5.0);
        } else if (name === 'bonus_points') {
          newValue = Math.min(Math.max(0, parsedValue), 10);
        } else {
          newValue = Math.min(Math.max(0, parsedValue), 100);
        }
      }

      const newFormData = { ...prev, [name]: newValue };

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
              .trim(),
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
          setNoDataDirections((prev) => ({ ...prev, [directionId]: 'Данные отсутствуют.' }));
        }
      } else {
        setNoDataDirections((prev) => ({ ...prev, [directionId]: 'Данные отсутствуют.' }));
      }
    } catch (error) {
      setNoDataDirections((prev) => ({ ...prev, [directionId]: 'Данные отсутствуют.' }));
    }
  };

  const fetchExamScores = async (directionId) => {
    if (noDataDirections[directionId]) return;

    try {
      const response = await fetch(`https://personal-account-c98o.onrender.com/api/v1/predict/exams/${directionId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      const data = await response.json();
      if (data.status_code === 200 && Array.isArray(data.body) && data.body.length > 0) {
        setExamScores((prev) => ({ ...prev, [directionId]: data.body }));
      }
    } catch (error) {
      console.error('Ошибка загрузки баллов экзаменов:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.gender) {
      toast.error('Пожалуйста, выберите пол.');
      return;
    }
    if (!formData.year) {
      toast.error('Пожалуйста, выберите год.');
      return;
    }
    if (formData.points > 310) {
      toast.error('Сумма баллов ЕГЭ превышает максимум (310). Исправьте данные.');
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
    ].filter((exam) => exam.points > 0);

    const dataToSend = {
      gender: formData.gender,
      gpa: parseFloat(formData.gpa) || 0,
      points: formData.points,
      bonus_points: parseInt(formData.bonus_points) || 0,
      exams: examsArray,
      year: parseInt(formData.year),
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
          setRecommendations(
            data.body.recomendate.map((rec, index) => ({
              direction_id: rec.direction_id,
              name: rec.name,
              probability: data.body.classifier ? data.body.classifier[index] : 0,
            }))
          );
          setTimeout(() => {
            recommendationsRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      } else {
        toast.error('Ошибка сервера');
      }
    } catch (error) {
      toast.error('Ошибка отправки данных. Проверьте подключение.');
      console.error('Ошибка отправки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen relative flex flex-col items-center justify-between bg-gradient-to-br from-cyan-50 via-indigo-50 to-pink-50/95 p-4 sm:p-8 font-inter">
      <Particles
        options={{
          particles: {
            number: { value: 30 },
            color: { value: '#4f46e5' },
            size: { value: 2 },
            move: { enable: true, speed: 0.5 },
            opacity: { value: 0.5 },
          },
        }}
        className="absolute inset-0 z-0"
      />
      <ToastContainer position="top-right" />

      {/* Форма */}
      <div
        className="w-full max-w-4xl z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <form
          onSubmit={handleSubmit}
          className="bg-white/95 backdrop-blur-lg p-6 sm:p-8 rounded-2xl shadow-xl border border-indigo-100/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(79,70,229,0.3)]"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center tracking-tight">
            Твой путь в ТИУ
          </h1>

          {/* Пол */}
          <label className="block text-sm sm:text-base font-semibold text-gray-900 mb-4">
            Пол:
            <div className="flex items-center justify-center gap-4 sm:gap-6 mt-3">
              {[
                { value: 'male', label: 'Мужской', gradient: 'from-indigo-600 to-blue-600' },
                { value: 'female', label: 'Женский', gradient: 'from-pink-600 to-rose-600' },
              ].map(({ value, label, gradient }) => (
                <label key={value} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value={value}
                    checked={formData.gender === value}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span
                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base text-white transition-all duration-300 shadow-lg bg-gradient-to-r ${gradient} ${
                      formData.gender === value ? 'scale-105 shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'opacity-70'
                    } hover:scale-105 active:scale-95`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </label>

          {/* GPA и бонусные баллы */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <label className="block text-sm sm:text-base font-semibold text-gray-900">
              Средний балл аттестата:
              <input
                type="number"
                step="0.01"
                min="3.0"
                max="5.0"
                name="gpa"
                value={formData.gpa}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full p-3 mt-2 bg-white/70 backdrop-blur-sm border border-indigo-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 transition-all duration-300 shadow-inner"
                placeholder="3.0–5.0"
              />
              {formData.gpa > 5.0 && (
                <p
                  className="text-red-500 text-sm mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  Максимум — 5.0
                </p>
              )}
            </label>

            <label className="block text-sm sm:text-base font-semibold text-gray-900">
              Дополнительные баллы:
              <input
                type="number"
                min="0"
                max="10"
                name="bonus_points"
                value={formData.bonus_points}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full p-3 mt-2 bg-white/70 backdrop-blur-sm border border-indigo-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-indigo-500 transition-all duration-300 shadow-inner"
                placeholder="0–10"
              />
              {formData.bonus_points > 10 && (
                <p
                  className="text-red-500 text-sm mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  Максимум — 10
                </p>
              )}
            </label>
          </div>

          {/* Экзамены */}
          <label className="block mb-4 text-sm sm:text-base font-semibold text-gray-900">
            Баллы ЕГЭ:
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3">
              {[
                { key: 'russian', label: 'Русский язык' },
                { key: 'math', label: 'Математика' },
                { key: 'physics', label: 'Физика' },
                { key: 'chemistry', label: 'Химия' },
                { key: 'history', label: 'История' },
                { key: 'informatics', label: 'Информатика' },
                { key: 'social_science', label: 'Обществознание' },
              ].map(({ key, label, icon }) => (
                <div key={key} className="flex items-center">
                  <span className="w-28 sm:w-32 text-gray-700 text-sm sm:text-base flex items-center">
                    {icon}
                    <span className="ml-2">{label}</span>
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="ml-2 sm:ml-3 p-3 border border-indigo-200 rounded-xl bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 transition-all duration-300 w-20 sm:w-24 text-sm sm:text-base"
                    placeholder="0–100"
                  />
                </div>
              ))}
            </div>
          </label>

          {/* Итоговая сумма */}
          <div className="mb-6 text-center">
            <label className="block mb-2 text-sm sm:text-base font-semibold text-gray-900">
              Итоговая сумма баллов:
            </label>
            <div
              className={`inline-block px-4 sm:px-6 py-2 rounded-xl font-semibold text-sm sm:text-base ${
                formData.points > 310 ? 'bg-red-100 border-red-300 text-red-800' : 'bg-indigo-100 border-indigo-300 text-indigo-800'
              } border shadow-inner`}
              
              
            >
              {formData.points} баллов
            </div>
            {formData.points > 310 && (
              <p
                className="text-red-500 text-sm mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                Сумма баллов не должна превышать 310
              </p>
            )}
          </div>

          {/* Кнопка */}
          <button
            type="submit"
            className={`w-full py-3 rounded-xl shadow-md text-white font-semibold text-sm sm:text-base transition-all duration-300 ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-500 hover:shadow-[0_0_15px_rgba(79,70,229,0.5)]'
            }`}
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ boxShadow: loading ? 'none' : ['0 0 0 rgba(79,70,229,0)', '0 0 15px rgba(79,70,229,0.5)', '0 0 0 rgba(79,70,229,0)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin mx-auto" />
            ) : (
              'Найти направления'
            )}
          </button>
        </form>
      </div>

      {/* Рекомендации */}
      <div
        className="w-full max-w-4xl mt-6 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div
          ref={recommendationsRef}
          className="p-6 sm:p-8 bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-indigo-100/50"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center tracking-tight">Рекомендации для тебя</h2>
          {sortedRecommendations.length > 0 ? (
            <div className="space-y-4">
              {sortedRecommendations.map((rec, index) => (
                <div
                  key={index}
                  className="p-4 sm:p-6 bg-white/90 backdrop-blur-md rounded-xl shadow-md hover:shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <p className="text-base sm:text-lg font-semibold text-gray-900">{rec.name}</p>

                  <div className="flex items-center mt-2">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                          className="fill-none stroke-gray-200 stroke-[3]"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className={`fill-none stroke-[3] stroke-indigo-500`}
                          strokeDasharray={`${rec.probability * 100}, 100`}
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          initial={{ strokeDasharray: '0, 100' }}
                          animate={{ strokeDasharray: `${rec.probability * 100}, 100` }}
                          transition={{ duration: 1 }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span
                          className={`text-sm sm:text-base font-bold ${
                            rec.probability >= 0.5 ? 'text-green-600' : rec.probability >= 0.3 ? 'text-orange-500' : 'text-red-600'
                          }`}
                        >
                          {Math.round(rec.probability * 100)}%
                        </span>
                      </div>
                    </div>
                    <p className="ml-4 text-sm sm:text-base text-gray-600">Вероятность поступления</p>
                  </div>

                  {noDataDirections[rec.direction_id] ? (
                    <p
                      className="text-sm sm:text-base text-gray-600 italic mt-3 flex items-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      
                      {noDataDirections[rec.direction_id]}
                    </p>
                  ) : (
                    <>
                      <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
                        {[
                          { action: () => fetchDetails(rec.direction_id), section: 'details', label: 'Подробнее', color: 'emerald' },
                          { action: () => fetchPointsHistory(rec.direction_id), section: 'points', label: 'Динамика баллов', color: 'indigo' },
                          { action: () => fetchExamScores(rec.direction_id), section: 'exams', label: 'Экзамены', color: 'cyan' },
                        ].map(({ action, section, label, color }) => (
                          <button
                            key={section}
                            onClick={() => {
                              action();
                              toggleSection(rec.direction_id, section);
                            }}
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base text-white transition-all duration-300 bg-${color}-600 ${
                              openSections[rec.direction_id]?.includes(section) ? `bg-${color}-800` : `hover:shadow-${color}-500/50`
                            } hover:scale-105 active:scale-95`}
                            disabled={noDataDirections[rec.direction_id]}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <span className="block sm:hidden">{label.split(' ')[0]}</span>
                            <span className="hidden sm:block">{label}</span>
                          </button>
                        ))}
                      </div>

                      {openSections[rec.direction_id]?.slice().reverse().map((section) => (
                        <div
                          key={section}
                          className="mt-4 p-4 bg-gray-50/80 backdrop-blur-sm rounded-xl relative"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <button
                            onClick={() => toggleSection(rec.direction_id, section)}
                            className="absolute top-2 right-2 text-red-600 hover:text-red-800 transition-colors duration-200 text-sm"
                          >
                            ✕
                          </button>
                          {section === 'details' && details[rec.direction_id] && (
                            <>
                              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">Подробности:</h3>
                              {details[rec.direction_id].split(/[;\n]/).map((block, i) => (
                                <p key={i} className="text-sm sm:text-base text-gray-600">{block.trim()}</p>
                              ))}
                            </>
                          )}
                          {section === 'points' && pointsHistory[rec.direction_id] && (
                            <>
                              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-4">Динамика баллов</h3>
                              <div className="h-56 sm:h-64">
                                <Line data={getChartData(pointsHistory[rec.direction_id])} options={chartOptions} />
                              </div>
                            </>
                          )}
                          {section === 'exams' && examScores[rec.direction_id] && (
                            <>
                              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-4">Минимальные баллы по экзаменам</h3>
                              <ul className="list-disc pl-5">
                                {examScores[rec.direction_id].map((exam, index) => (
                                  <li key={index} className="text-sm sm:text-base text-gray-600">
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
            <p
              className="text-gray-600 text-center text-sm sm:text-base flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              
              Введи параметры, чтобы увидеть рекомендации!
            </p>
          )}
        </div>

        {/* Описание */}
        <div
          className="mt-6 p-6 sm:p-8 bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-indigo-100/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            <span className="font-semibold text-indigo-600">Твой выбор в ТИУ</span> — это шаг к крутой карьере! Введи баллы ЕГЭ, средний балл аттестата и дополнительные достижения, чтобы получить персональные рекомендации по направлениям. Мы анализируем статистику поступлений и показываем твои шансы. Технические направления в ТИУ — это про инновации и будущее, но выбор за тобой. Давай найдём твой путь!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Form;