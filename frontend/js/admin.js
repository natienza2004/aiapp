import { deleteItem, getItems, getUsers } from './api.js';
import { getStoredUser, requireAuth } from './auth.js';

function formatDate(iso) {
  if (!iso) return 'N/A';
  const date = new Date(iso);
  return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
}

const PALETTE = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6'];

let allItems = [];
let allUsers = [];
let currentPage = 1;
const itemsPerPage = 10;
const DEFAULT_SORT = { sortBy: 'updatedAt', sortOrder: 'desc' };
const sortState = { ...DEFAULT_SORT };

function getSortParams() {
  return { sortBy: sortState.sortBy, sortOrder: sortState.sortOrder };
}

function getVisibleInventoryItems() {
  const searchInput = document.getElementById('search-inventory');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  if (!query) return allItems;

  return allItems.filter(item =>
    item.name.toLowerCase().includes(query) ||
    (item.category?.name || '').toLowerCase().includes(query) ||
    (item.reporter?.name || '').toLowerCase().includes(query)
  );
}

function renderInventoryView({ keepPage = true } = {}) {
  const visibleItems = getVisibleInventoryItems();
  const totalPages = Math.max(1, Math.ceil(visibleItems.length / itemsPerPage));
  if (!keepPage || currentPage > totalPages) currentPage = 1;
  renderInventoryTable(visibleItems, currentPage);
  renderPagination(visibleItems);
}

function updateSortHeaders() {
  document.querySelectorAll('[data-sort-key]').forEach((header) => {
    const icon = header.querySelector('.sort-icon');
    const isActive = header.dataset.sortKey === sortState.sortBy;
    header.classList.toggle('active-sort', isActive);
    if (icon) icon.textContent = isActive ? (sortState.sortOrder === 'asc' ? '\u2191' : '\u2193') : '';
  });
}

function setupInventorySorting() {
  document.querySelectorAll('[data-sort-key]').forEach((header) => {
    header.addEventListener('click', async () => {
      const sortBy = header.dataset.sortKey;
      if (!sortBy) return;

      if (sortState.sortBy !== sortBy) {
        sortState.sortBy = sortBy;
        sortState.sortOrder = 'asc';
      } else if (sortState.sortOrder === 'asc') {
        sortState.sortOrder = 'desc';
      } else {
        sortState.sortBy = DEFAULT_SORT.sortBy;
        sortState.sortOrder = DEFAULT_SORT.sortOrder;
      }

      updateSortHeaders();
      try {
        allItems = await getItems(getSortParams());
        renderInventoryView({ keepPage: true });
      } catch (err) {
        showNotification('Failed to sort inventory: ' + err.message, 'error');
      }
    });
  });
  updateSortHeaders();
}

function setupTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(`tab-${tabName}`).classList.add('active');
    });
  });
}

