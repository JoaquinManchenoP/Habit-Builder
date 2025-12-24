import {
  addCheckIn,
  addWeeklyCheckIn,
  createHabit as createHabitRecord,
  deleteHabit as deleteHabitRecord,
  getDefaultUserId,
  getHabitsByUserId,
  removeLastCompletion as removeLastCompletionRecord,
  updateHabit as updateHabitRecord,
} from "./mockDb";
import { DEFAULT_ACTIVE_DAYS } from "./habitSchedule";

export function getHabits() {
  return getHabitsByUserId(getDefaultUserId());
}

export function createHabit(
  name,
  activeDays = DEFAULT_ACTIVE_DAYS,
  goalType = "daily",
  targetCount = 1
) {
  return createHabitRecord(getDefaultUserId(), {
    name,
    activeDays,
    goalType,
    timesPerDay: goalType === "daily" ? targetCount : undefined,
    timesPerWeek: goalType === "weekly" ? targetCount : undefined,
  });
}

export function deleteHabit(id) {
  return deleteHabitRecord(id);
}

export function markHabitCompleted(id, isoDateOverride = null) {
  return addCheckIn(id, isoDateOverride);
}

export function addWeeklyHabitCheckIn(id, timestamp = null) {
  return addWeeklyCheckIn(id, timestamp);
}

export function removeLastCompletion(id) {
  return removeLastCompletionRecord(id);
}

export function updateHabitDetails(id, updates = {}) {
  return updateHabitRecord(id, updates);
}

export function updateHabitName(id, name) {
  return updateHabitRecord(id, { name });
}
