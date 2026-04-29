const BASE_URL = '/items';

function getAuthHeaders() {
  const headers = {};
  const userId = localStorage.getItem('userId');
  const role = localStorage.getItem('role');
  if (userId) headers['x-user-id'] = userId;
  if (role) headers['x-user-role'] = role;
  return headers;
}

async function safeJson(response) {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || response.statusText);
  }
  return response.json();
}

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value);
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

export async function getItems(params = {}) {
  const response = await fetch(`${BASE_URL}${buildQuery(params)}`, {
    headers: getAuthHeaders(),
  });
  return safeJson(response);
}

export async function searchItems(query, params = {}) {
  const response = await fetch(`${BASE_URL}/search${buildQuery({ query, ...params })}`, {
    headers: getAuthHeaders(),
  });
  return safeJson(response);
}

export async function getItem(id) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    headers: getAuthHeaders(),
  });
  return safeJson(response);
}

export async function createItem(formData) {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  return safeJson(response);
}

export async function updateItem(id, formData) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: formData,
  });
  return safeJson(response);
}

export async function deleteItem(id) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || response.statusText);
  }
}

export async function getCategories() {
  const response = await fetch('/categories', { headers: getAuthHeaders() });
  return safeJson(response);
}

export async function getLocations() {
  const response = await fetch('/locations', { headers: getAuthHeaders() });
  return safeJson(response);
}

export async function getDashboardSummary() {
  const response = await fetch('/dashboard/summary', { headers: getAuthHeaders() });
  return safeJson(response);
}

export async function getUsers() {
  const response = await fetch('/users', {
    headers: getAuthHeaders(),
  });
  return safeJson(response);
}

export async function getProfile() {
  const response = await fetch('/users/me', { headers: getAuthHeaders() });
  return safeJson(response);
}

export async function updateProfile(data) {
  const response = await fetch('/users/me', {
    method: 'PATCH',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return safeJson(response);
}
