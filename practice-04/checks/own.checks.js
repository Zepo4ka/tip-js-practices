import assert from "node:assert/strict";
import { demoTasks, variantTasks } from "../src/data.js";
import { addTask, getTaskStats, removeTask, updateTask } from "../src/task-service.js";
import { validateTaskDraft } from "../src/form-validation.js";
import { loadTasks, removeSavedTasks, saveTasks } from "../src/task-storage.js";

class MemoryStorage {
  values = new Map();
  getItem(key) { return this.values.get(key) ?? null; }
  setItem(key, value) { this.values.set(key, value); }
  removeItem(key) { this.values.delete(key); }
}

let passed = 0;
let failed = 0;
function check(name, action) {
  try {
    action();
    passed += 1;
    console.log(`OK: ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL: ${name} — ${error.message}`);
  }
}

check("Граница формы: 100 символов принимаются, 101 отклоняется", () => {
  const draft = { id: "75", title: "x".repeat(100), priority: "medium" };
  assert.equal(validateTaskDraft(draft, demoTasks).ok, true);
  const invalid = validateTaskDraft({ ...draft, title: "x".repeat(101) }, demoTasks);
  assert.equal(invalid.ok, false);
  assert.deepEqual(Object.keys(invalid.errors), ["title"]);
});

check("Независимые ошибки полей возвращаются вместе", () => {
  const invalid = validateTaskDraft({ id: "4", title: "   ", priority: "urgent" }, demoTasks);
  assert.equal(invalid.ok, false);
  assert.deepEqual(Object.keys(invalid.errors), ["id", "title", "priority"]);
});

check("Редактирование без priority отклоняется без изменения исходной задачи", () => {
  const before = JSON.stringify(demoTasks);
  assert.equal(updateTask(demoTasks, 1, "Изменить название", undefined).ok, false);
  assert.equal(JSON.stringify(demoTasks), before);
});

check("Сохранённый пустой список восстанавливается как storage", () => {
  const storage = new MemoryStorage();
  assert.equal(saveTasks(storage, "demo", []).ok, true);
  const loaded = loadTasks(storage, "demo", demoTasks);
  assert.equal(loaded.ok, true);
  assert.equal(loaded.source, "storage");
  assert.deepEqual(loaded.tasks, []);
});

check("Ненормализованное название отклоняет весь JSON и сохраняет запись для исследования", () => {
  const storage = new MemoryStorage();
  const raw = JSON.stringify({ version: 1, tasks: [{ ...demoTasks[0], title: "  Название  " }] });
  storage.setItem("demo", raw);
  const loaded = loadTasks(storage, "demo", demoTasks);
  assert.equal(loaded.ok, false);
  assert.equal(loaded.source, "fallback");
  assert.deepEqual(loaded.tasks, demoTasks);
  assert.equal(storage.getItem("demo"), raw);
});

check("Исключение без объекта Error перехватывается при чтении, записи и удалении", () => {
  const storage = {
    getItem() { throw null; },
    setItem() { throw "blocked"; },
    removeItem() { throw null; },
  };
  for (const result of [loadTasks(storage, "demo", demoTasks), saveTasks(storage, "demo", demoTasks), removeSavedTasks(storage, "demo")]) {
    assert.equal(result.ok, false);
    assert.ok(result.error.trim().length > 0);
  }
});

check("Вариант 5: add75/update23/delete37, восстановление и отдельный сброс", () => {
  const storage = new MemoryStorage();
  saveTasks(storage, "demo", demoTasks);
  let tasks = addTask(variantTasks, 75, "Согласовать демонстрацию прототипа", "medium").tasks;
  tasks = updateTask(tasks, 23, "Уточнить распределение задач команды", "high").tasks;
  tasks = removeTask(tasks, 37).tasks;
  assert.equal(saveTasks(storage, "variant", tasks).ok, true);
  const restored = loadTasks(storage, "variant", variantTasks).tasks;
  assert.deepEqual(restored.map((task) => task.id), [11, 23, 41, 58, 64, 75]);
  assert.deepEqual(getTaskStats(restored), { total: 6, completed: 3, pending: 3, progress: 50 });
  assert.equal(restored.find((task) => task.id === 23).completed, true);
  assert.deepEqual(loadTasks(storage, "demo", demoTasks).tasks, demoTasks);
  assert.equal(removeSavedTasks(storage, "variant").ok, true);
  assert.equal(storage.getItem("variant"), null);
  assert.notEqual(storage.getItem("demo"), null);
  assert.deepEqual(loadTasks(storage, "variant", variantTasks).tasks, variantTasks);
});

console.log(`\nСобственных проверок пройдено: ${passed}; не пройдено: ${failed}.`);
if (failed > 0) process.exitCode = 1;
