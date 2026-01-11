import { useState } from "react";
import { DEFAULT_ACTIVE_DAYS, normalizeActiveDays } from "../../../lib/habitSchedule";

export const useHabitEditModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editActiveDays, setEditActiveDays] = useState({ ...DEFAULT_ACTIVE_DAYS });
  const [editTarget, setEditTarget] = useState("1");
  const [editTargetError, setEditTargetError] = useState("");

  const openEditModal = (
    currentName = "",
    currentActiveDays = DEFAULT_ACTIVE_DAYS,
    currentTarget = 1
  ) => {
    setEditName(currentName);
    setEditActiveDays(normalizeActiveDays(currentActiveDays));
    setEditTarget(String(currentTarget));
    setEditTargetError("");
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

  return {
    isOpen,
    isVisible,
    editName,
    setEditName,
    editActiveDays,
    setEditActiveDays,
    editTarget,
    setEditTarget,
    editTargetError,
    setEditTargetError,
    openEditModal,
    closeEditModal,
  };
};
