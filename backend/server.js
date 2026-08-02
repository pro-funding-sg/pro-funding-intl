import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import paymentRoutes from './routes/payments.js'
import withdrawalRoutes from './routes/withdrawals.js'
import adminRoutes from './routes/admin.js'
import analyticsRoutes from "./routes/analytics.js"
import mt5Routes from "./routes/mt5.js"

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/withdrawals', withdrawalRoutes)
app.use('/api/admin', adminRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/mt5", mt5Routes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Serve frontend static files (local only, not on Vercel)
if (!process.env.VERCEL) {
  const frontendDist = path.join(__dirname, '..', 'frontend', 'dist')
  app.use(express.static(frontendDist))
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'))
  })
}

// Only listen locally — Vercel serverless handles this automatically
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

export default app
