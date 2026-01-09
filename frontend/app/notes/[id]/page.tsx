"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/auth";
import { deleteNote, getNote, updateNote, type Note } from "@/lib/notesApi";

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
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

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
        if (!cancelled) {
          setNote(data);
          setTitle(data.title);
          setContent(data.content);
        }
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

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!note) return;

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

    setSaving(true);
    try {
      const updated = await updateNote(token, note.id, { title: t, content: c });
      setNote(updated);
      setTitle(updated.title);
      setContent(updated.content);
      setEditing(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to update note");
    } finally {
      setSaving(false);
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
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {editing ? "Edit note" : note.title}
                  </h1>
                  <p className="mt-2 text-xs text-neutral-600">{formatDate(note.created_at)}</p>
                </div>

                <div className="flex items-center gap-4">
                  {!editing ? (
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setTitle(note.title);
                        setContent(note.content);
                        setEditing(true);
                      }}
                      className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700"
                      aria-label="Edit note"
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
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                      </svg>
                      <span className="underline underline-offset-4">Edit</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setTitle(note.title);
                        setContent(note.content);
                        setEditing(false);
                      }}
                      className="text-sm font-medium text-neutral-700 underline underline-offset-4"
                    >
                      Cancel
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={onDelete}
                    disabled={deleting || saving}
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
                    <span className="underline underline-offset-4">
                      {deleting ? "Deleting…" : "Delete"}
                    </span>
                  </button>
                </div>
              </div>

              {editing ? (
                <form onSubmit={onSave} className="mt-6 space-y-3">
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
                      rows={8}
                      className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black"
                      placeholder="Write your note…"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                </form>
              ) : (
                <p className="whitespace-pre-wrap text-base leading-7">{note.content}</p>
              )}
            </article>
          ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
