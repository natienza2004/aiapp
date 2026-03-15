import { Item, createItem, deleteItem, getItem, getItems, updateItem } from './api.js';

const statusEl = document.getElementById('form-status');

function setStatus(message: string, type: 'success' | 'error' | 'info' = 'info') {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
}

function getParam(name: string): string | null {
  return new URLSearchParams(window.location.search).get(name);
}

function formatDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleString();
}

async function initList() {
  const tbody = document.getElementById('inventory-body');
  if (!tbody) return;

  try {
    const items = await getItems();
    tbody.innerHTML = items
      .map(
        (item) =>
          `<tr>
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${item.category}</td>
            <td>${formatDate(item.createdAt)}</td>
            <td class="actions">
              <a class="button" href="edit-item.html?id=${item.id}">Edit</a>
              <button class="button" data-id="${item.id}">Delete</button>
            </td>
          </tr>`,
      )
      .join('');

    tbody.querySelectorAll('button[data-id]').forEach((button) => {
      button.addEventListener('click', async (event) => {
        const id = Number((event.currentTarget as HTMLElement).getAttribute('data-id'));
        if (!id) return;
        if (!confirm('Delete this item?')) return;
        try {
          await deleteItem(id);
          setStatus('Item deleted.', 'success');
          initList();
        } catch (err) {
          setStatus((err as Error).message, 'error');
        }
      });
    });
  } catch (err) {
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="6" class="loading">${(err as Error).message}</td></tr>`;
    }
  }
}

function bindForm(onSubmit: (values: { name: string; quantity: number; category: string; description: string }) => Promise<void>) {
  const form = document.getElementById('item-form') as HTMLFormElement | null;
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const data = {
      name: String(formData.get('name') ?? '').trim(),
      quantity: Number(formData.get('quantity') ?? 0),
      category: String(formData.get('category') ?? '').trim(),
      description: String(formData.get('description') ?? '').trim(),
    };

    try {
      await onSubmit(data);
      setStatus('Saved successfully', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 600);
    } catch (err) {
      setStatus((err as Error).message, 'error');
    }
  });
}

async function initAdd() {
  bindForm(async (values) => {
    await createItem(values);
  });
}

async function initEdit() {
  const idParam = getParam('id');
  const id = idParam ? Number(idParam) : NaN;
  if (!id) {
    setStatus('Missing item id', 'error');
    return;
  }

  try {
    const item = await getItem(id);
    (document.getElementById('name') as HTMLInputElement).value = item.name;
    (document.getElementById('quantity') as HTMLInputElement).value = String(item.quantity);
    (document.getElementById('category') as HTMLInputElement).value = item.category;
    (document.getElementById('description') as HTMLTextAreaElement).value = item.description ?? '';

    bindForm(async (values) => {
      await updateItem(id, values);
    });
  } catch (err) {
    setStatus((err as Error).message, 'error');
  }
}

function mount() {
  const page = document.body.dataset.page;
  if (page === 'list') {
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
