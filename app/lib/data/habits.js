import { DEFAULT_ACTIVE_DAYS } from "../habitSchedule";
import { createClient } from "../supabase/client";

const toLocalISODate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toLocalDateFromISO = (isoDate) => {
  if (!isoDate) return null;
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day), 12);
};

const getUserId = async (supabase) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id || null;
};

const mapHabits = (habits = [], checkins = []) => {
  const checkinsByHabit = new Map();
  checkins.forEach((checkin) => {
    if (!checkinsByHabit.has(checkin.habit_id)) {
      checkinsByHabit.set(checkin.habit_id, []);
    }
    checkinsByHabit.get(checkin.habit_id).push(checkin);
  });

  return habits.map((habit) => {
    const habitCheckins = checkinsByHabit.get(habit.id) || [];
    const checkIns = habitCheckins
      .map((entry) => entry.checked_at)
      .filter(Boolean);
    const completions = [
      ...new Set(
        habitCheckins
          .map((entry) => entry.local_date)
          .filter(Boolean)
      ),
    ];
    const createdAt = habit.created_at
      ? habit.created_at.slice(0, 10)
      : new Date().toISOString().slice(0, 10);
    const createdAtTimestamp = habit.created_at
      ? Date.parse(habit.created_at)
      : Date.now();

    return {
      id: habit.id,
      name: habit.name,
      goalType: habit.goal_type,
      timesPerDay: habit.times_per_day ?? undefined,
      timesPerWeek: habit.times_per_week ?? undefined,
      activeDays: habit.active_days || { ...DEFAULT_ACTIVE_DAYS },
      themeColor: habit.theme_color || undefined,
      createdAt,
      createdAtTimestamp,
      checkIns,
      completions,
      isMock: false,
    };
  });
};

export async function getHabits() {
  const supabase = createClient();
  const userId = await getUserId(supabase);
  if (!userId) return [];

  const [{ data: habits, error: habitError }, { data: checkins, error: checkinError }] =
    await Promise.all([
      supabase.from("habits").select("*").eq("user_id", userId),
      supabase.from("habit_checkins").select("*").eq("user_id", userId),
    ]);

  if (habitError || checkinError) {
    console.error("Failed to load habits", habitError || checkinError);
    return [];
  }

  return mapHabits(habits || [], checkins || []);
}

export async function createHabit(
  name,
  activeDays = DEFAULT_ACTIVE_DAYS,
  goalType = "daily",
  targetCount = 1
) {
  const supabase = createClient();
  const userId = await getUserId(supabase);
  if (!userId) return null;

  const payload = {
    user_id: userId,
    name,
    goal_type: goalType,
    times_per_day: goalType === "daily" ? targetCount : null,
    times_per_week: goalType === "weekly" ? targetCount : null,
    active_days: activeDays,
  };

  const { data, error } = await supabase
    .from("habits")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    console.error("Failed to create habit", error);
    return null;
  }

  return data;
}

export async function deleteHabit(id) {
  const supabase = createClient();
  const userId = await getUserId(supabase);
  if (!userId) return false;
  const { error } = await supabase
    .from("habits")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) {
    console.error("Failed to delete habit", error);
    return false;
  }
  return true;
}

export async function markHabitCompleted(id, isoDateOverride = null) {
  const supabase = createClient();
  const userId = await getUserId(supabase);
  if (!userId) return false;
  const targetDate =
    (isoDateOverride && toLocalDateFromISO(isoDateOverride)) || new Date();
  const localDate = toLocalISODate(targetDate);
  const checkedAt = targetDate.toISOString();

  const { error } = await supabase.from("habit_checkins").insert({
    habit_id: id,
    user_id: userId,
    checked_at: checkedAt,
    local_date: localDate,
  });

  if (error) {
    console.error("Failed to add check-in", error);
    return false;
  }
  return true;
}

export async function addWeeklyHabitCheckIn(id, timestamp = null) {
  const supabase = createClient();
  const userId = await getUserId(supabase);
  if (!userId) return false;
  const targetDate = timestamp ? new Date(timestamp) : new Date();
  const localDate = toLocalISODate(targetDate);
  const checkedAt = targetDate.toISOString();

  const { error } = await supabase.from("habit_checkins").insert({
    habit_id: id,
    user_id: userId,
    checked_at: checkedAt,
    local_date: localDate,
  });

  if (error) {
    console.error("Failed to add weekly check-in", error);
    return false;
  }
  return true;
}

export async function removeTodayCheckIn(id) {
  const supabase = createClient();
  const userId = await getUserId(supabase);
  if (!userId) return false;
  const todayLocal = toLocalISODate(new Date());

  const { data: rows, error: fetchError } = await supabase
    .from("habit_checkins")
    .select("id")
    .eq("habit_id", id)
    .eq("user_id", userId)
    .eq("local_date", todayLocal)
    .order("checked_at", { ascending: false })
    .limit(1);

  if (fetchError) {
    console.error("Failed to load check-in for removal", fetchError);
    return false;
  }

  const targetId = rows?.[0]?.id;
  if (!targetId) return true;

  const { error } = await supabase
    .from("habit_checkins")
    .delete()
    .eq("id", targetId)
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to remove check-in", error);
    return false;
  }
  return true;
}

export async function updateHabitDetails(id, updates = {}) {
  const supabase = createClient();
  const userId = await getUserId(supabase);
  if (!userId) return false;

  const payload = {
    name: updates.name,
    goal_type: updates.goalType,
    times_per_day: updates.timesPerDay,
    times_per_week: updates.timesPerWeek,
    active_days: updates.activeDays,
    theme_color: updates.themeColor,
  };

  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) {
      delete payload[key];
    }
  });

  const { error } = await supabase
    .from("habits")
    .update(payload)
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("Failed to update habit", error);
    return false;
  }
  return true;
}

export async function updateHabitName(id, name) {
  return updateHabitDetails(id, { name });
}
