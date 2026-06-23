import { createClient } from '@supabase/supabase-js';


const supabaseUrl = 'https://undyixtwcvuyuijecznd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuZHlpeHR3Y3Z1eXVpamVjem5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MjI3MzUsImV4cCI6MjA5NjQ5ODczNX0.03nWOaH0TlmnrBoSQn94pxjXt7OashKvc4v-3YuPdOA';

export const supabase = createClient(supabaseUrl, supabaseKey);

