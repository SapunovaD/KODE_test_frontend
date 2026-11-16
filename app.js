const API = "https://stoplight.io/mocks/kode-frontend-team/koder-stoplight/86566464/users?__example=all";
const app = document.getElementById("app");

let users = []; // человеки
let loading = true; // идёт ли загрузка
let error = false; // есть ли ошибка

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

/* Функция отрисовки */
function render() {
  if (loading) { app.innerHTML = '<div class="state">Загрузка…</div>'; return; }
  if (error) { app.innerHTML = '<div class="state">Ошибка загрузки. Обнови страницу.</div>'; return; }

  //карточка человека
  app.innerHTML = users.map(u => `
    <div class="card" data-id="${u.id}">
      <img src="${u.avatarUrl}" alt="">
      <div>
        <div class="name">${u.firstName} ${u.lastName}</div>
        <div class="sub">${u.userTag} · ${u.department}</div>
      </div>
    </div>
  `).join("");
}

loadUsers();
