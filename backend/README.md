# Backend

Node.js (JavaScript) API.

## Run
- Install: `npm install`
- Dev: `npm run dev`
- Health check: `GET http://localhost:4000/health`

## Auth check (Step 7)
- Protected route: `GET http://localhost:4000/me`
- Requires header: `Authorization: Bearer <SUPABASE_ACCESS_TOKEN>`
- Backend env needs: `SUPABASE_URL` and `SUPABASE_ANON_KEY`

## Notes API (Step 8)
- `GET /notes` → list notes (id, title, created_at)
- `GET /notes/:id` → get one note (title, content, created_at)
- `POST /notes` → create note `{ "title": "...", "content": "..." }`
- `DELETE /notes/:id` → delete note

All endpoints require `Authorization: Bearer <SUPABASE_ACCESS_TOKEN>`.
