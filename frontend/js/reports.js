import { requireAuth } from './auth.js';

const API_BASE = '/reports';

function getAuthHeaders() {
  const headers = {};
  const userId = localStorage.getItem('userId');
  const role = localStorage.getItem('role');
  if (userId) headers['x-user-id'] = userId;
  if (role) headers['x-user-role'] = role;
  return headers;
}

async function fetchReport(endpoint) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch report');
  return response.json();
}

function formatCurrency(value) {
  return '₱' + parseFloat(value || 0).toFixed(2);
}

function formatDate(iso) {
  return new Date(iso).toLocaleString();
}

function getStatusBadge(status) {
  const badges = {
    'In Stock': '<span class="alert-badge info">In Stock</span>',
    'Low Stock': '<span class="alert-badge warning">Low Stock</span>',
    'Out of Stock': '<span class="alert-badge danger">Out of Stock</span>',
  };
  return badges[status] || status;
}

function getRecommendedAction(status) {
  const actions = {
    'In Stock': 'No action needed',
    'Low Stock': 'Restock soon',
    'Out of Stock': 'Restock immediately',
  };
  return actions[status] || 'N/A';
}

async function loadSummary() {
  try {
    const data = await fetchReport('/summary');
    
    document.getElementById('total-items').textContent = data.totalItems || 0;
    document.getElementById('total-quantity').textContent = data.totalQuantity || 0;
    document.getElementById('total-value').textContent = formatCurrency(data.totalValue);
    document.getElementById('total-categories').textContent = data.totalCategories || 0;
    document.getElementById('total-locations').textContent = data.totalLocations || 0;
    document.getElementById('low-stock-count').textContent = data.lowStockCount || 0;
    document.getElementById('out-of-stock-count').textContent = data.outOfStockCount || 0;
    document.getElementById('uncategorized-count').textContent = data.uncategorizedCount || 0;

    document.getElementById('value-total').textContent = formatCurrency(data.totalValue);
    document.getElementById('value-highest').textContent = data.highestValueItem 
      ? `${data.highestValueItem.name} (${formatCurrency(data.highestValueItem.value)})`
      : 'N/A';
    document.getElementById('value-lowest').textContent = data.lowestValueItem 
      ? `${data.lowestValueItem.name} (${formatCurrency(data.lowestValueItem.value)})`
      : 'N/A';
    document.getElementById('value-average').textContent = formatCurrency(data.averageValue);
  } catch (err) {
    console.error('Failed to load summary:', err);
  }
}

async function loadCategoryReport() {
  try {
    const data = await fetchReport('/category');
    const tbody = document.getElementById('category-report-body');
    
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="loading">No categories found.</td></tr>';
      return;
    }
    
    tbody.innerHTML = data.map(item => `
      <tr>
        <td>${item.categoryName || 'Uncategorized'}</td>
        <td>${item.itemCount}</td>
        <td>${item.totalQuantity}</td>
        <td>${formatCurrency(item.totalValue)}</td>
      </tr>
    `).join('');

    renderCategoryChart(data);
  } catch (err) {
    console.error('Failed to load category report:', err);
  }
}

async function loadLocationReport() {
  try {
    const data = await fetchReport('/location');
    const tbody = document.getElementById('location-report-body');
    
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="loading">No locations found.</td></tr>';
      return;
    }
    
    tbody.innerHTML = data.map(item => `
      <tr>
        <td>${item.locationName || 'Unassigned'}</td>
        <td>${item.itemCount}</td>
        <td>${item.totalQuantity}</td>
        <td>${formatCurrency(item.totalValue)}</td>
      </tr>
    `).join('');

    renderLocationChart(data);
  } catch (err) {
    console.error('Failed to load location report:', err);
  }
}

