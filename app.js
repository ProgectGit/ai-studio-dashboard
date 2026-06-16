const PROJECT_STATUSES = ["idea", "active", "testing", "released", "paused", "archived"];
const TASK_PRIORITIES = ["low", "medium", "high", "critical"];
const TASK_STATUSES = ["todo", "in_progress", "blocked", "done"];

const PROJECT_STATUS_LABELS = {
  idea: "ідея",
  active: "активний",
  testing: "тестування",
  released: "випущений",
  paused: "на паузі",
  archived: "архів"
};

const TASK_PRIORITY_LABELS = {
  low: "низький",
  medium: "середній",
  high: "високий",
  critical: "критичний"
};

const TASK_STATUS_LABELS = {
  todo: "заплановано",
  in_progress: "в роботі",
  blocked: "заблоковано",
  done: "виконано"
};

const DATABASE_TYPES = {
  PostgreSQL: "Структуровані факти та реляційні дані проєкту.",
  Supabase: "Хостинг PostgreSQL, API, сховище та realtime-сервіси.",
  SQLite: "Мала локальна реляційна база для простих застосунків.",
  Firebase: "Realtime-дані застосунку та backend-сервіси.",
  Qdrant: "Векторна база знань для RAG.",
  Pinecone: "Керована векторна база для семантичного пошуку.",
  Weaviate: "Векторна база даних з AI-native пошуком.",
  Obsidian: "Локальна база знань у Markdown.",
  "Markdown Files": "Текстова пам'ять і документація проєкту.",
  "JSON Files": "Портативні структуровані файли даних.",
  localStorage: "Невелике браузерне сховище для локального стану."
};

const AI_MODULES = {
  ChatGPT: "Універсальний AI-асистент і модуль міркування.",
  Claude: "Асистент з довгим контекстом для аналізу та текстів.",
  Gemini: "Мультимодальний AI-асистент від Google.",
  Codex: "Кодинговий агент для реалізації задач.",
  "Local LLM": "Приватна модель, що працює на локальному обладнанні.",
  RAG: "Генерація з пошуком по знаннях проєкту.",
  Embeddings: "Семантичні вектори для пошуку та пам'яті.",
  "Agent Router": "Направляє задачі до потрібного AI-агента.",
  "Memory Agent": "Зберігає та дістає пам'ять проєкту.",
  "Research Agent": "Шукає, читає та підсумовує інформацію.",
  "Sales Agent": "Підтримує CRM, пропозиції та роботу з лідами.",
  "Medical Agent": "Підтримує медичні сценарії з обов'язковою перевіркою.",
  "Developer Agent": "Планує, редагує, тестує та рев'юїть код."
};

const TECH_STACK = [
  "HTML", "CSS", "JavaScript", "TypeScript", "Node.js", "React", "WordPress",
  "Shopify", "Liquid", "n8n", "Telegram Bot API", "GitHub", "GitHub Pages",
  "Docker", "PostgreSQL", "Supabase", "Qdrant"
];

const state = {
  supabase: null,
  projects: [],
  tasks: [],
  databases: [],
  aiModules: [],
  techStack: [],
  selectedProjectId: null,
  filters: {
    status: "",
    progress: "",
    tech: "",
    database: "",
    aiModule: ""
  }
};

const $ = (selector) => document.querySelector(selector);

