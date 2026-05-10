"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";
const TOKEN_KEY = "igp-admin-token";

export default function AdminLoginRoute() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@indiagov.in");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const payload = (await response.json()) as { message?: string; token?: string };

      if (!response.ok || !payload.token) {
        throw new Error(payload.message ?? "Login failed.");
      }

      window.localStorage.setItem(TOKEN_KEY, payload.token);
      router.push("/admin");
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-4xl items-center">
      <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="surface rounded-[2rem] border border-border/80 p-8 shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-saffron">India Governance Portal</p>
          <h1 className="mt-4 font-display text-4xl text-foreground">Administrator sign in</h1>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            Manage people, ministries, states, appointments, and profile media from the secure backend workspace.
          </p>
          <div className="mt-8 rounded-[1.5rem] border border-border/80 bg-white/70 p-5 text-sm text-muted-foreground dark:bg-white/5">
            Seeded credentials:
            <div className="mt-2 font-medium text-foreground">admin@indiagov.in</div>
            <div className="font-medium text-foreground">Admin@123</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="surface rounded-[2rem] border border-border/80 p-8 shadow-soft">
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Email</label>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                className="h-12 w-full rounded-2xl border border-border bg-transparent px-4 text-sm outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-foreground">Password</label>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                className="h-12 w-full rounded-2xl border border-border bg-transparent px-4 text-sm outline-none"
              />
            </div>
          </div>
          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-2xl bg-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
