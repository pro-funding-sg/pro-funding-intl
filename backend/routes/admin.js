import { Router } from 'express'
import { supabaseAdmin, supabase } from '../config/supabase.js'

const router = Router()

// Default admin email to seed
const DEFAULT_ADMIN_EMAIL = 'kmpyogi123@gmail.com'

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

/**
 * Ensure the seed admin exists and the caller is that admin.
 */
async function adminMiddleware(req, res, next) {
  try {
    // Get admin's profile row
    const { data: adminProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single()

    if (profileError || !adminProfile || !adminProfile.is_admin) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    req.adminProfile = adminProfile
    next()
  } catch (err) {
    return res.status(403).json({ error: 'Admin verification failed' })
  }
}

// ─── POST /login ─────────────────────────────────────────────────────────────
// Seed the default admin on first login attempt; then authenticate.
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Seed logic: if the login email matches the default admin and no admin exists, create one
    if (email === DEFAULT_ADMIN_EMAIL) {
      // Check if this user already exists in auth and has is_admin = true
      const { data: existingUsers } = await supabaseAdmin
        .from('users')
        .select('id, is_admin')
        .eq('email', DEFAULT_ADMIN_EMAIL)
        .limit(1)

      if (!existingUsers || existingUsers.length === 0) {
        // Seed: create auth user + profile with is_admin = true
        try {
          const { data: newAuthUser } = await supabaseAdmin.auth.admin.createUser({
            email: DEFAULT_ADMIN_EMAIL,
            password,
            email_confirm: true
          })

          await supabaseAdmin.from('users').insert({
            id: newAuthUser.user.id,
            email: DEFAULT_ADMIN_EMAIL,
            name: 'Admin',
            is_admin: true,
            created_at: new Date().toISOString()
          })
        } catch (seedErr) {
          // If user already exists in auth (duplicate), proceed to sign in
          console.log('Seed skipped — user may already exist:', seedErr.message)
        }
      }
    }

    // Attempt sign-in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return res.status(401).json({ error: error.message })
    }

    // Verify is_admin flag
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError || !profile || !profile.is_admin) {
      return res.status(403).json({ error: 'Not an admin account' })
    }

    res.json({
      message: 'Admin login successful',
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in
      },
      user: profile
    })
  } catch (err) {
    console.error('admin login error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── GET /users ──────────────────────────────────────────────────────────────
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('fetch users error:', error.message)
      return res.status(500).json({ error: 'Failed to fetch users' })
    }

    res.json({ users })
  } catch (err) {
    console.error('admin users error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── GET /payments ───────────────────────────────────────────────────────────
router.get('/payments', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { data: payments, error } = await supabaseAdmin
      .from('payments')
      .select('*, users(email, name)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('fetch payments error:', error.message)
      return res.status(500).json({ error: 'Failed to fetch payments' })
    }

    res.json({ payments })
  } catch (err) {
    console.error('admin payments error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── PUT /payments/:id ───────────────────────────────────────────────────────
router.put('/payments/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body // 'approved' or 'rejected'

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'status must be "approved" or "rejected"' })
    }

    // Update the payment status
    const { data: payment, error: updateError } = await supabaseAdmin
      .from('payments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single()

    if (updateError) {
      console.error('update payment error:', updateError.message)
      return res.status(500).json({ error: 'Failed to update payment' })
    }

    // Also update the user's payment_status
    const { error: userUpdateError } = await supabaseAdmin
      .from('users')
      .update({ payment_status: status })
      .eq('id', payment.user_id)

    if (userUpdateError) {
      console.error('update user payment_status error:', userUpdateError.message)
    }

    res.json({ message: `Payment ${status}`, payment })
  } catch (err) {
    console.error('admin update payment error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── GET /withdrawals ────────────────────────────────────────────────────────
router.get('/withdrawals', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { data: withdrawals, error } = await supabaseAdmin
      .from('withdrawals')
      .select('*, users(email, name)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('fetch withdrawals error:', error.message)
      return res.status(500).json({ error: 'Failed to fetch withdrawals' })
    }

    res.json({ withdrawals })
  } catch (err) {
    console.error('admin withdrawals error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── PUT /withdrawals/:id ────────────────────────────────────────────────────
router.put('/withdrawals/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status) {
      return res.status(400).json({ error: 'status is required' })
    }

    const { data: withdrawal, error } = await supabaseAdmin
      .from('withdrawals')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error('update withdrawal error:', error.message)
      return res.status(500).json({ error: 'Failed to update withdrawal' })
    }

    res.json({ message: `Withdrawal ${status}`, withdrawal })
  } catch (err) {
    console.error('admin update withdrawal error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── GET /stats ──────────────────────────────────────────────────────────────
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Total users
    const { count: totalUsers, error: countError } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })

    // Active accounts (payment_status = 'approved')
    const { count: activeAccounts, error: activeError } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'approved')

    // Sum of approved payments
    const { data: approvedPayments, error: sumError } = await supabaseAdmin
      .from('payments')
      .select('amount')
      .eq('status', 'approved')

    const totalCollected = approvedPayments
      ? approvedPayments.reduce((sum, p) => sum + Number(p.amount), 0)
      : 0

    if (countError || activeError || sumError) {
      return res.status(500).json({ error: 'Failed to fetch stats' })
    }

    res.json({
      stats: {
        totalUsers: totalUsers || 0,
        activeAccounts: activeAccounts || 0,
        totalCollected
      }
    })
  } catch (err) {
    console.error('admin stats error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
