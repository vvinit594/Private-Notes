# Private Notes Vault

## Overview
Private Notes Vault is a full-stack notes app where users can sign in and manage private notes tied to their account. Notes are stored in Supabase Postgres and protected with Row Level Security (RLS) so each user can only access their own notes.

## Features
- Email/password authentication + Google OAuth (Supabase Auth)
- Create, list, view, and delete notes
- Strict per-user data isolation enforced by Supabase RLS policies
- Frontend calls a Node/Express API, which validates the user token via Supabase

## Tech Stack
- Frontend: Next.js (App Router) + TypeScript + Tailwind
- Backend: Node.js + Express (JavaScript)
- Auth/DB: Supabase Auth + Supabase Postgres

## Repo Layout
- `frontend/` — Next.js (TypeScript)
- `backend/` — Node.js API (JavaScript)
- `supabase/` — SQL for schema + RLS
- `docs/` — setup notes

## Prerequisites
- Node.js 18+ installed
- A Supabase project (URL + anon key)
- (Optional) Google OAuth configured in Supabase for Google sign-in

## Environment Variables

### Backend (`backend/.env`)
- `SUPABASE_URL` (required)
- `SUPABASE_ANON_KEY` (required)
- `CORS_ORIGIN` (optional, default `http://localhost:3000`) — comma-separated allowed origins
- `BACKEND_PORT` (optional for local dev; Render uses `PORT` automatically)

### Frontend (`frontend/.env.local`)
- `NEXT_PUBLIC_SUPABASE_URL` (required)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (required)
- `NEXT_PUBLIC_BACKEND_URL` (optional, default `http://localhost:4000`)

## Supabase Setup (DB + RLS)
Run the SQL in:
- `supabase/notes.sql` (table + index)
- `supabase/rls.sql` (enable RLS + per-user policies)

## Run Locally

### 1) Backend
```bash
cd backend
npm install
npm run dev
```
Backend runs at http://localhost:4000

### 2) Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at http://localhost:3000

## Deployment (Render)
This project is designed to be deployed as two Render Web Services:

### Backend (Render Web Service)
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Env Vars: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `CORS_ORIGIN=https://YOUR-FRONTEND.onrender.com`

### Frontend (Render Web Service)
- Root Directory: `frontend`
- Build Command: `npm install; npm run build`
- Start Command: `npm start`
- Env Vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_BACKEND_URL=https://YOUR-BACKEND.onrender.com`

After deploying, update Supabase Auth URL settings:
- Site URL: `https://YOUR-FRONTEND.onrender.com`
- Redirect URLs: add `https://YOUR-FRONTEND.onrender.com/auth/callback`
