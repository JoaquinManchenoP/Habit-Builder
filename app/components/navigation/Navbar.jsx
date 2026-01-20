"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import MobileTopNav from "./MobileTopNav";

const NAV_ITEMS = [
  {
    label: "Home",
    href: "/home",
    icon: function HomeIcon({ className }) {
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 11.5l8-7 8 7" />
          <path d="M6.5 10.5V19a1.5 1.5 0 0 0 1.5 1.5h8A1.5 1.5 0 0 0 17.5 19v-8.5" />
        </svg>
      );
    },
  },
  {
    label: "My Habits",
    href: "/habits",
    icon: function HabitsIcon({ className }) {
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="4" y="3.5" width="16" height="17" rx="3" />
          <path d="M7.5 12.5l2.2 2.2L16.5 8.8" />
          <path d="M16.5 5.6v2.2M15.4 6.7h2.2" />
        </svg>
      );
    },
  },
  {
    label: "My Stats",
    href: "/my-stats",
    icon: function StatsIcon({ className }) {
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 19h16" />
          <path d="M7 19v-6" />
          <path d="M12 19v-9" />
          <path d="M17 19v-4" />
          <path d="M17.5 6v2.2M16.4 7.1h2.2" />
        </svg>
      );
    },
  },
  {
    label: "Leaderboard",
    href: "/leaderboard",
    icon: function LeaderboardIcon({ className }) {
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7 4h10v3a5 5 0 0 1-10 0V4z" />
          <path d="M7 4H5a2 2 0 0 0 2 2" />
          <path d="M17 4h2a2 2 0 0 1-2 2" />
          <path d="M12 14v4" />
          <path d="M9 18h6" />
          <path d="M7 20h10" />
          <path d="M12 2.5l.7 1.4 1.6.2-1.2 1.1.3 1.6-1.4-.8-1.4.8.3-1.6-1.2-1.1 1.6-.2z" />
          <circle cx="6.5" cy="6.5" r="0.9" />
          <circle cx="17.5" cy="6.5" r="0.9" />
        </svg>
      );
    },
  },
  {
    label: "New Habit",
    href: "/habits/new",
    icon: function NewHabitIcon({ className }) {
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="4" y="3.5" width="16" height="17" rx="3" />
          <path d="M12 8v8M8 12h8" />
          <path d="M7 6v2M6 7h2" />
          <path d="M17 6v2M16 7h2" />
        </svg>
      );
    },
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [optimisticPath, setOptimisticPath] = useState(null);

  useEffect(() => {
    if (optimisticPath && pathname === optimisticPath) {
      setOptimisticPath(null);
    }
  }, [optimisticPath, pathname]);

  return (
    <>
      <MobileTopNav items={NAV_ITEMS} />
      <aside className="hidden w-60 shrink-0 flex-col gap-8 lg:flex">
        <Link
          href="/home"
          className="flex items-center gap-3 text-xl font-semibold tracking-tight text-slate-800"
        >
          <span className="grid h-16 w-16 place-items-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
            <img
              src="/app-logo.png"
              alt="Habitoo"
              className="h-13 w-13 object-contain"
            />
          </span>
          <span className="leading-tight">Habit Builder</span>
        </Link>
        <nav className="flex flex-col gap-4 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200/70">
          {NAV_ITEMS.map((item) => {
            const currentPath = optimisticPath || pathname;
            const isActive = currentPath === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                onPointerDown={() => setOptimisticPath(item.href)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    setOptimisticPath(item.href);
                  }
                }}
                onClick={() => setOptimisticPath(item.href)}
                className={`flex items-center gap-4 rounded-xl px-5 py-3.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-amber-100 text-slate-900 shadow-lg"
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                }`}
              >
                <span
                  className={`grid h-9 w-9 place-items-center rounded-xl border ${
                    isActive
                      ? "border-[color:var(--app-accent-dark)] bg-[color:var(--app-accent-dark)] text-slate-900"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
