import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { email, password, name, phone } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { name: name || '', phone: phone || '' }
    })
    if (error) return res.status(400).json({ error: error.message })
    res.status(201).json({ message: 'User created', user: { id: data.user.id, email, name: name || '', phone: phone || '' } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
