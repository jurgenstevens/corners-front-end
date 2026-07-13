import * as tokenService from './tokenService'

export async function uploadImage(file) {
  const formData = new FormData()
  formData.append('image', file)
  const res = await fetch(`${import.meta.env.VITE_BACK_END_SERVER_URL}/api/uploads/image`, {
    method: 'POST',
    headers: tokenService.getToken() ? { Authorization: `Bearer ${tokenService.getToken()}` } : {},
    body: formData,
  })
  const json = await res.json()
  if (json.err) throw new Error(json.err)
  return json.url
}
