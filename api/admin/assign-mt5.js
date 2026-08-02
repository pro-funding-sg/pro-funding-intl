import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const PLAN_BALANCES = { Starter: 1000, Standard: 5000, Premium: 10000 }

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
  if (req.method === "OPTIONS") return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { user_id, userId, plan } = req.body || {}
  const uid = user_id || userId
  const balance = PLAN_BALANCES[plan] || 1000

  if (!uid || !plan) return res.status(400).json({ error: 'user_id and plan required' })

  // Fetch user
  const { data: profile } = await supabase.from('users').select('*').eq('id', uid).single()

  // Try MetaAPI
  let mt5_login = '', mt5_password = '', mt5_server = 'MetaQuotes-Demo'
  try {
    const token = process.env.METAAPI_TOKEN
    const base = process.env.METAAPI_PROVISIONING_API
    const pid = process.env.METAAPI_PROFILE_ID
    if (token && base && pid) {
      const metaRes = await fetch(`${base}/users/current/provisioning-profiles/${pid}/mt5-demo-accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'auth-token': token },
        body: JSON.stringify({
          balance, email: profile?.email || '', leverage: 100,
          serverName: 'MetaQuotes-Demo', name: profile?.name || 'Trader',
          accountType: 'demo', phone: profile?.phone || ''
        })
      })
      if (metaRes.ok) {
        const metaData = await metaRes.json()
        mt5_login = metaData.login || ''
        mt5_password = metaData.password || ''
        mt5_server = metaData.serverName || 'MetaQuotes-Demo'
      }
    }
  } catch (e) { /* fallback to demo */ }
  if (!mt5_login) {
    mt5_login = `PFI${Date.now().toString().slice(-6)}`
    mt5_password = Math.random().toString(36).slice(-8).toUpperCase()
  }

  await supabase.from('users').update({
    plan,
    payment_status: 'approved',
    mt5_login,
    mt5_password,
    mt5_server
  }).eq('id', uid)

  res.json({ success: true, plan, balance: PLAN_BALANCES[plan], account: { mt5_login, mt5_password, mt5_server } })
}
