"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/auth";
import { deleteNote, getNote, type Note } from "@/lib/notesApi";

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

export default function NoteDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string | string[] }>();
  const noteId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!noteId) {
        setError("Invalid note id");
        setLoading(false);
        return;
      }

      const token = await getAccessToken();
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const data = await getNote(token, noteId);
        if (!cancelled) setNote(data);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load note");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [noteId, router]);

  async function onDelete() {
    if (!note) return;
    const ok = window.confirm("Delete this note?");
    if (!ok) return;

    const token = await getAccessToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    setDeleting(true);
    try {
      await deleteNote(token, note.id);
      router.replace("/notes");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete note");
      setDeleting(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-black">
          <Link
            href="/notes"
            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700"
            aria-label="Back to notes"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span className="underline underline-offset-4">Back</span>
          </Link>

          <div className="mt-8">
          {loading ? <p className="text-sm text-neutral-700">Loading…</p> : null}

          {error ? (
            <p className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm">
              {error}
            </p>
          ) : null}

          {!loading && !error && note ? (
            <article className="space-y-3">
              <h1 className="text-2xl font-semibold tracking-tight">{note.title}</h1>
              <div className="flex items-center justify-between gap-6">
                <p className="text-xs text-neutral-600">{formatDate(note.created_at)}</p>
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700 disabled:opacity-50"
                  aria-label="Delete note"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M6 6l1 16h10l1-16" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                  </svg>
                  <span className="underline underline-offset-4">{deleting ? "Deleting…" : "Delete"}</span>
                </button>
              </div>
              <p className="whitespace-pre-wrap text-base leading-7">{note.content}</p>
            </article>
          ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
