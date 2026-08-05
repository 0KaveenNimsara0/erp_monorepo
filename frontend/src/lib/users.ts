import { getAuthToken } from './auth'

export interface User {
  id: number
  username: string
  role: 'admin' | 'manager' | 'staff'
  status: 'active' | 'inactive'
  created_at?: string
  password?: string // only used for payload
  pin?: string // only used for payload
}

const API_BASE = '/api/backend'

function getHeaders() {
  const token = getAuthToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}

export async function fetchUsersApi(): Promise<User[]> {
  try {
    const res = await fetch(`${API_BASE}/users`, {
      headers: getHeaders(),
      cache: 'no-store'
    })
    if (!res.ok) return []
    const json = await res.json()
    return Array.isArray(json.data) ? json.data : []
  } catch (err) {
    console.error('Failed to fetch users:', err)
    return []
  }
}

export async function createUserApi(payload: Partial<User>): Promise<User | null> {
  try {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.messages ? Object.values(err.messages).join(', ') : 'Failed to create user')
    }
    const json = await res.json()
    return json.data || null
  } catch (err: any) {
    console.error('Create user error:', err)
    throw err
  }
}

export async function updateUserApi(id: number, payload: Partial<User>): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.messages ? Object.values(err.messages).join(', ') : 'Failed to update user')
    }
    return true
  } catch (err: any) {
    console.error('Update user error:', err)
    throw err
  }
}
