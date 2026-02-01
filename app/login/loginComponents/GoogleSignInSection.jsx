"use client";

export default function GoogleSignInSection({ onSignIn }) {
  return (
    <button
      type="button"
      onClick={onSignIn}
      className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M21.6 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.34 2.98-7.53z"
          fill="#4285F4"
        />
        <path
          d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.24-2.5c-.9.6-2.06.96-3.38.96-2.6 0-4.8-1.75-5.58-4.1H3.08v2.57A9.98 9.98 0 0 0 12 22z"
          fill="#34A853"
        />
        <path
          d="M6.42 13.93a6.04 6.04 0 0 1 0-3.86V7.5H3.08a9.98 9.98 0 0 0 0 8.99l3.34-2.56z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.96c1.47 0 2.78.5 3.81 1.5l2.85-2.86C16.95 2.9 14.7 2 12 2A9.98 9.98 0 0 0 3.08 7.5l3.34 2.57c.78-2.35 2.98-4.1 5.58-4.1z"
          fill="#EA4335"
        />
      </svg>
      Continue with Google
    </button>
  );
}
