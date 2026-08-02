// API base URL — Vite env var in production, proxy in dev v2
const API_BASE = import.meta.env.VITE_API_URL || ''

const SUPABASE_URL = 'https://upcbhnszdtalizykmrpf.supabase.co'

function getSupabaseToken() {
  // Check all possible Supabase token storage keys
  const keys = Object.keys(localStorage).filter(k => k.includes('supabase') || k.includes('sb-'))
  for (const key of keys) {
    try {
      const data = JSON.parse(localStorage.getItem(key))
      if (data?.access_token) return data.access_token
      if (data?.currentSession?.access_token) return data.currentSession.access_token
    } catch (e) {}
  }
  return null
}

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`
  console.debug('apiFetch:', url)

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // Attach admin token if available
  const adminToken = localStorage.getItem('admin_token')
  if (adminToken) {
    headers['Authorization'] = `Bearer ${adminToken}`
  } else {
    // Try Supabase session token (from auth)
    const sbToken = getSupabaseToken()
    if (sbToken) {
      headers['Authorization'] = `Bearer ${sbToken}`
    }
  }

  return fetch(url, { ...options, headers })
}

export { API_BASE }
