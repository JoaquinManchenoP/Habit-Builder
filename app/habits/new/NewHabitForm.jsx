"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../../components/Button";
import { createHabit } from "../../lib/habits";
import {
  DEFAULT_ACTIVE_DAYS,
  WEEKDAY_LABELS,
  WEEKDAY_ORDER,
} from "../../lib/habitSchedule";

export default function NewHabitForm() {
  const [name, setName] = useState("");
  const [activeDays, setActiveDays] = useState({ ...DEFAULT_ACTIVE_DAYS });
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
        `Habit name must be between ${MIN_NAME_LENGTH} and ${MAX_NAME_LENGTH} characters.`
      );
      setStatusTone("warning");
      return;
    }

    createHabit(trimmedName, activeDays);
    setStatusMessage("Habit saved locally.");
    setStatusTone("success");
    setName("");
    setTimeout(() => router.push("/dashboard"), 400);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm w-2/3"
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
      <div className="flex items-start gap-12 pt-3 justify-center">
        {WEEKDAY_ORDER.map((dayKey) => (
          <label
            key={dayKey}
            className="flex flex-col items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600"
          >
            <input
              type="checkbox"
              checked={activeDays[dayKey]}
              onChange={(event) =>
                setActiveDays((prev) => ({
                  ...prev,
                  [dayKey]: event.target.checked,
                }))
              }
              className="grid h-8 w-8 place-items-center rounded-lg border border-slate-300 bg-white text-[11px] font-bold text-white transition appearance-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 checked:border-slate-900 checked:bg-slate-900 checked:before:content-['✓']"
            />
            <span>{WEEKDAY_LABELS[dayKey]}</span>
          </label>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Button
          type="submit"
          className="h-11 rounded-2xl bg-slate-900 px-6 text-[11px] font-semibold uppercase tracking-[0.2em] shadow-sm transition hover:bg-slate-800 active:scale-95"
        >
          Save habit
        </Button>
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
  );
}