const elements = {
  summaryGrid: $("#summaryGrid"),
  projectGrid: $("#projectGrid"),
  connectionStatus: $("#connectionStatus"),
  toast: $("#toast"),
  newProjectButton: $("#newProjectButton"),
  clearFiltersButton: $("#clearFiltersButton"),
  projectDialog: $("#projectDialog"),
  projectForm: $("#projectForm"),
  projectFormTitle: $("#projectFormTitle"),
  closeProjectButton: $("#closeProjectButton"),
  cancelProjectButton: $("#cancelProjectButton"),
  projectId: $("#projectId"),
  projectTitle: $("#projectTitle"),
  projectDescription: $("#projectDescription"),
  projectStatus: $("#projectStatus"),
  detailDialog: $("#detailDialog"),
  closeDetailButton: $("#closeDetailButton"),
  detailTitle: $("#detailTitle"),
  detailStatus: $("#detailStatus"),
  detailProgressLabel: $("#detailProgressLabel"),
  detailProgressBar: $("#detailProgressBar"),
  detailTaskCount: $("#detailTaskCount"),
  taskForm: $("#taskForm"),
  taskId: $("#taskId"),
  taskTitle: $("#taskTitle"),
  taskDescription: $("#taskDescription"),
  taskPriority: $("#taskPriority"),
  taskStatus: $("#taskStatus"),
  taskList: $("#taskList"),
  databaseForm: $("#databaseForm"),
  databaseType: $("#databaseType"),
  databaseList: $("#databaseList"),
  aiModuleForm: $("#aiModuleForm"),
  aiModuleType: $("#aiModuleType"),
  aiModuleList: $("#aiModuleList"),
  techForm: $("#techForm"),
  techName: $("#techName"),
  techList: $("#techList"),
  filterStatus: $("#filterStatus"),
  filterProgress: $("#filterProgress"),
  filterTech: $("#filterTech"),
  filterDatabase: $("#filterDatabase"),
  filterAiModule: $("#filterAiModule")
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

function init() {
  fillSelect(elements.projectStatus, PROJECT_STATUSES, "", PROJECT_STATUS_LABELS);
  fillSelect(elements.filterStatus, PROJECT_STATUSES, "Усі", PROJECT_STATUS_LABELS);
  fillSelect(elements.taskPriority, TASK_PRIORITIES, "", TASK_PRIORITY_LABELS);
  fillSelect(elements.databaseType, Object.keys(DATABASE_TYPES));
  fillSelect(elements.filterDatabase, Object.keys(DATABASE_TYPES), "Усі");
  fillSelect(elements.aiModuleType, Object.keys(AI_MODULES));
  fillSelect(elements.filterAiModule, Object.keys(AI_MODULES), "Усі");
  fillSelect(elements.techName, TECH_STACK);
  fillSelect(elements.filterTech, TECH_STACK, "Усі");
  bindEvents();
  connectSupabase();
}

function fillSelect(select, items, firstLabel = "", labels = {}) {
  select.innerHTML = "";
  if (firstLabel) {
    select.append(new Option(firstLabel, ""));
  }
  items.forEach((item) => select.append(new Option(labels[item] || item, item)));
}

function bindEvents() {
  elements.newProjectButton.addEventListener("click", () => openProjectForm());
  elements.closeProjectButton.addEventListener("click", () => elements.projectDialog.close());
  elements.cancelProjectButton.addEventListener("click", () => elements.projectDialog.close());
  elements.projectForm.addEventListener("submit", saveProject);
  elements.closeDetailButton.addEventListener("click", () => elements.detailDialog.close());
  elements.taskForm.addEventListener("submit", saveTask);
  elements.databaseForm.addEventListener("submit", addDatabase);
  elements.aiModuleForm.addEventListener("submit", addAiModule);
  elements.techForm.addEventListener("submit", addTech);
  elements.clearFiltersButton.addEventListener("click", clearFilters);

  [
    ["status", elements.filterStatus],
    ["progress", elements.filterProgress],
    ["tech", elements.filterTech],
    ["database", elements.filterDatabase],
    ["aiModule", elements.filterAiModule]
  ].forEach(([key, element]) => {
    element.addEventListener("change", () => {
      state.filters[key] = element.value;
      render();
    });
  });
}

async function connectSupabase() {
  const supabaseUrl = window.SUPABASE_URL;
  const supabaseAnonKey = window.SUPABASE_ANON_KEY;
  const isMissingConfig =
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes("YOUR_") ||
    supabaseAnonKey.includes("YOUR_");

  if (isMissingConfig) {
    showConnectionError();
    render();
    return;
  }

  state.supabase = window.supabase?.createClient
    ? window.supabase.createClient(supabaseUrl, supabaseAnonKey)
    : createRestClient(supabaseUrl, supabaseAnonKey);
  await loadAllData();
}

function createRestClient(baseUrl, apiKey) {
  const restUrl = `${baseUrl.replace(/\/$/, "")}/rest/v1`;

  function request(path, options = {}) {
    return fetch(`${restUrl}${path}`, {
      ...options,
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
        ...(options.headers || {})
      }
    }).then(async (response) => {
      const text = await response.text();
      const data = text ? JSON.parse(text) : null;
      if (!response.ok) {
        return { data: null, error: data };
      }
      return { data, error: null };
    }).catch((error) => ({ data: null, error }));
  }

  return {
    from(table) {
      return {
        select(columns) {
          const params = new URLSearchParams({ select: columns });
          return {
            order(column, options = {}) {
              params.set("order", `${column}.${options.ascending === false ? "desc" : "asc"}`);
              return request(`/${table}?${params.toString()}`);
            }
          };
        },
        insert(payload) {
          return request(`/${table}`, {
            method: "POST",
            body: JSON.stringify(Array.isArray(payload) ? payload : [payload])
          });
        },
        update(payload) {
          return {
            eq(column, value) {
              const params = new URLSearchParams({ [column]: `eq.${value}` });
              return request(`/${table}?${params.toString()}`, {
                method: "PATCH",
                body: JSON.stringify(payload)
              });
            }
          };
        },
        delete() {
          return {
            eq(column, value) {
              const params = new URLSearchParams({ [column]: `eq.${value}` });
              return request(`/${table}?${params.toString()}`, {
                method: "DELETE"
              });
            }
          };
        }
      };
    }
  };
}

