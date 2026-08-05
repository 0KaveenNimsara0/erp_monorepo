import { getAuthToken } from './auth';

export interface TaxSettings {
  enabled: boolean;
  rate: number;
}

const API_BASE = '/api/backend'; // Map through Next.js proxy to CodeIgniter

function getHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}
export interface Category {
  id: number;
  name: string;
}

export async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE}/categories`, {
      headers: getHeaders(),
      cache: 'no-store'
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (err) {
    console.error('Failed to fetch categories:', err);
    return [];
  }
}

export async function addCategory(category: string): Promise<Category[]> {
  const trimmed = category.trim();
  if (!trimmed) return getCategories();
  
  try {
    await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name: trimmed })
    });
    return getCategories();
  } catch (err) {
    console.error('Failed to add category:', err);
    return getCategories();
  }
}

export async function deleteCategory(id: number): Promise<Category[]> {
  try {
    await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return getCategories();
  } catch (err) {
    console.error('Failed to delete category:', err);
    return getCategories();
  }
}

export async function getTaxSettings(): Promise<TaxSettings> {
  const defaultSettings = { enabled: true, rate: 8.0 };
  try {
    const res = await fetch(`${API_BASE}/settings/tax`, {
      headers: getHeaders(),
      cache: 'no-store'
    });
    if (!res.ok) return defaultSettings;
    const json = await res.json();
    if (json.data) {
      return {
        enabled: Boolean(json.data.enabled),
        rate: Number(json.data.rate) || 0
      };
    }
    return defaultSettings;
  } catch (err) {
    console.error('Failed to fetch tax settings:', err);
    return defaultSettings;
  }
}

export async function saveTaxSettings(settings: TaxSettings): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/settings/tax`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(settings)
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to save tax settings:', err);
    return false;
  }
}
