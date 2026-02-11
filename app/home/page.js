"use client";

import { useMemo, useRef, useState } from "react";
import CardMenu from "../components/HabitCard/components/CardMenu";
import DeleteConfirmationModal from "../components/HabitCard/components/DeleteConfirmationModal";
import EditTargetHabitModal from "../components/HabitCard/components/EditTargetHabitModal";
import { useHabitMenu } from "../components/HabitCard/hooks/useHabitMenu";
import {
  countCheckInsOnLocalDate,
  countCheckInsThisWeek,
} from "../lib/habitScheduleUtils";
import { useHabits } from "../lib/hooks/useHabits";
import {
  HABIT_TARGET_MAX,
  HABIT_TARGET_MIN,
  MODAL_DURATION_MS,
} from "../lib/habitConstants";
import WeekleyHabitsSection from "./components/weekleyhabits section/WeekleyHabitsSection";
import DailyHabitsSection from "./components/dailyHabitsSection/DailyHabitSection";
import MainCircularProgress from "./components/MainCircularProgress";
import HomeCalendar from "./components/HomeCalendar";

const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export default function HomePage() {
  const { todayHabits, weeklyHabits, isLoading, markCompleted, removeToday, addWeeklyCheckIn, deleteById, updateById } =
    useHabits();
  const [activeMenuHabit, setActiveMenuHabit] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editTarget, setEditTarget] = useState(HABIT_TARGET_MIN);
  const [isDeleteActive, setIsDeleteActive] = useState(false);
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);
  const menuAnchorRef = useRef(null);
  const { menu, openMenu, closeMenu } = useHabitMenu(menuAnchorRef);

  const handleWeeklyIncrement = async (habit) => {
    await addWeeklyCheckIn(habit.id);
  };

  const handleDailyIncrement = async (habit) => {
    await markCompleted(habit.id);
  };

  const handleWeeklyDecrement = async (habit) => removeToday(habit.id);

  const handleDailyDecrement = async (habit) => removeToday(habit.id);

  const handleMenuOpen = (habit, event) => {
    setActiveMenuHabit(habit);
    openMenu(event);
  };

  const openEditModal = () => {
    if (!activeMenuHabit) return;
    closeMenu();
    const targetValue =
      activeMenuHabit.goalType === "weekly"
        ? Math.max(1, activeMenuHabit.timesPerWeek || 1)
        : Math.max(1, activeMenuHabit.timesPerDay || 1);
    setEditName(activeMenuHabit.name || "");
    setEditTarget(targetValue);
    setIsEditOpen(true);
    setIsEditVisible(false);
    requestAnimationFrame(() => setIsEditVisible(true));
  };

  const closeEditModal = () => {
    setIsEditVisible(false);
    setTimeout(() => setIsEditOpen(false), MODAL_DURATION_MS);
  };

  const clampTarget = (value) =>
    Math.max(HABIT_TARGET_MIN, Math.min(HABIT_TARGET_MAX, value));

  const handleTargetChange = (value) => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return;
    setEditTarget(clampTarget(parsed));
  };

  const handleSaveEdit = async (nextName, nextTarget) => {
    if (!activeMenuHabit) return;
    const trimmedName = nextName?.trim();
    if (!trimmedName) return;
    const resolvedTarget = clampTarget(Number(nextTarget) || editTarget);
    const updates =
      activeMenuHabit.goalType === "weekly"
        ? { name: trimmedName, timesPerWeek: resolvedTarget }
        : { name: trimmedName, timesPerDay: resolvedTarget };

    await updateById(activeMenuHabit.id, updates);
    closeEditModal();
  };

  const handleDeleteRequest = () => {
    if (!activeMenuHabit) return;
    closeMenu();
    setIsDeleteActive(true);
    setIsDeleteVisible(false);
    requestAnimationFrame(() => setIsDeleteVisible(true));
  };

  const handleCancelDelete = () => {
    setIsDeleteVisible(false);
    setTimeout(() => setIsDeleteActive(false), MODAL_DURATION_MS);
  };

  const handleConfirmDelete = () => {
    if (!activeMenuHabit) return;
    setIsDeleteVisible(false);
    setTimeout(() => {
      deleteById(activeMenuHabit.id);
      setIsDeleteActive(false);
    }, MODAL_DURATION_MS);
  };

  const todayList = useMemo(() => {
    const today = new Date();
    const isCompleted = (habit) => {
      const target = Math.max(1, habit.timesPerDay || 1);
      const count = countCheckInsOnLocalDate(habit.checkIns || [], today);
      return count >= target;
    };
    const incomplete = todayHabits.filter((habit) => !isCompleted(habit));
    const completed = todayHabits.filter((habit) => isCompleted(habit));
    return [...incomplete, ...completed];
  }, [todayHabits]);
  const weeklyList = useMemo(() => {
    const isCompleted = (habit) => {
      const target = Math.max(1, habit.timesPerWeek || 1);
      const count = countCheckInsThisWeek(habit.checkIns || []);
      return count >= target;
    };
    const incomplete = weeklyHabits.filter((habit) => !isCompleted(habit));
    const completed = weeklyHabits.filter((habit) => isCompleted(habit));
    return [...incomplete, ...completed];
  }, [weeklyHabits]);

  if (isLoading) {
    return (
      <div className="-mx-4 -mt-6 min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:-mx-6 sm:px-6">
        <div className="mx-auto flex min-h-[70vh] w-full max-w-xl flex-col items-center justify-center gap-5">
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-200 via-orange-300 to-orange-400 opacity-70 blur-md" />
            <div className="relative grid h-14 w-14 place-items-center rounded-2xl border border-orange-200/70 bg-white shadow-sm">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
              Loading
            </p>
            <p className="text-lg font-semibold text-slate-800">
              Warming up your habits
            </p>
          </div>
          <div className="h-1 w-32 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-slate-400/70" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="-mx-4 -mt-6 min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:-mx-6 sm:px-6">
      <div
        ref={menuAnchorRef}
        className="relative mx-auto space-y-8 lg:w-[55vw] md:w-4/6 sm:w-full"
      >
        <HomeCalendar weekDays={WEEK_DAYS} />
        <div className="space-y-4">
          <MainCircularProgress todayList={todayList} />
          <DailyHabitsSection
            todayList={todayList}
            onIncrement={handleDailyIncrement}
            onDecrement={handleDailyDecrement}
            onMenuOpen={handleMenuOpen}
          />
        </div>
        <WeekleyHabitsSection
          weeklyList={weeklyList}
          onIncrement={handleWeeklyIncrement}
          onDecrement={handleWeeklyDecrement}
          onMenuOpen={handleMenuOpen}
        />
        <CardMenu
          menu={menu}
          onClose={closeMenu}
          onEdit={openEditModal}
          onDelete={handleDeleteRequest}
          deleteLabel="Delete habit"
        />
      </div>
      <EditTargetHabitModal
        open={isEditOpen}
        visible={isEditVisible}
        nameValue={editName}
        targetValue={editTarget}
        targetLabel={
          activeMenuHabit?.goalType === "weekly"
            ? "Times per week"
            : "Times per day"
        }
        minTarget={HABIT_TARGET_MIN}
        maxTarget={HABIT_TARGET_MAX}
        onChangeName={setEditName}
        onChangeTarget={handleTargetChange}
        onIncrementTarget={() =>
          setEditTarget((prev) => clampTarget(prev + 1))
        }
        onDecrementTarget={() =>
          setEditTarget((prev) => clampTarget(prev - 1))
        }
        onSave={handleSaveEdit}
        onClose={closeEditModal}
      />
      <DeleteConfirmationModal
        isActive={isDeleteActive}
        isVisible={isDeleteVisible}
        habitName={activeMenuHabit?.name}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
