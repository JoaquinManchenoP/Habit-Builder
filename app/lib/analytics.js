const COLORS = [
  "#2563eb",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#0ea5e9",
  "#f97316",
  "#14b8a6",
  "#9333ea",
  "#94a3b8",
];

const toISODate = (date) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseISODate = (iso) => {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const startOfWeek = (date) => {
  const clone = new Date(date);
  clone.setUTCHours(0, 0, 0, 0);
  const day = clone.getUTCDay();
  const diffToMonday = (day + 6) % 7;
  clone.setUTCDate(clone.getUTCDate() - diffToMonday);
  return clone;
};

const addDays = (date, days) => {
  const clone = new Date(date);
  clone.setUTCDate(clone.getUTCDate() + days);
  return clone;
};

const daysBetweenInclusive = (start, end) => {
  if (end < start) return 0;
  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / 86_400_000) + 1;
};

const formatWeekLabel = (weekStart) =>
  weekStart.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

const buildMockHabits = (today = new Date()) => {
  const weekAnchor = startOfWeek(
    new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())),
  );
  const iso = (offset) => toISODate(addDays(weekAnchor, offset));

  return [
    {
      id: "mock-1",
      name: "Morning Run",
      createdAt: iso(-45),
      isMock: true,
      completions: [
        iso(-45),
        iso(-43),
        iso(-41),
        iso(-39),
        iso(-36),
        iso(-34),
        iso(-33),
        iso(-31),
        iso(-29),
        iso(-27),
        iso(-25),
        iso(-23),
        iso(-21),
        iso(-19),
        iso(-18),
        iso(-16),
        iso(-15),
        iso(-14),
        iso(-13),
        iso(-12),
        iso(-10),
        iso(-9),
        iso(-8),
        iso(-7),
        iso(-6),
        iso(-5),
        iso(-4),
        iso(-3),
        iso(-2),
        iso(-1),
        iso(0),
      ],
    },
    {
      id: "mock-2",
      name: "Read 20 Pages",
      createdAt: iso(-35),
      isMock: true,
      completions: [
        iso(-35),
        iso(-33),
        iso(-31),
        iso(-30),
        iso(-28),
        iso(-26),
        iso(-24),
        iso(-22),
        iso(-20),
        iso(-18),
        iso(-16),
        iso(-15),
        iso(-13),
        iso(-12),
        iso(-11),
        iso(-10),
        iso(-9),
        iso(-8),
        iso(-7),
        iso(-6),
        iso(-5),
        iso(-4),
        iso(-3),
        iso(-2),
        iso(-1),
        iso(0),
      ],
    },
    {
      id: "mock-3",
      name: "Meditate",
      createdAt: iso(-32),
      isMock: true,
      completions: [
        iso(-32),
        iso(-30),
        iso(-29),
        iso(-27),
        iso(-25),
        iso(-24),
        iso(-22),
        iso(-21),
        iso(-19),
        iso(-17),
        iso(-16),
        iso(-14),
        iso(-13),
        iso(-12),
        iso(-10),
        iso(-9),
        iso(-8),
        iso(-7),
        iso(-6),
        iso(-5),
        iso(-4),
        iso(-3),
        iso(-2),
        iso(-1),
        iso(0),
      ],
    },
    {
      id: "mock-4",
      name: "Strength Training",
      createdAt: iso(-40),
      isMock: true,
      completions: [
        iso(-40),
        iso(-38),
        iso(-36),
        iso(-35),
        iso(-34),
        iso(-33),
        iso(-31),
        iso(-29),
        iso(-28),
        iso(-26),
        iso(-24),
        iso(-22),
        iso(-21),
        iso(-19),
        iso(-18),
        iso(-16),
        iso(-15),
        iso(-13),
        iso(-12),
        iso(-10),
        iso(-9),
        iso(-8),
        iso(-6),
        iso(-5),
        iso(-4),
        iso(-3),
        iso(-2),
        iso(-1),
        iso(0),
      ],
    },
  ];
};

const applyColors = (habits) =>
  habits.map((habit, index) => ({
    ...habit,
    color: habit.color || COLORS[index % COLORS.length],
  }));

const buildWeeklyPercentages = (habits) => {
  if (!habits.length) return { weeks: [], series: [] };

  const today = new Date();
  const normalizedToday = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );

  const hydratedHabits = habits.map((habit, index) => {
    const completionDates = (habit.completions || [])
      .map(parseISODate)
      .sort((a, b) => a - b);
    const createdAt = habit.createdAt
      ? parseISODate(habit.createdAt)
      : completionDates[0] || normalizedToday;
    const latestCompletion = completionDates[completionDates.length - 1];

    return {
      ...habit,
      color: habit.color || COLORS[index % COLORS.length],
      createdAt,
      completionDates,
      latestDate:
        latestCompletion && latestCompletion > normalizedToday
          ? latestCompletion
          : normalizedToday,
    };
  });

  const earliestCreation = hydratedHabits.reduce(
    (earliest, habit) => (habit.createdAt < earliest ? habit.createdAt : earliest),
    hydratedHabits[0].createdAt,
  );
  const globalEnd = hydratedHabits.reduce(
    (latest, habit) => (habit.latestDate > latest ? habit.latestDate : latest),
    hydratedHabits[0].latestDate,
  );

  const firstWeek = startOfWeek(earliestCreation);
  const lastWeek = startOfWeek(globalEnd);

  const weeks = [];
  let pointer = new Date(firstWeek);
  while (pointer <= lastWeek) {
    weeks.push(new Date(pointer));
    pointer = addDays(pointer, 7);
  }

  const weekDescriptors = weeks.map((weekStart) => ({
    key: toISODate(weekStart),
    label: formatWeekLabel(weekStart),
    start: weekStart,
    end: addDays(weekStart, 6),
  }));

  const series = hydratedHabits.map((habit) => {
    const points = weekDescriptors.map((week) => {
      const activeEnd = week.end > normalizedToday ? normalizedToday : week.end;

      if (activeEnd < habit.createdAt) {
        return { ...week, value: null };
      }

      const activeStart = week.start < habit.createdAt ? habit.createdAt : week.start;
      const totalActiveDays = daysBetweenInclusive(activeStart, activeEnd);

      if (totalActiveDays <= 0) {
        return { ...week, value: null };
      }

      const completedDays = habit.completionDates.filter(
        (date) => date >= activeStart && date <= activeEnd,
      ).length;

      const percentage = (completedDays / totalActiveDays) * 100;

      return {
        ...week,
        value: Number.isFinite(percentage) ? Number(percentage.toFixed(1)) : 0,
      };
    });

    return {
      id: habit.id,
      name: habit.name,
      color: habit.color,
      points,
    };
  });

  return { weeks: weekDescriptors, series };
};

export {
  COLORS,
  applyColors,
  buildMockHabits,
  buildWeeklyPercentages,
  parseISODate,
  startOfWeek,
  toISODate,
};
