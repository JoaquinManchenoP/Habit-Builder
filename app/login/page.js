"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../components/Button";
import { createClient } from "../lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("signin");
  const [authMethod, setAuthMethod] = useState("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState("muted");
  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        router.replace("/home");
      }
    };

    checkSession();
  }, [router, supabase]);

  const resetStatus = () => {
    setStatusMessage("");
    setStatusTone("muted");
  };

  const handleGoogleSignIn = async () => {
    resetStatus();
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) {
      setStatusMessage(error.message);
      setStatusTone("warning");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    resetStatus();

    if (!email.trim()) {
      setStatusMessage("Please enter an email address.");
      setStatusTone("warning");
      return;
    }

    if (authMethod === "password" && !password) {
      setStatusMessage("Please enter a password.");
      setStatusTone("warning");
      return;
    }

    const action =
      authMethod === "magic"
        ? supabase.auth.signInWithOtp({ email })
        : mode === "signup"
        ? supabase.auth.signUp({ email, password })
        : supabase.auth.signInWithPassword({ email, password });

    const { error } = await action;
    if (error) {
      setStatusMessage(error.message);
      setStatusTone("warning");
      return;
    }

    if (authMethod === "magic") {
      setStatusMessage("Check your email for a magic sign-in link.");
      setStatusTone("success");
      return;
    }

    if (mode === "signup") {
      setStatusMessage("Check your email to confirm your account.");
      setStatusTone("success");
      return;
    }

    router.replace("/home");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-900">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="space-y-1 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            Habit Builder
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            {authMethod === "magic"
              ? "Check your inbox"
              : mode === "signup"
              ? "Create your account"
              : "Welcome back"}
          </h1>
          <p className="text-sm text-slate-600">
            {authMethod === "magic"
              ? "We’ll email you a secure link to sign in."
              : mode === "signup"
              ? "Start tracking your habits across devices."
              : "Log in to continue your streaks."}
          </p>
        </div>

        <div className="flex gap-2 rounded-2xl bg-slate-100 p-1">
          {[
            { value: "password", label: "Password" },
            { value: "magic", label: "Magic link" },
          ].map((option) => {
            const isSelected = authMethod === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setAuthMethod(option.value);
                  resetStatus();
                }}
                className={`flex-1 rounded-2xl px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
                  isSelected
                    ? "bg-[color:var(--app-accent)] text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <label className="block space-y-2 text-sm font-medium text-slate-700">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-base shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            autoComplete="email"
          />
        </label>

        {authMethod === "password" ? (
          <label className="block space-y-2 text-sm font-medium text-slate-700">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-base shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
            />
          </label>
        ) : null}

        <Button
          type="submit"
          className="h-11 w-full rounded-2xl bg-indigo-600 px-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-900 shadow-sm transition hover:bg-indigo-500 active:scale-95"
        >
          {authMethod === "magic"
            ? "Send magic link"
            : mode === "signup"
            ? "Create account"
            : "Sign in"}
        </Button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            or
          </span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
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

        {authMethod === "password" ? (
          <div className="flex items-center justify-between text-sm text-slate-600">
            <button
              type="button"
              onClick={() =>
                setMode((prev) => (prev === "signup" ? "signin" : "signup"))
              }
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              {mode === "signup"
                ? "Already have an account? Sign in"
                : "New here? Create an account"}
            </button>
          </div>
        ) : null}

        {statusMessage ? (
          <p
            className={`text-sm ${
              statusTone === "warning"
                ? "text-amber-700"
                : statusTone === "success"
                ? "text-emerald-700"
                : "text-slate-600"
            }`}
          >
            {statusMessage}
          </p>
        ) : null}
      </form>
    </div>
  );
}
