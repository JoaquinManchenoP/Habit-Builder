import NewHabitForm from "./NewHabitForm";

export default function NewHabitPage() {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">Create a Habit</h1>
        <p className="text-sm text-slate-600">
          Add a new habit to track. Data is stored in this browser.
        </p>
      </div>
      <NewHabitForm />
    </section>
  );
}