function renderCharts(items, users) {
  document.getElementById('stat-total-items').textContent = items.length;
  document.getElementById('stat-total-qty').textContent = items.reduce((s, i) => s + (i.quantity || 0), 0);
  document.getElementById('stat-total-users').textContent = users.length;

  const catCount = {};
  const catQty = {};
  items.forEach(({ category, quantity }) => {
    const catName = category?.name || 'Uncategorized';
    catCount[catName] = (catCount[catName] || 0) + 1;
    catQty[catName] = (catQty[catName] || 0) + (quantity || 0);
  });
  const cats = Object.keys(catCount);
  document.getElementById('stat-categories').textContent = cats.length;

  new Chart(document.getElementById('chart-category'), {
    type: 'bar',
    data: {
      labels: cats,
      datasets: [{ label: 'Items', data: cats.map(c => catCount[c]), backgroundColor: PALETTE }],
    },
    options: { 
      responsive: true,
      plugins: { legend: { display: false } }, 
      scales: { 
        y: { beginAtZero: true, ticks: { stepSize: 1, color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
      } 
    },
  });

  new Chart(document.getElementById('chart-qty'), {
    type: 'doughnut',
    data: {
      labels: cats,
      datasets: [{ data: cats.map(c => catQty[c]), backgroundColor: PALETTE }],
    },
    options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } },
  });

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
      datasets: [{ 
        label: 'Items Added', 
        data: months.map(m => byMonth[m]), 
        borderColor: '#6366f1', 
        backgroundColor: 'rgba(99,102,241,0.1)', 
        fill: true, 
        tension: 0.3 
      }],
    },
    options: { 
      responsive: true,
      plugins: { legend: { display: false } }, 
      scales: { 
        y: { beginAtZero: true, ticks: { stepSize: 1, color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
      } 
    },
  });

  const roleCount = {};
  users.forEach(({ role }) => { roleCount[role] = (roleCount[role] || 0) + 1; });
  const roles = Object.keys(roleCount);
  new Chart(document.getElementById('chart-roles'), {
    type: 'pie',
    data: {
      labels: roles,
      datasets: [{ data: roles.map(r => roleCount[r]), backgroundColor: PALETTE }],
    },
    options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } },
  });

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
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { 
        x: { beginAtZero: true, ticks: { stepSize: 1, color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#94a3b8' }, grid: { display: false } }
      },
    },
  });
}

function createImageCell(item) {
  const url = item.imageUrl;
  if (!url || url === '/uploads/undefined' || url.endsWith('/undefined')) 
    return '<td><div class="no-img">🖼️</div></td>';
  return `<td><img class="thumb" src="${url}" alt="${item.name}" /></td>`;
}

function renderInventoryTable(items, page = 1) {
  const tbody = document.getElementById('inventory-body');
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageItems = items.slice(start, end);
  
  document.getElementById('inv-count').textContent = items.length;
  
  if (pageItems.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="loading">No items found.</td></tr>';
    return;
  }
  
  tbody.innerHTML = pageItems.map((item, index) => {
    const catName = item.category?.name || 'N/A';
    return `
      <tr>
        <td>${start + index + 1}</td>
        ${createImageCell(item)}
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${catName}</td>
        <td>
          <div style="font-weight:600;font-size:0.82rem;">${item.reporter?.name || 'Unknown'}</div>
          ${item.reporter?.email ? `<div style="font-size:0.72rem;color:var(--text3);">${item.reporter.email}</div>` : ''}
        </td>
        <td>${formatDate(item.createdAt)}</td>
        <td class="actions">
          <a class="button" href="edit-item.html?id=${item.id}">Edit</a>
          <button class="button delete-btn" data-id="${item.id}">Delete</button>
        </td>
      </tr>`;
  }).join('');
  
  tbody.querySelectorAll('.delete-btn').forEach((button) => {
    button.addEventListener('click', async (event) => {
      const id = Number(event.currentTarget.getAttribute('data-id'));
      if (!id) return;
      if (!confirm('Delete this item?')) return;
      try {
        await deleteItem(id);
        allItems = allItems.filter(i => i.id !== id);
        renderInventoryView({ keepPage: true });
      } catch (err) {
        alert(err.message);
      }
    });
  });
  
  tbody.querySelectorAll('.thumb').forEach((img) => {
    img.addEventListener('click', () => {
      const modal = document.getElementById('image-modal');
      const modalImg = document.getElementById('modal-image');
      modal.style.display = 'block';
      modalImg.src = img.src;
      modalImg.alt = img.alt;
    });
  });
}

function renderPagination(items) {
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const pagination = document.getElementById('inventory-pagination');
  
  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }
  
  let html = '<button id="prev-page">← Prev</button>';
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }
  html += '<button id="next-page">Next →</button>';
  
  pagination.innerHTML = html;
  
  document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderInventoryTable(items, currentPage);
      renderPagination(items);
    }
  });
  
  document.getElementById('next-page').addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderInventoryTable(items, currentPage);
      renderPagination(items);
    }
  });
  
  document.querySelectorAll('.page-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = parseInt(btn.dataset.page);
      renderInventoryTable(items, currentPage);
      renderPagination(items);
    });
  });
  
  document.getElementById('prev-page').disabled = currentPage === 1;
  document.getElementById('next-page').disabled = currentPage === totalPages;
}

