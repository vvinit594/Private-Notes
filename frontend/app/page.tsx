"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const { data } = await supabase.auth.getSession();
      if (!cancelled && data.session) {
        window.location.assign("/notes");
        return;
      }
      if (!cancelled) setChecking(false);
    }

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-16">
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-black">
          <h1 className="text-3xl font-semibold tracking-tight">Private Notes Vault</h1>
          <p className="mt-3 text-base">
            A private, authenticated notes app is a secure digital platform designed to help users create, store, and manage their personal notes with complete privacy. It ensures that only authorized users can access their data through proper authentication, keeping notes protected from unauthorized access. Such an app typically focuses on simplicity, security, and reliability, allowing users to safely capture ideas, tasks, and important information while maintaining full control over their personal content.
          </p>
          <div className="mt-6">
            {checking ? (
              <p className="text-sm text-neutral-700">Loading…</p>
            ) : (
              <Link
                className="inline-flex rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-transform duration-150 ease-out hover:-translate-y-0.5 active:translate-y-0"
                href="/login"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
