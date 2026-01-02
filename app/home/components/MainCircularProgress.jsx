"use client";

import CircularProgress from "../../components/HabitCard/components/CircularProgress/CircularProgress";

export default function MainCircularProgress({ progress }) {
  return (
    <>
      <h1 className="text-lg font-semibold text-slate-900">Today</h1>
      <div className="flex items-center justify-center">
        <div className="mt-6 scale-[1.4] lg:scale-[1.6] md:scale-[1.6] sm:scale-[1.5] min-[1100px]:scale-170">
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
