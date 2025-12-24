export const NAV_DARK_YELLOW = "#ffcd1f";
export const WEEKLY_BRIGHT_GREEN = "#66ff9a";

export const getThemeColorForGoalType = (goalType) =>
  goalType === "weekly" ? WEEKLY_BRIGHT_GREEN : NAV_DARK_YELLOW;
