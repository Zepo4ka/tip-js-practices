"use strict";

// Исходные данные варианта 5.
const totalTasks = 7;
const completedTasks = 2;
const dailyLimit = 2;

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
} else if (
  !Number.isFinite(dailyLimit) ||
  !Number.isInteger(dailyLimit) ||
  dailyLimit < 1 ||
  dailyLimit > 1000
) {
  console.log("Ошибка: дневная норма должна быть целым числом от 1 до 1000.");
} else if (completedTasks === totalTasks) {
  console.log("Все задачи уже выполнены");
  console.log("Потребуется дней: 0");
} else {
  let remainingTasks = totalTasks - completedTasks;
  let day = 0;

  console.log(`Осталось задач: ${remainingTasks}`);

  while (remainingTasks > 0) {
    day += 1;
    // В последний день выполняем только оставшиеся задачи.
    const tasksForDay = Math.min(dailyLimit, remainingTasks);
    remainingTasks -= tasksForDay;
    console.log(`День ${day}: выполнено ${tasksForDay}, осталось ${remainingTasks}`);
  }

  console.log(`Потребуется дней: ${day}`);
}
