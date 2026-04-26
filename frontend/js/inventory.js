import { createItem, deleteItem, getItem, getItems, updateItem, getDashboardSummary, searchItems } from './api.js';
import { getStoredUser, requireAuth, redirectToDashboard } from './auth.js';

const statusEl = document.getElementById('form-status');

function setStatus(message, type = 'info') {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
}

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function formatDate(iso) {
  const date = new Date(iso);
  return date.toLocaleString();
}

function createImageCell(item) {
  const url = item.imageUrl;
  if (!url || url === '/uploads/undefined' || url.endsWith('/undefined')) return '<td><div class="no-img">🖼️</div></td>';
  return `<td><img class="thumb" src="${url}" alt="${item.name}" /></td>`;
}

function renderItems(items, user, tbody) {
  if (items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="loading">No items found.</td></tr>';
    return;
  }
  
  tbody.innerHTML = items
    .map((item, index) => {
      const canManage = user.role === 'ADMIN' || item.reporterId === user.id;
      const categoryName = item.category?.name || 'N/A';
      const locationName = item.location?.name || 'N/A';
      return `
        <tr>
          <td>${index + 1}</td>
          ${createImageCell(item)}
          <td>${item.name}</td>
          <td>${item.quantity}</td>
          <td>${categoryName}</td>
          <td>${locationName}</td>
          <td>${formatDate(item.createdAt)}</td>
          <td class="actions">
            ${canManage ? `<a class="button" href="edit-item.html?id=${item.id}">Edit</a><button class="button delete-btn" data-id="${item.id}">Delete</button>` : ''}
          </td>
        </tr>`;
    })
    .join('');

  tbody.querySelectorAll('button[data-id]').forEach((button) => {
    button.addEventListener('click', async (event) => {
      const id = Number(event.currentTarget.getAttribute('data-id'));
      if (!id) return;
      if (!confirm('Delete this item?')) return;
      try {
        await deleteItem(id);
        setStatus('Item deleted.', 'success');
        initList();
      } catch (err) {
        setStatus(err.message, 'error');
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

async function initList() {
  const user = requireAuth({ allow: ['STUDENT', 'ADMIN'], redirectTo: 'login.html' });
  if (!user) return;

  const tbody = document.getElementById('inventory-body');
  if (!tbody) return;

  try {
    const [items, summary] = await Promise.all([getItems(), getDashboardSummary()]);
    
    // Update stats
    const totalItemsEl = document.getElementById('total-items');
    const totalQuantityEl = document.getElementById('total-quantity');
    const totalValueEl = document.getElementById('total-value');
    const totalCategoriesEl = document.getElementById('total-categories');
    const totalLocationsEl = document.getElementById('total-locations');
    
    if (totalItemsEl) totalItemsEl.textContent = summary.totalItems || 0;
    if (totalQuantityEl) totalQuantityEl.textContent = summary.totalQuantity || 0;
    if (totalValueEl) totalValueEl.textContent = '₱' + (summary.totalValue || 0).toFixed(2);
    if (totalCategoriesEl) totalCategoriesEl.textContent = summary.totalCategories || 0;
    if (totalLocationsEl) totalLocationsEl.textContent = summary.totalLocations || 0;
    
    const itemCountBadge = document.getElementById('item-count');
    if (itemCountBadge) itemCountBadge.textContent = items.length;
    
    renderItems(items, user, tbody);

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
    
    // Setup search
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const query = e.target.value.trim();
        
        if (query.length === 0) {
          renderItems(items, user, tbody);
          return;
        }
        
        if (query.length < 2) {
          return;
        }
        
        debounceTimer = setTimeout(async () => {
          try {
            tbody.innerHTML = '<tr><td colspan="8" class="loading">Searching...</td></tr>';
            const results = await searchItems(query);
            renderItems(results, user, tbody);
          } catch (err) {
            tbody.innerHTML = `<tr><td colspan="8" class="loading">${err.message}</td></tr>`;
          }
        }, 300);
      });
    }
  } catch (err) {
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="8" class="loading">${err.message}</td></tr>`;
    }
  }
}

function bindImagePreview(existingUrl = null) {
  const input = document.getElementById('image');
  const preview = document.getElementById('image-preview');
  if (!input || !preview) return;

  if (existingUrl) {
    preview.src = existingUrl;
    preview.style.display = 'block';
  }

  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    preview.src = URL.createObjectURL(file);
    preview.style.display = 'block';
  });
}

function bindForm(onSubmit) {
  const form = document.getElementById('item-form');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    // Remove empty image field so Multer doesn't receive a 0-byte file
    const imageFile = formData.get('image');
    if (!imageFile || (imageFile instanceof File && imageFile.size === 0)) {
      formData.delete('image');
    }

    try {
      await onSubmit(formData);
      setStatus('Saved successfully', 'success');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 600);
    } catch (err) {
      setStatus(err.message, 'error');
    }
  });
}

async function initAdd() {
  const user = requireAuth({ allow: ['STUDENT', 'ADMIN'], redirectTo: 'login.html' });
  if (!user) return;

  bindImagePreview();
  bindForm(async (formData) => {
    await createItem(formData);
  });
}

async function initEdit() {
  const user = requireAuth({ allow: ['STUDENT', 'ADMIN'], redirectTo: 'login.html' });
  if (!user) return;

  const idParam = getParam('id');
  const id = idParam ? Number(idParam) : NaN;
  if (!id) {
    setStatus('Missing item id', 'error');
    return;
  }

  try {
    const item = await getItem(id);

    if (user.role !== 'ADMIN' && item.reporterId !== user.id) {
      setStatus('You are not allowed to edit this item.', 'error');
      return;
    }

    document.getElementById('name').value = item.name;
    document.getElementById('quantity').value = String(item.quantity);
    document.getElementById('value').value = item.value || '';
    document.getElementById('category').value = item.category?.name || '';
    document.getElementById('location').value = item.location?.name || '';
    document.getElementById('description').value = item.description || '';

    bindImagePreview(item.imageUrl || null);
    bindForm(async (formData) => {
      await updateItem(id, formData);
    });
  } catch (err) {
    setStatus(err.message, 'error');
  }
}

function mount() {
  const page = document.body.dataset.page;
  if (page === 'dashboard') {
    initList();
  }

  if (page === 'add') {
    initAdd();
  }

  if (page === 'edit') {
    initEdit();
  }
}

mount();
