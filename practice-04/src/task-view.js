import { getTaskStats } from "./task-service.js";

// Здесь создаётся DOM, но не изменяется состояние приложения.
// Контракт карточки, селекторы и тексты описаны в методичке.
export function createTaskElement(task) {
  const card = document.createElement("li");
  card.classList.add("task-card");
  card.classList.toggle("is-completed", task.completed);
  card.dataset.taskId = String(task.id);

  const title = document.createElement("h3");
  title.classList.add("task-title");
  title.textContent = task.title;

  const status = document.createElement("span");
  status.classList.add("task-status");
  status.textContent = task.completed ? "Выполнена" : "В работе";

  const priority = document.createElement("span");
  priority.classList.add("task-priority");
  const priorityLabels = { low: "Низкий", medium: "Средний", high: "Высокий" };
  priority.textContent = priorityLabels[task.priority];

  const actions = document.createElement("div");
  actions.classList.add("task-actions");

  for (const [action, label] of [["toggle", "Выполнена"], ["edit", "Изменить"], ["delete", "Удалить"]]) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.action = action;
    if (action === "toggle") {
      button.setAttribute("aria-pressed", String(task.completed));
    }

    const caption = document.createElement("span");
    caption.classList.add("action-label");
    caption.textContent = label;
    button.append(caption);
    actions.append(button);
  }

  card.append(title, status, priority, actions);
  return card;
}

export function renderTaskList(listElement, tasks) {
  listElement.replaceChildren(...tasks.map(createTaskElement));
}

export function renderSummary(summaryElement, tasks, visibleCount) {
  const stats = getTaskStats(tasks);
  const values = {
    total: stats.total,
    completed: stats.completed,
    pending: stats.pending,
    progress: `${stats.progress.toFixed(1)}%`,
    visible: visibleCount,
  };

  for (const [name, value] of Object.entries(values)) {
    summaryElement.querySelector(`[data-stat="${name}"]`).textContent = String(value);
  }
}

export function renderEmptyState(messageElement, total, visibleCount) {
  if (visibleCount > 0) {
    messageElement.textContent = "";
    messageElement.hidden = true;
    return;
  }

  messageElement.textContent = total === 0
    ? "Список задач пуст."
    : "Нет задач по выбранному фильтру.";
  messageElement.hidden = false;
}
