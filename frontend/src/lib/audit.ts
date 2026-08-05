import { getAuthToken } from './auth';

export interface AuditLog {
  id: number;
  user_id: number | null;
  username: string | null;
  action: string;
  entity: string;
  entity_id: number | null;
  old_values: any | null;
  new_values: any | null;
  ip_address: string | null;
  created_at: string;
}

const API_BASE = '/api/backend';

function getHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  try {
    const res = await fetch(`${API_BASE}/audit-logs`, {
      headers: getHeaders(),
      cache: 'no-store'
    });
    
    if (!res.ok) {
      console.error('Failed to fetch audit logs, status:', res.status);
      return [];
    }
    
    const json = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
}
