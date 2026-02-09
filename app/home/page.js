"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import CardMenu from "../components/HabitCard/components/CardMenu";
import DeleteConfirmationModal from "../components/HabitCard/components/DeleteConfirmationModal";
import EditTargetHabitModal from "../components/HabitCard/components/EditTargetHabitModal";
import { useHabitMenu } from "../components/HabitCard/hooks/useHabitMenu";
import {
  addWeeklyHabitCheckIn,
  deleteHabit,
  getHabits,
  markHabitCompleted,
  removeTodayCheckIn,
  updateHabitDetails,
} from "../lib/data";
import {
  countCheckInsOnLocalDate,
  countCheckInsThisWeek,
  isHabitActiveToday,
} from "../lib/habitScheduleUtils";
import WeekleyHabitsSection from "./components/weekleyhabits section/WeekleyHabitsSection";
import DailyHabitsSection from "./components/dailyHabitsSection/DailyHabitSection";
import MainCircularProgress from "./components/MainCircularProgress";
import HomeCalendar from "./components/HomeCalendar";

const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export default function HomePage() {
  const [todayHabits, setTodayHabits] = useState([]);
  const [weeklyHabits, setWeeklyHabits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenuHabit, setActiveMenuHabit] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editTarget, setEditTarget] = useState(1);
  const [isDeleteActive, setIsDeleteActive] = useState(false);
  const [isDeleteVisible, setIsDeleteVisible] = useState(false);
  const menuAnchorRef = useRef(null);
  const { menu, openMenu, closeMenu } = useHabitMenu(menuAnchorRef);

  const MODAL_DURATION = 300;
  const MIN_TARGET = 1;
  const MAX_TARGET = 20;

  useEffect(() => {
    const hydrate = async () => {
      setIsLoading(true);
      const habits = await getHabits();
      const today = new Date();
      setTodayHabits(
        habits.filter(
          (habit) =>
            habit.goalType === "daily" && isHabitActiveToday(habit, today)
        )
      );
      setWeeklyHabits(habits.filter((habit) => habit.goalType === "weekly"));
      setIsLoading(false);
    };

    hydrate();
    const handleRefresh = () => {
      hydrate();
    };
    window.addEventListener("habits:refresh", handleRefresh);
    return () => window.removeEventListener("habits:refresh", handleRefresh);
  }, []);

  const refreshHabits = async () => {
    setIsLoading(true);
    const habits = await getHabits();
    const today = new Date();
    setTodayHabits(
      habits.filter(
        (habit) =>
          habit.goalType === "daily" && isHabitActiveToday(habit, today)
      )
    );
    setWeeklyHabits(habits.filter((habit) => habit.goalType === "weekly"));
    setIsLoading(false);
  };

  const handleWeeklyIncrement = async (habit) => {
    await addWeeklyHabitCheckIn(habit.id);
    await refreshHabits();
  };

  const handleDailyIncrement = async (habit) => {
    await markHabitCompleted(habit.id);
    await refreshHabits();
  };

  const handleWeeklyDecrement = async (habit) => {
    await removeTodayCheckIn(habit.id);
    await refreshHabits();
  };

  const handleDailyDecrement = async (habit) => {
    await removeTodayCheckIn(habit.id);
    await refreshHabits();
  };

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
    setTimeout(() => setIsEditOpen(false), MODAL_DURATION);
  };

  const clampTarget = (value) =>
    Math.max(MIN_TARGET, Math.min(MAX_TARGET, value));

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

    await updateHabitDetails(activeMenuHabit.id, updates);
    await refreshHabits();
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
    setTimeout(() => setIsDeleteActive(false), MODAL_DURATION);
  };

  const handleConfirmDelete = () => {
    if (!activeMenuHabit) return;
    setIsDeleteVisible(false);
    setTimeout(() => {
      deleteHabit(activeMenuHabit.id).then(refreshHabits);
      setIsDeleteActive(false);
    }, MODAL_DURATION);
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
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-200 via-amber-300 to-orange-200 opacity-70 blur-md" />
            <div className="relative grid h-14 w-14 place-items-center rounded-2xl border border-amber-200/70 bg-white shadow-sm">
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
        minTarget={MIN_TARGET}
        maxTarget={MAX_TARGET}
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
