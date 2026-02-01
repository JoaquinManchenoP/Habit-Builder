"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase/client";
import MagicLinkSection from "./loginComponents/MagicLinkSection";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
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

    const action = supabase.auth.signInWithOtp({ email });

    const { error } = await action;
    if (error) {
      setStatusMessage(error.message);
      setStatusTone("warning");
      return;
    }

    setStatusMessage("Check your email for a magic sign-in link.");
    setStatusTone("success");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 py-10 text-slate-900">
      <div className="w-full max-w-md space-y-4">
        <MagicLinkSection
          email={email}
          onChangeEmail={(event) => setEmail(event.target.value)}
          onSubmit={handleSubmit}
          onGoogleSignIn={handleGoogleSignIn}
          statusMessage={statusMessage}
          statusTone={statusTone}
        />
      </div>
    </div>
  );
}
