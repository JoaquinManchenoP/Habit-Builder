"use client";

import Button from "../../components/Button";
import GoogleSignInSection from "./GoogleSignInSection";

export default function MagicLinkSection({
  email,
  onChangeEmail,
  onSubmit,
  onGoogleSignIn,
  statusMessage,
  statusTone,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-md space-y-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="space-y-1 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
          Habit Builder
        </p>
        <h1 className="text-2xl font-semibold text-slate-900">
          Check your inbox
        </h1>
        <p className="text-sm text-slate-600">
          We’ll email you a secure link to sign in.
        </p>
      </div>

      <label className="block space-y-3 text-sm font-medium text-slate-700 ">
        <span className="ml-1">Email</span>
        <input
          type="email"
          value={email}
          onChange={onChangeEmail}
          className="w-full rounded-md border mt-2 border-slate-300 px-3 py-2 text-base shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          autoComplete="email"
        />
      </label>

      <Button
        type="submit"
        className="h-11 w-full rounded-2xl bg-indigo-600 px-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-900 shadow-sm transition hover:bg-indigo-500 active:scale-95"
      >
        Send magic link
      </Button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
          or
        </span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <p className="text-xs text-slate-500">
        Prefer Google? Use the button below to continue.
      </p>
      <GoogleSignInSection onSignIn={onGoogleSignIn} />

      {statusMessage ? (
        <p
          className={`text-sm ${
            statusTone === "warning"
              ? "text-orange-700"
              : statusTone === "success"
                ? "text-emerald-700"
                : "text-slate-600"
          }`}
        >
          {statusMessage}
        </p>
      ) : null}
    </form>
  );
}
