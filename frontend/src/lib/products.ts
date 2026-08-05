export interface Product {
  id: number
  sku: string
  name: string
  category: string
  price: number
  cost_price: number
  stock_quantity: number
  reorder_level: number
}

export interface SaleItem {
  id: number
  name: string
  price: number
  qty: number
}

export interface Transaction {
  id: number
  invoice_number: string
  terminal: string
  payment_method: string
  total_amount: number
  status: string
  created_at: string
}

const API_BASE = '/api/backend'

export async function fetchProductsFromApi(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE}/products`, { cache: 'no-store' })
    if (!res.ok) return []
    const json = await res.json()
    return Array.isArray(json.data) ? json.data : []
  } catch (err) {
    console.error('Failed to fetch products from CodeIgniter API:', err)
    return []
  }
}

export async function createProductApi(product: Omit<Product, 'id'>): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    })
    if (!res.ok) return null
    const json = await res.json()
    return json.data || null
  } catch (err) {
    console.error('Failed to create product via API:', err)
    return null
  }
}

export async function updateProductApi(id: number, product: Partial<Product>): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    })
    return res.ok
  } catch (err) {
    console.error('Failed to update product via API:', err)
    return false
  }
}

export async function deleteProductApi(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE'
    })
    return res.ok
  } catch (err) {
    console.error('Failed to delete product via API:', err)
    return false
  }
}

export async function fetchSalesFromApi(): Promise<Transaction[]> {
  try {
    const res = await fetch(`${API_BASE}/sales`, { cache: 'no-store' })
    if (!res.ok) return []
    const json = await res.json()
    return Array.isArray(json.data) ? json.data : []
  } catch (err) {
    console.error('Failed to fetch sales from API:', err)
    return []
  }
}

export async function recordSaleApi(sale: { items: SaleItem[]; payment_method: string; subtotal: number; tax: number; total_amount: number }): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sale)
    })
    return res.ok
  } catch (err) {
    console.error('Failed to record sale via API:', err)
    return false
  }
}
