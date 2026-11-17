const API = "https://stoplight.io/mocks/kode-frontend-team/koder-stoplight/86566464/users?__example=all";
const app = document.getElementById("app");
const searchInput = document.getElementById("search");
const sortBtn = document.getElementById("sortBtn");
const tabsEl = document.getElementById("tabs");

let users = []; // человеки
let loading = true; // идёт ли загрузка
let error = false; // есть ли ошибка
let query = ""; // ввод поиска
let activeDept = "all"; // активная вкладка
let sortMode = "alpha"; // режим сортировки: alpha — по алфавиту, birthday — по др

// Список департаментов: значение из API -> подпись на вкладке
const DEPARTMENTS = [
  { key: "all", label: "Все" },
  { key: "android", label: "Android" },
  { key: "ios", label: "iOS" },
  { key: "design", label: "Дизайн" },
  { key: "management", label: "Менеджмент" },
  { key: "qa", label: "QA" },
  { key: "back_office", label: "Бэк-офис" },
  { key: "frontend", label: "Frontend" },
  { key: "hr", label: "HR" },
  { key: "pr", label: "PR" },
  { key: "backend", label: "Backend" },
  { key: "support", label: "Техподдержка" },
  { key: "analytics", label: "Аналитика" },
];

/* Загрузка людей */
async function loadUsers() {
  try {
    const res = await fetch(API);
    const data = await res.json();
    users = data.items;
    loading = false;
    render();
  } catch (e) {
    loading = false;
    error = true;
    render();
  }
}

// Фильтр по поиску и вкладке
function filtered() {
  const q = query.toLowerCase().trim();
  let list = users;

  // фильтр по департаменту (вкладка)
  if (activeDept !== "all") {
    list = list.filter(u => u.department === activeDept);
  }

  // фильтр по поиску
  if (q) {
    list = list.filter(u =>
      (u.firstName + " " + u.lastName).toLowerCase().includes(q) ||
      u.userTag.toLowerCase().includes(q)
    );
  }

  // сортировка
  if (sortMode === "alpha") {
    list = [...list].sort((a, b) => a.firstName.localeCompare(b.firstName));
  } else if (sortMode === "birthday") {
    // сортировка по дню рождения (ближайший сверху)
    list = [...list].sort((a, b) => {
      const today = new Date();
      const da = new Date(a.birthday);
      const db = new Date(b.birthday);
      da.setFullYear(today.getFullYear());
      db.setFullYear(today.getFullYear());
      if (da < today) da.setFullYear(today.getFullYear() + 1);
      if (db < today) db.setFullYear(today.getFullYear() + 1);
      return da - db;
    });
  }

  return list;
}

// Рисуем вкладки
function renderTabs() {
  tabsEl.innerHTML = DEPARTMENTS.map(d => `
    <button class="tab ${d.key === activeDept ? "active" : ""}" data-key="${d.key}">${d.label}</button>
  `).join("");

  tabsEl.querySelectorAll(".tab").forEach(el => {
    el.onclick = () => {
      activeDept = el.dataset.key;
      render();
    };
  });
}

/* Функция отрисовки */
function render() {
  const topbar = document.querySelector(".topbar");
  topbar.style.display = "block"; // по умолчанию шапка видна

  // карточка человека без поиска
  if (location.hash.startsWith("#user/")) {
    topbar.style.display = "none";
    const id = location.hash.replace("#user/", "");
    const user = users.find(u => String(u.id) === id);
    if (user) return renderDetails(user);
  }

  // Экран загрузки
  if (loading) { app.innerHTML = '<div class="state">Загрузка…</div>'; return; }

  // Экран ошибки
  if (error) { app.innerHTML = '<div class="state">Ошибка загрузки. Обнови страницу.</div>'; return; }

  // Рисуем вкладки
  renderTabs();

  // Список людей
  const list = filtered();

  // Ничего не найдено
  if (list.length === 0) {
    app.innerHTML = '<div class="state">Ничего не найдено</div>';
    return;
  }

  // Карточки красиво
  app.innerHTML = list.map(u => `
    <div class="card" data-id="${u.id}">
      <img src="${u.avatarUrl}" alt="">
      <div>
        <div class="name">${u.firstName} ${u.lastName}</div>
        <div class="sub">${u.userTag} · ${u.department}</div>
      </div>
    </div>
  `).join("");

  // Выбор карточки -> детали
  document.querySelectorAll(".card").forEach(el => {
    el.onclick = () => { location.hash = "#user/" + el.dataset.id; };
  });
}

// Детали человека
function renderDetails(u) {
  app.innerHTML = `
    <div class="details">
      <button onclick="history.back()">← Назад</button>
      <div><img src="${u.avatarUrl}" alt=""></div>
      <h2>${u.firstName} ${u.lastName}</h2>
      <div class="sub">${u.userTag} · ${u.department}</div>
      <p>Дата рождения: ${u.birthday || "—"}</p>
      <p>Телефон: <a href="tel:${u.phone}">${u.phone}</a></p>
    </div>`;
}

// Реакция на ввод в поиск 
searchInput.oninput = (e) => {
  query = e.target.value;
  if (!location.hash.startsWith("#user/")) render();
};

// Кнопка сортировки: переключает режим
sortBtn.onclick = () => {
  sortMode = sortMode === "alpha" ? "birthday" : "alpha";
  sortBtn.textContent = sortMode === "alpha" ? "А→Я" : "ДР";
  if (!location.hash.startsWith("#user/")) render();
};

// Реакция на клик по карточке, кнопка Назад
window.onhashchange = () => {
  // при возврате на главную восстанавливаем поиск
  if (!location.hash.startsWith("#user/")) {
    searchInput.value = query;
  }
  render();
};

loadUsers();
