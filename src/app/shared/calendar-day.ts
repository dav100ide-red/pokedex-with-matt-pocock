/*
 * A calendar day (a date with no time of day) is stored as a Date at midnight UTC, like
 * `new Date('2025-01-14')` in the seed data, so it is the same day in every time zone.
 * Date pickers work with local dates, so convert when moving values in and out of them.
 */

/** The calendar day of a local date, such as one picked in a date picker. */
export function toCalendarDay(localDate: Date): Date {
  return new Date(Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate()));
}

/** The local midnight of a calendar day, for showing it in a date picker. */
export function fromCalendarDay(day: Date): Date {
  return new Date(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate());
}
