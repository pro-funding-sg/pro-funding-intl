import { Router } from 'express'
import { supabaseAdmin } from '../config/supabase.js'

const router = Router()

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

// ─── POST /request ───────────────────────────────────────────────────────────
router.post('/request', authMiddleware, async (req, res) => {
  try {
    const { amount, upi_id, bank_details } = req.body
    if (!amount || !upi_id) {
      return res.status(400).json({ error: 'amount and upi_id are required' })
    }

    const { data: withdrawal, error } = await supabaseAdmin
      .from('withdrawals')
      .insert({
        user_id: req.user.id,
        amount,
        upi_id,
        bank_details: bank_details || null,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select('*')
      .single()

    if (error) {
      console.error('insert withdrawal error:', error.message)
      return res.status(500).json({ error: 'Failed to submit withdrawal request' })
    }

    res.status(201).json({ message: 'Withdrawal request submitted', withdrawal })
  } catch (err) {
    console.error('withdrawal request error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── GET /history ────────────────────────────────────────────────────────────
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { data: withdrawals, error } = await supabaseAdmin
      .from('withdrawals')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('fetch withdrawals error:', error.message)
      return res.status(500).json({ error: 'Failed to fetch withdrawal history' })
    }

    res.json({ withdrawals })
  } catch (err) {
    console.error('withdrawal history error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
