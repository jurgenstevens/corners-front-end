const BASE = import.meta.env.VITE_BACK_END_SERVER_URL

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }
}

// ── Business-side ─────────────────────────────────────────────────────────────

export async function getNearbyDistributors() {
  const res = await fetch(`${BASE}/api/distributors/nearby`, { headers: authHeaders() })
  return res.json()
}

export async function getDistributorById(id) {
  const res = await fetch(`${BASE}/api/distributors/${id}`, { headers: authHeaders() })
  return res.json()
}

export async function getDistributorCatalog(distributorId) {
  const res = await fetch(`${BASE}/api/distributors/${distributorId}/catalog`, { headers: authHeaders() })
  return res.json()
}

// ── Distributor-side ──────────────────────────────────────────────────────────

export async function getMyDistributor() {
  const res = await fetch(`${BASE}/api/distributors/me`, { headers: authHeaders() })
  return res.json()
}

export async function updateDistributor(data) {
  const res = await fetch(`${BASE}/api/distributors/me`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(data),
  })
  return res.json()
}

export async function getMyCatalog() {
  const res = await fetch(`${BASE}/api/distributors/catalog/mine`, { headers: authHeaders() })
  return res.json()
}

export async function createProduct(data) {
  const res = await fetch(`${BASE}/api/distributors/catalog/mine`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
  })
  return res.json()
}

export async function updateProduct(productId, data) {
  const res = await fetch(`${BASE}/api/distributors/catalog/${productId}`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(data),
  })
  return res.json()
}

export async function deleteProduct(productId) {
  const res = await fetch(`${BASE}/api/distributors/catalog/${productId}`, {
    method: 'DELETE', headers: authHeaders(),
  })
  return res.json()
}

export async function uploadCatalogPDF(file) {
  const formData = new FormData()
  formData.append('catalog', file)
  const res = await fetch(`${BASE}/api/distributors/catalog/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    body: formData,
  })
  return res.json()
}

export async function getMyOrders() {
  const res = await fetch(`${BASE}/api/orders/distributor`, { headers: authHeaders() })
  return res.json()
}

export async function quoteOrder(orderId, data) {
  const res = await fetch(`${BASE}/api/orders/${orderId}/quote`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(data),
  })
  return res.json()
}

export async function updateOrderStatus(orderId, status) {
  const res = await fetch(`${BASE}/api/orders/${orderId}/status`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify({ status }),
  })
  return res.json()
}
