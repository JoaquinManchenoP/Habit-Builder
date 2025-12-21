import { WEEKDAY_ORDER } from "./habitSchedule";

const LOCAL_DAY_KEY_BY_INDEX = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export const getLocalDayKey = (date = new Date()) =>
  LOCAL_DAY_KEY_BY_INDEX[date.getDay()];

export const isHabitActiveToday = (habit, date = new Date()) => {
  if (!habit?.activeDays) return false;
  if (habit.goalType === "weekly") return false;
  const key = getLocalDayKey(date);
  return Boolean(habit.activeDays[key]);
};

export const isHabitLaterThisWeek = (habit, date = new Date()) => {
  if (!habit?.activeDays) return false;
  if (habit.goalType === "weekly") return false;
  const todayKey = getLocalDayKey(date);
  const startIndex = WEEKDAY_ORDER.indexOf(todayKey);
  if (startIndex < 0) return false;
  const remainingKeys = WEEKDAY_ORDER.slice(startIndex + 1);
  return remainingKeys.some((key) => habit.activeDays[key]);
};
