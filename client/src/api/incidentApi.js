const API_BASE = '/api';

async function handleResponse(res) {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || error.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function getIncidents() {
  const res = await fetch(`${API_BASE}/incidents`);
  return handleResponse(res);
}

export async function getIncident(id) {
  const res = await fetch(`${API_BASE}/incidents/${id}`);
  return handleResponse(res);
}

export async function createIncident(data) {
  const res = await fetch(`${API_BASE}/incidents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function getIncidentReport(id) {
  const res = await fetch(`${API_BASE}/incidents/${id}/report`);
  return handleResponse(res);
}

export async function approveIncident(id, data) {
  const res = await fetch(`${API_BASE}/incidents/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function rejectIncident(id, data) {
  const res = await fetch(`${API_BASE}/incidents/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}