async function loadAllData() {
  try {
    const [projects, tasks, databases, aiModules, techStack] = await Promise.all([
      query("projects", "created_at"),
      query("project_tasks", "created_at"),
      query("project_databases", "database_type"),
      query("project_ai_modules", "module_type"),
      query("project_tech_stack", "tech_name")
    ]);

    state.projects = projects;
    state.tasks = tasks;
    state.databases = databases;
    state.aiModules = aiModules;
    state.techStack = techStack;
    elements.connectionStatus.textContent = "Підключено до Supabase";
    render();
  } catch (error) {
    console.error(error);
    showConnectionError(error);
    render();
  }
}

async function query(table, orderColumn) {
  const { data, error } = await state.supabase
    .from(table)
    .select("*")
    .order(orderColumn, { ascending: true });

  if (error) throw error;
  return data || [];
}

function showConnectionError(error = null) {
  const detail = error?.message || error?.msg || error?.details || error?.hint || "";
  elements.connectionStatus.textContent =
    detail
      ? `Не вдалося підключитися до бази даних: ${detail}`
      : "Не вдалося підключитися до бази даних. Перевір SUPABASE_URL і SUPABASE_ANON_KEY.";
  showToast(elements.connectionStatus.textContent);
}

function render() {
  renderSummary();
  renderProjects();
  renderDetail();
}

function getProjectMetrics(projectId) {
  const tasks = state.tasks.filter((task) => task.project_id === projectId);
  const completed = tasks.filter((task) => task.completed).length;
  const total = tasks.length;
  const progress = total ? Math.round((completed / total) * 100) : 0;
  return { tasks, completed, total, progress };
}

function renderSummary() {
  const projectMetrics = state.projects.map((project) => getProjectMetrics(project.id));
  const totalProgress = projectMetrics.reduce((sum, item) => sum + item.progress, 0);
  const averageProgress = state.projects.length ? Math.round(totalProgress / state.projects.length) : 0;
  const totalTasks = state.tasks.length;
  const completedTasks = state.tasks.filter((task) => task.completed).length;
  const criticalTasks = state.tasks.filter((task) => task.priority === "critical" && !task.completed).length;

  const cards = [
    ["Усього проєктів", state.projects.length],
    ["Активні проєкти", state.projects.filter((project) => project.status === "active").length],
    ["Випущені проєкти", state.projects.filter((project) => project.status === "released").length],
    ["Середній прогрес", `${averageProgress}%`],
    ["Усього задач", totalTasks],
    ["Виконані задачі", completedTasks],
    ["Критичні задачі", criticalTasks]
  ];

  elements.summaryGrid.innerHTML = cards
    .map(([label, value]) => `<article class="summary-card"><span>${label}</span><strong>${value}</strong></article>`)
    .join("");
}

