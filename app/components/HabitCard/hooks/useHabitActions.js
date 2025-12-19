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
}) => {
  const router = useRouter();

  const handleEdit = () => {
    closeMenu();
    openEditModal?.(habit.name, habit.activeDays);
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

  const handleSaveEdit = (nextName, nextActiveDays) => {
    if (!nextName) {
      closeEditModal?.();
      return;
    }
    const resolvedActiveDays = nextActiveDays || habit.activeDays;
    if (habit.isMock) {
      updateMockHabitDetails(habit.id, {
        name: nextName,
        activeDays: resolvedActiveDays,
      });
    } else {
      updateHabitDetails(habit.id, {
        name: nextName,
        activeDays: resolvedActiveDays,
      });
    }
    // Notify listeners (Habits page) to rehydrate
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storage"));
    }
    onEditNameChange?.(nextName);
    onEditActiveDaysChange?.(resolvedActiveDays);
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
