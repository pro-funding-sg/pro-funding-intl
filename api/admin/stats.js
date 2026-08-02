import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")
  if (req.method === "OPTIONS") return res.status(200).end()
  try {
    const [{ count: totalUsers }, { count: activeAccounts }, { data: payments }] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).neq('plan', 'none'),
      supabase.from('payments').select('amount').eq('status', 'approved')
    ])

    const totalCollected = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

    res.json({ totalUsers, activeAccounts, totalCollected })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
