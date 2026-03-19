import { deleteItem, getItems, getUsers } from './api.js';
import { getStoredUser, requireAuth } from './auth.js';

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

async function initAdmin() {
  const user = requireAuth({ allow: ['ADMIN'], redirectTo: 'login.html' });
  if (!user) return;

  // Load items
  const itemsTbody = document.getElementById('inventory-body');
  try {
    const items = await getItems();
    itemsTbody.innerHTML = items
      .map((item) => {
        return `
          <tr>
            <td>${item.id}</td>
            ${createImageCell(item)}
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${item.category}</td>
            <td>${item.reporter?.name || 'Unknown'}</td>
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
    const users = await getUsers();
    usersTbody.innerHTML = users
      .map((user) => {
        return `
          <tr>
            <td>${user.id}</td>
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