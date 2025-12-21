import { DEFAULT_ACTIVE_DAYS, normalizeActiveDays } from "./habitSchedule";
import { buildMockHabits } from "./analytics";

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
  const createdAt =
    habit.createdAt ||
    (completions.length ? completions[0] : new Date().toISOString().slice(0, 10));

  return {
    ...habit,
    createdAt,
    completions,
    goalType: habit.goalType || "daily",
    activeDays: normalizeActiveDays(habit.activeDays),
  };
};

const readUserHabits = () => {
  const storage = getStorage();
  if (!storage) return [];
  const storedValue = storage.getItem(STORAGE_KEY);
  if (!storedValue) return [];
  const parsed = safeParse(storedValue);
  const habits = Array.isArray(parsed) ? parsed : [];
  return habits.map(normalizeHabit);
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
  const newHabit = {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString(),
    name: habitData.name || "New habit",
    createdAt: new Date().toISOString().slice(0, 10),
    completions: [],
    goalType: habitData.goalType || "daily",
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
    return {
      ...habit,
      ...updates,
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
  const today = new Date();
  const isoDate = isoDateOverride || today.toISOString().slice(0, 10);
  const updated = habits.map((habit) => {
    if (habit.id !== habitId) return habit;
    if (habit.completions.includes(isoDate)) return habit;
    return {
      ...habit,
      createdAt: habit.createdAt || isoDate,
      completions: [...habit.completions, isoDate],
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
            activeDays: normalizeActiveDays(
              updates.activeDays ? updates.activeDays : habit.activeDays
            ),
          }
        : habit
    )
  );

export const updateMockHabitName = (habitId, name) =>
  updateMockHabitDetails(habitId, { name });

export const deleteMockHabit = (habitId) =>
  setSessionMockHabits(
    getSessionMockHabits().filter((habit) => habit.id !== habitId)
  );

export const addMockCheckIn = (habitId, isoDateOverride = null) => {
  const today = new Date().toISOString().slice(0, 10);
  const targetDate = isoDateOverride || today;
  return setSessionMockHabits(
    getSessionMockHabits().map((habit) => {
      if (habit.id !== habitId) return habit;
      if (habit.completions.includes(targetDate)) return habit;
      return {
        ...habit,
        createdAt: habit.createdAt || targetDate,
        completions: [...habit.completions, targetDate],
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
