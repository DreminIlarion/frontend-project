import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ClassifierForm = () => {
  const [formData, setFormData] = useState({
    year: '', 
    gender: '',
    gpa: '',
    points: '',
    direction: ''
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleRangeChange = (e) => {
    const { value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      points: value
    }));
  };

  const handleDirectionChange = (e) => {
    const { value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      direction: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const dataToSend = {
      ...formData,
      gpa: parseFloat(formData.gpa),
      year: parseInt(formData.year, 10),
      points: parseInt(formData.points, 10)
    };
  
    try {
      const response = await fetch('https://personal-account-fastapi.onrender.com/predict/v1/free', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });
  
      const result = await response.json();
      
  
      if (result && typeof result === 'number') {
        setPrediction(result);
      } else {
        setPrediction(null);
        toast.error("Ошибка: сервер не вернул предсказание.");
      }
    } catch (error) {
      console.error('Ошибка запроса:', error);
      toast.error('Произошла ошибка при отправке данных.');
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <div className="container mx-auto p-6 text-center ">
      <form onSubmit={handleSubmit} className="p-6 bg-white border border-gray-300 rounded-md shadow-md max-w-lg mx-auto">
        <fieldset className="flex-grow space-y-4 mb-6">
          <label className="block text-sm font-semibold">Пол:
            <select
              value={formData.gender}
              name="gender"
              onChange={handleChange}
              className="w-full p-2 mt-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Выберите пол</option>
              <option value="М">Мужской</option>
              <option value="Ж">Женский</option>
            </select>
          </label>

          <label className="block text-sm font-semibold">Средний балл аттестата:
            <input
              type="number"
              step="0.01"
              min='2.0'
              max='5.0'
              value={formData.gpa}
              name="gpa"
              onChange={handleChange}
              className="w-full p-2 mt-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </label>

          <label className="block text-sm font-semibold">Общее количество баллов (ЕГЭ):
            <input
              type="range"
              min="0"
              max="310"
              step="1"
              value={formData.points}
              onChange={handleRangeChange}
              className="w-full mt-2"
            />
            <span className="text-sm">{formData.points} баллов</span>
          </label>

          <label className="block text-sm font-semibold">Год:
            <input
              type="range"
              step="1"
              min='2019'
              max='2024'
              value={formData.year}
              name="year"
              onChange={handleChange}
              className="w-full mt-2"
              required
            />
            <span className="text-sm">{formData.year} год</span>
          </label>

          <label className="block text-sm font-semibold">Направление:
            <select
              value={formData.direction}
              onChange={handleDirectionChange}
              className="w-full p-2 mt-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Выберите направление</option>
              <option value="">Выберите направление</option>
              <option value="08.03.01 Строительство">08.03.01 Строительство</option>
              <option value="21.03.01 Нефтегазовое дело">21.03.01 Нефтегазовое дело</option>
              <option value="15.03.04 Автоматизация технологических процессов и производств">15.03.04 Автоматизация технологических процессов и производств</option>
              <option value="20.03.01 Техносферная безопасность">20.03.01 Техносферная безопасность</option>
              <option value="13.03.02 Электроэнергетика и электротехника">13.03.02 Электроэнергетика и электротехника</option>
              <option value="21.05.00 Прикладная геология, горное дело, нефтегазовое дело и геодезия">21.05.00 Прикладная геология, горное дело, нефтегазовое дело и геодезия</option>
              <option value="09.03.00 Информатика и вычислительная техника">09.03.00 Информатика и вычислительная техника</option>
              <option value="21.03.02 Землеустройство и кадастры">21.03.02 Землеустройство и кадастры</option>
              <option value="09.03.02 Информационные системы и технологии">09.03.02 Информационные системы и технологии</option>
              <option value="15.03.01 Машиностроение">15.03.01 Машиностроение</option>
              <option value="13.03.01 Теплоэнергетика и теплотехника">13.03.01 Теплоэнергетика и теплотехника</option>
              <option value="05.03.01 Геология">05.03.01 Геология</option>
              <option value="21.05.06 Нефтегазовые техника и технологии">21.05.06 Нефтегазовые техника и технологии</option>
              <option value="27.03.04 Управление в технических системах">27.03.04 Управление в технических системах</option>
              <option value="08.05.00 Техника и технологии строительства">08.05.00 Техника и технологии строительства</option>
              <option value="01.03.02 Прикладная математика и информатика">01.03.02 Прикладная математика и информатика</option>
              <option value="23.03.01 Технология транспортных процессов">23.03.01 Технология транспортных процессов</option>
              <option value="27.03.03 Системный анализ и управление">27.03.03 Системный анализ и управление</option>
              <option value="07.03.01 Архитектура">07.03.01 Архитектура</option>
              <option value="12.03.01 Приборостроение">12.03.01 Приборостроение</option>
              <option value="21.05.02 Прикладная геология">21.05.02 Прикладная геология</option>
              <option value="07.03.03 Дизайн архитектурной среды">07.03.03 Дизайн архитектурной среды</option>
              <option value="15.03.06 Мехатроника и робототехника">15.03.06 Мехатроника и робототехника</option>
              <option value="23.03.03 Эксплуатация транспортно-технологических машин и комплексов">23.03.03 Эксплуатация транспортно-технологических машин и комплексов</option>
              <option value="43.03.00 Сервис и туризм">43.03.00 Сервис и туризм</option>
              <option value="27.03.00 Управление в технических системах">27.03.00 Управление в технических системах</option>
              <option value="23.05.01 Наземные транспортно-технологические средства">23.05.01 Наземные транспортно-технологические средства</option>
              <option value="18.03.01 Химическая технология">18.03.01 Химическая технология</option>
              <option value="21.05.01 Прикладная геодезия">21.05.01 Прикладная геодезия</option>
              <option value="02.03.01 Математика и компьютерные науки">02.03.01 Математика и компьютерные науки</option>
              <option value="12.03.04 Биотехнические системы и технологии">12.03.04 Биотехнические системы и технологии</option>
              <option value="42.03.01 Реклама и связи с общественностью">42.03.01 Реклама и связи с общественностью</option>
              <option value="18.03.00 Химические технологии">18.03.00 Химические технологии</option>  
              {/* Дополнительные варианты */}
            </select>
          </label>
        </fieldset>

        <button
          type="submit"
          className="w-[175px] mx-auto p-2 bg-blue-500 text-white rounded-3xl hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex justify-center"
          disabled={loading}
        >
          {loading ? 'Загрузка...' : 'Предсказать'}
        </button>
      </form>

      {/* Результат предсказания */}
      {prediction !== null && (
        <div className="mt-6 p-6 bg-gray-100 rounded-3xl shadow-md max-w-lg mx-auto">
          <h2 className="text-xl font-semibold mb-4">Результат</h2>
          <p className="text-lg">
            Шанс на поступление: {' '}
            <span
              className={
                prediction <= 0.25
                  ? 'text-red-700'
                  : prediction > 0.25 && prediction <= 0.4
                  ? 'text-red-400'
                  : prediction > 0.4 && prediction <= 0.6
                  ? 'text-blue-400'
                  : prediction > 0.6 && prediction <= 0.75
                  ? 'text-teal-500'
                  : 'text-green-500'
              }
            >
              {(() => {
                if (prediction <= 0.25) return 'Очень низкий (менее 25%)';
                if (prediction > 0.25 && prediction <= 0.4) return 'Низкий (менее 40%)';
                if (prediction > 0.4 && prediction <= 0.6) return 'Средний (более 50%)';
                if (prediction > 0.6 && prediction <= 0.75) return 'Повышенный (более 60%)';
                return 'Высокий (более 75%)';
              })()}
            </span>
          </p>
        </div>
      )}

      {/* Контейнер для Toast */}
      <ToastContainer />
    </div>
  );
};

export default ClassifierForm;
