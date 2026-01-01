import { DEFAULT_ACTIVE_DAYS, normalizeActiveDays } from "./habitSchedule";
import { buildMockHabits } from "./analytics";
import { getThemeColorForGoalType } from "./habitTheme";

const STORAGE_KEY = "habits";
const DEFAULT_USER_ID = "local-user";
const USERS = [{ id: DEFAULT_USER_ID, name: "Local User" }];

let sessionMockHabits = null;

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error("Failed to parse habits from storage", error);
    return [];
  }
};

const getStorage = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage;
};

const normalizeHabit = (habit) => {
  const completions = Array.isArray(habit.completions) ? habit.completions : [];
  const checkIns = Array.isArray(habit.checkIns) ? habit.checkIns : [];
  const createdAt =
    habit.createdAt ||
    (completions.length ? completions[0] : new Date().toISOString().slice(0, 10));
  const createdAtTimestamp =
    typeof habit.createdAtTimestamp === "number"
      ? habit.createdAtTimestamp
      : Date.parse(createdAt);
  const goalType = habit.goalType || "daily";
  const themeColor = habit.themeColor || getThemeColorForGoalType(goalType);
  const timesPerDay = Number.isFinite(habit.timesPerDay)
    ? Math.max(1, Math.min(20, Math.floor(habit.timesPerDay)))
    : 1;
  const timesPerWeek = Number.isFinite(habit.timesPerWeek)
    ? Math.max(1, Math.min(20, Math.floor(habit.timesPerWeek)))
    : 1;

  return {
    ...habit,
    createdAt,
    createdAtTimestamp,
    completions,
    checkIns,
    goalType,
    themeColor,
    timesPerDay: goalType === "daily" ? timesPerDay : habit.timesPerDay,
    timesPerWeek: goalType === "weekly" ? timesPerWeek : habit.timesPerWeek,
    activeDays: normalizeActiveDays(habit.activeDays),
  };
};

const toLocalISODate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toLocalDateFromISO = (isoDate) => {
  if (!isoDate) return null;
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [_, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day), 12);
};

const readUserHabits = () => {
  const storage = getStorage();
  if (!storage) return [];
  const storedValue = storage.getItem(STORAGE_KEY);
  if (!storedValue) return [];
  const parsed = safeParse(storedValue);
  const habits = Array.isArray(parsed) ? parsed : [];
  const normalized = habits.map(normalizeHabit);
  const needsPersist = normalized.some((habit, index) => {
    const original = habits[index] || {};
    return (
      original.goalType !== habit.goalType ||
      original.themeColor !== habit.themeColor ||
      original.timesPerDay !== habit.timesPerDay ||
      original.timesPerWeek !== habit.timesPerWeek ||
      original.checkIns === undefined
    );
  });
  if (needsPersist) {
    persistUserHabits(normalized);
  }
  return normalized;
};

const persistUserHabits = (habits) => {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(STORAGE_KEY, JSON.stringify(habits));
};

const getSessionMockHabits = () => {
  if (!sessionMockHabits) {
    sessionMockHabits = buildMockHabits();
  }
  return sessionMockHabits;
};

const setSessionMockHabits = (nextHabits) => {
  sessionMockHabits = nextHabits;
  return sessionMockHabits;
};

export const getUsers = () => USERS;

export const getDefaultUserId = () => DEFAULT_USER_ID;

export const getHabitsByUserId = () => readUserHabits();

export const getHabitById = (habitId) => {
  const habits = readUserHabits();
  return habits.find((habit) => habit.id === habitId) || null;
};

export const createHabit = (userId, habitData = {}) => {
  const habits = readUserHabits();
  const goalType = habitData.goalType || "daily";
  const themeColor =
    habitData.themeColor || getThemeColorForGoalType(goalType);
  const timesPerDay = Number.isFinite(habitData.timesPerDay)
    ? Math.max(1, Math.min(20, Math.floor(habitData.timesPerDay)))
    : 1;
  const timesPerWeek = Number.isFinite(habitData.timesPerWeek)
    ? Math.max(1, Math.min(20, Math.floor(habitData.timesPerWeek)))
    : 1;
  const newHabit = {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString(),
    name: habitData.name || "New habit",
    createdAt: new Date().toISOString().slice(0, 10),
    createdAtTimestamp: Date.now(),
    completions: [],
    checkIns: [],
    goalType,
    themeColor,
    timesPerDay: goalType === "daily" ? timesPerDay : undefined,
    timesPerWeek: goalType === "weekly" ? timesPerWeek : undefined,
    activeDays: normalizeActiveDays(habitData.activeDays || DEFAULT_ACTIVE_DAYS),
  };
  const updated = [...habits, newHabit];
  persistUserHabits(updated);
  return newHabit;
};

