"use client";

import { useState } from "react";
import { createClient } from "../lib/supabase/client";

const supabase = createClient();

export default function DebugPage() {
  const [status, setStatus] = useState("");
  const [userId, setUserId] = useState("");

  const handleGetSession = async () => {
    setStatus("Checking session...");
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      setStatus(`Session error: ${error.message}`);
      return;
    }

    const id = session?.user?.id || "";
    setUserId(id);
    setStatus(id ? `Session user: ${id}` : "No session user.");
  };

  const handleSignOut = async () => {
    setStatus("Signing out...");
    const { error } = await supabase.auth.signOut();
    if (error) {
      setStatus(`Sign out error: ${error.message}`);
      return;
    }
    setUserId("");
    setStatus("Signed out. Try inserts to verify RLS.");
  };

  const handleInsertAsUser = async () => {
    if (!userId) {
      setStatus("No cached user id. Click 'Get session' first.");
      return;
    }

    setStatus("Inserting habit for session user...");
    const { error } = await supabase.from("habits").insert({
      user_id: userId,
      name: "RLS test (user)",
      goal_type: "daily",
    });

    setStatus(
      error ? `Insert as user error: ${error.message}` : "Insert as user: OK"
    );
  };

  const handleInsertRandomUser = async () => {
    const randomId = "00000000-0000-0000-0000-000000000000";
    setStatus("Inserting habit for random user...");
    const { error } = await supabase.from("habits").insert({
      user_id: randomId,
      name: "RLS test (random)",
      goal_type: "daily",
    });

    setStatus(
      error
        ? `Insert random user error: ${error.message}`
        : "Insert random user: OK"
    );
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col gap-4 px-6 py-10 text-slate-900">
      <h1 className="text-2xl font-semibold">Supabase Debug</h1>
      <p className="text-sm text-slate-600">
        Use this page to verify sessions and RLS behavior. This route is public.
      </p>
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Session Info
        </h2>
        <label className="text-sm font-medium text-slate-700">
          Session user id
          <input
            type="text"
            value={userId}
            readOnly
            className="mt-2 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 shadow-sm"
            placeholder="(empty)"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Status message
          <textarea
            value={status}
            readOnly
            rows={3}
            className="mt-2 w-full resize-none rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 shadow-sm"
            placeholder="(none)"
          />
        </label>
      </div>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={handleGetSession}
          className="h-11 rounded-2xl bg-indigo-600 px-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-sm transition hover:bg-indigo-500 active:scale-95"
        >
          Get session
        </button>
        <button
          type="button"
          onClick={handleSignOut}
          className="h-11 rounded-2xl border border-slate-200 bg-white px-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
        >
          Sign out
        </button>
        <button
          type="button"
          onClick={handleInsertAsUser}
          disabled={!userId}
          className="h-11 rounded-2xl border border-slate-200 bg-white px-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Insert habit as session user
        </button>
        <button
          type="button"
          onClick={handleInsertRandomUser}
          className="h-11 rounded-2xl border border-slate-200 bg-white px-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
        >
          Insert habit with random user id
        </button>
      </div>
    </div>
  );
}
