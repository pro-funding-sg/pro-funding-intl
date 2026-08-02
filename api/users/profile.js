import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  const auth = req.headers.authorization
  if (!auth) return res.status(401).json({ error: 'Unauthorized' })

  const token = auth.replace('Bearer ', '')
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
  if (authErr || !user) return res.status(401).json({ error: 'Invalid token' })

  // Try to get existing profile
  let { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // If no profile exists, auto-create one
  if (!profile || error) {
    const newProfile = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || '',
      phone: user.user_metadata?.phone || '',
      plan: 'none',
      payment_status: 'none'
    }
    await supabase.from('users').upsert(newProfile, { onConflict: 'id' })
    profile = newProfile
  }

  res.json(profile)
}
