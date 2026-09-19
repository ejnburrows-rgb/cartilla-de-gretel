// date-helpers.ts — date math for streaks, reports, and pacing.
// All functions are tz-neutral; callers pass dates in their local tz.
// School year is defined as Aug 1 \u2013 Jul 31.

export function startOfDay(d: Date = new Date()): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

export function startOfWeek(d: Date = new Date(), weekStartsOn: 0 | 1 = 1): Date {
  const out = startOfDay(d);
  const day = out.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  out.setDate(out.getDate() - diff);
  return out;
}

export function endOfWeek(d: Date = new Date(), weekStartsOn: 0 | 1 = 1): Date {
  const start = startOfWeek(d, weekStartsOn);
  const out = new Date(start);
  out.setDate(out.getDate() + 6);
  out.setHours(23, 59, 59, 999);
  return out;
}

export function daysBetween(a: Date, b: Date): number {
  const ms = startOfDay(b).getTime() - startOfDay(a).getTime();
  return Math.round(ms / 86_400_000);
}

export function isSameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export function isConsecutiveDay(prev: Date, next: Date): boolean {
  return daysBetween(prev, next) === 1;
}

export function schoolYearStart(now: Date = new Date()): Date {
  const year = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  return new Date(year, 7, 1, 0, 0, 0, 0); // Aug 1
}

export function schoolYearEnd(now: Date = new Date()): Date {
  const start = schoolYearStart(now);
  return new Date(start.getFullYear() + 1, 6, 31, 23, 59, 59, 999); // Jul 31
}

export function weekOfSchoolYear(now: Date = new Date()): number {
  const start = schoolYearStart(now);
  const diff = daysBetween(start, now);
  return Math.floor(diff / 7) + 1;
}

export function formatDateEs(d: Date): string {
  const day = d.getDate();
  const month = MONTHS_ES[d.getMonth()];
  const year = d.getFullYear();
  return `${day} de ${month} de ${year}`;
}

export function formatDateEn(d: Date): string {
  const day = d.getDate();
  const month = MONTHS_EN[d.getMonth()];
  const year = d.getFullYear();
  return `${month} ${day}, ${year}`;
}

export function relativeDateEs(d: Date, now: Date = new Date()): string {
  const diff = daysBetween(d, now);
  if (diff === 0) return "hoy";
  if (diff === 1) return "ayer";
  if (diff > 1 && diff <= 6) return `hace ${diff} d\u00edas`;
  return formatDateEs(d);
}

export function relativeDateEn(d: Date, now: Date = new Date()): string {
  const diff = daysBetween(d, now);
  if (diff === 0) return "today";
  if (diff === 1) return "yesterday";
  if (diff > 1 && diff <= 6) return `${diff} days ago`;
  return formatDateEn(d);
}

const MONTHS_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];
const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
