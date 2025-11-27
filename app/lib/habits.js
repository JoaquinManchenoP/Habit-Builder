const STORAGE_KEY = "habits";

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
  // Default the creation date to the earliest completion or today so
  // downstream features can reason about when the habit became active.
  const createdAt =
    habit.createdAt ||
    (completions.length ? completions[0] : new Date().toISOString().slice(0, 10));

  return {
    ...habit,
    createdAt,
    completions,
    isMock: Boolean(habit.isMock),
  };
};

const readHabits = () => {
  const storage = getStorage();
  if (!storage) return [];
  const storedValue = storage.getItem(STORAGE_KEY);
  if (!storedValue) return [];
  const parsed = safeParse(storedValue);
  const habits = Array.isArray(parsed) ? parsed : [];
  return habits.map(normalizeHabit);
};

const persistHabits = (habits) => {
  const storage = getStorage();
  if (!storage) return;
  const userHabits = habits.filter((habit) => !habit.isMock);
  storage.setItem(STORAGE_KEY, JSON.stringify(userHabits));
};

export function getHabits() {
  return readHabits();
}

export function createHabit(name) {
  const habits = readHabits();
  const newHabit = {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString(),
    name,
    createdAt: new Date().toISOString().slice(0, 10),
    completions: [],
    isMock: false,
  };
  const updated = [...habits, newHabit];
  persistHabits(updated);
  return newHabit;
}

export function deleteHabit(id) {
  const habits = readHabits();
  const filtered = habits.filter((habit) => habit.id !== id);
  persistHabits(filtered);
  return filtered;
}

export function markHabitCompleted(id) {
  const habits = readHabits();
  const today = new Date();
  const isoDate = today.toISOString().slice(0, 10);

  const updated = habits.map((habit) => {
    if (habit.id !== id) return habit;

    if (habit.completions.includes(isoDate)) {
      return habit;
    }

    return {
      ...habit,
      createdAt: habit.createdAt || isoDate,
      completions: [...habit.completions, isoDate],
    };
  });

  persistHabits(updated);
  return updated;
}
