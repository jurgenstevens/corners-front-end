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

export async function createCheckoutSession(priceId = import.meta.env.VITE_STRIPE_PRICE_ID) {
  const res = await fetch(`${BASE}/api/billing/checkout`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ priceId }),
  })
  const json = await res.json()
  if (json.err) throw new Error(json.err)
  window.location.href = json.url
}