function setupSearch() {
  const searchInput = document.getElementById('search-inventory');
  if (!searchInput) return;
  
  searchInput.addEventListener('input', (e) => {
    currentPage = 1;
    renderInventoryView({ keepPage: false });
  });
}

async function deleteUser(userId) {
  const response = await fetch(`/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'x-user-id': localStorage.getItem('userId'),
      'x-user-role': localStorage.getItem('role'),
    },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to delete user');
  }
}

function renderUsersTable(users) {
  const tbody = document.getElementById('users-body');
  const currentUserId = parseInt(localStorage.getItem('userId'));
  
  document.getElementById('users-count').textContent = users.length;
  
  tbody.innerHTML = users.map((user, index) => {
    const canDelete = user.id !== currentUserId;
    const statusBadge = user.isActive !== false 
      ? '<span class="alert-badge info">Active</span>' 
      : '<span class="alert-badge">Inactive</span>';
    
    return `
      <tr>
        <td>${index + 1}</td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td><span class="role-badge ${user.role.toLowerCase()}">${user.role}</span></td>
        <td>${formatDate(user.createdAt)}</td>
        <td>${statusBadge}</td>
        <td class="actions">
          ${canDelete ? `<button class="button danger delete-user-btn" data-id="${user.id}">Delete</button>` : '<span style="color:var(--text3);font-size:0.75rem;">Cannot delete</span>'}
        </td>
      </tr>`;
  }).join('');
  
  tbody.querySelectorAll('.delete-user-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const userId = parseInt(btn.dataset.id);
      showDeleteUserModal(userId);
    });
  });
}

function showDeleteUserModal(userId) {
  const modal = document.getElementById('delete-user-modal');
  modal.style.display = 'flex';
  
  const confirmBtn = document.getElementById('confirm-delete');
  const cancelBtn = document.getElementById('cancel-delete');
  
  const handleConfirm = async () => {
    try {
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Deleting...';
      
      await deleteUser(userId);
      
      allUsers = allUsers.filter(u => u.id !== userId);
      renderUsersTable(allUsers);
      modal.style.display = 'none';
      
      // Show success notification
      showNotification('User deleted successfully', 'success');
    } catch (err) {
      showNotification('Failed to delete user: ' + err.message, 'error');
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Delete User';
    }
    cleanup();
  };
  
  const handleCancel = () => {
    modal.style.display = 'none';
    cleanup();
  };
  
  const cleanup = () => {
    confirmBtn.removeEventListener('click', handleConfirm);
    cancelBtn.removeEventListener('click', handleCancel);
    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Delete User';
  };
  
  confirmBtn.addEventListener('click', handleConfirm);
  cancelBtn.addEventListener('click', handleCancel);
}

function showNotification(message, type = 'info') {
  // Remove existing notification if any
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Trigger animation
  setTimeout(() => notification.classList.add('show'), 10);
  
  // Auto remove after 4 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

async function initAdmin() {
  const user = requireAuth({ allow: ['ADMIN'], redirectTo: 'login.html' });
  if (!user) return;

  setupTabs();
  
  try {
    allItems = await getItems(getSortParams());
    allUsers = await getUsers();
    
    renderInventoryView();
    renderUsersTable(allUsers);
    renderCharts(allItems, allUsers);
    setupInventorySorting();
    setupSearch();
    
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
  } catch (err) {
    console.error('Failed to load admin data:', err);
  }
}

const page = document.body.dataset.page;
if (page === 'admin') {
  initAdmin();
}
