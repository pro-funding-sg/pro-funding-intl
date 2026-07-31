import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import dotenv from 'dotenv'
import WebSocket from 'ws'

dotenv.config({ path: new URL('../.env', import.meta.url).pathname })

const supabaseUrl = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: WebSocket }
})

const schemaSQL = readFileSync(new URL('./schema.sql', import.meta.url).pathname, 'utf-8')

async function runMigration() {
  console.log('Starting migration...')
  
  // Split into individual statements
  const statements = schemaSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))
  
  for (const stmt of statements) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: stmt + ';' })
      if (error) {
        // Try direct SQL via REST API
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': serviceKey,
            'Authorization': `Bearer ${serviceKey}`
          },
          body: JSON.stringify({ sql: stmt + ';' })
        })
        const result = await response.json()
        if (!response.ok && result.message !== 'duplicate key value violates unique constraint') {
          console.log(`Statement result [${stmt.substring(0, 60)}...]:`, response.status, result)
        }
      }
    } catch (e) {
      console.log(`Statement skipped [${stmt.substring(0, 60)}...]:`, e.message)
    }
  }
  
  console.log('Migration complete!')
  
  // Seed admin user
  console.log('Seeding admin user...')
  const { data: existingUsers, error: checkError } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'kmpyogi123@gmail.com')
  
  if (checkError) {
    // Table might not exist yet, try to create the admin via auth
    try {
      const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
        email: 'kmpyogi123@gmail.com',
        password: 'Admin@123456',
        email_confirm: true
      })
      
      if (createError && createError.message.includes('already')) {
        console.log('Admin user already exists in auth')
      } else if (authUser) {
        console.log('Created admin auth user:', authUser.user.id)
        
        const { error: insertError } = await supabase
          .from('users')
          .upsert({
            id: authUser.user.id,
            email: 'kmpyogi123@gmail.com',
            name: 'Admin',
            is_admin: true,
            plan: 'none',
            payment_status: 'none'
          })
        
        if (insertError) {
          console.log('Insert admin profile error:', insertError.message)
        } else {
          console.log('Admin profile created with is_admin=true')
        }
      }
    } catch (e) {
      console.log('Admin seeding error:', e.message)
    }
  } else if (existingUsers.length === 0) {
    console.log('Need to create admin user via auth API')
  } else {
    // Update existing to admin
    const { error: updateError } = await supabase
      .from('users')
      .update({ is_admin: true })
      .eq('email', 'kmpyogi123@gmail.com')
    
    if (updateError) console.log('Update admin error:', updateError.message)
    else console.log('Admin user updated with is_admin=true')
  }
}

runMigration().catch(e => console.error('Migration failed:', e.message))
