import { requireAuth } from './auth.js';

function getAuthHeaders() {
  const headers = {};
  const userId = localStorage.getItem('userId');
  const role = localStorage.getItem('role');
  if (userId) headers['x-user-id'] = userId;
  if (role) headers['x-user-role'] = role;
  return headers;
}

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function formatDate(iso) {
  if (!iso) return 'N/A';
  const date = new Date(iso);
  return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
}

function formatCurrency(value) {
  return '₱' + parseFloat(value || 0).toFixed(2);
}

async function fetchItem(id) {
  const response = await fetch(`/items/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch item');
  return response.json();
}

async function fetchItemHistory(id) {
  const response = await fetch(`/items/${id}/history`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch history');
  return response.json();
}

function getActionIcon(actionType) {
  const icons = {
    'CREATED': '✨',
    'UPDATED': '✏️',
    'QUANTITY_CHANGED': '🔢',
    'LOCATION_CHANGED': '📍',
    'CATEGORY_CHANGED': '🏷️',
    'VALUE_CHANGED': '💰',
    'DELETED': '🗑️',
    'RESTORED': '♻️',
  };
  return icons[actionType] || '📝';
}

function getActionLabel(actionType) {
  const labels = {
    'CREATED': 'Item Created',
    'UPDATED': 'Item Updated',
    'QUANTITY_CHANGED': 'Quantity Changed',
    'LOCATION_CHANGED': 'Location Changed',
    'CATEGORY_CHANGED': 'Category Changed',
    'VALUE_CHANGED': 'Value Changed',
    'DELETED': 'Item Deleted',
    'RESTORED': 'Item Restored',
  };
  return labels[actionType] || actionType;
}

function renderItemDetails(item) {
  document.getElementById('item-name').textContent = item.name;
  document.getElementById('edit-item-btn').href = `edit-item.html?id=${item.id}`;
  
  const detailsHtml = `
    <div style="display:grid;gap:1rem;">
      ${item.imageUrl && item.imageUrl !== '/uploads/undefined' ? `
        <div>
          <img src="${item.imageUrl}" alt="${item.name}" style="max-width:100%;max-height:300px;border-radius:var(--radius-sm);border:1px solid var(--border);" />
        </div>
      ` : ''}
      <div class="detail-row">
        <span class="detail-label">Name:</span>
        <span class="detail-value">${item.name}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Description:</span>
        <span class="detail-value">${item.description || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Quantity:</span>
        <span class="detail-value">${item.quantity}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Value:</span>
        <span class="detail-value">${formatCurrency(item.value)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Category:</span>
        <span class="detail-value">${item.category?.name || 'N/A'}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Location:</span>
        <span class="detail-value">${item.location?.name || 'N/A'}</span>
      </div>
    </div>
  `;
  
  document.getElementById('item-details-content').innerHTML = detailsHtml;
  
  const quickInfoHtml = `
    <div style="display:flex;flex-direction:column;gap:0.75rem;">
      <div class="quick-info-item">
        <div class="quick-info-label">Owner</div>
        <div class="quick-info-value">${item.reporter?.name || 'Unknown'}</div>
      </div>
      <div class="quick-info-item">
        <div class="quick-info-label">Created</div>
        <div class="quick-info-value">${formatDate(item.createdAt)}</div>
      </div>
      <div class="quick-info-item">
        <div class="quick-info-label">Last Updated</div>
        <div class="quick-info-value">${formatDate(item.updatedAt)}</div>
      </div>
      <div class="quick-info-item">
        <div class="quick-info-label">Total Value</div>
        <div class="quick-info-value">${formatCurrency(item.value * item.quantity)}</div>
      </div>
    </div>
  `;
  
  document.getElementById('quick-info').innerHTML = quickInfoHtml;
}

function renderHistory(history) {
  const container = document.getElementById('history-timeline');
  
  if (history.length === 0) {
    container.innerHTML = '<div class="empty-state">No history available for this item.</div>';
    return;
  }
  
  const timelineHtml = history.map(log => {
    let changeText = '';
    
    if (log.changedField && log.oldValue && log.newValue) {
      changeText = `<div class="timeline-change">
        <span class="change-field">${log.changedField}:</span>
        <span class="change-old">${log.oldValue}</span>
        <span class="change-arrow">→</span>
        <span class="change-new">${log.newValue}</span>
      </div>`;
    }
    
    return `
      <div class="timeline-item">
        <div class="timeline-icon">${getActionIcon(log.actionType)}</div>
        <div class="timeline-content">
          <div class="timeline-header">
            <span class="timeline-action">${getActionLabel(log.actionType)}</span>
            <span class="timeline-date">${formatDate(log.createdAt)}</span>
          </div>
          ${changeText}
          <div class="timeline-user">by ${log.user?.name || 'Unknown User'}</div>
        </div>
      </div>
    `;
  }).join('');
  
  container.innerHTML = timelineHtml;
}

async function init() {
  const user = requireAuth({ allow: ['STUDENT', 'ADMIN'], redirectTo: 'login.html' });
  if (!user) return;
  
  const itemId = getParam('id');
  if (!itemId) {
    alert('No item ID provided');
    window.location.href = 'dashboard.html';
    return;
  }
  
  try {
    const [item, history] = await Promise.all([
      fetchItem(itemId),
      fetchItemHistory(itemId),
    ]);
    
    renderItemDetails(item);
    renderHistory(history);
  } catch (err) {
    alert('Failed to load item details: ' + err.message);
    window.location.href = 'dashboard.html';
  }
}

init();
