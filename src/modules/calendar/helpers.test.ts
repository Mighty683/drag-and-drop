import { describe, it, expect } from 'vitest';
import { getDateWeekDays, getDaySlotsTimes } from './helpers';

describe('calendar helpers', () => {
  describe('getDateWeekDays', () => {
    it('should return the correct days', () => {
      const date = new Date('2021-01-01');
      const days = getDateWeekDays(date);
      expect(days[0].getDate()).toBe(27);
      expect(days[1].getDate()).toBe(28);
      expect(days[2].getDate()).toBe(29);
      expect(days[3].getDate()).toBe(30);
      expect(days[4].getDate()).toBe(31);
      expect(days[5].getDate()).toBe(1);
      expect(days[6].getDate()).toBe(2);
    });
  });

  describe('getDaySlots', () => {
    it('should return the correct slots', () => {
      const date = new Date('2021-01-01');
      const slots = getDaySlotsTimes(date);
      expect(slots[0].start.getHours()).toBe(0);
      expect(slots[0].start.getMinutes()).toBe(0);
      expect(slots[47].start.getHours()).toBe(23);
      expect(slots[47].start.getMinutes()).toBe(30);
    });
  });
});