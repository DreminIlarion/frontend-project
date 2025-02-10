import React, { useState } from 'react';

const Form = () => {
  const [formData, setFormData] = useState({
    top_n: '',
    gender: '',
    age: '',
    sport: '',
    foreign: '',
    gpa: '',
    points: 0,
    bonus_points: '',
    exams: [],
    reception_form: '',
    priority: '',
    education: '',
    study_form: ''
  });

  const [recommendations, setRecommendations] = useState([]);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleExamClick = (exam) => {
    setFormData((prevData) => {
      const newExams = prevData.exams.includes(exam)
        ? prevData.exams.filter((item) => item !== exam)
        : [...prevData.exams, exam];
  
      return {
        ...prevData,
        exams: newExams,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://personal-account-fastapi.onrender.com/predict/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
        }),
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const sortedRecommendations = data.recomendate.map((item, index) => ({
          name: item,
          probability: data.classifier[index],
        })).sort((a, b) => b.probability - a.probability);

        setRecommendations(sortedRecommendations);
      } else {
        console.log('Ошибка при отправке данных');
      }
    } catch (error) {
      console.error('Ошибка отправки данных:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 flex space-x-10">
      {/* Форма */}
      <form onSubmit={handleSubmit} className="bg-white p-8 shadow-xl rounded-lg w-1/2">
        <label className="block mb-4 text-sm font-semibold">
          Количество направлений:
          <input
            type="number"
            value={formData.top_n}
            onChange={handleChange}
            name="top_n"
            className="w-full p-2 mt-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            required
          />
        </label>

        <label className="block mb-4 text-sm font-semibold">
          Пол:
          <select
            value={formData.gender}
            name="gender"
            onChange={handleChange}
            className="w-full p-2 mt-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            required
          >
            <option value="">Выберите пол</option>
            <option value="М">Мужской</option>
            <option value="Ж">Женский</option>
          </select>
        </label>

        <label className="block mb-4 text-sm font-semibold">
          Возраст:
          <input
            type="number"
            value={formData.age}
            name="age"
            onChange={handleChange}
            className="w-full p-2 mt-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            required
          />
        </label>

        

        <label className="block mb-4 text-sm font-semibold">
          Средний балл аттестата:
          <input
            type="number"
            step="0.01"
            min='2.0'
            max='5.0'
            value={formData.gpa}
            name="gpa"
            onChange={handleChange}
            className="w-full p-2 mt-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            required
          />
        </label>

        <label className="block mb-4 text-sm font-semibold">
          Общее количество баллов (ЕГЭ):
          <input
            type="range"
            min="0"
            max="300"
            step="1"
            value={formData.points}
            onChange={(e) => setFormData({ ...formData, points: e.target.value })}
            className="w-full mt-2"
          />
          <span className="text-sm">{formData.points} баллов</span>
        </label>

        <label className="block mb-4 text-sm font-semibold">
          Дополнительные баллы (ЕГЭ):
          <input
            type="number"
            min='0'
            max='10'
            value={formData.bonus_points}
            name="bonus_points"
            onChange={handleChange}
            className="w-full p-2 mt-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </label>

        <label className="block mb-4 text-sm font-semibold">
          Выберите экзамены:
          <div className="grid grid-cols-2 gap-2 mt-2">
            {['Русский язык', 'Математика', 'Физика', 'Химия', 'Биология', 'Информатика', 'История', 'Обществознание', 'Литература', 'География', 'Иностранный язык'].map((exam) => (
              <div
                key={exam}
                className={`p-2 border rounded-lg cursor-pointer ${formData.exams.includes(exam) ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => handleExamClick(exam)}
              >
                {exam}
              </div>
            ))}
          </div>
        </label>

        <label className="block mb-4 text-sm font-semibold">
          Вид приема:
          <select
            value={formData.reception_form}
            name="reception_form"
            onChange={handleChange}
            className="w-full p-2 mt-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            required
          >
            <option value="">Выберите вид приема</option>
            <option value="Общий конкурс">Общий конкурс</option>
            <option value="По договору">По договору</option>
          </select>
        </label>

        <label className="block mb-4 text-sm font-semibold">
          Приоритет:
          <input
            type="number"
            value={formData.priority}
            name="priority"
            onChange={handleChange}
            className="w-full p-2 mt-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            required
          />
        </label>

        <label className="block mb-4 text-sm font-semibold">
          Вид образования:
          <select
            value={formData.education}
            name="education"
            onChange={handleChange}
            className="w-full p-2 mt-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            required
          >
            <option value="">Выберите вид образования</option>
            <option value="Начальное общее образование">Начальное общее образование</option>
            <option value="Среднее общее образование">Среднее общее образование</option>
            <option value="Высшее общее образование">Высшее общее образование</option>
          </select>
        </label>

        <label className="block mb-4 text-sm font-semibold">
          Форма обучения:
          <select
            value={formData.study_form}
            name="study_form"
            onChange={handleChange}
            className="w-full p-2 mt-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            required
          >
            <option value="">Выберите форму обучения</option>
            <option value="Очная">Очная</option>
            <option value="Заочная">Заочная</option>
          </select>
        </label>

        <button type="submit" className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          Рассчитать
        </button>
      </form>

      {/* Блок с результатами */}
      <div className="w-1/2 p-6 bg-gray-50 rounded-lg shadow-xl overflow-y-auto" style={{ maxHeight: '95vh' }}>
        <h2 className="text-2xl font-semibold mb-4">Рекомендации</h2>
        <div>
          {recommendations.length > 0 ? (
            recommendations.slice(0, 100).map((item, index) => (
              <div key={index} className="p-4 mb-4 bg-blue-100 rounded-md">
                <p className="text-lg font-semibold text-blue-700">{item.name}</p>
                <div className="mt-2">
                  <p className="text-lg mt-1 text-gray-600">Вероятность поступления: {Math.round(item.probability * 100)}%</p>
                  <div className="w-full bg-gray-200 h-2 mt-1 rounded-full">
                    <div
                      style={{ width: `${Math.round(item.probability * 100)}%` }}
                      className="h-2 bg-green-500 rounded-full"
                    ></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>Рекомендации пока отсутствуют. Введите параметры</p>
            
            
          )}
        </div>
      </div>
    </div>
  );
};

export default Form;
