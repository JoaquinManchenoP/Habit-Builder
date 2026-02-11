"use client";

import Link from "next/link";
import Button from "../../../components/Button";

export default function PageHeader({ habitsCount, usingMockData }) {
  return (
    <div className="flex items-center justify-between ">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">My Habits</h1>
      </div>
      <div className="flex items-center gap-3">
        {usingMockData ? (
          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-700">
            Using mock testing data
          </span>
        ) : null}
        <span className="text-sm font-medium text-slate-800">
          {habitsCount} {habitsCount === 1 ? "habit" : "habits"}
        </span>
        <Link href="/habits/new">
          <Button
            type="button"
            className="h-10 w-10 bg-[color:var(--app-accent-dark)] p-0 text-xl font-bold text-slate-900 transition-transform duration-150 ease-out hover:scale-105 hover:bg-[color:var(--app-accent)] active:scale-95"
          >
            +
          </Button>
        </Link>
      </div>
    </div>
  );
}
