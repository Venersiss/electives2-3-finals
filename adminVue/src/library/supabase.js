import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
   'https://xivybitbnmdubnpztxrf.supabase.co',
   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpdnliaXRibm1kdWJucHp0eHJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5Nzc4NTYsImV4cCI6MjA4MDU1Mzg1Nn0.g5DOQzR5wJfhtpdfnx5i8g68tZyuBUHNWCIBsw40XfU'
)

export { supabase }
