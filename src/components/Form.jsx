import React, { useState } from 'react';
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from "chart.js";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);
const Form = () => {
  const [formData, setFormData] = useState({
    gender: '',
    foreign_citizenship: '',
    military_service: 'no',
    gpa: '',
    points: 0,
    bonus_points: 0,
    exams: [],
    year: ''
  });

  const [recommendations, setRecommendations] = useState([]);
  const [details, setDetails] = useState({});
  const [pointsHistory, setPointsHistory] = useState({});
  const [openSections, setOpenSections] = useState({});
  const sortedRecommendations = [...recommendations].sort((a, b) => b.probability - a.probability);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const LineChartComponent = ({ data }) => {
    const chartData = {
      labels: data.map((item) => item.year), // Года по оси X
      datasets: [
        {
          label: "Баллы",
          data: data.map((item) => item.points), // Значения по Y
          borderColor: "#4F46E5",
          backgroundColor: "rgba(79, 70, 229, 0.2)",
          borderWidth: 2,
          pointRadius: 4,
          pointBackgroundColor: "#4F46E5",
          tension: 0.4, // Плавность линий
        },
      ],
    };
  
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          title: { display: true, text: "Год", color: "#333" },
        },
        y: {
          title: { display: true, text: "Баллы", color: "#333" },
          beginAtZero: false,
        },
      },
    };
  
    return <Line data={chartData} options={options} />;
  };
  


  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => {
      const newFormData = { ...prev, [name]: value };
  
      // Пересчет суммы баллов
      const totalPoints =
        (parseInt(newFormData.russian) || 0) +
        (parseInt(newFormData.math) || 0) +
        (parseInt(newFormData.physics) || 0) +
        (parseInt(newFormData.chemistry) || 0) +
        (parseInt(newFormData.history) || 0) +
        (parseInt(newFormData.informatics) || 0) +
        (parseInt(newFormData.social_science) || 0) +
        (parseInt(newFormData.bonus_points) || 0); // Учитываем доп. баллы
  
      return { ...newFormData, points: totalPoints };
    });
  };

  const handleExamChange = (subject, value) => {
    setFormData((prevData) => {
      const updatedExams = prevData.exams.filter((exam) => exam.subject !== subject);
      if (value !== '') {
        updatedExams.push({ subject, points: Number(value) });
      }
      return { ...prevData, exams: updatedExams };
    });
  };

  
  const toggleSection = (directionId, section) => {
    setOpenSections((prev) => {
      const newState = { ...prev };
  
      if (!newState[directionId]) {
        newState[directionId] = [];
      }
  
      // Если уже открыт — убираем
      if (newState[directionId].includes(section)) {
        newState[directionId] = newState[directionId].filter((s) => s !== section);
      } else {
        // Добавляем в конец списка (чтобы отображалось выше)
        newState[directionId] = [...newState[directionId], section];
      }
  
      return newState;
    });
  };

  const fetchDetails = async (directionId) => {
    try {
      const response = await fetch(`https://personal-account-fastapi.onrender.com/api/v1/predict/direction/${directionId}`, {
        method: 'GET',
        credentials: 'include',
      });
  
      if (response.ok) {
        const data = await response.text();
        

        setDetails((prev) => ({ 
          ...prev, 
          [directionId]: data
            .replace(/\\n/g, ' ') // Заменяет закодированные \n на пробелы
            .replace(/\s+/g, ' ') // Убирает лишние пробелы
            .replace(/([а-яА-Я]):([А-Я])/g, '$1: $2') // Добавляет пробел после двоеточий
            .replace(/([а-яА-Я])([А-Я])/g, '$1 $2') // Добавляет пробел между словами, где его нет
            .replace(/-\s+/g, '- ') // Исправляет форматирование списков
            .replace(/(\.)([^\s])/g, '. $2') // Добавляет пробел после точки, если его нет
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
      const response = await fetch(`https://personal-account-fastapi.onrender.com/api/v1/predict/points/${directionId}`, {
        method: 'GET',

        credentials: 'include',
      });
  
      if (response.ok) {
        const data = await response.json();
        setPointsHistory((prev) => ({ ...prev, [directionId]: data }));
      } else {
        console.error('Ошибка загрузки динамики баллов:', await response.text());
      }
    } catch (error) {
      console.error('Ошибка загрузки динамики баллов:', error);
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.gender) {
      console.log("Ошибка: Пол не указан");
      toast.error("Пожалуйста, выберите пол.");
      return;
    }
  
    if (!formData.year) {
      toast.error("Пожалуйста, выберите год.");
      return;
    }

    setLoading(true );

    try {
      const response = await fetch('https://personal-account-fastapi.onrender.com/api/v1/predict/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setLoading(false );
        if (data.recomendate && Array.isArray(data.recomendate)) {
          setRecommendations(data.recomendate.map((rec, index) => ({
            direction_id: rec.direction_id,  // Добавляем ID направления!
            name: rec.name,
            probability: data.classifier ? data.classifier[index] : 0,
          })));
          
          
        }
      } else {
        console.error('Ошибка при отправке данных:', await response.text());
      }
    } catch (error) {
      console.error('Ошибка отправки данных:', error);
    }
  };

  

  return (
    <div className="container mx-auto p-6 flex space-x-10">
      <ToastContainer />
      <form onSubmit={handleSubmit} className="bg-white p-8 shadow-xl rounded-lg w-1/2">
      <label className="block mb-4 text-sm font-semibold">Пол:</label>
      <div className="flex items-center gap-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="gender"
            value="male"
            checked={formData.gender === "male"}
            onChange={handleChange}
            className="hidden"
          />
          <span
            className={`px-4 py-2 rounded-lg border ${formData.gender === "male" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
          >
            Мужской
          </span>
        </label>

        <label className="flex items-center cursor-pointer">
          <input
              
            type="radio"
            name="gender"
            value="female"
            checked={formData.gender === "female"}
            onChange={handleChange}
            className="hidden"
          />
          <span
            className={`px-4 py-2 rounded-lg border ${formData.gender === "female" ? "bg-pink-600 text-white" : "bg-gray-100"}`}
          >
            Женский
          </span>
        </label>
      </div>
      <br></br>
        
        <label className="block mb-4 text-sm font-semibold">
          Гражданство:
          <input type="text" name="foreign_citizenship" value={formData.foreign_citizenship} onChange={handleChange} className="w-full p-2 mt-2 border rounded-lg" />
        </label>

        <label className="block mb-4 text-sm font-semibold flex items-center">
          <span className="mr-2">Военная служба:</span>
          <input
            type="checkbox"
            name="military_service"
            checked={formData.military_service === "yes"} 
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                military_service: e.target.checked ? "yes" : "no",
              }))
            }
            className="w-5 h-5 accent-blue-600 cursor-pointer"
          />
          <span className="ml-2">{formData.military_service === "yes" ? "Да" : "Нет"}</span>
        </label>


        <label className="block mb-2 text-sm font-semibold">Год:</label>
        <div className="grid grid-cols-3 gap-2">
          {[2019, 2020, 2021, 2022, 2023, 2024].map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => handleChange({ target: { name: "year", value: year } })}
              className={`px-3 py-2 text-sm rounded-md border transition-all 
                ${
                  formData.year === year
                    ? "bg-blue-500 text-white font-semibold shadow-md"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
            >
              {year}
            </button>
          ))}
        </div>


        
        <label className="block mb-4 text-sm font-semibold">
          Средний балл аттестата:
          <input type="number" step="0.01" min="2.0" max="5.0" name="gpa" value={formData.gpa} onChange={handleChange} className="w-full p-2 mt-2 border rounded-lg" />
        </label>
        
        <label className="block mb-4 text-sm font-semibold">
          Баллы ЕГЭ (сумма):
          <input type="number" required max='310' name="points" value={formData.points} readOnly className="w-full p-2 mt-2 border rounded-lg bg-gray-100" />
        </label>
        
        <label className="block mb-4 text-sm font-semibold">
          Дополнительные баллы:
          <input type="number" max='10'  name="bonus_points" value={formData.bonus_points} onChange={handleChange} className="w-full p-2 mt-2 border rounded-lg" />
        </label>

        <label className="block mb-4 text-sm font-semibold">
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
              <span className="w-40">{label}:</span>
              <input 
                type="number" 
                min="0" 
                max="100" 
                name={key}
                value={formData[key]}
                onChange={handleChange} 
                className="ml-2 p-2 border rounded-lg w-24" 
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
          className={`w-full py-2 rounded-lg ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"}`}
          disabled={loading}
        >
          {loading ? "Загрузка..." : "Рассчитать"}
        </button>
      </form>

      <div className="w-1/2 p-6 bg-gray-50 rounded-lg shadow-xl overflow-y-auto flex-1 " style={{ maxHeight: '95vh' }}>
    <h2 className="text-2xl font-semibold mb-4">Рекомендации</h2>
    {sortedRecommendations.length > 0 ? (
      sortedRecommendations.map((rec, index) => (
        <div key={index} className="p-4 mb-4 bg-blue-100 rounded-md">
          <p className="text-lg font-semibold text-blue-700">{rec.name}</p>
          <p className="text-lg mt-1 text-gray-600">
            <strong className="text-lg text-blue-600">Вероятность поступления:</strong> 
            <span className="text-xl font-semibold text-green-600">
              {Math.round(rec.probability * 100)}%
            </span>
          </p>

          {/* Кнопки */}
          <div className="mt-2">
            <button 
              onClick={() => {
                fetchDetails(rec.direction_id);
                toggleSection(rec.direction_id, "details");
              }} 
              className={`mr-2 px-4 py-2 rounded-lg ${openSections[rec.direction_id]?.includes("details") ? "bg-green-700 text-white" : "bg-green-500 text-white"}`}
            >
              Подробнее
            </button>

            <button 
              onClick={() => {
                fetchPointsHistory(rec.direction_id);
                toggleSection(rec.direction_id, "points");
              }} 
              className={`px-4 py-2 rounded-lg ${openSections[rec.direction_id]?.includes("points") ? "bg-purple-700 text-white" : "bg-purple-500 text-white"}`}
            >
              Динамика баллов
            </button>
          </div>

          {/* Отображение блоков в нужном порядке */}
          {openSections[rec.direction_id]?.slice().reverse().map((section) => (
            <div key={section} className="mt-4 p-4 bg-gray-100 rounded-md relative">
              <button 
                onClick={() => toggleSection(rec.direction_id, section)} 
                className="absolute top-2 right-2 text-red-600"
              >
                ✖
              </button>
              {section === "details" && details[rec.direction_id] && (
                <>
                  <h3 className="text-md font-semibold">Подробности:</h3>
                  {details[rec.direction_id].split(/[;\n]/).map((block, i) => (
                    <p key={i} className="mt-1 text-sm text-gray-700">{block.trim()}</p>
                  ))}
                </>
              )}
              {section === "points" && pointsHistory[rec.direction_id] && (
              <>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Динамика баллов</h3>
                <div className="h-60">
                  <LineChartComponent data={pointsHistory[rec.direction_id]} />
                </div>
              </>
            )}


              
            </div>
          ))}
        </div>
      ))
    ) : (
      <p>Рекомендации пока отсутствуют. Введите параметры.</p>
    )}
  </div>


    </div>
  );
};

export default Form;
