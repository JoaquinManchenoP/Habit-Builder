const DEFAULT_ACTIVE_DAYS = Object.freeze({
  mon: true,
  tue: true,
  wed: true,
  thu: true,
  fri: true,
  sat: true,
  sun: true,
});

const WEEKDAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const WEEKDAY_LABELS = {
  mon: "M",
  tue: "T",
  wed: "W",
  thu: "T",
  fri: "F",
  sat: "S",
  sun: "S",
};

const DAY_KEY_BY_INDEX = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const normalizeActiveDays = (activeDays) => {
  if (!activeDays || typeof activeDays !== "object") {
    return { ...DEFAULT_ACTIVE_DAYS };
  }
  return {
    mon: activeDays.mon !== false,
    tue: activeDays.tue !== false,
    wed: activeDays.wed !== false,
    thu: activeDays.thu !== false,
    fri: activeDays.fri !== false,
    sat: activeDays.sat !== false,
    sun: activeDays.sun !== false,
  };
};

const getDayKey = (date) => DAY_KEY_BY_INDEX[date.getUTCDay()];

const isActiveDay = (date, activeDays) => {
  const key = getDayKey(date);
  return Boolean(activeDays?.[key]);
};

export {
  DEFAULT_ACTIVE_DAYS,
  WEEKDAY_ORDER,
  WEEKDAY_LABELS,
  getDayKey,
  isActiveDay,
  normalizeActiveDays,
};
