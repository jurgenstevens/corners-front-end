const BASE = import.meta.env.VITE_BACK_END_SERVER_URL

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }
}

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
