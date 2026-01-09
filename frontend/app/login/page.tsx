"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Login failed";
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const isValid = useMemo(() => {
    return email.trim().length > 0 && password.length >= 6;
  }, [email, password]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const { data } = await supabase.auth.getSession();
      if (!cancelled && data.session) {
        router.replace("/notes");
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function onEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!isValid) {
      setError("Enter an email and a password (min 6 characters). ");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (signUpError) throw signUpError;

        // If email confirmations are enabled, there may be no session yet.
        if (!data.session) {
          setInfo("Check your email to confirm your account, then log in.");
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
      }

      router.replace("/notes");
      } catch (err: unknown) {
        setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (oauthError) throw oauthError;
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-black">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold tracking-tight">Private Notes Vault</h1>
            <Link
              href="/"
              className="text-sm text-neutral-700 underline underline-offset-4"
            >
              Back
            </Link>
          </div>

          <p className="mt-2 text-sm text-neutral-600">
            Private notes tied to your account.
          </p>

          <div className="mt-5 rounded-xl bg-neutral-100 p-1">
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setMode("signin")}
                className={
                  mode === "signin"
                    ? "rounded-lg bg-white px-3 py-2 text-sm font-medium"
                    : "rounded-lg px-3 py-2 text-sm font-medium text-neutral-700"
                }
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={
                  mode === "signup"
                    ? "rounded-lg bg-white px-3 py-2 text-sm font-medium"
                    : "rounded-lg px-3 py-2 text-sm font-medium text-neutral-700"
                }
              >
                Sign up
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <button
            type="button"
            onClick={onGoogle}
            disabled={loading}
            className="w-full rounded-md border border-black px-4 py-3 text-sm font-medium transition-transform duration-150 ease-out hover:-translate-y-0.5 hover:bg-black hover:text-white disabled:opacity-50"
          >
            Continue with Google
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-neutral-200" />
              <span className="text-xs text-neutral-500">or</span>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>

            <form onSubmit={onEmailSubmit} className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Email</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black"
                placeholder="you@example.com"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">Password</span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-black"
                placeholder="••••••••"
              />
              <span className="mt-1 block text-xs text-neutral-600">
                Minimum 6 characters.
              </span>
            </label>

            {error ? (
              <p className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-black">
                {error}
              </p>
            ) : null}

            {info ? (
              <p className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700">
                {info}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-black px-4 py-3 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading
                ? "Please wait…"
                : mode === "signin"
                  ? "Log in"
                  : "Create account"}
            </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
