import Link from "next/link";
import Header from "./components/Header";
import Button from "./components/Button";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        <Header />
        <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">Welcome to Habit Builder</h1>
            <p className="text-sm text-slate-600">
              Track your daily routines and stay organized. All data is stored locally in your browser.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/dashboard">
              <Button className="w-full justify-center">Go to dashboard</Button>
            </Link>
            <Link href="/habits/new">
              <Button className="w-full justify-center bg-slate-900 hover:bg-slate-800 focus-visible:outline-slate-900">
                Create a habit
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
