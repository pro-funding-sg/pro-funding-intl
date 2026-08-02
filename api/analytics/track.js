import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { page, referrer } = req.body || {}
  const ip = req.headers['x-forwarded-for'] || '0.0.0.0'
  const ua = (req.headers['user-agent'] || '').slice(0, 200)
  const visitorHash = ip + ua.slice(0, 30)

  try {
    await supabase.from('analytics').insert({
      page: page || '/',
      referrer: referrer || '',
      visitor_hash: visitorHash,
      user_agent: ua,
      created_at: new Date().toISOString()
    })
  } catch(e) { /* silent */ }

  res.json({ ok: true })
}
