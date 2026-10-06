function getIdError(id) {
  if (typeof id !== "number") {
    return "Идентификатор должен быть числом.";
  }

  if (!Number.isSafeInteger(id) || id <= 0) {
    return "Идентификатор должен быть положительным безопасным целым числом.";
  }

  return undefined;
}

function getTitleError(title) {
  if (typeof title !== "string") {
    return "Название должно быть строкой.";
  }

  const length = title.trim().length;
  if (length < 1 || length > 100) {
    return "Название после удаления краевых пробелов должно содержать от 1 до 100 символов.";
  }

  return undefined;
}

export function createTask(id, title, priority = "medium") {
  const idError = getIdError(id);
  if (idError !== undefined) {
    return { ok: false, error: idError };
  }

  const titleError = getTitleError(title);
  if (titleError !== undefined) {
    return { ok: false, error: titleError };
  }

  if (typeof priority !== "string") {
    return { ok: false, error: "Приоритет должен быть строкой." };
  }

  if (priority !== "low" && priority !== "medium" && priority !== "high") {
    return { ok: false, error: 'Приоритет должен быть "low", "medium" или "high".' };
  }

  return {
    ok: true,
    task: { id, title: title.trim(), completed: false, priority },
  };
}

export function findTaskById(tasks, id) {
  // Идентификатор задачи не совпадает с её индексом в массиве.
  return tasks.find((task) => task.id === id);
}

export function getPendingTasks(tasks) {
  return tasks.filter((task) => task.completed === false);
}

export function getTaskTitles(tasks) {
  return tasks.map((task) => task.title);
}

export function getTaskStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed === true).length;
  const pending = total - completed;
  const progress = total === 0 ? 0 : (completed / total) * 100;

  // Округление понадобится только при выводе, здесь сохраняем число.
  return { total, completed, pending, progress };
}

export function addTask(tasks, id, title, priority = "medium") {
  const result = createTask(id, title, priority);
  if (!result.ok) {
    return result;
  }

  if (findTaskById(tasks, id) !== undefined) {
    return { ok: false, error: `Задача с идентификатором ${id} уже существует.` };
  }

  return { ok: true, tasks: [...tasks, result.task] };
}

export function setTaskCompleted(tasks, id, completed) {
  const idError = getIdError(id);
  if (idError !== undefined) {
    return { ok: false, error: idError };
  }

  if (typeof completed !== "boolean") {
    return { ok: false, error: "Статус выполнения должен быть true или false." };
  }

  if (findTaskById(tasks, id) === undefined) {
    return { ok: false, error: `Задача с идентификатором ${id} не найдена.` };
  }

  // Новый массив и копия выбранной задачи сохраняют предыдущее состояние.
  return {
    ok: true,
    tasks: tasks.map((task) => task.id === id ? { ...task, completed } : task),
  };
}

export function renameTask(tasks, id, title) {
  const idError = getIdError(id);
  if (idError !== undefined) {
    return { ok: false, error: idError };
  }

  const titleError = getTitleError(title);
  if (titleError !== undefined) {
    return { ok: false, error: titleError };
  }

  if (findTaskById(tasks, id) === undefined) {
    return { ok: false, error: `Задача с идентификатором ${id} не найдена.` };
  }

  const normalizedTitle = title.trim();
  return {
    ok: true,
    tasks: tasks.map((task) => task.id === id ? { ...task, title: normalizedTitle } : task),
  };
}

export function removeTask(tasks, id) {
  const idError = getIdError(id);
  if (idError !== undefined) {
    return { ok: false, error: idError };
  }

  if (findTaskById(tasks, id) === undefined) {
    return { ok: false, error: `Задача с идентификатором ${id} не найдена.` };
  }

  return { ok: true, tasks: tasks.filter((task) => task.id !== id) };
}

export function updateTask(tasks, id, title, priority) {
  if (!["low", "medium", "high"].includes(priority)) {
    return { ok: false, error: 'Приоритет должен быть "low", "medium" или "high".' };
  }
  const validation = createTask(id, title, priority);
  if (!validation.ok) return validation;
  if (findTaskById(tasks, id) === undefined) {
    return { ok: false, error: `Задача с идентификатором ${id} не найдена.` };
  }
  return {
    ok: true,
    tasks: tasks.map((task) => task.id === id
      ? { ...task, title: validation.task.title, priority: validation.task.priority }
      : task),
  };
}
