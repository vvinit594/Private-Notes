export function getBackendUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "https://private-notes-backend.onrender.com";

  // Normalize to avoid double slashes when concatenating with paths like "/notes".
  return raw.replace(/\/+$/, "");
}