function renderProjects() {
  const projects = getFilteredProjects();
  if (!projects.length) {
    elements.projectGrid.innerHTML = `<div class="empty-state">Немає проєктів, що відповідають поточним фільтрам.</div>`;
    return;
  }

  elements.projectGrid.innerHTML = projects.map((project) => {
    const metrics = getProjectMetrics(project.id);
    const tech = state.techStack.filter((item) => item.project_id === project.id).slice(0, 4);
    const databases = state.databases.filter((item) => item.project_id === project.id).slice(0, 3);
    const modules = state.aiModules.filter((item) => item.project_id === project.id).slice(0, 3);
    return `
      <article class="project-card">
        <div class="item-title-row">
          <h3>${escapeHtml(project.title)}</h3>
          <span class="status-pill">${PROJECT_STATUS_LABELS[project.status] || project.status}</span>
        </div>
        <p class="muted">${escapeHtml(project.description || "Опис ще не додано.")}</p>
        <div>
          <div class="progress-meta">
            <strong>${metrics.progress}%</strong>
            <span class="muted">${metrics.completed} / ${metrics.total} задач</span>
          </div>
          <div class="progress-track"><span style="width:${metrics.progress}%"></span></div>
        </div>
        <div class="tag-row">${[...tech.map((i) => i.tech_name), ...databases.map((i) => i.database_type), ...modules.map((i) => i.module_type)].map(tag).join("")}</div>
        <div class="card-actions">
          <button class="primary-button" type="button" data-action="open" data-id="${project.id}">Відкрити</button>
          <button class="ghost-button" type="button" data-action="edit" data-id="${project.id}">Редагувати</button>
          <button class="danger-button" type="button" data-action="delete" data-id="${project.id}">Видалити</button>
        </div>
      </article>
    `;
  }).join("");

  elements.projectGrid.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", handleProjectAction);
  });
}

function getFilteredProjects() {
  return state.projects.filter((project) => {
    const metrics = getProjectMetrics(project.id);
    const hasTech = !state.filters.tech || state.techStack.some((item) => item.project_id === project.id && item.tech_name === state.filters.tech);
    const hasDatabase = !state.filters.database || state.databases.some((item) => item.project_id === project.id && item.database_type === state.filters.database);
    const hasModule = !state.filters.aiModule || state.aiModules.some((item) => item.project_id === project.id && item.module_type === state.filters.aiModule);
    const hasStatus = !state.filters.status || project.status === state.filters.status;
    const hasProgress = !state.filters.progress || progressMatches(metrics.progress, state.filters.progress);
    return hasStatus && hasProgress && hasTech && hasDatabase && hasModule;
  });
}

function progressMatches(progress, range) {
  const [min, max] = range.split("-").map(Number);
  return progress >= min && progress <= max;
}

function tag(value) {
  return `<span class="tag">${escapeHtml(value)}</span>`;
}

function handleProjectAction(event) {
  const { action, id } = event.currentTarget.dataset;
  if (action === "open") openProjectDetail(id);
  if (action === "edit") openProjectForm(id);
  if (action === "delete") deleteProject(id);
}

function openProjectForm(projectId = "") {
  const project = state.projects.find((item) => item.id === projectId);
  elements.projectFormTitle.textContent = project ? "Редагувати проєкт" : "Новий проєкт";
  elements.projectId.value = project?.id || "";
  elements.projectTitle.value = project?.title || "";
  elements.projectDescription.value = project?.description || "";
  elements.projectStatus.value = project?.status || "idea";
  elements.projectDialog.showModal();
}

