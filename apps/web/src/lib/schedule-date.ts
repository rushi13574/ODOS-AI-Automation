/**
 * Schedule values represent calendar days, never instants. Keep them as
 * YYYY-MM-DD until a display calculation explicitly needs a local Date.
 */
export function toScheduleDay(value?: string | Date | null): string {
  if (!value) return '';

  if (value instanceof Date) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return value.slice(0, 10);

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : toScheduleDay(parsed);
}

export function scheduleDayToLocalDate(day: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!match) return null;

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return date.getFullYear() === Number(match[1]) && date.getMonth() === Number(match[2]) - 1 && date.getDate() === Number(match[3])
    ? date
    : null;
}

export function todayScheduleDay(now = new Date()): string {
  return toScheduleDay(now);
}

export function scheduleDayWeekday(day: string): number | null {
  return scheduleDayToLocalDate(day)?.getDay() ?? null;
}
