"use client";

import { useEffect, useRef, useState } from "react";
import DeleteConfirmationModal from "../components/HabitCard/components/DeleteConfirmationModal";
import HabitsList from "./habitPageComponents/HabitsList";
import PageHeader from "./habitPageComponents/page-header/PageHeader";
import {
  deleteHabit,
  addWeeklyHabitCheckIn,
  markHabitCompleted,
  removeTodayCheckIn,
} from "../lib/habits";
import {
  deleteMockHabit,
  addMockWeeklyHabitCheckIn,
  loadHabitsWithMock,
  markMockHabitCompleted,
  removeMockHabitTodayCheckIn,
} from "../lib/habitData";

export default function HabitsPage() {
  const [habits, setHabits] = useState([]);
  const [usingMockData, setUsingMockData] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [isModalActive, setIsModalActive] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [fadeTargetId, setFadeTargetId] = useState(null);
  const cardRefs = useRef({});
  const previousPositions = useRef({});

  const MODAL_DURATION = 300;
  const CARD_FADE_DELAY = 300;
  const CARD_FADE_DURATION = 450;
  const REPOSITION_DURATION = 450;

  useEffect(() => {
    const hydrate = () => {
      const { habits: loaded, usingMockData: usingMock } = loadHabitsWithMock();
      setHabits(loaded);
      setUsingMockData(usingMock);
    };

    hydrate();
    window.addEventListener("storage", hydrate);
    return () => window.removeEventListener("storage", hydrate);
  }, []);

  const handleComplete = (id, isChecked, isoDateOverride = null) => {
    const habit = habits.find((item) => item.id === id);
    if (!habit) return;

    if (isChecked) {
      if (habit.isMock) {
        markMockHabitCompleted(id, isoDateOverride);
      } else {
        markHabitCompleted(id, isoDateOverride);
      }
    } else {
      if (habit.isMock) {
        removeMockHabitTodayCheckIn(id);
      } else {
        removeTodayCheckIn(id);
      }
    }

    const { habits: hydrated, usingMockData: usingMock } = loadHabitsWithMock();
    setHabits(hydrated);
    setUsingMockData(usingMock);
  };

  const handleWeeklyCheckIn = (habit) => {
    if (!habit) return;
    if (habit.isMock) {
      addMockWeeklyHabitCheckIn(habit.id);
    } else {
      addWeeklyHabitCheckIn(habit.id);
    }
    const { habits: hydrated, usingMockData: usingMock } = loadHabitsWithMock();
    setHabits(hydrated);
    setUsingMockData(usingMock);
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

  const handleDelete = (id) => {
    const habit = habits.find((item) => item.id === id);
    if (!habit) return;

    if (habit.isMock) {
      deleteMockHabit(id);
    } else {
      deleteHabit(id);
    }

    const { habits: hydrated, usingMockData: usingMock } = loadHabitsWithMock();
    setHabits(hydrated);
    setUsingMockData(usingMock);
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

  return (
    <>
      <section className="space-y-4">
        <PageHeader habitsCount={habits.length} usingMockData={usingMockData} />
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
