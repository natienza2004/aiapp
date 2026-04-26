import { requireAuth, getStoredUser } from './auth.js';

const user = requireAuth({ redirectTo: 'login.html' });
if (!user) throw new Error('Not authenticated');

const PALETTE = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#06b6d4','#ef4444','#84cc16'];

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getDaysUntil(date) {
  const today = new Date();
  const target = new Date(date);
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  return diff;
}

async function fetchDashboardData() {
  const [summary, recentItems, categoryDist, lowStock, reminders, valueByCategory] = await Promise.all([
    fetch('/dashboard/summary').then(r => r.json()),
    fetch('/dashboard/recent-items?limit=10').then(r => r.json()),
    fetch('/dashboard/category-distribution').then(r => r.json()),
    fetch('/dashboard/low-stock').then(r => r.json()),
    fetch('/dashboard/upcoming-reminders?days=7').then(r => r.json()),
    fetch('/dashboard/value-by-category').then(r => r.json()),
  ]);

  return { summary, recentItems, categoryDist, lowStock, reminders, valueByCategory };
}

function renderSummary(summary) {
  document.getElementById('stat-total-items').textContent = summary.totalItems;
  document.getElementById('stat-total-value').textContent = formatCurrency(summary.totalValue);
  document.getElementById('stat-categories').textContent = summary.totalCategories;
  document.getElementById('stat-locations').textContent = summary.totalLocations;
  
  const changeEl = document.getElementById('stat-items-change');
  if (summary.itemsThisMonth > 0) {
    changeEl.textContent = `+${summary.itemsThisMonth} this month`;
    changeEl.style.color = '#10b981';
  } else {
    changeEl.textContent = 'No change';
    changeEl.style.color = '#6b7280';
  }
}

function renderCategoryChart(data) {
  const ctx = document.getElementById('chart-category-dist');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(d => d.category),
      datasets: [{
        data: data.map(d => d.count),
        backgroundColor: PALETTE,
      }],
    },
    options: {
      plugins: { legend: { position: 'bottom' } },
      responsive: true,
      maintainAspectRatio: true,
    },
  });
}

function renderValueChart(data) {
  const ctx = document.getElementById('chart-value-category');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.category),
      datasets: [{
        label: 'Total Value',
        data: data.map(d => d.value),
        backgroundColor: PALETTE[0],
      }],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } },
      responsive: true,
      maintainAspectRatio: true,
    },
  });
}

function renderLowStock(items) {
  const container = document.getElementById('low-stock-list');
  document.getElementById('low-stock-count').textContent = items.length;
  
  if (items.length === 0) {
    container.innerHTML = '<div class="empty-state">✅ All items are well stocked</div>';
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="alert-item">
      <div class="alert-icon">⚠️</div>
      <div class="alert-content">
        <div class="alert-title">${item.name}</div>
        <div class="alert-desc">Only ${item.quantity} left in stock</div>
      </div>
      <div class="alert-badge danger">Low Stock</div>
    </div>
  `).join('');
}

function renderReminders(reminders) {
  const container = document.getElementById('reminders-list');
  document.getElementById('reminders-count').textContent = reminders.length;
  
  if (reminders.length === 0) {
    container.innerHTML = '<div class="empty-state">📅 No upcoming reminders</div>';
    return;
  }

  container.innerHTML = reminders.map(reminder => {
    const days = getDaysUntil(reminder.expiryDate);
    const urgency = days <= 3 ? 'danger' : days <= 7 ? 'warning' : 'info';
    return `
      <div class="reminder-item">
        <div class="reminder-icon">🔔</div>
        <div class="reminder-content">
          <div class="reminder-title">${reminder.title}</div>
          <div class="reminder-desc">${reminder.item?.name || 'Unknown Item'}</div>
        </div>
        <div class="reminder-badge ${urgency}">${days} days</div>
      </div>
    `;
  }).join('');
}

function renderRecentItems(items) {
  const tbody = document.getElementById('recent-items-body');
  
  if (items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="loading">No items found</td></tr>';
    return;
  }

  tbody.innerHTML = items.map(item => `
    <tr>
      <td>
        ${item.imageUrl 
          ? `<img class="thumb" src="${item.imageUrl}" alt="${item.name}" />` 
          : '<div class="no-img">🖼️</div>'}
      </td>
      <td><strong>${item.name}</strong></td>
      <td><span class="cat-badge">${item.category?.name || 'N/A'}</span></td>
      <td>${item.location?.name || 'N/A'}</td>
      <td><span class="qty-badge">${item.quantity}</span></td>
      <td>${formatCurrency(item.value * item.quantity)}</td>
      <td>${formatDate(item.createdAt)}</td>
    </tr>
  `).join('');
}

async function init() {
  try {
    const data = await fetchDashboardData();
    
    renderSummary(data.summary);
    renderCategoryChart(data.categoryDist);
    renderValueChart(data.valueByCategory);
    renderLowStock(data.lowStock);
    renderReminders(data.reminders);
    renderRecentItems(data.recentItems);
  } catch (err) {
    console.error('Dashboard error:', err);
    alert('Failed to load dashboard data');
  }
}

init();
