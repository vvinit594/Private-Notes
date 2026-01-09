# Step 4–5: Notes Schema + RLS

## Run schema SQL
1. Open Supabase Dashboard → **SQL Editor**
2. Paste and run: `supabase/notes.sql`

## Run RLS SQL
1. In SQL Editor, paste and run: `supabase/rls.sql`

## Quick sanity check (optional)
- Go to **Table Editor → notes**
- Ensure RLS is enabled
- Policies should show 3 policies: select/insert/delete

RLS is what enforces ownership at the database level: a user can only read/insert/delete rows where `user_id = auth.uid()`.
