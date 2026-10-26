const BASE = import.meta.env.VITE_BACK_END_SERVER_URL

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token')
  const headers = { Authorization: `Bearer ${token}`, ...options.headers }
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }
  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  const json = await res.json()
  if (res.status === 402 && window.location.pathname !== '/billing/upgrade') {
    window.location.assign('/billing/upgrade')
  }
  return json
}
