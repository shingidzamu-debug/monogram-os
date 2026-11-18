import { createClient } from '@supabase/supabase-js';

// The publishable key is meant for browser code: row level security on
// public.studio_state limits every signed-in user to their own row.
// Override both with NEXT_PUBLIC_* env vars to point at another project.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yytentaxigdswtsqlwtt.supabase.co';
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_hR0ZJOEmt6NR6OoPNb_LjA_ArmD-lwN';

export const supabase = createClient(url, key, {
  auth: { flowType: 'implicit', persistSession: true, detectSessionInUrl: true },
});
