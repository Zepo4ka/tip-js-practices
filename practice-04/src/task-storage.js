export const STORAGE_VERSION = 1;

// Все функции принимают объект storage явно, чтобы их можно было проверить
// без обращения к глобальному window.localStorage.

export function isValidTaskList(value) {
  if (!Array.isArray(value)) return false;
  const ids = new Set();
  for (const task of value) {
    if (task === null || typeof task !== "object" || Array.isArray(task)
      || !Number.isSafeInteger(task.id) || task.id <= 0 || ids.has(task.id)
      || typeof task.title !== "string" || task.title !== task.title.trim()
      || task.title.length < 1 || task.title.length > 100
      || typeof task.completed !== "boolean"
      || !["low", "medium", "high"].includes(task.priority)) return false;
    ids.add(task.id);
  }
  return true;
}

export function loadTasks(storage, key, fallbackTasks) {
  const fallback = fallbackTasks.map((task) => ({ ...task }));
  try {
    const raw = storage.getItem(key);
    if (raw === null) return { ok: true, source: "initial", tasks: fallback };
    const saved = JSON.parse(raw);
    if (saved === null || typeof saved !== "object" || Array.isArray(saved)
      || saved.version !== STORAGE_VERSION || !isValidTaskList(saved.tasks)) {
      throw new Error("Неверная версия или схема сохранённых задач.");
    }
    return { ok: true, source: "storage", tasks: saved.tasks.map((task) => ({ ...task })) };
  } catch (error) {
    return {
      ok: false,
      source: "fallback",
      tasks: fallback,
      error: `Не удалось прочитать сохранённые задачи. Используется исходный набор. ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export function saveTasks(storage, key, tasks) {
  if (!isValidTaskList(tasks)) {
    return { ok: false, error: "Некорректный список задач не сохранён." };
  }
  try {
    storage.setItem(key, JSON.stringify({ version: STORAGE_VERSION, tasks }));
    return { ok: true };
  } catch (error) {
    return { ok: false, error: `Изменения доступны в этой вкладке, но не сохранены: ${error instanceof Error ? error.message : String(error)}` };
  }
}

export function removeSavedTasks(storage, key) {
  try {
    storage.removeItem(key);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: `Не удалось удалить сохранённые задачи: ${error instanceof Error ? error.message : String(error)}` };
  }
}
