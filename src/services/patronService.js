const BASE = import.meta.env.VITE_BACK_END_SERVER_URL

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }
}

export async function getMyProfile() {
  console.log('patronService.getMyProfile — fetching patron profile')
  const res = await fetch(`${BASE}/api/patrons/me`, { headers: authHeaders() })
  const data = await res.json()
  console.log('patronService.getMyProfile — result:', data)
  return data
}

export async function updateProfile(data) {
  console.log('patronService.updateProfile — data:', data)
  const res = await fetch(`${BASE}/api/patrons/me`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  const result = await res.json()
  console.log('patronService.updateProfile — result:', result)
  return result
}