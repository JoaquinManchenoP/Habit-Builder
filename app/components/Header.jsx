import Link from "next/link";

export default function Header() {
  return (
    <header className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <Link href="/dashboard" className="text-lg font-bold text-indigo-700">
        Habit Builder
      </Link>
      <nav className="flex items-center gap-4 text-sm font-medium text-slate-700">
        <Link href="/dashboard" className="hover:text-indigo-700">
          Dashboard
        </Link>
        <Link href="/habits" className="hover:text-indigo-700">
          Habits
        </Link>
        <Link href="/habits/new" className="hover:text-indigo-700">
          New Habit
        </Link>
      </nav>
    </header>
  );
}
