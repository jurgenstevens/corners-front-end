import { apiFetch } from './apiFetch.js'

export async function getMyBusiness() {
  return apiFetch('/api/businesses/me')
}

export async function setupBusiness(data) {
  return apiFetch('/api/businesses/setup', { method: 'PUT', body: JSON.stringify(data) })
}

export async function getBusinessById(id) {
  return apiFetch(`/api/businesses/${id}`)
}

export async function updateVisibility(visibility) {
  console.log('businessService.updateVisibility — setting visibility to:', visibility)
  const data = await apiFetch('/api/businesses/setup', { method: 'PUT', body: JSON.stringify({ visibility }) })
  console.log('businessService.updateVisibility — response:', data)
  return data
}
