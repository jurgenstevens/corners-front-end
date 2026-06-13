const BASE = import.meta.env.VITE_BACK_END_SERVER_URL

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }
}

export async function getBusinessProducts() {
  const res = await fetch(`${BASE}/api/products`, { headers: authHeaders() })
  return res.json()
}

export async function getProductsByBusiness(businessId) {
  const res = await fetch(`${BASE}/api/products/by-business/${businessId}`, { headers: authHeaders() })
  return res.json()
}

export async function getPatronProducts() {
  const res = await fetch(`${BASE}/api/products/patron`, { headers: authHeaders() })
  return res.json()
}

export async function createProduct(data) {
  const res = await fetch(`${BASE}/api/products`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
  })
  return res.json()
}

export async function requestProduct(businessId, data) {
  const res = await fetch(`${BASE}/api/products/request/${businessId}`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
  })
  return res.json()
}

export async function voteForProduct(id) {
  const res = await fetch(`${BASE}/api/products/${id}/vote`, { method: 'POST', headers: authHeaders() })
  return res.json()
}

export async function updateProductStatus(id, status) {
  const res = await fetch(`${BASE}/api/products/${id}/status`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify({ status }),
  })
  return res.json()
}

export async function updateProduct(id, data) {
  const res = await fetch(`${BASE}/api/products/${id}`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(data),
  })
  return res.json()
}

export async function deleteProduct(id) {
  const res = await fetch(`${BASE}/api/products/${id}`, { method: 'DELETE', headers: authHeaders() })
  return res.json()
}

export async function promoteProduct(id, data) {
  const res = await fetch(`${BASE}/api/products/${id}/promote`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(data),
  })
  return res.json()
}

export async function requestMoreInfo(id) {
  const res = await fetch(`${BASE}/api/products/${id}/request-info`, { method: 'POST', headers: authHeaders() })
  return res.json()
}

export async function patronUpdateProduct(id, data) {
  const res = await fetch(`${BASE}/api/products/${id}/patron-update`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(data),
  })
  return res.json()
}
