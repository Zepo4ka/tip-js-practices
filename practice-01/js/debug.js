"use strict";

const plannedText = "8";
const completedText = "3";
const additionalText = "2";

// Преобразуем строковые количества в числа перед сложением.
const completedTotal = Number(completedText) + Number(additionalText);
const remainingTasks = Number(plannedText) - completedTotal;

console.log("Выполнено:", completedTotal);
console.log("Осталось:", remainingTasks);

let controlSum = 0;

// Номер 4 тоже должен попасть в контрольную сумму.
for (let taskNumber = 1; taskNumber <= 4; taskNumber += 1) {
  controlSum += taskNumber;
}

console.log("Контрольная сумма:", controlSum);
