import { Router } from 'express'
import { supabaseAdmin, supabase } from '../config/supabase.js'

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

// ─── POST /signup ────────────────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, phone } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Create user via admin API (bypasses email confirmation)
    const { data: authUser, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, phone }
      })

    if (createError) {
      console.error('createUser error:', createError.message)
      return res.status(400).json({ error: createError.message })
    }

    const userId = authUser.user.id

    // Insert profile row into users table
    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email,
        name: name || '',
        phone: phone || '',
        created_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('insert user error:', insertError.message)
      // Best-effort: delete the auth user if profile insert fails
      await supabaseAdmin.auth.admin.deleteUser(userId)
      return res.status(500).json({ error: 'Failed to create user profile' })
    }

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: userId,
        email,
        name: name || '',
        phone: phone || ''
      }
    })
  } catch (err) {
    console.error('signup error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── POST /login ─────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return res.status(401).json({ error: error.message })
    }

    // Fetch profile from users table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    res.json({
      message: 'Login successful',
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in
      },
      user: profileError ? { id: data.user.id, email: data.user.email } : profile
    })
  } catch (err) {
    console.error('login error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ─── GET /me ─────────────────────────────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
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
    console.error('me error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
