const API_BASE = '/api/admin';

export async function fetchItems<T>(resource: string): Promise<T[]> {
  const res = await fetch(`${API_BASE}/${resource}`);
  if (!res.ok) throw new Error(`Failed to fetch ${resource}`);
  return res.json();
}

export async function createItem<T>(resource: string, data: Partial<T>): Promise<T> {
  const res = await fetch(`${API_BASE}/${resource}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create ${resource}`);
  return res.json();
}

export async function updateItem<T>(resource: string, id: string, data: Partial<T>): Promise<T> {
  const res = await fetch(`${API_BASE}/${resource}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update ${resource}`);
  return res.json();
}

export async function deleteItem(resource: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${resource}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete ${resource}`);
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload image');
  const data = await res.json();
  return data.url;
}

export async function fetchMedia(): Promise<{ filename: string; url: string }[]> {
  const res = await fetch(`${API_BASE}/media`);
  if (!res.ok) throw new Error('Failed to fetch media');
  return res.json();
}

export async function deleteMedia(filename: string): Promise<void> {
  const res = await fetch(`${API_BASE}/media?filename=${encodeURIComponent(filename)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete media');
}
