const BASE = import.meta.env.VITE_BACK_END_SERVER_URL

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  }
}

export async function getStatus() {
  const res = await fetch(`${BASE}/api/billing/status`, { headers: authHeaders() })
  return res.json()
}

export async function createCheckoutSession() {
  const res = await fetch(`${BASE}/api/billing/create-checkout`, {
    method: 'POST',
    headers: authHeaders(),
  })
  const json = await res.json()
  if (json.err) throw new Error(json.err)
  window.location.href = json.url
}
