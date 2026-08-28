import { addDays } from 'date-fns';

export const APPLICATION_TIME_ZONE = 'Asia/Kolkata';

function partsFor(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: APPLICATION_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  return Object.fromEntries(
    parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]),
  ) as Record<'year' | 'month' | 'day', string>;
}

/** A schedule day is stored at UTC noon so it always represents the same IST day. */
export function applicationToday(now = new Date()): Date {
  const { year, month, day } = partsFor(now);
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 12));
}

export function scheduleDay(date: Date): string {
  const { year, month, day } = partsFor(date);
  return `${year}-${month}-${day}`;
}

export function scheduleDateFromKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

export function nextScheduleDay(date: Date): Date {
  return addDays(date, 1);
}
