"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../../components/Button";
import { createHabit } from "../../lib/habits";

export default function NewHabitPage() {
  const [name, setName] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusTone, setStatusTone] = useState("muted");
  const router = useRouter();
  const MIN_NAME_LENGTH = 3;
  const MAX_NAME_LENGTH = 20;
  const trimmedName = name.trim();
  const isTooShort =
    trimmedName.length > 0 && trimmedName.length < MIN_NAME_LENGTH;
  const isTooLong = trimmedName.length > MAX_NAME_LENGTH;
  const inlineWarningMessage = isTooShort
    ? `Habit name must be at least ${MIN_NAME_LENGTH} characters.`
    : isTooLong
      ? `Habit name must be ${MAX_NAME_LENGTH} characters or less.`
      : "";

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!trimmedName) {
      setStatusMessage("Please provide a name for your habit.");
      setStatusTone("warning");
      return;
    }
    if (isTooShort || isTooLong) {
      setStatusMessage(
        `Habit name must be between ${MIN_NAME_LENGTH} and ${MAX_NAME_LENGTH} characters.`,
      );
      setStatusTone("warning");
      return;
    }

    createHabit(trimmedName);
    setStatusMessage("Habit saved locally.");
    setStatusTone("success");
    setName("");
    setTimeout(() => router.push("/dashboard"), 400);
  };

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">Create a Habit</h1>
        <p className="text-sm text-slate-600">
          Add a new habit to track. Data is stored in this browser.
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      >
        <label className="block space-y-2 text-sm font-medium text-slate-700">
          <span>Create a new habit</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={MAX_NAME_LENGTH}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-base shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="e.g. Morning run"
          />
          {inlineWarningMessage ? (
            <span className="text-xs font-medium text-amber-600">
              {inlineWarningMessage}
            </span>
          ) : null}
        </label>
        <div className="flex items-center gap-3">
          <Button type="submit">Save habit</Button>
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
        </div>
      </form>
    </section>
  );
}
