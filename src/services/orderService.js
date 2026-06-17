const BASE = import.meta.env.VITE_BACK_END_SERVER_URL

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }
}

export async function createOrder(data) {
  const res = await fetch(`${BASE}/api/orders`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
  })
  return res.json()
}

export async function getMyOrders() {
  const res = await fetch(`${BASE}/api/orders/business`, { headers: authHeaders() })
  return res.json()
}

export async function acceptOrder(orderId) {
  const res = await fetch(`${BASE}/api/orders/${orderId}/accept`, {
    method: 'PUT', headers: authHeaders(),
  })
  return res.json()
}

export async function cancelOrder(orderId) {
  const res = await fetch(`${BASE}/api/orders/${orderId}/cancel`, {
    method: 'PUT', headers: authHeaders(),
  })
  return res.json()
}
