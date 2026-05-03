import * as tokenService from './tokenService'

const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/api/products`

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${tokenService.getToken()}`,
  }
}

export async function getMyProducts() {
  const res = await fetch(`${BASE_URL}/my`, { headers: authHeaders() })
  const json = await res.json()
  if (json.err) throw new Error(json.err)
  return json
}

export async function getAllProducts() {
  const res = await fetch(BASE_URL, { headers: authHeaders() })
  const json = await res.json()
  if (json.err) throw new Error(json.err)
  return json
}

export async function createProduct(data) {
  const res = await fetch(BASE_URL, { method: 'POST', headers: authHeaders(), body: JSON.stringify(data) })
  const json = await res.json()
  if (json.err) throw new Error(json.err)
  return json
}

export async function updateProduct(id, data) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(data) })
  const json = await res.json()
  if (json.err) throw new Error(json.err)
  return json
}

export async function deleteProduct(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE', headers: authHeaders() })
  const json = await res.json()
  if (json.err) throw new Error(json.err)
  return json
}