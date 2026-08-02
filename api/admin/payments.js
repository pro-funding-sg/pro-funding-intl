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
  if (req.method === 'PUT' || req.method === 'PATCH') {
    const id = req.url.split('/').pop()
    const { status } = req.body || {}

    const { data: payment, error } = await supabase
      .from('payments')
      .update({ status })
      .eq('id', id)
      .select('*')
      .single()

    if (error) return res.status(500).json({ error: error.message })

    // Update user payment_status
    if (payment) {
      await supabase.from('users').update({ payment_status: status }).eq('id', payment.user_id)
    }

    return res.json({ payment })
  }

  const { data: payments, error } = await supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.json({ payments })
}
