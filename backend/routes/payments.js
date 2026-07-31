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

// ─── POST /submit ────────────────────────────────────────────────────────────
router.post('/submit', authMiddleware, async (req, res) => {
  try {
    const { amount, plan, utr } = req.body
    if (!amount || !plan || !utr) {
      return res.status(400).json({ error: 'amount, plan, and utr are required' })
    }

    const userId = req.user.id

    // Insert payment record
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        user_id: userId,
        amount,
        plan,
        utr,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select('*')
      .single()

    if (paymentError) {
      console.error('insert payment error:', paymentError.message)
      return res.status(500).json({ error: 'Failed to submit payment' })
    }

    // Update user payment_status to 'pending'
    const { error: userUpdateError } = await supabaseAdmin
      .from('users')
      .update({ payment_status: 'pending' })
      .eq('id', userId)

    if (userUpdateError) {
      console.error('update user payment_status error:', userUpdateError.message)
      // Non-fatal — payment record exists
    }

    res.status(201).json({ message: 'Payment submitted', payment })
  } catch (err) {
    console.error('submit payment error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── GET /history ────────────────────────────────────────────────────────────
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { data: payments, error } = await supabaseAdmin
      .from('payments')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('fetch payments error:', error.message)
      return res.status(500).json({ error: 'Failed to fetch payment history' })
    }

    res.json({ payments })
  } catch (err) {
    console.error('payment history error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
