import * as tokenService from './tokenService'

const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/api/requests`

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${tokenService.getToken()}`,
  }
}

export async function createRequest(data) {
  const res = await fetch(BASE_URL, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) })
  const json = await res.json()
  if (json.err) throw new Error(json.err)
  return json
}

export async function getMyRequests() {
  const res = await fetch(`${BASE_URL}/my`, { headers: authHeaders() })
  const json = await res.json()
  if (json.err) throw new Error(json.err)
  return json
}

export async function getBusinessRequests() {
  const res = await fetch(`${BASE_URL}/business`, { headers: authHeaders() })
  const json = await res.json()
  if (json.err) throw new Error(json.err)
  return json
}

export async function updateRequestStatus(id, status) {
  const res = await fetch(`${BASE_URL}/${id}/status`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ status }) })
  const json = await res.json()
  if (json.err) throw new Error(json.err)
  return json
}