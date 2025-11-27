"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import { buildWeeklyPercentages } from "../lib/analytics";
import { loadHabitsWithMock } from "../lib/habitData";

const buildPath = (points, xScale, yScale) => {
  let path = "";
  let hasStarted = false;

  points.forEach((point, index) => {
    if (point.value === null || Number.isNaN(point.value)) {
      hasStarted = false;
      return;
    }

    const x = xScale(index);
    const y = yScale(point.value);

    if (!hasStarted) {
      path += `M ${x} ${y}`;
      hasStarted = true;
    } else {
      path += ` L ${x} ${y}`;
    }
  });

  return path || null;
};

const MultiLineChart = ({ weeks, series }) => {
  if (!weeks.length || !series.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
        Add a habit to see weekly completion percentages.
      </div>
    );
  }

  const width = 920;
  const height = 420;
  const margin = { top: 24, right: 24, bottom: 72, left: 64 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = (index) => {
    if (weeks.length === 1) return margin.left + innerWidth / 2;
    const step = innerWidth / (weeks.length - 1);
    return margin.left + index * step;
  };

  const yScale = (value) => {
    const clamped = Math.max(0, Math.min(100, value));
    const ratio = 1 - clamped / 100;
    return margin.top + ratio * innerHeight;
  };

  const yTicks = [0, 25, 50, 75, 100];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Weekly completion percentage per habit"
      className="w-full overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <g>
        {/* Y-axis grid lines and labels */}
        {yTicks.map((tick) => {
          const y = yScale(tick);
          return (
            <g key={tick}>
              <line
                x1={margin.left}
                x2={width - margin.right}
                y1={y}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <text
                x={margin.left - 12}
                y={y + 4}
                textAnchor="end"
                fontSize="12"
                fill="#475569"
              >
                {tick}%
              </text>
            </g>
          );
        })}

        {/* X-axis grid lines and labels */}
        {weeks.map((week, index) => {
          const x = xScale(index);
          return (
            <g key={week.key}>
              <line
                x1={x}
                x2={x}
                y1={margin.top}
                y2={height - margin.bottom}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <text
                x={x}
                y={height - margin.bottom + 28}
                textAnchor="middle"
                fontSize="12"
                fill="#475569"
              >
                {week.label}
              </text>
            </g>
          );
        })}

        {/* Lines */}
        {series.map((line) => {
          const path = buildPath(line.points, xScale, yScale);
          if (!path) return null;
          return (
            <path
              key={line.id}
              d={path}
              fill="none"
              stroke={line.color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}

        {/* Data points */}
        {series.map((line) =>
          line.points.map((point, index) => {
            if (point.value === null) return null;
            const x = xScale(index);
            const y = yScale(point.value);
            return (
              <g key={`${line.id}-${point.key}`} className="transition-opacity">
                <circle
                  cx={x}
                  cy={y}
                  r={5}
                  fill={line.color}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <title>
                  {`${line.name} — ${point.label}: ${point.value.toFixed(1)}%`}
                </title>
              </g>
            );
          }),
        )}
      </g>

      {/* Axis titles */}
      <text
        x={margin.left}
        y={margin.top - 6}
        textAnchor="start"
        fontSize="12"
        fill="#1f2937"
        fontWeight="600"
      >
        Weekly completion (%)
      </text>
      <text
        x={width / 2}
        y={height - 20}
        textAnchor="middle"
        fontSize="12"
        fill="#1f2937"
        fontWeight="600"
      >
        Calendar weeks
      </text>
    </svg>
  );
};

export default function DashboardPage() {
  const [habits, setHabits] = useState([]);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    const hydrate = () => {
      const { habits: loaded, usingMockData: usingMock } = loadHabitsWithMock();
      setHabits(loaded);
      setUsingMockData(usingMock);
    };

    hydrate();
    window.addEventListener("storage", hydrate);
    return () => window.removeEventListener("storage", hydrate);
  }, []);

  const { weeks, series } = useMemo(
    () => buildWeeklyPercentages(habits),
    [habits],
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <Header />

        <section className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Weekly completion
              </h1>
              <p className="text-sm text-slate-600">
                One point per habit per week: completed days divided by active
                days, capped at 100%.
              </p>
            </div>
            {usingMockData ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                Using mock testing data
              </span>
            ) : null}
          </div>
        </section>

        <MultiLineChart weeks={weeks} series={series} />

        {series.length ? (
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold text-slate-800">Legend</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {series.map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  <span
                    className="h-3 w-8 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-600">
                      {`Data points: ${item.points.filter((p) => p.value !== null).length} weeks`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
