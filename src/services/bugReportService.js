const BASE = import.meta.env.VITE_BACK_END_SERVER_URL

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }
}

export async function submitBugReport(data) {
  const res = await fetch(`${BASE}/api/bug-reports`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  return res.json()
}