async function loadStockReport() {
  try {
    const data = await fetchReport('/stock');
    const tbody = document.getElementById('stock-report-body');
    
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="loading">No items found.</td></tr>';
      return;
    }
    
    let allStockData = data;
    
    function renderStockTable(filteredData) {
      if (filteredData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">No items match this filter.</td></tr>';
        return;
      }
      
      tbody.innerHTML = filteredData.map(item => `
        <tr>
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>${item.lowStockThreshold || 5}</td>
          <td>${getStatusBadge(item.status)}</td>
          <td>${getRecommendedAction(item.status)}</td>
        </tr>
      `).join('');
    }
    
    renderStockTable(allStockData);
    
    // Setup filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.dataset.filter;
        let filtered = allStockData;
        
        if (filter === 'in-stock') {
          filtered = allStockData.filter(i => i.status === 'In Stock');
        } else if (filter === 'low-stock') {
          filtered = allStockData.filter(i => i.status === 'Low Stock');
        } else if (filter === 'out-of-stock') {
          filtered = allStockData.filter(i => i.status === 'Out of Stock');
        }
        
        renderStockTable(filtered);
      });
    });
  } catch (err) {
    console.error('Failed to load stock report:', err);
  }
}

async function loadRecentActivity() {
  try {
    const data = await fetchReport('/recent-activity');
    const tbody = document.getElementById('activity-report-body');
    
    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="loading">No recent activity.</td></tr>';
      return;
    }
    
    tbody.innerHTML = data.map(item => `
      <tr>
        <td>${item.name}</td>
        <td>${item.action}</td>
        <td>${formatDate(item.timestamp)}</td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Failed to load recent activity:', err);
  }
}

function renderCategoryChart(data) {
  const ctx = document.getElementById('category-chart');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(d => d.categoryName || 'Uncategorized'),
      datasets: [{
        data: data.map(d => d.itemCount),
        backgroundColor: [
          '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', 
          '#10b981', '#3b82f6', '#ef4444', '#14b8a6'
        ],
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 11 } } }
      }
    }
  });
}

function renderLocationChart(data) {
  const ctx = document.getElementById('location-chart');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.locationName || 'Unassigned'),
      datasets: [{
        label: 'Items',
        data: data.map(d => d.itemCount),
        backgroundColor: '#6366f1',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { 
          beginAtZero: true,
          ticks: { color: '#94a3b8' },
          grid: { color: 'rgba(255,255,255,0.05)' }
        },
        x: { 
          ticks: { color: '#94a3b8' },
          grid: { display: false }
        }
      }
    }
  });
}

async function exportCSV() {
  try {
    const response = await fetch(`${API_BASE}/export?format=csv`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) throw new Error('Export failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-report-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert('Failed to export report: ' + err.message);
  }
}

async function init() {
  const user = requireAuth({ allow: ['STUDENT', 'ADMIN'], redirectTo: 'login.html' });
  if (!user) return;

  await Promise.all([
    loadSummary(),
    loadInsights(),
    loadCategoryReport(),
    loadLocationReport(),
    loadStockReport(),
    loadDataQuality(),
    loadRecentActivity(),
  ]);

  document.getElementById('export-csv')?.addEventListener('click', exportCSV);
}

async function loadInsights() {
  try {
    const data = await fetchReport('/insights');
    const container = document.getElementById('insights-container');
    
    if (data.length === 0) {
      container.innerHTML = '<div class="empty-state">No insights available at this time.</div>';
      return;
    }
    
    container.innerHTML = data.map(insight => `
      <div class="insight-card ${insight.type}">
        <div class="insight-icon">${insight.icon}</div>
        <div class="insight-message">${insight.message}</div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to load insights:', err);
  }
}

async function loadDataQuality() {
  try {
    const data = await fetchReport('/data-quality');
    
    renderQualityList('quality-no-category', data.itemsWithoutCategory);
    renderQualityList('quality-no-location', data.itemsWithoutLocation);
    renderQualityList('quality-no-value', data.itemsWithoutValue);
    renderQualityList('quality-no-image', data.itemsWithoutImage);
  } catch (err) {
    console.error('Failed to load data quality:', err);
  }
}

function renderQualityList(elementId, items) {
  const container = document.getElementById(elementId);
  
  if (!items || items.length === 0) {
    container.innerHTML = '<div class="empty-state">All items have this field.</div>';
    return;
  }
  
  container.innerHTML = items.map(item => `
    <div class="quality-item">
      <div class="quality-item-info">
        <div class="quality-item-name">${item.name}</div>
        <div class="quality-item-field">Missing: ${item.missingField}</div>
      </div>
      <a href="edit-item.html?id=${item.id}" class="button">Edit Item</a>
    </div>
  `).join('');
}

init();
