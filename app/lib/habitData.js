import { getHabits } from "./habits";
import { applyColors, buildMockHabits } from "./analytics";
import { normalizeActiveDays } from "./habitSchedule";

let sessionMockHabits = null;

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

export const deleteMockHabit = (id) =>
  setSessionMockHabits(getSessionMockHabits().filter((habit) => habit.id !== id));

export const markMockHabitCompleted = (id, isoDateOverride = null) => {
  const today = new Date().toISOString().slice(0, 10);
  const targetDate = isoDateOverride || today;
  return setSessionMockHabits(
    getSessionMockHabits().map((habit) => {
      if (habit.id !== id) return habit;
      if (habit.completions.includes(targetDate)) return habit;
      return {
        ...habit,
        createdAt: habit.createdAt || targetDate,
        completions: [...habit.completions, targetDate],
      };
    }),
  );
};

export const removeMockHabitLastCompletion = (id) => {
  return setSessionMockHabits(
    getSessionMockHabits().map((habit) => {
      if (habit.id !== id) return habit;
      if (!habit.completions || habit.completions.length === 0) return habit;
      const latest = habit.completions.reduce((latestIso, currentIso) =>
        latestIso && latestIso > currentIso ? latestIso : currentIso,
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
    }),
  );
};

export const loadHabitsWithMock = () => {
  const userHabits = getHabits().map((habit) => ({ ...habit, isMock: false }));
  const mockHabits = getSessionMockHabits().map((habit) => ({ ...habit, isMock: true }));
  const habits = applyColors([...userHabits, ...mockHabits]);
  return { habits, usingMockData: userHabits.length === 0 };
};

export const updateMockHabitName = (id, name) =>
  setSessionMockHabits(
    getSessionMockHabits().map((habit) => (habit.id === id ? { ...habit, name } : habit)),
  );

export const updateMockHabitDetails = (id, updates = {}) =>
  setSessionMockHabits(
    getSessionMockHabits().map((habit) =>
      habit.id === id
        ? {
            ...habit,
            ...updates,
            activeDays: normalizeActiveDays(
              updates.activeDays ? updates.activeDays : habit.activeDays,
            ),
          }
        : habit,
    ),
  );
