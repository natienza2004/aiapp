import { createItem, deleteItem, getItem, getItems, updateItem } from './api.js';
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
  if (!item.imageUrl) return '<td></td>';
  return `
    <td>
      <img class="thumb" src="${item.imageUrl}" alt="${item.name}" />
    </td>
  `;
}

async function initList() {
  const user = requireAuth({ allow: ['STUDENT', 'ADMIN'], redirectTo: 'login.html' });
  if (!user) return;

  if (user.role === 'ADMIN') {
    redirectToDashboard(user);
    return;
  }

  const tbody = document.getElementById('inventory-body');
  if (!tbody) return;

  try {
    const items = await getItems();
    tbody.innerHTML = items
      .map((item) => {
        const canManage = user.role === 'ADMIN' || item.reporterId === user.id;
        return `
          <tr>
            <td>${item.id}</td>
            ${createImageCell(item)}
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${item.category}</td>
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

    // Image zoom
    tbody.querySelectorAll('.thumb').forEach((img) => {
      img.addEventListener('click', () => {
        const modal = document.getElementById('image-modal');
        const modalImg = document.getElementById('modal-image');
        modal.style.display = 'block';
        modalImg.src = img.src;
        modalImg.alt = img.alt;
      });
    });

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
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="7" class="loading">${err.message}</td></tr>`;
    }
  }
}

function bindForm(onSubmit) {
  const form = document.getElementById('item-form');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);

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
  const user = requireAuth({ allow: ['STUDENT'], redirectTo: 'login.html' });
  if (!user) return;

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
    document.getElementById('category').value = item.category;
    document.getElementById('description').value = item.description || '';

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
