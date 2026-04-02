import { deleteItem, getItems, getUsers } from './api.js';
import { getStoredUser, requireAuth } from './auth.js';

function formatDate(iso) {
  const date = new Date(iso);
  return date.toLocaleString();
}

const PALETTE = ['#1a73e8','#34a853','#fbbc04','#ea4335','#9c27b0','#00bcd4','#ff5722','#607d8b'];

function renderCharts(items, users) {
  // Stats
  document.getElementById('stat-total-items').textContent = items.length;
  document.getElementById('stat-total-qty').textContent = items.reduce((s, i) => s + (i.quantity || 0), 0);
  document.getElementById('stat-total-users').textContent = users.length;

  // Category counts
  const catCount = {};
  const catQty = {};
  items.forEach(({ category, quantity }) => {
    catCount[category] = (catCount[category] || 0) + 1;
    catQty[category] = (catQty[category] || 0) + (quantity || 0);
  });
  const cats = Object.keys(catCount);
  document.getElementById('stat-categories').textContent = cats.length;

  new Chart(document.getElementById('chart-category'), {
    type: 'bar',
    data: {
      labels: cats,
      datasets: [{ label: 'Items', data: cats.map(c => catCount[c]), backgroundColor: PALETTE }],
    },
    options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } },
  });

  new Chart(document.getElementById('chart-qty'), {
    type: 'doughnut',
    data: {
      labels: cats,
      datasets: [{ data: cats.map(c => catQty[c]), backgroundColor: PALETTE }],
    },
    options: { plugins: { legend: { position: 'bottom' } } },
  });

  // Timeline — group by YYYY-MM
  const byMonth = {};
  items.forEach(({ createdAt }) => {
    const key = createdAt ? createdAt.slice(0, 7) : 'Unknown';
    byMonth[key] = (byMonth[key] || 0) + 1;
  });
  const months = Object.keys(byMonth).sort();
  new Chart(document.getElementById('chart-timeline'), {
    type: 'line',
    data: {
      labels: months,
      datasets: [{ label: 'Items Added', data: months.map(m => byMonth[m]), borderColor: '#1a73e8', backgroundColor: 'rgba(26,115,232,0.1)', fill: true, tension: 0.3 }],
    },
    options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } },
  });

  // User roles
  const roleCount = {};
  users.forEach(({ role }) => { roleCount[role] = (roleCount[role] || 0) + 1; });
  const roles = Object.keys(roleCount);
  new Chart(document.getElementById('chart-roles'), {
    type: 'pie',
    data: {
      labels: roles,
      datasets: [{ data: roles.map(r => roleCount[r]), backgroundColor: PALETTE }],
    },
    options: { plugins: { legend: { position: 'bottom' } } },
  });

  // Items per owner
  const ownerCount = {};
  items.forEach(({ reporter, reporterId }) => {
    const label = reporter ? `${reporter.name}` : `User #${reporterId}`;
    ownerCount[label] = (ownerCount[label] || 0) + 1;
  });
  const owners = Object.keys(ownerCount);
  new Chart(document.getElementById('chart-owners'), {
    type: 'bar',
    data: {
      labels: owners,
      datasets: [{ label: 'Items Owned', data: owners.map(o => ownerCount[o]), backgroundColor: PALETTE }],
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false } },
      scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } },
    },
  });
}

function createImageCell(item) {
  if (!item.imageUrl) return '<td></td>';
  return `
    <td>
      <img class="thumb" src="${item.imageUrl}" alt="${item.name}" />
    </td>
  `;
}

async function initAdmin() {
  const user = requireAuth({ allow: ['ADMIN'], redirectTo: 'login.html' });
  if (!user) return;

  let items = [], users = [];

  // Load items
  const itemsTbody = document.getElementById('inventory-body');
  try {
    items = await getItems();
    itemsTbody.innerHTML = items
      .map((item, index) => {
        return `
          <tr>
            <td>${index + 1}</td>
            ${createImageCell(item)}
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${item.category}</td>
            <td>
              <div style="font-weight:600;">${item.reporter?.name || 'Unknown'}</div>
              ${item.reporter?.email ? `<div style="font-size:0.78rem;color:#6b7280;">${item.reporter.email}</div>` : ''}
            </td>
            <td>${formatDate(item.createdAt)}</td>
            <td class="actions">
              <a class="button" href="edit-item.html?id=${item.id}">Edit</a>
              <button class="button delete-btn" data-id="${item.id}">Delete</button>
            </td>
          </tr>`;
      })
      .join('');

    itemsTbody.querySelectorAll('.delete-btn').forEach((button) => {
      button.addEventListener('click', async (event) => {
        const id = Number(event.currentTarget.getAttribute('data-id'));
        if (!id) return;
        if (!confirm('Delete this item?')) return;
        try {
          await deleteItem(id);
          initAdmin();
        } catch (err) {
          alert(err.message);
        }
      });
    });

    // Image zoom
    itemsTbody.querySelectorAll('.thumb').forEach((img) => {
      img.addEventListener('click', () => {
        const modal = document.getElementById('image-modal');
        const modalImg = document.getElementById('modal-image');
        modal.style.display = 'block';
        modalImg.src = img.src;
        modalImg.alt = img.alt;
      });
    });
  } catch (err) {
    itemsTbody.innerHTML = `<tr><td colspan="8" class="loading">${err.message}</td></tr>`;
  }

  // Load users
  const usersTbody = document.getElementById('users-body');
  try {
    users = await getUsers();
    usersTbody.innerHTML = users
      .map((user, index) => {
        return `
          <tr>
            <td>${index + 1}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>${formatDate(user.createdAt)}</td>
          </tr>`;
      })
      .join('');
  } catch (err) {
    usersTbody.innerHTML = `<tr><td colspan="5" class="loading">${err.message}</td></tr>`;
  }

  renderCharts(items, users);

  // Modal close
  const modal = document.getElementById('image-modal');
  const closeBtn = modal.querySelector('.close');
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
}

const page = document.body.dataset.page;
if (page === 'admin') {
  initAdmin();
}