"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addWeeklyHabitCheckIn,
  deleteHabit,
  getHabits,
  markHabitCompleted,
  removeTodayCheckIn,
  updateHabitDetails,
} from "../data";
import { isHabitActiveToday } from "../habitScheduleUtils";

export const useHabits = () => {
  const [habits, setHabits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshHabits = useCallback(async () => {
    setIsLoading(true);
    const loaded = await getHabits();
    setHabits(loaded);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      refreshHabits();
    }, 0);
    const handleRefresh = () => {
      refreshHabits();
    };
    window.addEventListener("habits:refresh", handleRefresh);
    return () => {
      window.clearTimeout(timerId);
      window.removeEventListener("habits:refresh", handleRefresh);
    };
  }, [refreshHabits]);

  const markCompleted = useCallback(
    async (id, isoDateOverride = null) => {
      await markHabitCompleted(id, isoDateOverride);
      await refreshHabits();
    },
    [refreshHabits]
  );

  const removeToday = useCallback(
    async (id) => {
      await removeTodayCheckIn(id);
      await refreshHabits();
    },
    [refreshHabits]
  );

  const addWeeklyCheckIn = useCallback(
    async (id) => {
      await addWeeklyHabitCheckIn(id);
      await refreshHabits();
    },
    [refreshHabits]
  );

  const deleteById = useCallback(
    async (id) => {
      await deleteHabit(id);
      await refreshHabits();
    },
    [refreshHabits]
  );

  const updateById = useCallback(
    async (id, updates = {}) => {
      await updateHabitDetails(id, updates);
      await refreshHabits();
    },
    [refreshHabits]
  );

  const todayHabits = useMemo(() => {
    const today = new Date();
    return habits.filter(
      (habit) => habit.goalType === "daily" && isHabitActiveToday(habit, today)
    );
  }, [habits]);

  const weeklyHabits = useMemo(
    () => habits.filter((habit) => habit.goalType === "weekly"),
    [habits]
  );

  return {
    habits,
    todayHabits,
    weeklyHabits,
    isLoading,
    refreshHabits,
    markCompleted,
    removeToday,
    addWeeklyCheckIn,
    deleteById,
    updateById,
  };
};
