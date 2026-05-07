const BASE = import.meta.env.VITE_BACK_END_SERVER_URL

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }
}

export async function getNotifications() {
  const res = await fetch(`${BASE}/api/notifications`, { headers: authHeaders() })
  return res.json()
}

export async function markRead(id) {
  const res = await fetch(`${BASE}/api/notifications/${id}/read`, { method: 'PUT', headers: authHeaders() })
  return res.json()
}

export async function markAllRead() {
  const res = await fetch(`${BASE}/api/notifications/read-all`, { method: 'PUT', headers: authHeaders() })
  return res.json()
}
