"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addMockWeeklyHabitCheckIn,
  loadHabitsWithMock,
  markMockHabitCompleted,
} from "../lib/habitData";
import { addWeeklyHabitCheckIn, markHabitCompleted } from "../lib/habits";
import { isHabitActiveToday } from "../lib/habitScheduleUtils";
import WeekleyHabitsSection from "./components/weekleyhabits section/WeekleyHabitsSection";
import DailyHabitsSection from "./components/dailyHabitsSection/DailyHabitSection";
import MainCircularProgress from "./components/MainCircularProgress";
import HomeCalendar from "./components/HomeCalendar";

const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

const TODAY_PROGRESS = {
  percent: 50,
  label: "Eat vegetables",
  subtitle: "Goal: 2 servings",
  color: "#ffcd1f",
  count: 1,
};

export default function HomePage() {
  const [todayHabits, setTodayHabits] = useState([]);
  const [weeklyHabits, setWeeklyHabits] = useState([]);

  useEffect(() => {
    const hydrate = () => {
      const { habits } = loadHabitsWithMock();
      const today = new Date();
      setTodayHabits(
        habits.filter(
          (habit) =>
            habit.goalType !== "weekly" && isHabitActiveToday(habit, today)
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
          habit.goalType !== "weekly" && isHabitActiveToday(habit, today)
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

  const todayList = useMemo(() => todayHabits, [todayHabits]);
  const weeklyList = useMemo(() => weeklyHabits, [weeklyHabits]);

  return (
    <div className="-mx-4 -mt-6 min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:-mx-6 sm:px-6">
      <div className="mx-auto space-y-8 lg:w-[55vw] md:w-4/6 sm:w-full ">
        <HomeCalendar weekDays={WEEK_DAYS} />
        <div className="space-y-4">
          <MainCircularProgress progress={TODAY_PROGRESS} />
          <DailyHabitsSection
            todayList={todayList}
            onIncrement={handleDailyIncrement}
          />
        </div>
        <WeekleyHabitsSection
          weeklyList={weeklyList}
          onIncrement={handleWeeklyIncrement}
        />
      </div>
    </div>
  );
}
