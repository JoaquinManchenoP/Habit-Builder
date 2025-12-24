import { applyColors } from "./analytics";
import {
  addMockCheckIn,
  addMockWeeklyCheckIn,
  deleteMockHabit,
  getDefaultUserId,
  getHabitsByUserId,
  getMockHabits,
  removeMockLastCompletion,
  updateMockHabitDetails,
  updateMockHabitName,
} from "./mockDb";

export { deleteMockHabit, updateMockHabitDetails, updateMockHabitName };

export const markMockHabitCompleted = (id, isoDateOverride = null) =>
  addMockCheckIn(id, isoDateOverride);

export const addMockWeeklyHabitCheckIn = (id, timestamp = null) =>
  addMockWeeklyCheckIn(id, timestamp);

export const removeMockHabitLastCompletion = (id) => removeMockLastCompletion(id);

export const loadHabitsWithMock = () => {
  const userHabits = getHabitsByUserId(getDefaultUserId()).map((habit) => ({
    ...habit,
    isMock: false,
  }));
  const mockHabits = getMockHabits();
  const habits = applyColors([...userHabits, ...mockHabits]);
  return { habits, usingMockData: userHabits.length === 0 };
};
