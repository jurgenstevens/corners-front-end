const BASE = import.meta.env.VITE_BACK_END_SERVER_URL

function headers() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }
}

async function req(method, path, body) {
  const opts = { method, headers: headers() }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(`${BASE}/api/admin${path}`, opts)
  return res.json()
}

export const getStats = () => req('GET', '/stats')
export const getZipActivity = () => req('GET', '/stats/zip-activity')
export const getTopProducts = () => req('GET', '/stats/top-products')
export const getGrowthStats = () => req('GET', '/stats/growth')
export const getConnectionRates = () => req('GET', '/stats/connection-rates')

export const getBugReports = (params = {}) => {
  const qs = new URLSearchParams(params).toString()
  return req('GET', `/bug-reports${qs ? `?${qs}` : ''}`)
}
export const updateBugReport = (id, data) => req('PUT', `/bug-reports/${id}`, data)

export const getVoteAbuseFlags = () => req('GET', '/vote-abuse-flags')
export const dismissAbuseFlag = (flagId) => req('PUT', `/vote-abuse-flags/${flagId}/dismiss`)

export const getBannedUsers = () => req('GET', '/users/banned')
export const banUser = (profileId, reason) => req('PUT', `/users/${profileId}/ban`, { reason })
export const liftBan = (profileId) => req('PUT', `/users/${profileId}/lift-ban`)
export const suspendUser = (profileId, reason, days) => req('PUT', `/users/${profileId}/suspend`, { reason, days })
export const liftSuspension = (profileId) => req('PUT', `/users/${profileId}/lift-suspension`)

export const getAllBusinesses = (params = {}) => {
  const qs = new URLSearchParams(params).toString()
  return req('GET', `/businesses${qs ? `?${qs}` : ''}`)
}
export const getBusinessDetail = (id) => req('GET', `/businesses/${id}`)
export const verifyBusiness = (id, notes) => req('PUT', `/businesses/${id}/verify`, { notes })
export const revokeBusiness = (id) => req('PUT', `/businesses/${id}/revoke`)
export const rejectStore = (id) => req('PUT', `/businesses/${id}/reject-store`)

export const getAllPatrons = () => req('GET', '/users/patrons')
export const getPatronDetail = (id) => req('GET', `/users/patrons/${id}`)
export const deletePatron = (id) => req('DELETE', `/users/patrons/${id}`)
export const getAllDistributors = () => req('GET', '/distributors')
export const getAllProducts = () => req('GET', '/products')
export const getProductDetail = (id) => req('GET', `/products/${id}`)
export const approveProduct = (id) => req('PUT', `/products/${id}/approve`)
export const getTallyHits = () => req('GET', '/products/tally-hits')
export const getExpiringRejected = () => req('GET', '/products/expiring-rejected')
export const hardDeleteProduct = (id) => req('DELETE', `/products/${id}`)
export const restoreProduct = (id) => req('PUT', `/products/${id}/restore`)
