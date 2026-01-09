# Supabase Setup (Step 3)

This project uses Supabase for:
- Authentication (Email/Password + Google OAuth)
- Postgres database (notes table)
- Row Level Security (RLS) policies to ensure each user can only access their own notes

## 1) Create a Supabase project
1. Go to https://supabase.com and sign in.
2. Click **New project**.
3. Choose an organization.
4. Set:
   - **Project name**: `private-notes-vault` (any name is fine)
   - **Database password**: save it somewhere safe
   - **Region**: closest to you
5. Create the project and wait until it finishes provisioning.

## 2) Grab your project API settings (you will need these later)
In Supabase dashboard:
- Go to **Project Settings → API**
- Copy:
  - **Project URL**  → this becomes `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL`
  - **anon public key** → this becomes `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - **service_role key** → this becomes `SUPABASE_SERVICE_ROLE_KEY` (server-only; never expose in frontend)

## 3) Enable Email + Password auth
- Go to **Authentication → Providers**
- Ensure **Email** provider is enabled.

Recommended (optional but good practice):
- Confirm email setting depends on your preference:
  - For simple testing you can turn OFF email confirmations.
  - For a more realistic flow you can keep confirmations ON.

## 4) Set up Google OAuth
### 4.1 Create OAuth credentials in Google Cloud
1. Go to https://console.cloud.google.com/
2. Create (or select) a project.
3. Go to **APIs & Services → OAuth consent screen**
   - Choose **External** (usually)
   - Fill required fields (app name, support email)
   - Add yourself as a test user if in testing mode
4. Go to **APIs & Services → Credentials**
5. Click **Create credentials → OAuth client ID**
6. Choose **Web application**
7. Add **Authorized redirect URIs**:

Local dev (we’ll use Next.js on port 3000):
- `http://localhost:3000/auth/callback`

Production (update after deploy):
- `https://<your-frontend-domain>/auth/callback`

8. Create the client and copy:
- **Client ID**
- **Client secret**

### 4.2 Configure Google provider in Supabase
1. In Supabase dashboard go to **Authentication → Providers → Google**
2. Enable Google
3. Paste the **Client ID** and **Client secret**
4. Save

## 5) Configure redirect URLs in Supabase
In Supabase dashboard:
- Go to **Authentication → URL Configuration**
- Set **Site URL**:
  - Local dev: `http://localhost:3000`
  - Production: `https://<your-frontend-domain>` (update later)
- Add **Redirect URLs** (allow-list):
  - `http://localhost:3000/auth/callback`
  - `https://<your-frontend-domain>/auth/callback`

## 6) What you should have at the end of Step 3
- A Supabase project created
- Email provider enabled
- Google OAuth enabled and configured
- You have these 3 secrets/values ready:
  - `SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only)

Next step (Step 4/5) will create the `notes` table and add RLS policies so notes are private by default.
