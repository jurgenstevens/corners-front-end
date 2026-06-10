const BASE = import.meta.env.VITE_BACK_END_SERVER_URL

function getToken() {
  return localStorage.getItem('token')
}

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` }
}

export async function getNearbyBusinesses(zip) {
  const url = zip
    ? `${BASE}/api/connections/nearby?zip=${encodeURIComponent(zip)}`
    : `${BASE}/api/connections/nearby`
  const res = await fetch(url, { headers: authHeaders() })
  return res.json()
}

export async function requestConnection(businessId) {
  const res = await fetch(`${BASE}/api/connections/request/${businessId}`, {
    method: 'POST',
    headers: authHeaders(),
  })
  return res.json()
}

export async function dismissBusiness(businessId) {
  const res = await fetch(`${BASE}/api/connections/dismiss/${businessId}`, {
    method: 'POST',
    headers: authHeaders(),
  })
  return res.json()
}

export async function getMyStores() {
  const res = await fetch(`${BASE}/api/connections/my-stores`, { headers: authHeaders() })
  return res.json()
}

export async function getConnectionStatus(businessId) {
  const res = await fetch(`${BASE}/api/connections/status/${businessId}`, { headers: authHeaders() })
  return res.json()
}

export async function getPendingConnections() {
  const res = await fetch(`${BASE}/api/connections/pending`, { headers: authHeaders() })
  return res.json()
}

export async function disconnectFromBusiness(businessId) {
  console.log('connectionService.disconnectFromBusiness — businessId:', businessId)
  const res = await fetch(`${BASE}/api/connections/disconnect/${businessId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  return res.json()
}

export async function updateConnectionStatus(connectionId, status, denialReason) {
  const res = await fetch(`${BASE}/api/connections/${connectionId}/status`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ status, denialReason }),
  })
  return res.json()
}
