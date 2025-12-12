import { useEffect, useRef } from "react";

export default function CardMenu({
  menu,
  onClose,
  onAddPreviousCheckIn,
  onEdit,
  onDelete,
}) {
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menu.open) return;
    const handleClickAway = (event) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickAway);
    return () => document.removeEventListener("mousedown", handleClickAway);
  }, [menu.open, onClose]);

  if (!menu.open) return null;

  return (
    <div
      ref={menuRef}
      style={{ top: menu.y, left: menu.x }}
      className={`absolute z-40 w-48 origin-top-left rounded-lg border border-slate-200 bg-white shadow-lg transition duration-300 ease-out ${
        menu.visible ? "opacity-100 scale-100 translate-y-1" : "opacity-0 scale-95 translate-y-2"
      }`}
    >
      <button
        type="button"
        className="block w-full px-4 py-2 text-left text-sm text-slate-800 transition hover:bg-slate-50"
        onClick={(event) => {
          event.stopPropagation();
          onAddPreviousCheckIn();
        }}
      >
        Add previous check in
      </button>
      <button
        type="button"
        className="block w-full px-4 py-2 text-left text-sm text-slate-800 transition hover:bg-slate-50"
        onClick={(event) => {
          event.stopPropagation();
          onEdit();
        }}
      >
        Edit habit
      </button>
      <button
        type="button"
        className="block w-full px-4 py-2 text-left text-sm text-red-700 transition hover:bg-red-50"
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
      >
        Delete
      </button>
    </div>
  );
}
