import { useState } from "react";

export const useHabitMenu = (cardRef) => {
  const [menu, setMenu] = useState({ open: false, visible: false, x: 0, y: 0 });

  const openMenu = (event) => {
    if (!cardRef.current) return;
    if (event.target.closest("input[type='checkbox']")) return;
    event.stopPropagation();
    const rect = cardRef.current.getBoundingClientRect();
    setMenu({
      open: true,
      visible: true,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  const closeMenu = () => {
    setMenu((prev) => ({ ...prev, visible: false }));
    setTimeout(() => setMenu({ open: false, visible: false, x: 0, y: 0 }), 200);
  };

  return { menu, openMenu, closeMenu };
};
