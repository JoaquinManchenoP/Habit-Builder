import { getHabits } from "./habits";
import { applyColors, buildMockHabits } from "./analytics";

export const loadHabitsWithMock = () => {
  const stored = getHabits();
  if (stored.length) {
    return { habits: applyColors(stored), usingMockData: false };
  }

  return { habits: applyColors(buildMockHabits()), usingMockData: true };
};
