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

const MetricCard = ({ title, value, subtitle, showDivider }) => (
  <div
    className={`relative flex flex-col items-center justify-center py-3 px-4 text-center max-[360px]:py-2.5 max-[360px]:px-3 ${
      showDivider
        ? "before:absolute before:left-0 before:top-5 before:bottom-5 before:w-[1.5px] before:bg-slate-200"
        : ""
    }`}
  >
    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 max-[360px]:text-[10px]">
      {title}
    </p>
    <p className="mt-1 text-2xl font-bold leading-tight text-slate-900 max-[360px]:text-xl">
      {value}
    </p>
    <p className="text-[11px] text-slate-600 max-[360px]:text-[10px]">
      {subtitle}
    </p>
  </div>
);

const CircularProgress = ({ percent, value, showPercent = false, color }) => {
  const safePercent = Math.max(0, Math.min(100, percent || 0));
  const initialValue = Number.isFinite(value) ? value : safePercent;
  const [displayValue, setDisplayValue] = useState(initialValue);
  const displayValueRef = useRef(initialValue);
  const gradientId = useId();
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
};

const ConsistencyMetricCard = ({
  title,
  subtitle,
  percent,
  value,
  showPercent,
  color,
  showDivider,
}) => (
  <div
    className={`relative flex flex-col items-center justify-center py-3 px-4 text-center max-[360px]:py-2.5 max-[360px]:px-3 ${
      showDivider
        ? "before:absolute before:left-0 before:top-5 before:bottom-5 before:w-[1.5px] before:bg-slate-200"
        : ""
    }`}
  >
    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 max-[360px]:text-[10px]">
      {title}
    </p>
    <div className="mt-2 flex items-center justify-center">
      <CircularProgress
        percent={percent}
        value={value}
        showPercent={showPercent}
        color={color}
      />
    </div>
    <p className="text-[11px] text-slate-600 max-[360px]:text-[10px]">
      {subtitle}
    </p>
  </div>
);

export default function MetricsGrid({ metrics, consistencyPercent, color }) {
  const visibleMetrics = metrics.filter((metric) => metric.title !== "Started");
  return (
    <div className="mt-1 flex items-center justify-center max-[360px]:mt-3">
      <div className="grid w-full grid-cols-3 gap-3 max-[360px]:gap-3">
        {visibleMetrics.map((metric, index) =>
          metric.title === "Consistency" ? (
            <ConsistencyMetricCard
              key={metric.title}
              title={metric.title}
              subtitle={metric.subtitle}
              percent={consistencyPercent}
              value={consistencyPercent}
              showPercent
              color={color}
              showDivider={index % 3 !== 0}
            />
          ) : metric.title === "Streak" || metric.title === "Check-ins" ? (
            <ConsistencyMetricCard
              key={metric.title}
              title={metric.title}
              subtitle={metric.subtitle}
              percent={Math.min(100, parseInt(metric.value, 10) || 0)}
              value={parseInt(metric.value, 10) || 0}
              color={color}
              showDivider={index % 3 !== 0}
            />
          ) : (
            <MetricCard
              key={metric.title}
              title={metric.title}
              value={metric.value}
              subtitle={metric.subtitle}
              showDivider={index % 3 !== 0}
            />
          )
        )}
      </div>
    </div>
  );
}
