const BASE = import.meta.env.VITE_BACK_END_SERVER_URL

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }
}

export async function getMyBusiness() {
  const res = await fetch(`${BASE}/api/businesses/me`, { headers: authHeaders() })
  return res.json()
}

export async function setupBusiness(data) {
  const res = await fetch(`${BASE}/api/businesses/setup`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  return res.json()
}

export async function getBusinessById(id) {
  const res = await fetch(`${BASE}/api/businesses/${id}`, { headers: authHeaders() })
  return res.json()
}

export async function updateVisibility(visibility) {
  console.log('businessService.updateVisibility — setting visibility to:', visibility)
  const res = await fetch(`${BASE}/api/businesses/setup`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ visibility }),
  })
  const data = await res.json()
  console.log('businessService.updateVisibility — response:', data)
  return data
}