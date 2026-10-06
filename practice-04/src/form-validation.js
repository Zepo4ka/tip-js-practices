const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

// Чистая проверка данных формы. DOM и показ сообщений выполняются в main.js.
// draft: { id, title, priority }; editingId: null либо id редактируемой задачи.
export function validateTaskDraft(draft, tasks, editingId = null) {
  const errors = {};
  const fields = draft ?? {};
  const rawId = editingId === null ? fields.id : editingId;
  const id = typeof rawId === "string" || typeof rawId === "number"
    ? Number(rawId)
    : NaN;

  if (!Number.isSafeInteger(id) || id <= 0 || (editingId !== null && typeof editingId !== "number")) {
    errors.id = "Идентификатор должен быть положительным безопасным целым числом.";
  } else if (editingId === null && tasks.some((task) => task.id === id)) {
    errors.id = `Задача с идентификатором ${id} уже существует.`;
  } else if (editingId !== null && !tasks.some((task) => task.id === id)) {
    errors.id = `Задача с идентификатором ${id} не найдена.`;
  }

  const title = typeof fields.title === "string" ? fields.title.trim() : "";
  if (typeof fields.title !== "string" || title.length < 1 || title.length > 100) {
    errors.title = "Название после удаления краевых пробелов должно содержать от 1 до 100 символов.";
  }
  if (!ALLOWED_PRIORITIES.has(fields.priority)) {
    errors.priority = "Выберите низкий, средний или высокий приоритет.";
  }

  return Object.keys(errors).length > 0
    ? { ok: false, errors }
    : { ok: true, value: { id, title, priority: fields.priority } };
}
