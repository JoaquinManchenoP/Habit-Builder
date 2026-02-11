"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../../components/Button";
import { createHabit } from "../../lib/data";
import {
  DEFAULT_ACTIVE_DAYS,
  WEEKDAY_LABELS,
  WEEKDAY_ORDER,
} from "../../lib/habitSchedule";
import { HABIT_TARGET_MAX } from "../../lib/habitConstants";

export default function NewHabitForm() {
  const [name, setName] = useState("");
  const [goalType, setGoalType] = useState("daily");
  const [activeDays, setActiveDays] = useState({ ...DEFAULT_ACTIVE_DAYS });
  const [timesPerDay, setTimesPerDay] = useState("1");
  const [timesPerWeek, setTimesPerWeek] = useState("1");
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!goalType) {
      setStatusMessage("Please choose a goal type.");
      setStatusTone("warning");
      return;
    }
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

    const rawTarget = goalType === "daily" ? timesPerDay : timesPerWeek;
    const targetCount = parseInt(rawTarget, 10);
    if (!Number.isInteger(targetCount) || targetCount < 1) {
      setStatusMessage("Please provide a valid target count.");
      setStatusTone("warning");
      return;
    }
    if (targetCount > HABIT_TARGET_MAX) {
      setStatusMessage(`Target count cannot exceed ${HABIT_TARGET_MAX}.`);
      setStatusTone("warning");
      return;
    }

    await createHabit(
      trimmedName,
      goalType === "daily" ? activeDays : undefined,
      goalType,
      targetCount
    );
    setStatusMessage("Habit saved locally.");
    setStatusTone("success");
    setName("");
    setTimeout(() => router.push("/home"), 400);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm w-2/3"
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Goal type
        </p>
        <div className="flex gap-2 rounded-2xl bg-slate-100 p-1">
          {[
            { value: "daily", label: "Daily goal" },
            { value: "weekly", label: "Weekly goal" },
          ].map((option) => {
            const isSelected = goalType === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setGoalType(option.value)}
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
      </div>
      {goalType === "daily" ? (
        <label className="block space-y-2 text-sm font-medium text-slate-700">
          <span>Times per day</span>
          <input
            type="number"
            min={1}
            max={HABIT_TARGET_MAX}
            step={1}
            value={timesPerDay}
            onChange={(event) => setTimesPerDay(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-base shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            inputMode="numeric"
          />
        </label>
      ) : null}
      {goalType === "weekly" ? (
        <label className="block space-y-2 text-sm font-medium text-slate-700">
          <span>Times per week</span>
          <input
            type="number"
            min={1}
            max={HABIT_TARGET_MAX}
            step={1}
            value={timesPerWeek}
            onChange={(event) => setTimesPerWeek(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-base shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            inputMode="numeric"
          />
        </label>
      ) : null}
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
          <span className="text-xs font-medium text-orange-600">
            {inlineWarningMessage}
          </span>
        ) : null}
      </label>
      {goalType === "daily" ? (
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
                className="grid h-8 w-8 place-items-center rounded-lg border border-slate-300 bg-white text-[11px] font-bold text-white transition appearance-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 checked:border-indigo-600 checked:bg-indigo-600 checked:before:content-['✓']"
              />
              <span>{WEEKDAY_LABELS[dayKey]}</span>
            </label>
          ))}
        </div>
      ) : null}
      <div className="flex items-center gap-3">
        <Button
          type="submit"
          className="h-11 rounded-2xl bg-indigo-600 px-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-900 shadow-sm transition hover:bg-indigo-500 active:scale-95"
        >
          Save habit
        </Button>
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
      </div>
    </form>
  );
}
