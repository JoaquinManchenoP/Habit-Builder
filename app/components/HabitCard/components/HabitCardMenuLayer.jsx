"use client";

import CardMenu from "./CardMenu";
import EditHabitModal from "./EditHabitModal";
import PreviousCheckInModal from "./PreviousCheckInModal";
import { useHabitActions } from "../hooks/useHabitActions";
import { useHabitBackfillModal } from "../hooks/useHabitBackfillModal";
import { useHabitEditModal } from "../hooks/useHabitEditModal";
import { useHabitMenu } from "../hooks/useHabitMenu";

export default function HabitCardMenuLayer({
  habit,
  onDelete,
  onComplete,
  isCompletedToday,
  goalType,
  cardRef,
  children,
}) {
  const { menu, openMenu, closeMenu } = useHabitMenu(cardRef);
  const {
    isOpen: isBackfillOpen,
    isVisible: isBackfillVisible,
    selectedDate: selectedBackfillDate,
    calendarMonth,
    setSelectedDate: setSelectedBackfillDate,
    openBackfillModal,
    closeBackfillModal,
    handleMonthChange,
  } = useHabitBackfillModal();
  const {
    isOpen: isEditOpen,
    isVisible: isEditVisible,
    editName,
    setEditName,
    editActiveDays,
    setEditActiveDays,
    openEditModal,
    closeEditModal,
  } = useHabitEditModal();

  const {
    handleEdit,
    handleDelete,
    handleAddPreviousCheckIn,
    handleOpenPreviousCheckIn,
    handleToggleComplete,
    handleSaveEdit,
  } = useHabitActions({
    habit,
    onDelete,
    onComplete,
    closeMenu,
    openBackfillModal,
    closeBackfillModal,
    openEditModal,
    closeEditModal,
    onEditNameChange: setEditName,
    onEditActiveDaysChange: setEditActiveDays,
  });

  const menuContent = (
    <CardMenu
      menu={menu}
      onClose={closeMenu}
      onAddPreviousCheckIn={handleOpenPreviousCheckIn}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );

  const handleCardClick = (event) => {
    if (event.target.closest("[data-habit-heatmap='true']")) return;
    if (event.target.closest("[data-habit-progress='true']")) return;
    if (event.target.closest("input[type='checkbox']")) return;
    openMenu(event);
  };

  return (
    <>
      {typeof children === "function"
        ? children({ handleCardClick, handleToggleComplete, menuContent })
        : null}
      <PreviousCheckInModal
        open={isBackfillOpen}
        visible={isBackfillVisible}
        monthDate={calendarMonth}
        selectedDate={selectedBackfillDate}
        onClose={closeBackfillModal}
        onConfirm={handleAddPreviousCheckIn}
        onSelectDate={setSelectedBackfillDate}
        onMonthChange={handleMonthChange}
      />
      <EditHabitModal
        open={isEditOpen}
        visible={isEditVisible}
        nameValue={editName}
        activeDaysValue={editActiveDays}
        onChangeName={setEditName}
        onChangeActiveDay={(dayKey, nextValue) =>
          setEditActiveDays((prev) => ({ ...prev, [dayKey]: nextValue }))
        }
        onSave={handleSaveEdit}
        onClose={closeEditModal}
      />
    </>
  );
}
