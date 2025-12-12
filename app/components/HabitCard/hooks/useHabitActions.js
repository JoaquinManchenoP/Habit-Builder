import { useRouter } from "next/navigation";
import { updateHabitName } from "../../../lib/habits";
import { updateMockHabitName } from "../../../lib/habitData";

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
}) => {
  const router = useRouter();

  const handleEdit = () => {
    closeMenu();
    openEditModal?.(habit.name);
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

  const handleSaveEdit = (nextName) => {
    if (!nextName) {
      closeEditModal?.();
      return;
    }
    if (habit.isMock) {
      updateMockHabitName(habit.id, nextName);
    } else {
      updateHabitName(habit.id, nextName);
    }
    // Notify listeners (Habits page) to rehydrate
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storage"));
    }
    onEditNameChange?.(nextName);
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
