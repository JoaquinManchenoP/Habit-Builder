import { getHabits } from "./habits";
import { applyColors, buildMockHabits } from "./analytics";

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

export const markMockHabitCompleted = (id) => {
  const today = new Date().toISOString().slice(0, 10);
  return setSessionMockHabits(
    getSessionMockHabits().map((habit) => {
      if (habit.id !== id) return habit;
      if (habit.completions.includes(today)) return habit;
      return {
        ...habit,
        completions: [...habit.completions, today],
      };
    }),
  );
};

export const loadHabitsWithMock = () => {
  const userHabits = getHabits().map((habit) => ({ ...habit, isMock: false }));
  const mockHabits = getSessionMockHabits().map((habit) => ({ ...habit, isMock: true }));
  const habits = applyColors([...userHabits, ...mockHabits]);
  return { habits, usingMockData: userHabits.length === 0 };
};
