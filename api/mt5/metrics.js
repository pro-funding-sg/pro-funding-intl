import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { mt5_login, user_id } = req.query

  // Resolve login from user_id if needed
  let login = mt5_login
  if (!login && user_id) {
    const { data: user } = await supabase.from('users').select('mt5_login').eq('id', user_id).single()
    login = user?.mt5_login || ''
  }

  if (!login) {
    return res.json({ connected: false, message: 'No MT5 account assigned. Contact support.' })
  }

  const METAAPI_TOKEN = process.env.METAAPI_TOKEN
  const METAAPI_BASE = 'https://mt-client-api-v1.agiliumtrade.agiliumtrade.ai'

  if (!METAAPI_TOKEN) {
    return res.json({ connected: false, message: 'MT5 bridge offline — contact support.' })
  }

  // Try REAL MetaAPI connection
  try {
    // Step 1: Find the account by login
    const findUrl = `${METAAPI_BASE}/users/current/accounts?login=${encodeURIComponent(login)}&limit=10`
    console.log('Looking up account:', findUrl)

    const findRes = await fetch(findUrl, {
      headers: { 'auth-token': METAAPI_TOKEN }
    })

    if (!findRes.ok) {
      console.error('MetaAPI find error:', findRes.status, await findRes.text())
      return res.json({ connected: false, message: 'MT5 account lookup failed. Please try again later.' })
    }

    const accounts = await findRes.json()

    if (!accounts || accounts.length === 0) {
      return res.json({ connected: false, message: `MT5 account ${login} not found. Please trade on MT5 first.` })
    }

    const account = accounts[0]
    console.log('Found account:', account._id, 'login:', account.login)

    // Step 2: Get account state (real-time balance, equity, profit)
    const stateUrl = `${METAAPI_BASE}/users/current/accounts/${account._id}/state`
    const stateRes = await fetch(stateUrl, {
      headers: { 'auth-token': METAAPI_TOKEN }
    })

    if (!stateRes.ok) {
      console.error('MetaAPI state error:', stateRes.status)
      return res.json({
        connected: false,
        message: 'MT5 account found but state unavailable. Start MetaTrader 5 and connect your account.'
      })
    }

    const state = await stateRes.json()

    // Calculate metrics
    const balance = state.balance || 0
    const equity = state.equity || 0
    const profit = state.profit || 0
    const margin = state.margin || 0
    const freeMargin = (state.marginFree || state.freeMargin || 0)

    // Get account info for initial balance
    let initialBalance = balance
    try {
      const infoRes = await fetch(`${METAAPI_BASE}/users/current/accounts/${account._id}/account-information`, {
        headers: { 'auth-token': METAAPI_TOKEN }
      })
      if (infoRes.ok) {
        const info = await infoRes.json()
        initialBalance = info.balance || balance
      }
    } catch (e) { /* use current balance */ }

    const profitPct = initialBalance > 0
      ? parseFloat(((equity - initialBalance) / initialBalance * 100).toFixed(1))
      : 0

    return res.json({
      connected: true,
      balance,
      equity,
      profit,
      margin,
      freeMargin,
      profitPct,
      dailyDrawdown: 0,
      totalDrawdown: 0,
      profitTarget: 8,
      rulesBreached: false
    })
  } catch (e) {
    console.error('MetaAPI exception:', e.message)
    return res.json({
      connected: false,
      message: 'Could not connect to MT5 bridge. Please ensure MetaTrader 5 is running and your account is connected.'
    })
  }
}
