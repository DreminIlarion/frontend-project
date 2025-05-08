# Python коддляпостроенияграфиков
import matplotlib.pyplot as plt
import pandas as pd
 
  # Чтениеданныхизфайла
data = pd.read_csv(times.txt)


 # Подготовкаданныхдляграфика
sizes = data[’Size’].unique()
 methods = [’Serial’, ’P.Rows’, ’P.Columns’, ’P.Blocks’]
 times = {method: [] for method in methods}
 for size in sizes:
 for method in methods:



 time = data[(data[’Method’] == method) & (data[’Size’] == size)][
 ’Time’].values[0]
 times[method].append(time)
 # Построениеграфика
 plt.figure(figsize=(10, 6))
 for method in methods:
 plt.plot(sizes, times[method], marker=’o’, label=method)
 plt.xlabel(’Размер матрицы’)
 plt.ylabel(’Время выполнениясек ()’)
 plt.title(’Сравнение временивыполненияалгоритмов ’)
 plt.legend()
plt.grid(True)
plt.savefig(’task5_plot.png’)