async function saveProject(event) {
  event.preventDefault();
  if (!state.supabase) return showConnectionError();

  const id = elements.projectId.value;
  const payload = {
    title: elements.projectTitle.value.trim(),
    description: elements.projectDescription.value.trim(),
    status: elements.projectStatus.value
  };

  try {
    const request = id
      ? state.supabase.from("projects").update(payload).eq("id", id)
      : state.supabase.from("projects").insert(payload);
    const { error } = await request;
    if (error) throw error;
    elements.projectDialog.close();
    await loadAllData();
    showToast("Проєкт збережено.");
  } catch (error) {
    showToast(error.message);
  }
}

async function deleteProject(projectId) {
  if (!state.supabase) return showConnectionError();
  const project = state.projects.find((item) => item.id === projectId);
  if (!confirm(`Видалити "${project?.title || "проєкт"}"?`)) return;

  const { error } = await state.supabase.from("projects").delete().eq("id", projectId);
  if (error) return showToast(error.message);
  if (state.selectedProjectId === projectId) {
    state.selectedProjectId = null;
    elements.detailDialog.close();
  }
  await loadAllData();
  showToast("Проєкт видалено.");
}

function openProjectDetail(projectId) {
  state.selectedProjectId = projectId;
  renderDetail();
  elements.detailDialog.showModal();
}

function renderDetail() {
  if (!state.selectedProjectId || !elements.detailDialog.open) return;
  const project = state.projects.find((item) => item.id === state.selectedProjectId);
  if (!project) return;

  const metrics = getProjectMetrics(project.id);
  elements.detailTitle.textContent = project.title;
  elements.detailStatus.textContent = PROJECT_STATUS_LABELS[project.status] || project.status;
  elements.detailProgressLabel.textContent = `${metrics.progress}%`;
  elements.detailProgressBar.style.width = `${metrics.progress}%`;
  elements.detailTaskCount.textContent = `${metrics.completed} / ${metrics.total} задач`;

  renderTasks(project.id);
  renderRelatedList(elements.databaseList, state.databases.filter((item) => item.project_id === project.id), "database_type", "description", "database");
  renderRelatedList(elements.aiModuleList, state.aiModules.filter((item) => item.project_id === project.id), "module_type", "description", "ai");
  renderRelatedList(elements.techList, state.techStack.filter((item) => item.project_id === project.id), "tech_name", "", "tech");
}

function renderTasks(projectId) {
  const tasks = state.tasks.filter((task) => task.project_id === projectId);
  elements.taskList.innerHTML = tasks.length ? tasks.map((task) => `
    <article class="list-item">
      <div class="item-title-row">
        <label class="checkbox-row">
          <input type="checkbox" data-task-complete="${task.id}" ${task.completed ? "checked" : ""}>
          <strong>${escapeHtml(task.title)}</strong>
        </label>
        <span class="status-pill">${TASK_PRIORITY_LABELS[task.priority] || task.priority}</span>
      </div>
      <p class="muted">${escapeHtml(task.description || TASK_STATUS_LABELS[task.status] || "Опису немає.")}</p>
      <div class="item-actions">
        <button class="ghost-button" type="button" data-task-edit="${task.id}">Редагувати</button>
        <button class="danger-button" type="button" data-task-delete="${task.id}">Видалити</button>
      </div>
    </article>
  `).join("") : `<div class="empty-state">Задач ще немає.</div>`;

  elements.taskList.querySelectorAll("[data-task-complete]").forEach((input) => {
    input.addEventListener("change", toggleTaskComplete);
  });
  elements.taskList.querySelectorAll("[data-task-edit]").forEach((button) => {
    button.addEventListener("click", editTask);
  });
  elements.taskList.querySelectorAll("[data-task-delete]").forEach((button) => {
    button.addEventListener("click", deleteTask);
  });
}

