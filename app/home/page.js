"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import CardMenu from "../components/HabitCard/components/CardMenu";
import DeleteConfirmationModal from "../components/HabitCard/components/DeleteConfirmationModal";
import EditTargetHabitModal from "../components/HabitCard/components/EditTargetHabitModal";
import { useHabitMenu } from "../components/HabitCard/hooks/useHabitMenu";
import {
  addMockWeeklyHabitCheckIn,
  deleteMockHabit,
  loadHabitsWithMock,
  markMockHabitCompleted,
  removeMockHabitTodayCheckIn,
  updateMockHabitDetails,
} from "../lib/habitData";
import {
  addWeeklyHabitCheckIn,
  deleteHabit,
  markHabitCompleted,
  removeTodayCheckIn,
  updateHabitDetails,
} from "../lib/habits";
import { isHabitActiveToday } from "../lib/habitScheduleUtils";
import WeekleyHabitsSection from "./components/weekleyhabits section/WeekleyHabitsSection";
import DailyHabitsSection from "./components/dailyHabitsSection/DailyHabitSection";
import MainCircularProgress from "./components/MainCircularProgress";
import HomeCalendar from "./components/HomeCalendar";

const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export default function HomePage() {
  const [todayHabits, setTodayHabits] = useState([]);
  const [weeklyHabits, setWeeklyHabits] = useState([]);
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
    const hydrate = () => {
      const { habits } = loadHabitsWithMock();
      const today = new Date();
      setTodayHabits(
        habits.filter(
          (habit) =>
            habit.goalType === "daily" && isHabitActiveToday(habit, today)
        )
      );
      setWeeklyHabits(habits.filter((habit) => habit.goalType === "weekly"));
    };

    hydrate();
    window.addEventListener("storage", hydrate);
    return () => window.removeEventListener("storage", hydrate);
  }, []);

  const refreshHabits = () => {
    const { habits } = loadHabitsWithMock();
    const today = new Date();
    setTodayHabits(
      habits.filter(
        (habit) =>
          habit.goalType === "daily" && isHabitActiveToday(habit, today)
      )
    );
    setWeeklyHabits(habits.filter((habit) => habit.goalType === "weekly"));
  };

  const handleWeeklyIncrement = (habit) => {
    if (habit.isMock) {
      addMockWeeklyHabitCheckIn(habit.id);
    } else {
      addWeeklyHabitCheckIn(habit.id);
    }
    refreshHabits();
  };

  const handleDailyIncrement = (habit) => {
    if (habit.isMock) {
      markMockHabitCompleted(habit.id);
    } else {
      markHabitCompleted(habit.id);
    }
    refreshHabits();
  };

  const handleWeeklyDecrement = (habit) => {
    if (habit.isMock) {
      removeMockHabitTodayCheckIn(habit.id);
    } else {
      removeTodayCheckIn(habit.id);
    }
    refreshHabits();
  };

  const handleDailyDecrement = (habit) => {
    if (habit.isMock) {
      removeMockHabitTodayCheckIn(habit.id);
    } else {
      removeTodayCheckIn(habit.id);
    }
    refreshHabits();
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

  const handleSaveEdit = (nextName, nextTarget) => {
    if (!activeMenuHabit) return;
    const trimmedName = nextName?.trim();
    if (!trimmedName) return;
    const resolvedTarget = clampTarget(Number(nextTarget) || editTarget);
    const updates =
      activeMenuHabit.goalType === "weekly"
        ? { name: trimmedName, timesPerWeek: resolvedTarget }
        : { name: trimmedName, timesPerDay: resolvedTarget };

    if (activeMenuHabit.isMock) {
      updateMockHabitDetails(activeMenuHabit.id, updates);
    } else {
      updateHabitDetails(activeMenuHabit.id, updates);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storage"));
    }
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
      if (activeMenuHabit.isMock) {
        deleteMockHabit(activeMenuHabit.id);
      } else {
        deleteHabit(activeMenuHabit.id);
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"));
      }
      setIsDeleteActive(false);
    }, MODAL_DURATION);
  };

  const todayList = useMemo(() => todayHabits, [todayHabits]);
  const weeklyList = useMemo(() => weeklyHabits, [weeklyHabits]);

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
