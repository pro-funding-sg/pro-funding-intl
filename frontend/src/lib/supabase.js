import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://upcbhnszdtalizykmrpf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwY2JobnN6ZHRhbGl6eWttcnBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1MTQ1MDgsImV4cCI6MjEwMTA5MDUwOH0.ywwXvFlLRb7nYSlIg-5Nm1OXZ3hnH5spunZUkPEEZaU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
