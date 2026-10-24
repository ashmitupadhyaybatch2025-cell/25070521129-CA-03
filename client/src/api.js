const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export async function api(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  let data = {}
  try {
    data = await res.json()
  } catch {
    // empty response body
  }

  if (!res.ok) throw new Error(data.msg || data.message || 'Something went wrong')
  return data
}
