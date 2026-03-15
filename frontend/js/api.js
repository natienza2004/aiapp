const BASE_URL = '/items';

async function safeJson(response) {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || response.statusText);
  }
  return response.json();
}

export async function getItems() {
  const response = await fetch(BASE_URL);
  return safeJson(response);
}

export async function getItem(id) {
  const response = await fetch(`${BASE_URL}/${id}`);
  return safeJson(response);
}

export async function createItem(item) {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  return safeJson(response);
}

export async function updateItem(id, item) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  return safeJson(response);
}

export async function deleteItem(id) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || response.statusText);
  }
}