export const updateHabit = (habitId, updates = {}) => {
  const habits = readUserHabits();
  const updated = habits.map((habit) => {
    if (habit.id !== habitId) return habit;
    const goalType = updates.goalType || habit.goalType || "daily";
    const themeColor =
      updates.themeColor ||
      habit.themeColor ||
      getThemeColorForGoalType(goalType);
    const timesPerDay = Number.isFinite(updates.timesPerDay)
      ? Math.max(1, Math.min(20, Math.floor(updates.timesPerDay)))
      : Number.isFinite(habit.timesPerDay)
      ? habit.timesPerDay
      : 1;
    const timesPerWeek = Number.isFinite(updates.timesPerWeek)
      ? Math.max(1, Math.min(20, Math.floor(updates.timesPerWeek)))
      : Number.isFinite(habit.timesPerWeek)
      ? habit.timesPerWeek
      : 1;
    return {
      ...habit,
      ...updates,
      goalType,
      themeColor,
      timesPerDay: goalType === "daily" ? timesPerDay : habit.timesPerDay,
      timesPerWeek: goalType === "weekly" ? timesPerWeek : habit.timesPerWeek,
      activeDays: normalizeActiveDays(
        updates.activeDays ? updates.activeDays : habit.activeDays
      ),
    };
  });
  persistUserHabits(updated);
  return updated;
};

export const deleteHabit = (habitId) => {
  const habits = readUserHabits();
  const filtered = habits.filter((habit) => habit.id !== habitId);
  persistUserHabits(filtered);
  return filtered;
};

export const addCheckIn = (habitId, isoDateOverride = null) => {
  const habits = readUserHabits();
  const targetDate =
    (isoDateOverride && toLocalDateFromISO(isoDateOverride)) || new Date();
  const isoDate = toLocalISODate(targetDate);
  const isoTimestamp = targetDate.toISOString();
  const updated = habits.map((habit) => {
    if (habit.id !== habitId) return habit;
    const checkIns = Array.isArray(habit.checkIns) ? habit.checkIns : [];
    const completions = Array.isArray(habit.completions)
      ? habit.completions
      : [];
    const nextCompletions = completions.includes(isoDate)
      ? completions
      : [...completions, isoDate];
    return {
      ...habit,
      createdAt: habit.createdAt || isoDate,
      checkIns: [...checkIns, isoTimestamp],
      completions: nextCompletions,
    };
  });
  persistUserHabits(updated);
  return updated;
};

export const removeCheckIn = (habitId, isoDate) => {
  const habits = readUserHabits();
  const updated = habits.map((habit) => {
    if (habit.id !== habitId) return habit;
    if (!habit.completions || habit.completions.length === 0) return habit;
    const nextCompletions = isoDate
      ? habit.completions.filter((date) => date !== isoDate)
      : habit.completions;
    return { ...habit, completions: nextCompletions };
  });
  persistUserHabits(updated);
  return updated;
};

export const removeLastCompletion = (habitId) => {
  const habits = readUserHabits();
  const updated = habits.map((habit) => {
    if (habit.id !== habitId) return habit;
    if (!habit.completions || habit.completions.length === 0) return habit;
    const latest = habit.completions.reduce((latestIso, currentIso) =>
      latestIso && latestIso > currentIso ? latestIso : currentIso
    );
    let removed = false;
    const nextCompletions = habit.completions.filter((iso) => {
      if (!removed && iso === latest) {
        removed = true;
        return false;
      }
      return true;
    });
    return { ...habit, completions: nextCompletions };
  });
  persistUserHabits(updated);
  return updated;
};

export const getMockHabits = () =>
  getSessionMockHabits().map((habit) => ({ ...habit, isMock: true }));

