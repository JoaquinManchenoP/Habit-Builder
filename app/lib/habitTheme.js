export const NAV_DARK_YELLOW = "#ffb347";
export const WEEKLY_BRIGHT_GREEN = "#66ff9a";
export const WEEKLY_SHADE_DARK = "#00a84a";
export const WEEKLY_SHADE_MEDIUM = "#00c853";
export const WEEKLY_SHADE_BRIGHT = "#00e676";
export const WEEKLY_SHADE_NEON = "#00ff6a";
export const PROGRESS_COLOR_LOW = "#ffe2b8";
export const PROGRESS_COLOR_MIDLOW = "#ffb347";
export const PROGRESS_COLOR_MIDHIGH = "#86efac";
export const PROGRESS_COLOR_HIGH = WEEKLY_SHADE_NEON;

export const getThemeColorForGoalType = (goalType) =>
  goalType === "weekly" ? WEEKLY_BRIGHT_GREEN : NAV_DARK_YELLOW;

export const getWeeklyProgressShade = (clampedPercent) => {
  if (clampedPercent >= 100) return WEEKLY_SHADE_NEON;
  if (clampedPercent >= 50) return WEEKLY_SHADE_BRIGHT;
  if (clampedPercent >= 25) return WEEKLY_SHADE_MEDIUM;
  return WEEKLY_SHADE_DARK;
};
