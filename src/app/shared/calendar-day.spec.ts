import { describe, expect, it } from 'vitest';
import { fromCalendarDay, toCalendarDay } from './calendar-day';

describe('calendar days', () => {
  it('turns a local date into midnight UTC of the same day, dropping the time', () => {
    expect(toCalendarDay(new Date(2025, 0, 14, 18, 30))).toEqual(new Date('2025-01-14'));
  });

  it('turns a calendar day into local midnight of the same day', () => {
    const local = fromCalendarDay(new Date('2025-01-14'));

    expect(local.getFullYear()).toBe(2025);
    expect(local.getMonth()).toBe(0);
    expect(local.getDate()).toBe(14);
    expect(local.getHours()).toBe(0);
  });

  it('keeps the same day through a round trip', () => {
    const day = new Date('2026-09-06');

    expect(toCalendarDay(fromCalendarDay(day))).toEqual(day);
  });
});
