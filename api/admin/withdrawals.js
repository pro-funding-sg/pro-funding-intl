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

  if (req.method === 'PUT') {
    const { id, status, transaction_ref, admin_note } = req.body || {}
    const updateData = { status }
    if (transaction_ref) updateData.transaction_ref = transaction_ref
    if (admin_note) updateData.admin_note = admin_note

    const { data: w, error } = await supabase
      .from('withdrawals')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single()

    if (error) return res.status(500).json({ error: error.message })
    return res.json({ withdrawal: w })
  }

  // GET — fetch with user details
  const { data: withdrawals, error } = await supabase
    .from('withdrawals')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })

  // Enrich with user data
  const enriched = await Promise.all((withdrawals || []).map(async (w) => {
    if (w.user_id) {
      const { data: user } = await supabase.from('users').select('email,name').eq('id', w.user_id).single()
      return { ...w, email: user?.email || '', user_name: user?.name || '' }
    }
    return w
  }))

  res.json({ withdrawals: enriched })
}
