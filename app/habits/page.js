"use client";

import { useEffect, useRef, useState } from "react";
import HabitCard from "../components/HabitCard";
import Header from "../components/Header";
import Button from "../components/Button";
import PageContainer from "../components/PageContainer";
import { deleteHabit, markHabitCompleted, removeLastCompletion } from "../lib/habits";
import Link from "next/link";
import {
  deleteMockHabit,
  loadHabitsWithMock,
  markMockHabitCompleted,
  removeMockHabitLastCompletion,
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

  const handleComplete = (id, isChecked) => {
    const habit = habits.find((item) => item.id === id);
    if (!habit) return;

    if (isChecked) {
      if (habit.isMock) {
        markMockHabitCompleted(id);
      } else {
        markHabitCompleted(id);
      }
    } else {
      if (habit.isMock) {
        removeMockHabitLastCompletion(id);
      } else {
        removeLastCompletion(id);
      }
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
    <main className="min-h-screen bg-slate-50">
      <PageContainer>
        <Header />
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-900">Habits</h1>
              <p className="text-sm text-slate-600">
                Browse the habits stored on this device.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {usingMockData ? (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                  Using mock testing data
                </span>
              ) : null}
              <span className="text-sm font-medium text-slate-800">
                {habits.length} {habits.length === 1 ? "habit" : "habits"}
              </span>
              <Link href="/habits/new">
                <Button type="button" className="h-9 w-9 p-0 text-lg font-bold">
                  +
                </Button>
              </Link>
            </div>
          </div>
          {habits.length === 0 ? (
            <p className="rounded-md border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
              Start by creating a new habit.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[...habits]
                .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
                .map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onComplete={handleComplete}
                  onDelete={handleDeleteRequest}
                  isCompletedToday={habit.completions?.includes(new Date().toISOString().slice(0, 10))}
                  isFading={fadeTargetId === habit.id}
                  cardRef={(node) => {
                    if (node) {
                      cardRefs.current[habit.id] = node;
                    } else {
                      delete cardRefs.current[habit.id];
                    }
                  }}
                />
              ))}
            </div>
          )}
        </section>
        {isModalActive ? (
          <div
            className={`fixed inset-0 z-40 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm transition-opacity duration-300 ease-out ${
              isModalVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            <div
              className={`w-full max-w-sm rounded-lg bg-white p-6 shadow-2xl transition duration-300 ease-out ${
                isModalVisible
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-95 translate-y-1"
              }`}
            >
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-slate-900">
                  Delete habit?
                </h2>
                <p className="text-sm text-slate-600">
                  You are about to delete{" "}
                  <b> {pendingHabit?.name || "this habit"}.</b> This action
                  cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
                    onClick={handleCancelDelete}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                    onClick={handleConfirmDelete}
                  >
                    Yes, delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </PageContainer>
    </main>
  );
}
