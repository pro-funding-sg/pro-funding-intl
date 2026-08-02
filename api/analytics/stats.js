import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { data: all, error } = await supabase
    .from('analytics')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error || !all) return res.status(500).json({ error: error?.message })

  const totalVisits = all.length
  const uniqueVisitors = new Set(all.filter(r => r.visitor_hash).map(r => r.visitor_hash)).size
  const pages = {}
  all.forEach(r => { pages[r.page] = (pages[r.page] || 0) + 1 })
  const topPages = Object.entries(pages)
    .sort((a,b) => b[1] - a[1])
    .slice(0, 10)
    .map(([page, count]) => ({ page, count }))

  const referrers = {}
  all.filter(r => r.referrer).forEach(r => {
    const domain = r.referrer.replace(/https?:\/\//,'').split('/')[0]
    referrers[domain] = (referrers[domain] || 0) + 1
  })
  const topReferrers = Object.entries(referrers)
    .sort((a,b) => b[1] - a[1])
    .slice(0, 5)

  const lastVisit = all[0]?.created_at || null

  res.json({
    totalVisits,
    uniqueVisitors,
    topPages,
    topReferrers,
    lastVisit,
    recent: all.slice(0, 15).map(r => ({
      page: r.page,
      referrer: r.referrer || 'direct',
      time: r.created_at
    }))
  })
}
