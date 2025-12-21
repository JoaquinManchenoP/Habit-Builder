"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

const FALLBACK_GRADIENT = { start: "#a855f7", end: "#38bdf8" };

const parseHexColor = (value) => {
  if (!value) return null;
  const trimmed = value.trim();
  const hex = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;
  const expanded =
    hex.length === 3 ? hex.split("").map((char) => char + char).join("") : hex;
  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) return null;
  return {
    r: parseInt(expanded.slice(0, 2), 16),
    g: parseInt(expanded.slice(2, 4), 16),
    b: parseInt(expanded.slice(4, 6), 16),
  };
};

const mixChannel = (value, target, amount) =>
  Math.round(value + (target - value) * amount);

const rgbToHex = ({ r, g, b }) =>
  `#${[r, g, b]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;

const buildGradient = (baseColor) => {
  const rgb = parseHexColor(baseColor);
  if (!rgb) return FALLBACK_GRADIENT;
  const lighter = {
    r: mixChannel(rgb.r, 255, 0.35),
    g: mixChannel(rgb.g, 255, 0.35),
    b: mixChannel(rgb.b, 255, 0.35),
  };
  const darker = {
    r: mixChannel(rgb.r, 0, 0.15),
    g: mixChannel(rgb.g, 0, 0.15),
    b: mixChannel(rgb.b, 0, 0.15),
  };
  return { start: rgbToHex(lighter), end: rgbToHex(darker) };
};

export default function CircularProgress({
  percent,
  value,
  showPercent = false,
  color,
}) {
  const safePercent = Math.max(0, Math.min(100, percent || 0));
  const initialValue = Number.isFinite(value) ? value : safePercent;
  const [displayValue, setDisplayValue] = useState(initialValue);
  const displayValueRef = useRef(initialValue);
  const gradientId = useId();
  const shadowId = useId();
  const gradientColors = useMemo(() => buildGradient(color), [color]);
  const size = 68;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = useMemo(
    () => circumference * (1 - safePercent / 100),
    [circumference, safePercent]
  );
  const isComplete = safePercent >= 100;
  const startColor = isComplete ? "#22c55e" : gradientColors.start;
  const endColor = isComplete ? "#22c55e" : gradientColors.end;

  useEffect(() => {
    const endValue = Number.isFinite(value) ? value : safePercent;
    const startValue = displayValueRef.current;
    const duration = 900;
    if (startValue === endValue) return;
    let frameId;
    let start;

    const easeInOutCubic = (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const tick = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);
      const nextValue = Math.round(
        startValue + (endValue - startValue) * eased
      );
      displayValueRef.current = nextValue;
      setDisplayValue(nextValue);
      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [safePercent, value]);

  return (
    <div className="relative h-[68px] w-[68px]">
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              stopColor={startColor}
              style={{ transition: "stop-color 400ms ease-in-out" }}
            />
            <stop
              offset="100%"
              stopColor={endColor}
              style={{ transition: "stop-color 400ms ease-in-out" }}
            />
          </linearGradient>
          <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="0"
              floodColor="rgba(0, 0, 0, 0)"
              floodOpacity="0"
            />
          </filter>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 900ms ease-in-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={`text-[15px] font-extrabold text-slate-900 transition duration-300 ${
            isComplete ? "scale-90 opacity-0" : "scale-100 opacity-100"
          }`}
        >
          {showPercent ? `${displayValue} %` : displayValue}
        </span>
        <svg
          viewBox="0 0 24 24"
          className={`absolute h-8 w-8 transition duration-300 ${
            isComplete ? "scale-100 opacity-100" : "scale-90 opacity-0"
          }`}
          fill="none"
          stroke="#22c55e"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>
    </div>
  );
}
