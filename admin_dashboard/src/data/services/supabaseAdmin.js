import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://undyixtwcvuyuijecznd.supabase.co'; 

const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZHlpeHR3Y3Z1eXVpamVjem5kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDkyMjczNSwiZXhwIjoyMDk2NDk4NzM1fQ.K-ynMHo3AlB3TPP0gLtL5pBblDvSMs5J2qkLHB725Lo';

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);