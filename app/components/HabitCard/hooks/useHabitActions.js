import { useRouter } from "next/navigation";
import { updateHabitDetails } from "../../../lib/habits";
import { updateMockHabitDetails } from "../../../lib/habitData";

export const useHabitActions = ({
  habit,
  onDelete,
  onComplete,
  closeMenu,
  openBackfillModal,
  closeBackfillModal,
  openEditModal,
  closeEditModal,
  onEditNameChange,
  onEditActiveDaysChange,
  onEditTargetChange,
  onEditTargetError,
}) => {
  const router = useRouter();

  const handleEdit = () => {
    closeMenu();
    const currentTarget =
      habit.goalType === "weekly"
        ? habit.timesPerWeek || 1
        : habit.timesPerDay || 1;
    openEditModal?.(habit.name, habit.activeDays, currentTarget);
  };

  const handleDelete = () => {
    onDelete?.(habit.id);
    closeMenu();
  };

  const handleAddPreviousCheckIn = (isoDate) => {
    if (!isoDate) return;
    onComplete?.(habit.id, true, isoDate);
    closeBackfillModal();
  };

  const handleOpenPreviousCheckIn = () => {
    closeMenu();
    openBackfillModal();
  };

  const handleSaveEdit = (nextName, nextActiveDays, nextTarget) => {
    if (!nextName) {
      closeEditModal?.();
      return;
    }
    const parsedTarget = Number.parseInt(nextTarget, 10);
    if (!Number.isInteger(parsedTarget) || parsedTarget < 1) {
      onEditTargetError?.("Please enter a whole number of at least 1.");
      return;
    }
    if (parsedTarget > 20) {
      onEditTargetError?.("Target cannot exceed 20.");
      return;
    }
    const resolvedActiveDays = nextActiveDays || habit.activeDays;
    const updates =
      habit.goalType === "weekly"
        ? { name: nextName, activeDays: resolvedActiveDays, timesPerWeek: parsedTarget }
        : { name: nextName, activeDays: resolvedActiveDays, timesPerDay: parsedTarget };
    if (habit.isMock) {
      updateMockHabitDetails(habit.id, updates);
    } else {
      updateHabitDetails(habit.id, updates);
    }
    // Notify listeners (Habits page) to rehydrate
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storage"));
    }
    onEditNameChange?.(nextName);
    onEditActiveDaysChange?.(resolvedActiveDays);
    onEditTargetChange?.(String(parsedTarget));
    onEditTargetError?.("");
    closeEditModal?.();
  };

  const handleToggleComplete = (next) => {
    onComplete?.(habit.id, next);
  };

  return {
    handleEdit,
    handleDelete,
    handleAddPreviousCheckIn,
    handleOpenPreviousCheckIn,
    handleSaveEdit,
    handleToggleComplete,
  };
};
