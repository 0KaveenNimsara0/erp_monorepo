import { getAuthToken } from './auth';

export interface SaleItem {
  id: number;
  sale_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: string;
  subtotal: string;
  refunded_quantity?: number;
}

export interface Sale {
  id: number;
  invoice_number: string;
  user_id: number;
  cashier_name?: string | null;
  subtotal: string;
  tax: string;
  total_amount: string;
  refunded_amount?: string;
  payment_method: string;
  status: string;
  refund_reason?: string | null;
  created_at: string;
  items?: SaleItem[];
}

export interface SalesSummary {
  today_revenue: number;
  today_orders: number;
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
}

export interface ReportItem {
  date: string;
  revenue: string;
  orders: string;
}

const API_BASE = '/api/backend';

function getHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export async function fetchSales(): Promise<Sale[]> {
  try {
    const res = await fetch(`${API_BASE}/sales`, {
      headers: getHeaders(),
      cache: 'no-store'
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (err) {
    console.error('Failed to fetch sales:', err);
    return [];
  }
}

export async function fetchSalesSummary(): Promise<SalesSummary | null> {
  try {
    const res = await fetch(`${API_BASE}/sales/summary`, {
      headers: getHeaders(),
      cache: 'no-store'
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error('Failed to fetch sales summary:', err);
    return null;
  }
}

export async function fetchSalesReport(days: number | 'all' = 30): Promise<ReportItem[]> {
  try {
    const res = await fetch(`${API_BASE}/sales/report?days=${days}`, {
      headers: getHeaders(),
      cache: 'no-store'
    });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (err) {
    console.error('Failed to fetch sales report:', err);
    return [];
  }
}

export async function fetchSaleDetails(id: number): Promise<Sale | null> {
  try {
    const res = await fetch(`${API_BASE}/sales/${id}`, {
      headers: getHeaders(),
      cache: 'no-store'
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error('Failed to fetch sale details:', err);
    return null;
  }
}

export async function refundSaleApi(id: number, reason: string, items?: { id: number, quantity: number }[], full_refund: boolean = false): Promise<{ success: boolean; message: string }> {
  try {
    const payload = items ? { reason, items } : { reason, full_refund };
    const res = await fetch(`${API_BASE}/sales/${id}/refund`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    return { success: res.ok, message: json.message || (res.ok ? 'Refund successful' : 'Refund failed') };
  } catch (err) {
    console.error('Failed to refund sale:', err);
    return { success: false, message: 'Network error occurred' };
  }
}
