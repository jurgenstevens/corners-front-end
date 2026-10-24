import { apiFetch } from './apiFetch.js'

export async function getNearbyBusinesses(zip) {
  const path = zip
    ? `/api/connections/nearby?zip=${encodeURIComponent(zip)}`
    : '/api/connections/nearby'
  return apiFetch(path)
}

export async function requestConnection(businessId) {
  return apiFetch(`/api/connections/request/${businessId}`, { method: 'POST' })
}

export async function dismissBusiness(businessId) {
  return apiFetch(`/api/connections/dismiss/${businessId}`, { method: 'POST' })
}

export async function getMyStores() {
  return apiFetch('/api/connections/my-stores')
}

export async function getConnectionStatus(businessId) {
  return apiFetch(`/api/connections/status/${businessId}`)
}

export async function getPendingConnections() {
  return apiFetch('/api/connections/pending')
}

export async function disconnectFromBusiness(businessId) {
  console.log('connectionService.disconnectFromBusiness — businessId:', businessId)
  return apiFetch(`/api/connections/disconnect/${businessId}`, { method: 'DELETE' })
}

export async function deleteConnection(connectionId) {
  return apiFetch(`/api/connections/${connectionId}`, { method: 'DELETE' })
}

export async function updateConnectionStatus(connectionId, status, denialReason) {
  return apiFetch(`/api/connections/${connectionId}/status`, { method: 'PUT', body: JSON.stringify({ status, denialReason }) })
}
