import {
  PROGRESS_COLOR_LOW,
  PROGRESS_COLOR_MIDLOW,
  PROGRESS_COLOR_MIDHIGH,
  PROGRESS_COLOR_HIGH,
} from "./habitTheme";

const clampPercent = (value) => Math.max(0, Math.min(100, value || 0));

const hexToRgb = (hex) => {
  const trimmed = hex.replace("#", "");
  const expanded =
    trimmed.length === 3
      ? trimmed.split("").map((char) => char + char).join("")
      : trimmed;
  const r = parseInt(expanded.slice(0, 2), 16);
  const g = parseInt(expanded.slice(2, 4), 16);
  const b = parseInt(expanded.slice(4, 6), 16);
  return { r, g, b };
};

const rgbToHex = ({ r, g, b }) =>
  `#${[r, g, b]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;

const lerp = (start, end, amount) => start + (end - start) * amount;

const mix = (from, to, amount) => {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  return rgbToHex({
    r: Math.round(lerp(a.r, b.r, amount)),
    g: Math.round(lerp(a.g, b.g, amount)),
    b: Math.round(lerp(a.b, b.b, amount)),
  });
};

export const getProgressColorStops = () => [
  { p: 0, color: PROGRESS_COLOR_LOW },
  { p: 40, color: PROGRESS_COLOR_MIDLOW },
  { p: 41, color: PROGRESS_COLOR_MIDHIGH },
  { p: 100, color: PROGRESS_COLOR_HIGH },
];

export const getProgressColor = (percent) => {
  const clamped = clampPercent(percent);
  const stops = getProgressColorStops();
  for (let i = 0; i < stops.length - 1; i += 1) {
    const current = stops[i];
    const next = stops[i + 1];
    if (clamped <= next.p) {
      const range = next.p - current.p || 1;
      const amount = (clamped - current.p) / range;
      return mix(current.color, next.color, amount);
    }
  }
  return PROGRESS_COLOR_HIGH;
};
