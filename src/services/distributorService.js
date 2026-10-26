import { apiFetch } from './apiFetch.js'

// ── Business-side ─────────────────────────────────────────────────────────────

export async function getNearbyDistributors() {
  return apiFetch('/api/distributors/nearby')
}

export async function getDistributorById(id) {
  return apiFetch(`/api/distributors/${id}`)
}

export async function getDistributorCatalog(distributorId) {
  return apiFetch(`/api/distributors/${distributorId}/catalog`)
}

// ── Distributor-side ──────────────────────────────────────────────────────────

export async function getMyDistributor() {
  return apiFetch('/api/distributors/me')
}

export async function updateDistributor(data) {
  return apiFetch('/api/distributors/me', { method: 'PUT', body: JSON.stringify(data) })
}

export async function getMyCatalog() {
  return apiFetch('/api/distributors/catalog/mine')
}

export async function createProduct(data) {
  return apiFetch('/api/distributors/catalog/mine', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateProduct(productId, data) {
  return apiFetch(`/api/distributors/catalog/${productId}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteProduct(productId) {
  return apiFetch(`/api/distributors/catalog/${productId}`, { method: 'DELETE' })
}

export async function uploadCatalogPDF(file) {
  const formData = new FormData()
  formData.append('catalog', file)
  return apiFetch('/api/distributors/catalog/upload', { method: 'POST', body: formData })
}

export async function getMyOrders() {
  return apiFetch('/api/orders/distributor')
}

export async function quoteOrder(orderId, data) {
  return apiFetch(`/api/orders/${orderId}/quote`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function updateOrderStatus(orderId, status) {
  return apiFetch(`/api/orders/${orderId}/status`, { method: 'PUT', body: JSON.stringify({ status }) })
}
