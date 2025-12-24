"use client";

import CircularProgress from "../../components/HabitCard/components/CircularProgress/CircularProgress";

export default function MainCircularProgress({ progress }) {
  return (
    <>
      <h1 className="text-lg font-semibold text-slate-900">Today</h1>
      <div className="flex items-center justify-center">
        <div className="scale-170 mt-6">
          <CircularProgress
            percent={progress.percent}
            value={progress.percent}
            showPercent
            color={progress.color}
          />
        </div>
      </div>
    </>
  );
}
