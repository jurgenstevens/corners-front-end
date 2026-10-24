import { apiFetch } from './apiFetch.js'

export async function createOrder(data) {
  return apiFetch('/api/orders', { method: 'POST', body: JSON.stringify(data) })
}

export async function getMyOrders() {
  return apiFetch('/api/orders/business')
}

export async function acceptOrder(orderId) {
  return apiFetch(`/api/orders/${orderId}/accept`, { method: 'PUT' })
}

export async function cancelOrder(orderId) {
  return apiFetch(`/api/orders/${orderId}/cancel`, { method: 'PUT' })
}
