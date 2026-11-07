"use client";

import React, { useCallback, useEffect, useState } from "react";

// Guestbook moderation, shown inside the tablet's Settings app.
// Talks to /api/guestbook/admin, which needs GUESTBOOK_ADMIN_TOKEN (set in the environment).

type Entry = { id: number; name: string; message: string; approved: boolean; created_at: string };
type Action = "approve" | "hide" | "delete";

const TOKEN_KEY = "guestbook-admin-token";

function NoteCard({ e, busy, onAct }: { e: Entry; busy: boolean; onAct: (action: Action, id: number) => void }) {
  return (
    <li className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-stone-900">{e.name}</p>
          <p className="text-xs text-stone-500">
            #{e.id} · {new Date(e.created_at).toLocaleString()}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
            e.approved ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
          }`}
        >
          {e.approved ? "Published" : "Waiting"}
        </span>
      </div>
      <p className="mt-2 whitespace-pre-wrap break-words text-sm text-stone-700">{e.message}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {!e.approved ? (
          <button
            disabled={busy}
            onClick={() => onAct("approve", e.id)}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            Approve
          </button>
        ) : (
          <button
            disabled={busy}
            onClick={() => onAct("hide", e.id)}
            className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 disabled:opacity-50"
          >
            Hide
          </button>
        )}
        <button
          disabled={busy}
          onClick={() => onAct("delete", e.id)}
          className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </li>
  );
}

export default function GuestbookAdmin() {
  const [token, setToken] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const call = useCallback(async (tok: string, body: Record<string, unknown>) => {
    const res = await fetch("/api/guestbook/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: tok, ...body })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
    return data;
  }, []);

  const load = useCallback(
    async (tok: string) => {
      setBusy(true);
      setError("");
      try {
        const data = await call(tok, { action: "all" });
        setEntries(data.entries ?? []);
        setUnlocked(true);
        try {
          sessionStorage.setItem(TOKEN_KEY, tok);
        } catch {
          /* private mode: just don't remember it */
        }
      } catch (e) {
        setUnlocked(false);
        setError(e instanceof Error ? e.message : "Something went wrong.");
      } finally {
        setBusy(false);
      }
    },
    [call]
  );

  // Reuse the token for this browser tab so reopening Settings doesn't ask again
  useEffect(() => {
    let saved = "";
    try {
      saved = sessionStorage.getItem(TOKEN_KEY) ?? "";
    } catch {
      /* ignore */
    }
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToken(saved);
      void load(saved);
    }
  }, [load]);

  const act = async (action: Action, id: number) => {
    if (action === "delete" && !window.confirm("Delete this note permanently? This can't be undone.")) return;
    setBusy(true);
    setError("");
    try {
      await call(token, { action, id });
      await load(token);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  };

  const pending = entries.filter((e) => !e.approved);
  const published = entries.filter((e) => e.approved);

  return (
    <div className="mx-auto max-w-2xl">
      <h4 className="text-xl font-bold">Guestbook moderation</h4>
      <p className="mt-1 text-sm text-stone-500">
        Approve notes to publish them on the notebook, hide a published note to take it down (it stays here), or delete it for good.
      </p>

      {!unlocked ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void load(token.trim());
          }}
          className="mt-5 space-y-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
        >
          <label htmlFor="admin-token" className="block text-sm font-medium">
            Admin token
          </label>
          <input
            id="admin-token"
            type="password"
            autoComplete="current-password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="The value of GUESTBOOK_ADMIN_TOKEN"
            className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={busy || !token.trim()}
            className="rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-700 disabled:opacity-50"
          >
            {busy ? "Checking…" : "Unlock"}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      ) : (
        <>
          <div className="mt-5 flex items-center justify-between">
            <p className="text-sm text-stone-600">
              {pending.length} waiting · {published.length} published
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => void load(token)}
                disabled={busy}
                className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-stone-100 disabled:opacity-50"
              >
                Refresh
              </button>
              <button
                onClick={() => {
                  try {
                    sessionStorage.removeItem(TOKEN_KEY);
                  } catch {
                    /* ignore */
                  }
                  setUnlocked(false);
                  setToken("");
                  setEntries([]);
                }}
                className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-stone-100"
              >
                Lock
              </button>
            </div>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <h5 className="mt-5 text-xs font-semibold uppercase tracking-wider text-amber-700">Waiting for approval</h5>
          <ul className="mt-2 space-y-3">
            {pending.length === 0 && <li className="text-sm text-stone-500">Nothing waiting. 🎉</li>}
            {pending.map((e) => (
              <NoteCard key={e.id} e={e} busy={busy} onAct={act} />
            ))}
          </ul>

          <h5 className="mt-6 text-xs font-semibold uppercase tracking-wider text-emerald-700">Published</h5>
          <ul className="mt-2 space-y-3">
            {published.length === 0 && <li className="text-sm text-stone-500">No published notes yet.</li>}
            {published.map((e) => (
              <NoteCard key={e.id} e={e} busy={busy} onAct={act} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
