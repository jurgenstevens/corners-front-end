const BASE = import.meta.env.VITE_BACK_END_SERVER_URL

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }
}

export async function getMyThreads() {
  const res = await fetch(`${BASE}/api/messages`, { headers: authHeaders() })
  return res.json()
}

export async function getThread(threadId) {
  const res = await fetch(`${BASE}/api/messages/${threadId}`, { headers: authHeaders() })
  return res.json()
}

export async function sendReply(threadId, body) {
  const res = await fetch(`${BASE}/api/messages/${threadId}/reply`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ body }),
  })
  return res.json()
}
