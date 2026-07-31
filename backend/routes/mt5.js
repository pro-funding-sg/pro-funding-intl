import { Router } from 'express'
import fetch from 'node-fetch'
import { supabaseAdmin } from '../config/supabase.js'

const router = Router()

// Plan → starting balance mapping
const PLAN_BALANCES = {
  Starter: 1000,
  Standard: 5000,
  Premium: 10000
}

// MetaApi configuration from environment
const METAAPI_BASE = process.env.METAAPI_BASE_URL || 'https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai'
const METAAPI_TOKEN = process.env.METAAPI_AUTH_TOKEN || ''

/**
 * Helper: extract and verify Bearer token, return user or 401.
 */
async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' })
    }
    const token = header.split(' ')[1]
    const { data, error } = await supabaseAdmin.auth.getUser(token)
    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }
    req.user = data.user
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Authentication failed' })
  }
}

// ─── POST /create-account ────────────────────────────────────────────────────
router.post('/create-account', authMiddleware, async (req, res) => {
  try {
    const { user_id } = req.body
    const targetUserId = user_id || req.user.id

    // Only allow creating for self, or admin check can be added here
    // For now, allow the authenticated user to create for themselves
    // If user_id differs from req.user.id, admin check would be needed
    if (targetUserId !== req.user.id) {
      return res.status(403).json({ error: 'Cannot create MT5 account for another user' })
    }

    // Fetch user profile to determine plan
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', targetUserId)
      .single()

    if (profileError || !profile) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Check if user already has an MT5 account
    if (profile.mt5_login) {
      return res.status(400).json({
        error: 'MT5 account already exists',
        mt5_login: profile.mt5_login,
        mt5_server: profile.mt5_server
      })
    }

    // Determine plan — from profile.payment_plan or profile.plan field
    const userPlan = profile.payment_plan || profile.plan
    if (!userPlan || !PLAN_BALANCES[userPlan]) {
      return res.status(400).json({
        error: `Invalid or missing plan. Available plans: ${Object.keys(PLAN_BALANCES).join(', ')}`
      })
    }

    const balance = PLAN_BALANCES[userPlan]

    // Call MetaApi provisioning API to create MT5 account
    const payload = {
      name: profile.name || profile.email,
      type: 'cloud-g2',
      login: `${targetUserId.substring(0, 8)}`, // use portion of UUID as login hint
      balance,
      leverage: 100,
      platform: 'mt5',
      application: 'MetaApi',
      manualTrades: true,
      magic: 0,
      description: `Prop firm account — ${userPlan} plan`
    }

    console.log('MetaApi provisioning payload:', JSON.stringify(payload, null, 2))

    let mt5Login = null
    let mt5Password = null
    let mt5Server = null

    if (METAAPI_TOKEN) {
      try {
        const response = await fetch(`${METAAPI_BASE}/users/current/provisioning-profiles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': METAAPI_TOKEN
          },
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          const errBody = await response.text()
          console.error('MetaApi provisioning failed:', response.status, errBody)
          return res.status(502).json({
            error: 'MT5 provisioning failed',
            details: errBody
          })
        }

        const result = await response.json()
        console.log('MetaApi response:', JSON.stringify(result, null, 2))

        mt5Login = result.login
        mt5Password = result.password
        mt5Server = result.server || result.broker
      } catch (fetchErr) {
        console.error('MetaApi fetch error:', fetchErr.message)
        return res.status(502).json({ error: 'Failed to reach MT5 provisioning service' })
      }
    } else {
      // No MetaApi token configured — generate placeholder credentials for development
      console.warn('METAAPI_AUTH_TOKEN not set — using placeholder MT5 credentials')
      mt5Login = Math.floor(10000000 + Math.random() * 90000000).toString()
      mt5Password = Math.random().toString(36).substring(2, 10).toUpperCase()
      mt5Server = 'MetaQuotes-Demo'
    }

    // Update user record with MT5 credentials
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        mt5_login: mt5Login,
        mt5_password: mt5Password,
        mt5_server: mt5Server,
        mt5_balance: balance,
        mt5_plan: userPlan
      })
      .eq('id', targetUserId)

    if (updateError) {
      console.error('update user mt5 error:', updateError.message)
      return res.status(500).json({ error: 'Failed to save MT5 credentials to user profile' })
    }

    res.status(201).json({
      message: 'MT5 account created successfully',
      account: {
        user_id: targetUserId,
        plan: userPlan,
        balance,
        mt5_login: mt5Login,
        mt5_password: mt5Password,
        mt5_server: mt5Server
      }
    })
  } catch (err) {
    console.error('create mt5 account error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── GET /status/:userId ─────────────────────────────────────────────────────
router.get('/status/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params

    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email, mt5_login, mt5_password, mt5_server, mt5_balance, mt5_plan')
      .eq('id', userId)
      .single()

    if (error || !profile) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (!profile.mt5_login) {
      return res.json({
        status: 'not_created',
        user_id: userId,
        message: 'No MT5 account found for this user'
      })
    }

    res.json({
      status: 'active',
      account: {
        user_id: profile.id,
        mt5_login: profile.mt5_login,
        mt5_server: profile.mt5_server,
        mt5_balance: profile.mt5_balance,
        mt5_plan: profile.mt5_plan
      }
    })
  } catch (err) {
    console.error('mt5 status error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
