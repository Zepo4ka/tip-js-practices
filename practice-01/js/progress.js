"use strict";

// Исходные данные варианта 5.
const totalTasks = 7;
const completedTasks = 2;

if (
  !Number.isFinite(totalTasks) ||
  !Number.isInteger(totalTasks) ||
  totalTasks < 0 ||
  totalTasks > 1000 ||
  !Number.isFinite(completedTasks) ||
  !Number.isInteger(completedTasks) ||
  completedTasks < 0 ||
  completedTasks > totalTasks
) {
  console.log("Ошибка: количества задач должны быть целыми числами от 0 до 1000, выполнено не больше общего количества.");
} else if (totalTasks === 0) {
  console.log("Задач пока нет");
} else {
  const remainingTasks = totalTasks - completedTasks;
  const percentage = completedTasks / totalTasks * 100;
  let status = "В работе";

  // Статус зависит от количеств, а не от округлённого процента.
  if (completedTasks === 0) {
    status = "Не начато";
  } else if (completedTasks === totalTasks) {
    status = "Завершено";
  }

  console.log(`Всего задач: ${totalTasks}`);
  console.log(`Выполнено: ${completedTasks}`);
  console.log(`Осталось: ${remainingTasks}`);
  console.log(`Прогресс: ${percentage.toFixed(1)}%`);
  console.log(`Статус: ${status}`);
}
