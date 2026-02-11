import NewHabitForm from "./NewHabitForm";

export default function NewHabitPage() {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">New Habit</h1>
      </div>
      <NewHabitForm />
    </section>
  );
}
