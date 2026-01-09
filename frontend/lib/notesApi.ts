import { getBackendUrl } from "@/lib/backend";

export type NoteListItem = {
  id: string;
  title: string;
  created_at: string;
};

export type Note = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
};

async function apiFetch(path: string, accessToken: string, init?: RequestInit) {
  const res = await fetch(`${getBackendUrl()}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data?.error || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export async function listNotes(accessToken: string): Promise<NoteListItem[]> {
  const data = await apiFetch("/notes", accessToken);
  return (data as { notes: NoteListItem[] }).notes;
}

export async function getNote(accessToken: string, id: string): Promise<Note> {
  const data = await apiFetch(`/notes/${id}`, accessToken);
  return (data as { note: Note }).note;
}

export async function createNote(
  accessToken: string,
  input: { title: string; content: string },
): Promise<Omit<Note, "user_id">> {
  const data = await apiFetch("/notes", accessToken, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return (data as { note: Omit<Note, "user_id"> }).note;
}

export async function deleteNote(accessToken: string, id: string): Promise<void> {
  await apiFetch(`/notes/${id}`, accessToken, { method: "DELETE" });
}
