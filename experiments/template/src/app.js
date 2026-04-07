const contacts = [];
let sortKey = null;
let sortDir = "asc";

const form = document.getElementById("contact-form");
const tbody = document.getElementById("contacts-body");
const dialog = document.getElementById("delete-confirm");
const deleteNameEl = document.getElementById("delete-name");
let pendingDeleteIndex = null;

function renderTable() {
  if (contacts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="empty-message">No contacts yet. Add one using the form.</td></tr>`;
    return;
  }

  let sorted = [...contacts];
  if (sortKey) {
    sorted.sort((a, b) => {
      const cmp = (a[sortKey] || "").localeCompare(b[sortKey] || "");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }

  tbody.innerHTML = sorted
    .map(
      (c, i) => `
    <tr>
      <td>${c.name}</td>
      <td>${c.email}</td>
      <td>${c.role}</td>
      <td><button class="delete-btn" data-index="${i}">Delete</button></td>
    </tr>`
    )
    .join("");
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(form);
  contacts.push({
    name: data.get("name"),
    email: data.get("email"),
    role: data.get("role"),
  });
  form.reset();
  renderTable();
});

tbody.addEventListener("click", (e) => {
  const btn = e.target.closest(".delete-btn");
  if (!btn) return;
  pendingDeleteIndex = parseInt(btn.dataset.index, 10);
  deleteNameEl.textContent = contacts[pendingDeleteIndex]?.name || "";
  dialog.showModal();
});

document.getElementById("confirm-delete").addEventListener("click", () => {
  if (pendingDeleteIndex !== null) {
    contacts.splice(pendingDeleteIndex, 1);
    pendingDeleteIndex = null;
    dialog.close();
    renderTable();
  }
});

document.getElementById("cancel-delete").addEventListener("click", () => {
  dialog.close();
});

fetch("/api/contacts")
  .then((res) => res.json())
  .then((data) => {
    contacts.push(...data);
    renderTable();
  })
  .catch((err) => console.error("Failed to load contacts:", err));
