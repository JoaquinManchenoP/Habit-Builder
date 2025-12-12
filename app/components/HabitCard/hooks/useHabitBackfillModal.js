import { useState } from "react";

export const useHabitBackfillModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date();
    return new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  });

  const openBackfillModal = () => {
    const today = new Date();
    setSelectedDate(today.toISOString().slice(0, 10));
    setCalendarMonth(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)));
    setIsOpen(true);
    setIsVisible(false);
    requestAnimationFrame(() => setIsVisible(true));
  };

  const closeBackfillModal = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsOpen(false);
      setSelectedDate(null);
    }, 300);
  };

  const handleMonthChange = (offset) => {
    setCalendarMonth((prev) => {
      const next = new Date(Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth() + offset, 1));
      return next;
    });
  };

  return {
    isOpen,
    isVisible,
    selectedDate,
    calendarMonth,
    setSelectedDate,
    openBackfillModal,
    closeBackfillModal,
    handleMonthChange,
  };
};
