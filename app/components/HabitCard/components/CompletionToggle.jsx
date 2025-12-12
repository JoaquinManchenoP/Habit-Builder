export default function CompletionToggle({ checked, onChange }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onClick={(event) => event.stopPropagation()}
      onChange={(event) => {
        event.stopPropagation();
        onChange(event.target.checked);
      }}
      className="grid h-9 w-9 place-items-center rounded-xl border border-slate-300 bg-white text-sm font-bold text-white transition
               appearance-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500
               checked:border-green-600 checked:bg-green-600 checked:before:content-['✓']"
      aria-label="Mark habit completed"
    />
  );
}
