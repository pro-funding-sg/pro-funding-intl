import { Router } from 'express'
import { supabaseAdmin } from '../config/supabase.js'

const router = Router()

// POST /track — log a page view
router.post('/track', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  
  const { page, referrer } = req.body || {}
  const ip = req.headers['x-forwarded-for'] || '0.0.0.0'
  const ua = (req.headers['user-agent'] || '').slice(0, 200)
  const visitorHash = ip + ua.slice(0, 30)

  try {
    await supabaseAdmin.from('analytics').insert({
      page: page || '/',
      referrer: referrer || '',
      visitor_hash: visitorHash,
      user_agent: ua,
      created_at: new Date().toISOString()
    })
  } catch(e) { /* silent */ }

  res.json({ ok: true })
})

// GET /stats — return analytics
router.get('/stats', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  
  const { data: all, error } = await supabaseAdmin
    .from('analytics')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error || !all) return res.status(500).json({ error: error?.message })

  const totalVisits = all.length
  const uniqueVisitors = new Set(all.filter(r => r.visitor_hash).map(r => r.visitor_hash)).size
  const pages = {}
  all.forEach(r => { pages[r.page] = (pages[r.page] || 0) + 1 })
  const topPages = Object.entries(pages).sort((a,b) => b[1] - a[1]).slice(0, 10).map(([page, count]) => ({ page, count }))

  res.json({ totalVisits, uniqueVisitors, topPages, lastVisit: all[0]?.created_at, recent: all.slice(0, 10) })
})

export default router