export const updateMockHabitDetails = (habitId, updates = {}) =>
  setSessionMockHabits(
    getSessionMockHabits().map((habit) =>
      habit.id === habitId
        ? {
            ...habit,
            ...updates,
            goalType: updates.goalType || habit.goalType || "daily",
            themeColor:
              updates.themeColor ||
              habit.themeColor ||
              getThemeColorForGoalType(updates.goalType || habit.goalType || "daily"),
            timesPerDay: Number.isFinite(updates.timesPerDay)
              ? Math.max(1, Math.floor(updates.timesPerDay))
              : habit.timesPerDay,
            timesPerWeek: Number.isFinite(updates.timesPerWeek)
              ? Math.max(1, Math.floor(updates.timesPerWeek))
              : habit.timesPerWeek,
            activeDays: normalizeActiveDays(
              updates.activeDays ? updates.activeDays : habit.activeDays
            ),
          }
        : habit
    )
  );

export const addWeeklyCheckIn = (habitId, timestamp = null) => {
  const habits = readUserHabits();
  const isoTimestamp = timestamp || new Date().toISOString();
  const isoDate = new Date(isoTimestamp).toISOString().slice(0, 10);
  const updated = habits.map((habit) => {
    if (habit.id !== habitId) return habit;
    const checkIns = Array.isArray(habit.checkIns) ? habit.checkIns : [];
    const completions = Array.isArray(habit.completions)
      ? habit.completions
      : [];
    const nextCompletions = completions.includes(isoDate)
      ? completions
      : [...completions, isoDate];
    return {
      ...habit,
      checkIns: [...checkIns, isoTimestamp],
      completions: nextCompletions,
    };
  });
  persistUserHabits(updated);
  return updated;
};

export const addMockWeeklyCheckIn = (habitId, timestamp = null) => {
  const isoTimestamp = timestamp || new Date().toISOString();
  const isoDate = new Date(isoTimestamp).toISOString().slice(0, 10);
  return setSessionMockHabits(
    getSessionMockHabits().map((habit) => {
      if (habit.id !== habitId) return habit;
      const checkIns = Array.isArray(habit.checkIns) ? habit.checkIns : [];
      const completions = Array.isArray(habit.completions)
        ? habit.completions
        : [];
      const nextCompletions = completions.includes(isoDate)
        ? completions
        : [...completions, isoDate];
      return {
        ...habit,
        checkIns: [...checkIns, isoTimestamp],
        completions: nextCompletions,
      };
    })
  );
};

export const updateMockHabitName = (habitId, name) =>
  updateMockHabitDetails(habitId, { name });

export const deleteMockHabit = (habitId) =>
  setSessionMockHabits(
    getSessionMockHabits().filter((habit) => habit.id !== habitId)
  );

export const addMockCheckIn = (habitId, isoDateOverride = null) => {
  const targetDate =
    (isoDateOverride && toLocalDateFromISO(isoDateOverride)) || new Date();
  const isoDate = toLocalISODate(targetDate);
  const isoTimestamp = targetDate.toISOString();
  return setSessionMockHabits(
    getSessionMockHabits().map((habit) => {
      if (habit.id !== habitId) return habit;
      const checkIns = Array.isArray(habit.checkIns) ? habit.checkIns : [];
      const completions = Array.isArray(habit.completions)
        ? habit.completions
        : [];
      const nextCompletions = completions.includes(isoDate)
        ? completions
        : [...completions, isoDate];
      return {
        ...habit,
        createdAt: habit.createdAt || isoDate,
        checkIns: [...checkIns, isoTimestamp],
        completions: nextCompletions,
      };
    })
  );
};

export const removeMockLastCompletion = (habitId) => {
  return setSessionMockHabits(
    getSessionMockHabits().map((habit) => {
      if (habit.id !== habitId) return habit;
      if (!habit.completions || habit.completions.length === 0) return habit;
      const latest = habit.completions.reduce((latestIso, currentIso) =>
        latestIso && latestIso > currentIso ? latestIso : currentIso
      );
      let removed = false;
      const completions = habit.completions.filter((iso) => {
        if (!removed && iso === latest) {
          removed = true;
          return false;
        }
        return true;
      });
      return { ...habit, completions };
    })
  );
};
