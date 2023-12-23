import { describe, it, expect } from "vitest";
import { getDateWeekDays, getDaySlotsTimes, getCalendarSlot, getCalendarEventsTrees } from "./helpers";
import { CalendarEvent, CalendarSlotTime } from "./types";

describe("calendar helpers", () => {
  describe("getDateWeekDays", () => {
    it("should return the correct days", () => {
      const date = new Date("2021-01-01");
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

  describe("getDaySlots", () => {
    it("should return the correct slots", () => {
      const date = new Date("2021-01-01");
      const slots = getDaySlotsTimes(date);
      expect(slots[0].start.getHours()).toBe(0);
      expect(slots[0].start.getMinutes()).toBe(0);
      expect(slots[47].start.getHours()).toBe(23);
      expect(slots[47].start.getMinutes()).toBe(30);
    });
  });
  describe("getCalendarSlot", () => {
    describe("cases before slot", () => {
      const testSlot: CalendarSlotTime = {
        start: new Date("2021-01-01 00:30"),
        end: new Date("2021-01-01 01:00"),
      };
      it("should return the event which started before slot and is overlapping with slot event", () => {
        const event1: CalendarEvent = {
          start: new Date("2021-01-01 00:00"),
          end: new Date("2021-01-01 01:00"),
          title: "Event 1",
          id: "1",
        };
        const event2: CalendarEvent = {
          start: new Date("2021-01-01 00:30"),
          end: new Date("2021-01-01 01:30"),
          title: "Event 2",
          id: "2",
        };
        expect(getCalendarSlot(testSlot, getCalendarEventsTrees([event1, event2])).rows.length).toBe(2);
      });

      it("should not return the event which ended before slot", () => {
        const event1: CalendarEvent = {
          start: new Date("2021-01-01 00:00"),
          end: new Date("2021-01-01 00:30"),
          title: "Event 1",
          id: "1",
        };
        const event2: CalendarEvent = {
          start: new Date("2021-01-01 00:30"),
          end: new Date("2021-01-01 01:30"),
          title: "Event 2",
          id: "2",
        };
        expect(getCalendarSlot(testSlot, getCalendarEventsTrees([event1, event2])).rows.length).toBe(1);
      });
    });
    describe("cases after slot", () => {
      const testSlot: CalendarSlotTime = {
        start: new Date("2021-01-01 00:00"),
        end: new Date("2021-01-01 00:30"),
      };
      it("should return the event which started after slot", () => {
        const event1: CalendarEvent = {
          start: new Date("2021-01-01 00:00"),
          end: new Date("2021-01-01 01:00"),
          title: "Event 1",
          id: "1",
        };
        const event2: CalendarEvent = {
          start: new Date("2021-01-01 00:30"),
          end: new Date("2021-01-01 02:00"),
          title: "Event 2",
          id: "2",
        };
        expect(getCalendarSlot(testSlot, getCalendarEventsTrees([event1, event2])).rows.length).toBe(2);
      });
      it("should not return the event which ended after longest slot event", () => {
        const event1: CalendarEvent = {
          start: new Date("2021-01-01 00:00"),
          end: new Date("2021-01-01 02:00"),
          title: "Event 1",
          id: "1",
        };
        const event2: CalendarEvent = {
          start: new Date("2021-01-01 02:00"),
          end: new Date("2021-01-01 03:00"),
          title: "Event 2",
          id: "2",
        };
        expect(getCalendarSlot(testSlot, getCalendarEventsTrees([event1, event2])).rows.length).toBe(1);
      });
      it("should not return the event which ended before longest slot event", () => {
        const event1: CalendarEvent = {
          start: new Date("2021-01-01 00:00"),
          end: new Date("2021-01-01 01:00"),
          title: "Event 1",
          id: "1",
        };
        const event2: CalendarEvent = {
          start: new Date("2021-01-01 01:00"),
          end: new Date("2021-01-01 02:00"),
          title: "Event 2",
          id: "2",
        };
        expect(getCalendarSlot(testSlot, getCalendarEventsTrees([event1, event2])).rows.length).toBe(1);
      });

      it("should return events which are chained with overlapping", () => {
        const event1: CalendarEvent = {
          start: new Date("2021-01-01 00:00"),
          end: new Date("2021-01-01 02:00"),
          title: "Event 1",
          id: "1",
        };
        const event2: CalendarEvent = {
          start: new Date("2021-01-01 01:30"),
          end: new Date("2021-01-01 03:00"),
          title: "Event 2",
          id: "2",
        };
        const event3: CalendarEvent = {
          start: new Date("2021-01-01 02:30"),
          end: new Date("2021-01-01 04:00"),
          title: "Event 3",
          id: "3",
        };
        expect(getCalendarSlot(testSlot, getCalendarEventsTrees([event1, event2, event3])).rows.length).toBe(3);
      });
      it("should find two events which are chained with overlapping", () => {
        const event1: CalendarEvent = {
          start: new Date("2021-01-01 00:00"),
          end: new Date("2021-01-01 04:00"),
          title: "Event 1",
          id: "1",
        };
        const event2: CalendarEvent = {
          start: new Date("2021-01-01 01:00"),
          end: new Date("2021-01-01 02:00"),
          title: "Event 2",
          id: "2",
        };
        const event3: CalendarEvent = {
          start: new Date("2021-01-01 02:30"),
          end: new Date("2021-01-01 03:30"),
          title: "Event 3",
          id: "3",
        };
        expect(getCalendarSlot(testSlot, getCalendarEventsTrees([event1, event2, event3])).rows.length).toBe(3);
      });

      it("should find element which extends over slot longest event", () => {
        const event1: CalendarEvent = {
          start: new Date("2021-01-01 00:00"),
          end: new Date("2021-01-01 02:00"),
          title: "Event 1",
          id: "1",
        };
        const event2: CalendarEvent = {
          start: new Date("2021-01-01 00:00"),
          end: new Date("2021-01-01 01:00"),
          title: "Event 2",
          id: "2",
        };
        const event3: CalendarEvent = {
          start: new Date("2021-01-01 01:30"),
          end: new Date("2021-01-01 02:30"),
          title: "Event 3",
          id: "3",
        };
        expect(getCalendarSlot(testSlot, getCalendarEventsTrees([event1, event2, event3])).rows.length).toBe(3);
      });

      it("should find element which extends over slot longest event in different order", () => {
        const event1: CalendarEvent = {
          start: new Date("2021-01-01 00:00"),
          end: new Date("2021-01-01 02:00"),
          title: "Event 1",
          id: "1",
        };
        const event2: CalendarEvent = {
          start: new Date("2021-01-01 00:00"),
          end: new Date("2021-01-01 01:00"),
          title: "Event 2",
          id: "2",
        };
        const event3: CalendarEvent = {
          start: new Date("2021-01-01 01:30"),
          end: new Date("2021-01-01 02:30"),
          title: "Event 3",
          id: "3",
        };
        expect(getCalendarSlot(testSlot, getCalendarEventsTrees([event3, event2, event1])).rows.length).toBe(3);
      });
    });

    describe("cases inside slot", () => {
      const testSlot: CalendarSlotTime = {
        start: new Date("2021-01-01 00:00"),
        end: new Date("2021-01-01 00:30"),
      };
      it("should return the events which is inside slot", () => {
        const event1: CalendarEvent = {
          start: new Date("2021-01-01 00:00"),
          end: new Date("2021-01-01 00:30"),
          title: "Event 1",
          id: "1",
        };
        const event2: CalendarEvent = {
          start: new Date("2021-01-01 00:00"),
          end: new Date("2021-01-01 01:00"),
          title: "Event 2",
          id: "2",
        };
        const event3: CalendarEvent = {
          start: new Date("2021-01-01 00:15"),
          end: new Date("2021-01-01 00:45"),
          title: "Event 3",
          id: "3",
        };
        expect(getCalendarSlot(testSlot, getCalendarEventsTrees([event1, event2, event3])).rows.length).toBe(3);
      });
    });
  });
});
