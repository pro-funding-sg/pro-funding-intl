// API base URL — uses Vite env var in production, proxy in dev
const API_BASE = import.meta.env.VITE_API_URL || ''

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`
  const token = localStorage.getItem('admin_token')
  const session = localStorage.getItem('supabase_session')

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // Attach admin token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  // Attach supabase session if available
  if (session) {
    try {
      const s = JSON.parse(session)
      if (s.access_token) {
        headers['Authorization'] = `Bearer ${s.access_token}`
      }
    } catch (e) {}
  }

  return fetch(url, { ...options, headers })
}

export { API_BASE }
