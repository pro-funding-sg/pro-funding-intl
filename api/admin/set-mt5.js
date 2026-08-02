import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const { userId, mt5_login, mt5_password, mt5_server, plan } = req.body || {}

  if (!userId || !mt5_login) {
    return res.status(400).json({ error: 'userId and mt5_login required' })
  }

  const { error } = await supabase.from('users').update({
    mt5_login,
    mt5_password: mt5_password || '',
    mt5_server: mt5_server || 'MetaQuotes-Demo',
    payment_status: 'approved',
    plan: plan || 'Standard'
  }).eq('id', userId)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true, mt5_login, mt5_server: mt5_server || 'MetaQuotes-Demo' })
}
