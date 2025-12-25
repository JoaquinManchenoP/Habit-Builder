import { DEFAULT_ACTIVE_DAYS, isActiveDay, normalizeActiveDays } from "./habitSchedule";
import { getThemeColorForGoalType } from "./habitTheme";

const COLORS = [
  "#ffe08a",
  "#ffd86a",
  "#ffcd1f",
  "#f3c01b",
  "#e8b317",
  "#dca513",
  "#d09810",
  "#c48b0c",
  "#b87d09",
  "#ac7006",
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
  const dailyThemeColor = getThemeColorForGoalType("daily");

  return [
    {
      id: "mock-1",
      name: "Morning Run",
      createdAt: iso(-45),
      isMock: true,
      goalType: "daily",
      themeColor: dailyThemeColor,
      timesPerDay: 1,
      timesPerWeek: undefined,
      checkIns: [],
      activeDays: {
        ...DEFAULT_ACTIVE_DAYS,
        sat: false,
        sun: false,
      },
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
      goalType: "daily",
      themeColor: dailyThemeColor,
      timesPerDay: 1,
      timesPerWeek: undefined,
      checkIns: [],
      activeDays: {
        ...DEFAULT_ACTIVE_DAYS,
        wed: false,
      },
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
      goalType: "daily",
      themeColor: dailyThemeColor,
      timesPerDay: 1,
      timesPerWeek: undefined,
      checkIns: [],
      activeDays: {
        ...DEFAULT_ACTIVE_DAYS,
        mon: false,
        thu: false,
      },
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
      goalType: "daily",
      themeColor: dailyThemeColor,
      timesPerDay: 1,
      timesPerWeek: undefined,
      checkIns: [],
      activeDays: {
        ...DEFAULT_ACTIVE_DAYS,
        tue: false,
        fri: false,
      },
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
  habits.map((habit, index) => {
    const goalType = habit.goalType || "daily";
    const themeColor = habit.themeColor || getThemeColorForGoalType(goalType);
    return {
      ...habit,
      goalType,
      themeColor,
      color: themeColor || habit.color || COLORS[index % COLORS.length],
      activeDays: normalizeActiveDays(habit.activeDays),
    };
  });

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
    const completionSet = new Set(
      completionDates.map((date) => toISODate(date)),
    );
    const activeDays = normalizeActiveDays(habit.activeDays);

    const goalType = habit.goalType || "daily";
    const themeColor = habit.themeColor || getThemeColorForGoalType(goalType);

    return {
      ...habit,
      goalType,
      themeColor,
      color: themeColor || habit.color || COLORS[index % COLORS.length],
      activeDays,
      createdAt,
      completionDates,
      completionSet,
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
      const totalActiveDays = (() => {
        if (activeEnd < activeStart) return 0;
        let count = 0;
        let pointer = new Date(activeStart);
        while (pointer <= activeEnd) {
          const completed = habit.completionSet.has(toISODate(pointer));
          if (isActiveDay(pointer, habit.activeDays) || completed) {
            count += 1;
          }
          pointer = addDays(pointer, 1);
        }
        return count;
      })();

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
