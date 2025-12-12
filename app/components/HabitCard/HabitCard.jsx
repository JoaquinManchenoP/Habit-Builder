"use client";

import { useRef } from "react";
import CardHeader from "./components/CardHeader";
import CardMenu from "./components/CardMenu";
import CompletionOverlay from "./components/CompletionOverlay";
import Heatmap from "./components/Heatmap";
import MetricsGrid from "./components/MetricsGrid";
import PreviousCheckInModal from "./components/PreviousCheckInModal";
import EditHabitModal from "./components/EditHabitModal";
import { useHabitMetrics } from "./hooks/useHabitMetrics";
import { useHabitMenu } from "./hooks/useHabitMenu";
import { useHabitBackfillModal } from "./hooks/useHabitBackfillModal";
import { useHabitActions } from "./hooks/useHabitActions";
import { useHabitEditModal } from "./hooks/useHabitEditModal";

export default function HabitCard({
  habit,
  onDelete,
  onComplete,
  isCompletedToday = false,
  isFading = false,
  cardRef = null,
}) {
  const internalRef = useRef(null);

  const { days, metrics } = useHabitMetrics(habit);
  const { menu, openMenu, closeMenu } = useHabitMenu(internalRef);
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
  });

  return (
    <>
      <div
        ref={(node) => {
          internalRef.current = node;
          if (typeof cardRef === "function") {
            cardRef(node);
          } else if (cardRef && "current" in cardRef) {
            cardRef.current = node;
          }
        }}
        className={`group relative grid h-[370px] grid-rows-[2fr_4fr_4fr] rounded-2xl border border-slate-200 p-5 shadow-md transform origin-center transition ${
          isFading
            ? "pointer-events-none opacity-0 scale-95 transition-all duration-[400ms] ease-out"
            : "opacity-100 transform hover:scale-[1.02] active:scale-[0.99]"
        }`}
      >
        <div
          className={` pt-3 relative flex h-full w-full flex-col origin-center transition-transform ${
            isCompletedToday ? "scale-[0.97] group-hover:scale-100" : "scale-100"
          }`}
        >
          <CardHeader
            name={habit.name}
            color={habit.color}
            isCompletedToday={isCompletedToday}
            onToggleComplete={handleToggleComplete}
            onOpenMenu={(event) => {
              if (event.target.closest("input[type='checkbox']")) return;
              openMenu(event);
            }}
          />
          <MetricsGrid metrics={metrics} />
          <Heatmap days={days} color={habit.color} />
        </div>
        {isCompletedToday ? <CompletionOverlay /> : null}
        <CardMenu
          menu={menu}
          onClose={closeMenu}
          onAddPreviousCheckIn={handleOpenPreviousCheckIn}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
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
        onChangeName={setEditName}
        onSave={handleSaveEdit}
        onClose={closeEditModal}
      />
    </>
  );
}
