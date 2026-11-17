const API = "https://stoplight.io/mocks/kode-frontend-team/koder-stoplight/86566464/users?__example=all";
const app = document.getElementById("app");
const searchInput = document.getElementById("search");

let users = []; // человеки
let loading = true; // идёт ли загрузка
let error = false; // есть ли ошибка
let query = ""; // ввод поиска

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

// Фильтр по поиску
function filtered() {
  const q = query.toLowerCase().trim();
  if (!q) return users;
  return users.filter(u =>
    (u.firstName + " " + u.lastName).toLowerCase().includes(q) ||
    u.userTag.toLowerCase().includes(q)
  );
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

// Реакция на клик по карточке, кнопка Назад
window.onhashchange = render;

loadUsers();
