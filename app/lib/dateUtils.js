export const toLocalISODate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const parseLocalISODate = (isoDate, hour = 12) => {
  if (!isoDate) return null;
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day), hour);
};

export const toDateOrNull = (value) => {
  if (!value) return null;
  if (typeof value === "string") {
    const parsed = parseLocalISODate(value, 0);
    if (parsed) return parsed;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};
