const API_URL = "https://dummyjson.com/todos";

let todos = [];
let currentPage = 1;
let itemsPerPage = 10;

document.addEventListener("DOMContentLoaded", () => {
  fetchTodos();
  document.getElementById("addTodoForm").addEventListener("submit", addTodo);
  document.getElementById("searchInput").addEventListener("input", renderTodos);
});

async function fetchTodos() {
  try {
    toggleLoading(true);
    const res = await fetch(`${API_URL}`);
    const data = await res.json();
    todos = data.todos;
    renderTodos();
  } catch (err) {
    showError("Failed to fetch todos.");
  } finally {
    toggleLoading(false);
  }
}

function renderTodos() {
  const list = document.getElementById("todoList");
  list.innerHTML = "";

  // Filtered
  let filtered = [...todos];
  const search = document.getElementById("searchInput").value.toLowerCase();
  if (search) {
    filtered = filtered.filter((todo) =>
      todo.todo.toLowerCase().includes(search)
    );
  }

  // Date filter (you can simulate by checking IDs as createdDate not in dummy API)
  const from = new Date(document.getElementById("fromDate").value);
  const to = new Date(document.getElementById("toDate").value);
  if (!isNaN(from) && !isNaN(to)) {
    filtered = filtered.filter((todo) => {
      const fakeDate = new Date(2023, 0, todo.id); // simulate date using ID
      return fakeDate >= from && fakeDate <= to;
    });
  }

  // Pagination
  const start = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(start, start + itemsPerPage);

  for (const todo of paginated) {
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.textContent = todo.todo;
    list.appendChild(li);
  }

  renderPagination(filtered.length);
}

function renderPagination(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.className = `page-item ${i === currentPage ? "active" : ""}`;
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.addEventListener("click", (e) => {
      e.preventDefault();
      currentPage = i;
      renderTodos();
    });
    pagination.appendChild(li);
  }
}

async function addTodo(e) {
  e.preventDefault();
  const input = document.getElementById("newTodoText");
  const text = input.value.trim();
  if (!text) return;

  try {
    toggleLoading(true);
    const res = await fetch(API_URL + "/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        todo: text,
        completed: false,
        userId: 1,
      }),
    });
    const newTodo = await res.json();
    todos.unshift(newTodo); // Add to beginning
    input.value = "";
    currentPage = 1;
    renderTodos();
  } catch (err) {
    showError("Failed to add todo.");
  } finally {
    toggleLoading(false);
  }
}

function toggleLoading(show) {
  document.getElementById("loading").classList.toggle("d-none", !show);
}

function showError(msg) {
  const error = document.getElementById("error");
  error.textContent = msg;
  error.classList.remove("d-none");
  setTimeout(() => error.classList.add("d-none"), 3000);
}
