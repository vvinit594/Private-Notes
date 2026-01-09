const { createClient } = require('@supabase/supabase-js');

function createSupabaseClientForRequest(req) {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
  }

  const authHeader = req.headers.authorization || '';

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        // Forward the user access token so Postgres RLS policies apply.
        Authorization: authHeader,
      },
    },
  });
}

module.exports = { createSupabaseClientForRequest };