function renderRelatedList(container, items, titleKey, descriptionKey, type) {
  container.innerHTML = items.length ? items.map((item) => `
    <article class="list-item">
      <strong>${escapeHtml(item[titleKey])}</strong>
      ${descriptionKey ? `<p class="muted">${escapeHtml(item[descriptionKey] || "")}</p>` : ""}
      <button class="danger-button" type="button" data-related-delete="${item.id}" data-related-type="${type}">Видалити</button>
    </article>
  `).join("") : `<div class="empty-state">Поки нічого не додано.</div>`;

  container.querySelectorAll("[data-related-delete]").forEach((button) => {
    button.addEventListener("click", deleteRelated);
  });
}

async function saveTask(event) {
  event.preventDefault();
  if (!state.supabase) return showConnectionError();

  const id = elements.taskId.value;
  const status = elements.taskStatus.value;
  const payload = {
    project_id: state.selectedProjectId,
    title: elements.taskTitle.value.trim(),
    description: elements.taskDescription.value.trim(),
    priority: elements.taskPriority.value,
    status,
    completed: status === "done"
  };

  const request = id
    ? state.supabase.from("project_tasks").update(payload).eq("id", id)
    : state.supabase.from("project_tasks").insert(payload);
  const { error } = await request;
  if (error) return showToast(error.message);

  elements.taskForm.reset();
  elements.taskId.value = "";
  await loadAllData();
  showToast("Задачу збережено.");
}

function editTask(event) {
  const task = state.tasks.find((item) => item.id === event.currentTarget.dataset.taskEdit);
  if (!task) return;
  elements.taskId.value = task.id;
  elements.taskTitle.value = task.title;
  elements.taskDescription.value = task.description || "";
  elements.taskPriority.value = task.priority;
  elements.taskStatus.value = task.status || (task.completed ? "done" : "todo");
  elements.taskTitle.focus();
}

async function toggleTaskComplete(event) {
  const id = event.currentTarget.dataset.taskComplete;
  const completed = event.currentTarget.checked;
  const { error } = await state.supabase
    .from("project_tasks")
    .update({ completed, status: completed ? "done" : "todo" })
    .eq("id", id);
  if (error) return showToast(error.message);
  await loadAllData();
}

async function deleteTask(event) {
  const id = event.currentTarget.dataset.taskDelete;
  const { error } = await state.supabase.from("project_tasks").delete().eq("id", id);
  if (error) return showToast(error.message);
  await loadAllData();
  showToast("Задачу видалено.");
}

async function addDatabase(event) {
  event.preventDefault();
  await insertRelated("project_databases", {
    project_id: state.selectedProjectId,
    database_type: elements.databaseType.value,
    description: DATABASE_TYPES[elements.databaseType.value]
  });
}

async function addAiModule(event) {
  event.preventDefault();
  await insertRelated("project_ai_modules", {
    project_id: state.selectedProjectId,
    module_type: elements.aiModuleType.value,
    description: AI_MODULES[elements.aiModuleType.value]
  });
}

async function addTech(event) {
  event.preventDefault();
  await insertRelated("project_tech_stack", {
    project_id: state.selectedProjectId,
    tech_name: elements.techName.value
  });
}

async function insertRelated(table, payload) {
  if (!state.supabase) return showConnectionError();
  const { error } = await state.supabase.from(table).insert(payload);
  if (error) return showToast(error.message);
  await loadAllData();
  showToast("Елемент додано.");
}

async function deleteRelated(event) {
  const { relatedDelete: id, relatedType } = event.currentTarget.dataset;
  const tables = {
    database: "project_databases",
    ai: "project_ai_modules",
    tech: "project_tech_stack"
  };
  const { error } = await state.supabase.from(tables[relatedType]).delete().eq("id", id);
  if (error) return showToast(error.message);
  await loadAllData();
  showToast("Елемент видалено.");
}

function clearFilters() {
  Object.keys(state.filters).forEach((key) => {
    state.filters[key] = "";
  });
  elements.filterStatus.value = "";
  elements.filterProgress.value = "";
  elements.filterTech.value = "";
  elements.filterDatabase.value = "";
  elements.filterAiModule.value = "";
  render();
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("visible");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => {
    elements.toast.classList.remove("visible");
  }, 3600);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
