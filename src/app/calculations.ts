const DAY = 86400000;
function parseDate(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Please select both dates.');
  const date = new Date(value + 'T00:00:00Z');
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value)
    throw new Error('Please enter a valid date.');
  return date;
}
// Clamp calendar months to the last day of their target month.
function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const last = new Date(result);
  last.setUTCMonth(last.getUTCMonth() + 1);
  last.setUTCDate(0);
  result.setUTCDate(Math.min(date.getUTCDate(), last.getUTCDate()));
  return result;
}
export function dateDifference(startValue: string, endValue: string, includeEndDay = false) {
  const start = parseDate(startValue),
    end = parseDate(endValue);
  if (end < start) throw new Error('End date must be on or after the start date.');
  const boundary = new Date(end.getTime() + (includeEndDay ? DAY : 0));
  const days = (boundary.getTime() - start.getTime()) / DAY;
  let months =
    (boundary.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    boundary.getUTCMonth() -
    start.getUTCMonth();
  if (addMonths(start, months) > boundary) months--;
  const remainder = (boundary.getTime() - addMonths(start, months).getTime()) / DAY;
  let working = Math.floor(days / 7) * 5;
  for (let i = 0; i < days % 7; i++) {
    const weekday = (start.getUTCDay() + i) % 7;
    if (weekday !== 0 && weekday !== 6) working++;
  }
  const format = (date: Date) =>
    date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
  return {
    days,
    years: Math.floor(months / 12),
    calendarMonths: months % 12,
    months,
    remainder,
    weeks: Math.floor(days / 7),
    weekDays: days % 7,
    hours: days * 24,
    working,
    weekends: days - working,
    start: format(start),
    end: format(end),
  };
}
export function timeSeconds(value: string): number {
  if (!/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(value))
    throw new Error('Please select valid start and end times.');
  const [hours, minutes, seconds = 0] = value.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}
export function timeDifference(start: string, end: string) {
  const first = timeSeconds(start),
    last = timeSeconds(end);
  const totalSeconds = (last - first + 86400) % 86400;
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor(totalSeconds / 60) % 60,
    seconds: totalSeconds % 60,
    totalSeconds,
    total: Number((totalSeconds / 60).toFixed(4)),
    decimal: Number((totalSeconds / 3600).toFixed(6)),
    overnight: last < first,
  };
}
