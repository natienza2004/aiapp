export interface Item {
  id: number;
  name: string;
  quantity: number;
  category: string;
  description?: string;
  createdAt: string;
}

const BASE_URL = '/items';

interface ItemQueryParams {
  sortBy?: string;
  sortOrder?: string;
}

function buildQuery(params: ItemQueryParams = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, value);
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

async function safeJson(response: Response) {
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || response.statusText);
  }
  return response.json();
}

export async function getItems(params: ItemQueryParams = {}): Promise<Item[]> {
  const response = await fetch(`${BASE_URL}${buildQuery(params)}`);
  return safeJson(response);
}

export async function getItem(id: number): Promise<Item> {
  const response = await fetch(`${BASE_URL}/${id}`);
  return safeJson(response);
}

export async function createItem(item: Omit<Item, 'id' | 'createdAt'>): Promise<Item> {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  return safeJson(response);
}

export async function updateItem(
  id: number,
  item: Partial<Omit<Item, 'id' | 'createdAt'>>,
): Promise<Item> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  return safeJson(response);
}

export async function deleteItem(id: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || response.statusText);
  }
}
