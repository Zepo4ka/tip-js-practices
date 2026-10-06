import assert from "node:assert/strict";
import {
  addTask,
  setTaskCompleted,
  renameTask,
  removeTask,
} from "./src/task-service.js";

// Снимки хранят значения, чтобы изменение общей ссылки не скрыло мутацию.
const snapshot = (tasks) => tasks.map((task) => ({ ...task }));

function successful(result) {
  assert.equal(result.ok, true, result.error ?? "Операция вернула отказ");
  assert.ok(Array.isArray(result.tasks), "Ожидается массив задач");
  return result.tasks;
}

function check(name, run) {
  try {
    const actual = run();
    console.log(`OK: ${name}. Результат: ${JSON.stringify(actual)}`);
  } catch (error) {
    console.error(`FAIL: ${name}. ${error.message}`);
    process.exitCode = 1;
  }
}

check("Удалённый идентификатор можно использовать снова", () => {
  const original = [
    { id: 1, title: "Заказать детали стенда", completed: true, priority: "high" },
    { id: 23, title: "Собрать крепление", completed: false, priority: "low" },
    { id: 47, title: "Проверить датчик", completed: false, priority: "medium" },
  ];
  const before = snapshot(original);
  const oldTask = original[0];

  const removed = successful(removeTask(original, 1));
  assert.notStrictEqual(removed, original);
  assert.deepEqual(removed, before.slice(1));
  const afterRemoval = snapshot(removed);

  const restored = successful(addTask(removed, 1, "Подготовить инструкцию стенда", "low"));
  assert.notStrictEqual(restored, removed);
  assert.deepEqual(restored, [
    ...afterRemoval,
    { id: 1, title: "Подготовить инструкцию стенда", completed: false, priority: "low" },
  ]);
  assert.notStrictEqual(restored[2], oldTask);
  assert.deepEqual(original, before, "Удаление и повторное добавление изменили исходный список");
  assert.deepEqual(removed, afterRemoval, "Добавление изменило промежуточный список");
  assert.deepEqual(oldTask, before[0], "Изменился объект ранее удалённой задачи");

  return { ids: restored.map((task) => task.id), newTask: restored[2], originalTask: oldTask };
});

check("Обновление краёв списка сохраняет средние записи и остальные поля", () => {
  const original = [
    { id: 51, title: "Записать маршрут", completed: false, priority: "high" },
    { id: 68, title: "Купить карту", completed: true, priority: "low" },
    { id: 84, title: "Сверить прогноз", completed: false, priority: "medium" },
    { id: 99, title: "Собрать рюкзак", completed: false, priority: "high" },
  ];
  const before = snapshot(original);

  const firstUpdated = successful(renameTask(original, 51, "  Записать запасной маршрут  "));
  assert.notStrictEqual(firstUpdated, original);
  assert.notStrictEqual(firstUpdated[0], original[0]);
  assert.deepEqual(firstUpdated, [
    { ...before[0], title: "Записать запасной маршрут" },
    ...before.slice(1),
  ]);
  const afterFirst = snapshot(firstUpdated);

  const bothUpdated = successful(setTaskCompleted(firstUpdated, 99, true));
  assert.notStrictEqual(bothUpdated, firstUpdated);
  assert.notStrictEqual(bothUpdated[3], firstUpdated[3]);
  assert.deepEqual(bothUpdated, [
    ...afterFirst.slice(0, 3),
    { ...afterFirst[3], completed: true },
  ]);
  assert.deepEqual(bothUpdated.slice(1, 3), before.slice(1, 3), "Изменились средние задачи");
  assert.deepEqual(original, before, "Обновление изменило исходные объекты");
  assert.deepEqual(firstUpdated, afterFirst, "Обновление последней задачи изменило предыдущий список");

  return { first: bothUpdated[0], middleIds: bothUpdated.slice(1, 3).map((task) => task.id), last: bothUpdated[3] };
});

check("Полный цикл новой задачи сохраняет каждое предыдущее состояние", () => {
  const original = [
    { id: 301, title: "Проверить микрофон", completed: true, priority: "medium" },
    { id: 307, title: "Настроить свет", completed: false, priority: "high" },
  ];
  const before = snapshot(original);

  const added = successful(addTask(original, 313, "Подготовить запись", "low"));
  assert.notStrictEqual(added, original);
  assert.deepEqual(added, [
    ...before,
    { id: 313, title: "Подготовить запись", completed: false, priority: "low" },
  ]);
  const afterAdd = snapshot(added);

  const completed = successful(setTaskCompleted(added, 313, true));
  assert.notStrictEqual(completed, added);
  assert.notStrictEqual(completed[2], added[2]);
  assert.deepEqual(completed, [
    ...before,
    { ...afterAdd[2], completed: true },
  ]);
  const afterComplete = snapshot(completed);

  const renamed = successful(renameTask(completed, 313, "  Запись готова к монтажу  "));
  assert.notStrictEqual(renamed, completed);
  assert.notStrictEqual(renamed[2], completed[2]);
  assert.deepEqual(renamed, [
    ...before,
    { ...afterComplete[2], title: "Запись готова к монтажу" },
  ]);
  const afterRename = snapshot(renamed);

  const final = successful(removeTask(renamed, 313));
  assert.notStrictEqual(final, renamed);
  assert.notStrictEqual(final, original);
  assert.deepEqual(final, before, "После полного цикла изменились исходные поля");
  assert.deepEqual(original, before, "Изменилось исходное состояние");
  assert.deepEqual(added, afterAdd, "Изменилось состояние после добавления");
  assert.deepEqual(completed, afterComplete, "Изменилось состояние после завершения");
  assert.deepEqual(renamed, afterRename, "Изменилось состояние после переименования");

  return { finalTasks: final, stages: [added[2], completed[2], renamed[2]], newArray: final !== original };
});
