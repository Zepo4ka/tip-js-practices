// Общий набор из методички проверяется отдельно от индивидуального варианта.
export const demoTasks = [
  { id: 1, title: "Изучить функции", completed: true, priority: "medium" },
  { id: 4, title: "Подготовить модель задач", completed: false, priority: "high" },
  { id: 7, title: "Проверить методы массивов", completed: false, priority: "low" },
  { id: 10, title: "Оформить README", completed: true, priority: "medium" },
];

// Номер в журнале N = 5: ((5 - 1) % 8) + 1 = 5.
// Вариант 5: разработка командного прототипа, первые четыре задачи выполнены.
export const variantNumber = 5;
export const variantTasks = [
  { id: 11, title: "Обсудить идею прототипа", completed: true, priority: "high" },
  { id: 23, title: "Распределить задачи в команде", completed: true, priority: "medium" },
  { id: 37, title: "Подготовить макет экранов", completed: true, priority: "low" },
  { id: 41, title: "Собрать основные функции прототипа", completed: true, priority: "high" },
  { id: 58, title: "Проверить совместную работу модулей", completed: false, priority: "medium" },
  { id: 64, title: "Подготовить демонстрацию команды", completed: false, priority: "low" },
];
