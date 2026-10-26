import { apiFetch } from './apiFetch.js'

export async function getBusinessProducts() {
  return apiFetch('/api/products')
}

export async function getProductsByBusiness(businessId) {
  return apiFetch(`/api/products/by-business/${businessId}`)
}

export async function getPatronProducts() {
  return apiFetch('/api/products/patron')
}

export async function createProduct(data) {
  return apiFetch('/api/products', { method: 'POST', body: JSON.stringify(data) })
}

export async function requestProduct(businessId, data) {
  return apiFetch(`/api/products/request/${businessId}`, { method: 'POST', body: JSON.stringify(data) })
}

export async function voteForProduct(id) {
  return apiFetch(`/api/products/${id}/vote`, { method: 'POST' })
}

export async function updateProductStatus(id, status) {
  return apiFetch(`/api/products/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) })
}

export async function updateProduct(id, data) {
  return apiFetch(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteProduct(id) {
  return apiFetch(`/api/products/${id}`, { method: 'DELETE' })
}

export async function promoteProduct(id, data) {
  return apiFetch(`/api/products/${id}/promote`, { method: 'POST', body: JSON.stringify(data) })
}

export async function requestMoreInfo(id) {
  return apiFetch(`/api/products/${id}/request-info`, { method: 'POST' })
}

export async function patronUpdateProduct(id, data) {
  return apiFetch(`/api/products/${id}/patron-update`, { method: 'PUT', body: JSON.stringify(data) })
}
