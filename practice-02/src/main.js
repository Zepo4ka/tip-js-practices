import { demoTasks, variantNumber, variantTasks } from "./data.js";
import {
  findTaskById, getPendingTasks, getTaskTitles, getTaskStats,
  addTask, setTaskCompleted, renameTask, removeTask,
} from "./task-service.js";

function showStats(tasks) {
  const { total, completed, pending, progress } = getTaskStats(tasks);
  console.log(`Всего: ${total}; выполнено: ${completed}; осталось: ${pending}`);
  if (total === 0) {
    console.log("Задач пока нет");
  } else {
    console.log(`Прогресс: ${progress.toFixed(1)}%`);
  }
}

function showTasks(tasks) {
  console.log(JSON.stringify(tasks, null, 2));
}

// Состояние заменяется только при успешной операции.
function applyOperation(currentTasks, result, label) {
  console.log(`\n${label}`);
  if (!result.ok) {
    console.log(`Отказ: ${result.error}`);
    showStats(currentTasks);
    return currentTasks;
  }
  showStats(result.tasks);
  return result.tasks;
}

function showPreserved(initialTasks, snapshot, name) {
  const preserved = JSON.stringify(initialTasks) === snapshot;
  console.log(`Исходный ${name} сохранён: ${preserved}`);
  if (!preserved) {
    throw new Error(`Исходный ${name} изменён`);
  }
}

function runCommonScenario() {
  console.log("=== Общий сценарий ===");
  const snapshot = JSON.stringify(demoTasks);
  let currentTasks = demoTasks;
  showTasks(currentTasks);
  console.log("Названия:", getTaskTitles(currentTasks));
  console.log("Невыполненные задачи:");
  showTasks(getPendingTasks(currentTasks));
  console.log("Поиск id = 4:", findTaskById(currentTasks, 4));
  showStats(currentTasks);

  currentTasks = applyOperation(currentTasks,
    addTask(currentTasks, 20, "Добавить проверку", "high"), "Добавление id = 20");
  currentTasks = applyOperation(currentTasks,
    setTaskCompleted(currentTasks, 4, true), "Выполнение id = 4");
  currentTasks = applyOperation(currentTasks,
    renameTask(currentTasks, 10, "Подготовить инструкцию запуска"), "Переименование id = 10");
  currentTasks = applyOperation(currentTasks,
    removeTask(currentTasks, 7), "Удаление id = 7");

  const beforeRefusal = currentTasks;
  const beforeRefusalSnapshot = JSON.stringify(currentTasks);
  currentTasks = applyOperation(currentTasks,
    addTask(currentTasks, 20, "Повторная задача", "high"), "Повторное добавление id = 20");
  console.log("После отказа список сохранён:",
    currentTasks === beforeRefusal && JSON.stringify(currentTasks) === beforeRefusalSnapshot);

  console.log("\nИтоговые задачи:");
  showTasks(currentTasks);
  console.log("Итоговые id:", currentTasks.map((task) => task.id));
  showPreserved(demoTasks, snapshot, "demoTasks");
}

function runVariantScenario() {
  console.log(`\n=== Вариант ${variantNumber}: разработка командного прототипа ===`);
  const snapshot = JSON.stringify(variantTasks);
  let currentTasks = variantTasks;
  showTasks(currentTasks);
  showStats(currentTasks);

  currentTasks = applyOperation(currentTasks,
    addTask(currentTasks, 80, "Провести пробную демонстрацию прототипа", "medium"), "Добавление id = 80");
  const beforeCompleted = currentTasks;
  currentTasks = applyOperation(currentTasks,
    setTaskCompleted(currentTasks, 11, true), "Установка completed = true для id = 11");
  console.log("Повторная установка статуса создала новый массив и объект:",
    currentTasks !== beforeCompleted &&
    findTaskById(currentTasks, 11) !== findTaskById(beforeCompleted, 11));
  currentTasks = applyOperation(currentTasks,
    renameTask(currentTasks, 23, "Уточнить распределение задач в команде"), "Переименование id = 23");
  currentTasks = applyOperation(currentTasks,
    removeTask(currentTasks, 37), "Удаление id = 37");

  const beforeRefusal = currentTasks;
  const beforeRefusalSnapshot = JSON.stringify(currentTasks);
  currentTasks = applyOperation(currentTasks,
    addTask(currentTasks, 80, "Повторная демонстрация", "medium"), "Повторное добавление id = 80");
  console.log("После отказа список сохранён:",
    currentTasks === beforeRefusal && JSON.stringify(currentTasks) === beforeRefusalSnapshot);

  console.log("\nИтоговые задачи варианта:");
  showTasks(currentTasks);
  console.log("Итоговые id:", currentTasks.map((task) => task.id));
  showPreserved(variantTasks, snapshot, "variantTasks");
}

runCommonScenario();
runVariantScenario();

console.log("\n=== Пустой список ===");
showStats([]);
