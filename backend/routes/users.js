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

// ─── GET /profile ────────────────────────────────────────────────────────────
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single()

    if (error || !profile) {
      return res.status(404).json({ error: 'Profile not found' })
    }

    res.json({ user: profile })
  } catch (err) {
    console.error('get profile error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── PUT /profile ────────────────────────────────────────────────────────────
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone } = req.body
    const updates = {}

    if (name !== undefined) updates.name = name
    if (phone !== undefined) updates.phone = phone

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No fields to update (name, phone)' })
    }

    const { data: updated, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select('*')
      .single()

    if (error) {
      console.error('update profile error:', error.message)
      return res.status(500).json({ error: 'Failed to update profile' })
    }

    res.json({ message: 'Profile updated', user: updated })
  } catch (err) {
    console.error('update profile error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
