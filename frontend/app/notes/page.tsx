"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { getAccessToken } from "@/lib/auth";
import { createNote, listNotes, type NoteListItem } from "@/lib/notesApi";

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

export default function NotesListPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<NoteListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const empty = useMemo(() => !loading && !error && notes.length === 0, [loading, error, notes]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const token = await getAccessToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const items = await listNotes(token);
        if (!cancelled) setNotes(items);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load notes");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      // If user logs out in another tab, return to login.
      run();
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const t = title.trim();
    const c = content.trim();

    if (!t || !c) {
      setError("Title and content are required.");
      return;
    }

    const token = await getAccessToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setCreating(true);
    try {
      const created = await createNote(token, { title: t, content: c });
      setNotes((prev) => [
        { id: created.id, title: created.title, created_at: created.created_at },
        ...prev,
      ]);
      setTitle("");
      setContent("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create note");
    } finally {
      setCreating(false);
    }
  }

  async function onLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-black">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold tracking-tight">Notes</h1>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
            >
              Log out
            </button>
          </div>

          <form onSubmit={onCreate} className="mt-8 space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black"
              placeholder="Title"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Content</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black"
              placeholder="Write your note…"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {creating ? "Saving…" : "Save"}
          </button>
          </form>

          <div className="mt-8">
          {loading ? <p className="text-sm text-neutral-700">Loading…</p> : null}

          {error ? (
            <p className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm">
              {error}
            </p>
          ) : null}

          {empty ? (
            <p className="text-sm text-neutral-700">No notes yet.</p>
          ) : null}

          {!loading && !error && notes.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {notes.map((n) => (
                <li
                  key={n.id}
                  className="rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-300"
                >
                  <Link href={`/notes/${n.id}`} className="block">
                    <div className="flex items-start justify-between gap-6">
                      <h2 className="text-base font-medium leading-6">{n.title}</h2>
                      <span className="shrink-0 text-xs text-neutral-600">
                        {formatDate(n.created_at)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
