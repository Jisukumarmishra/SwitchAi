const API_BASE = '/api';

async function handleResponse(res) {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || error.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function getAgents() {
  const res = await fetch(`${API_BASE}/agents`);
  return handleResponse(res);
}
