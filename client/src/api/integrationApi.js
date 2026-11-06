const API_BASE = '/api';

async function handleResponse(res) {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || error.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function getIntegrationStatus() {
  const res = await fetch(`${API_BASE}/integrations/status`);
  return handleResponse(res);
}

export async function getHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return handleResponse(res);
}
