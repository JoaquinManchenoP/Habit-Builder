"use client";

import { useEffect, useRef, useState } from "react";
import DeleteConfirmationModal from "../components/HabitCard/components/DeleteConfirmationModal";
import HabitsList from "./habitPageComponents/HabitsList";
import PageHeader from "./habitPageComponents/page-header/PageHeader";
import {
  deleteHabit,
  addWeeklyHabitCheckIn,
  getHabits,
  markHabitCompleted,
  removeTodayCheckIn,
} from "../lib/habits";

export default function HabitsPage() {
  const [habits, setHabits] = useState([]);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [isModalActive, setIsModalActive] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fadeTargetId, setFadeTargetId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const cardRefs = useRef({});
  const previousPositions = useRef({});

  const MODAL_DURATION = 300;
  const CARD_FADE_DELAY = 300;
  const CARD_FADE_DURATION = 450;
  const REPOSITION_DURATION = 450;

  useEffect(() => {
    const hydrate = async () => {
      setIsLoading(true);
      const loaded = await getHabits();
      setHabits(loaded);
      setIsLoading(false);
    };

    hydrate();
    const handleRefresh = () => {
      hydrate();
    };
    window.addEventListener("habits:refresh", handleRefresh);
    return () => window.removeEventListener("habits:refresh", handleRefresh);
  }, []);

  const handleComplete = async (id, isChecked, isoDateOverride = null) => {
    const habit = habits.find((item) => item.id === id);
    if (!habit) return;

    if (isChecked) {
      await markHabitCompleted(id, isoDateOverride);
    } else {
      await removeTodayCheckIn(id);
    }

    const hydrated = await getHabits();
    setHabits(hydrated);
  };

  const handleWeeklyCheckIn = async (habit) => {
    if (!habit) return;
    await addWeeklyHabitCheckIn(habit.id);
    const hydrated = await getHabits();
    setHabits(hydrated);
  };

  const capturePositions = () => {
    previousPositions.current = {};
    Object.entries(cardRefs.current).forEach(([id, node]) => {
      if (node) {
        const rect = node.getBoundingClientRect();
        previousPositions.current[id] = rect;
      }
    });
  };

  useEffect(() => {
    if (!Object.keys(previousPositions.current).length) return;
    requestAnimationFrame(() => {
      Object.entries(cardRefs.current).forEach(([id, node]) => {
        const prev = previousPositions.current[id];
        if (!node || !prev) return;
        const rect = node.getBoundingClientRect();
        const dx = prev.left - rect.left;
        const dy = prev.top - rect.top;
        if (dx || dy) {
          node.style.transition = "none";
          node.style.transform = `translate(${dx}px, ${dy}px)`;
          requestAnimationFrame(() => {
            node.style.transition = `transform ${REPOSITION_DURATION}ms ease-in-out`;
            node.style.transform = "translate(0, 0)";
            setTimeout(() => {
              if (node) {
                node.style.transition = "";
                node.style.transform = "";
              }
            }, REPOSITION_DURATION + 50);
          });
        }
      });
      previousPositions.current = {};
    });
  }, [habits, REPOSITION_DURATION]);

  const handleDelete = async (id) => {
    const habit = habits.find((item) => item.id === id);
    if (!habit) return;

    await deleteHabit(id);
    const hydrated = await getHabits();
    setHabits(hydrated);
  };

  const handleDeleteRequest = (id) => {
    setPendingDeleteId(id);
    setIsModalActive(true);
    setIsModalVisible(false);
    requestAnimationFrame(() => setIsModalVisible(true));
  };

  const handleCancelDelete = () => {
    setIsModalVisible(false);
    setTimeout(() => {
      setPendingDeleteId(null);
      setIsModalActive(false);
    }, MODAL_DURATION);
  };

  const handleConfirmDelete = () => {
    if (!pendingDeleteId) return;
    setIsModalVisible(false);
    const targetId = pendingDeleteId;
    setTimeout(() => {
      setIsModalActive(false);
      setPendingDeleteId(null);
      setTimeout(() => {
        setFadeTargetId(targetId);
        setTimeout(() => {
          capturePositions();
          handleDelete(targetId);
          setFadeTargetId(null);
        }, CARD_FADE_DURATION);
      }, CARD_FADE_DELAY);
    }, MODAL_DURATION);
  };

  const pendingHabit = habits.find((habit) => habit.id === pendingDeleteId);

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[70vh] w-full max-w-xl flex-col items-center justify-center gap-5">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-200 via-amber-300 to-orange-200 opacity-70 blur-md" />
          <div className="relative grid h-14 w-14 place-items-center rounded-2xl border border-amber-200/70 bg-white shadow-sm">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
            Loading
          </p>
          <p className="text-lg font-semibold text-slate-800">
            Fetching your habits
          </p>
        </div>
        <div className="h-1 w-32 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-slate-400/70" />
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="space-y-4">
        <PageHeader habitsCount={habits.length} usingMockData={false} />
        <HabitsList
          habits={habits}
          onComplete={handleComplete}
          onWeeklyCheckIn={handleWeeklyCheckIn}
          onDeleteRequest={handleDeleteRequest}
          fadeTargetId={fadeTargetId}
          cardRefs={cardRefs}
        />
      </section>
      <DeleteConfirmationModal
        isActive={isModalActive}
        isVisible={isModalVisible}
        habitName={pendingHabit?.name}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
