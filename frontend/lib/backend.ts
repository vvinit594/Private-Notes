export function getBackendUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "https://private-notes-backend.onrender.com"
  );
}
