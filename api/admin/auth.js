import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return res.status(401).json({ error: 'Invalid credentials' })

  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', data.user.id)
    .single()

  if (!profile?.is_admin) return res.status(403).json({ error: 'Not an admin' })

  res.json({ token: data.session.access_token, user: data.user, profile })
}
