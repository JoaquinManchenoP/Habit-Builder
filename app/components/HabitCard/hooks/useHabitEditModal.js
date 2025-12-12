import { useState } from "react";

export const useHabitEditModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [editName, setEditName] = useState("");

  const openEditModal = (currentName = "") => {
    setEditName(currentName);
    setIsOpen(true);
    setIsVisible(false);
    requestAnimationFrame(() => setIsVisible(true));
  };

  const closeEditModal = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  return { isOpen, isVisible, editName, setEditName, openEditModal, closeEditModal };
};
