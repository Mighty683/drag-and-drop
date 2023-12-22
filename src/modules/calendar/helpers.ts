import { CalendarEvent, CalendarSlot, CalendarSlotTime } from "./types";
import { v4 } from "uuid";

import { format } from "date-fns/format";

export const thirtyMinutes = 1000 * 60 * 30;

export function getDateWeekDays(date: Date) {
  const days: Date[] = [];
  const day = date.getDay();
  const start = new Date(date);
  start.setDate(date.getDate() - day);
  for (let i = 0; i < 7; i++) {
    const newDate = new Date(start);
    newDate.setDate(start.getDate() + i);
    days.push(newDate);
  }
  return days;
}

export function getDaySlotsTimes(date: Date) {
  const slots: CalendarSlotTime[] = [];
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  for (let i = 0; i < 48; i++) {
    const newDate = new Date(start);
    newDate.setMinutes(start.getMinutes() + i * 30);
    slots.push({
      start: newDate,
      end: new Date(newDate.getTime() + thirtyMinutes),
    });
  }
  return slots;
}

export function formatSlotDate(date: CalendarSlot) {
  return `${format(date.start, "HH:mm")} - ${format(date.end, "HH:mm")}`;
}

export function getEventRequiredSlotsNumber(event: CalendarEvent) {
  return Math.floor((event.end.getTime() - event.start.getTime()) / thirtyMinutes);
}

export function getEventEndIfStartInSlot(event: CalendarEvent, slot: CalendarSlot) {
  return new Date(slot.start.getTime() + (event.end.getTime() - event.start.getTime()));
}

export function getCalendarEventsForSlot(slot: CalendarSlotTime, events: CalendarEvent[]): CalendarEvent[] {
  return events.filter(event => {
    const eventBeginInSlot =
      event.start.getTime() >= slot.start.getTime() && event.start.getTime() < slot.end.getTime();
    return eventBeginInSlot;
  });
}

export function createMockEvents(): CalendarEvent[] {
  const now = new Date();
  const event1: CalendarEvent = {
    start: new Date(now.getTime() - 1000 * 60 * 60 * 3),
    end: new Date(now.getTime() - 1000 * 60 * 60 * 2),
    title: "Event 1",
    id: v4(),
  };
  const event2: CalendarEvent = {
    start: new Date(now.getTime() - 1000 * 60 * 60 * 5),
    end: new Date(now.getTime() - 1000 * 60 * 60 * 4),
    title: "Event 2",
    id: v4(),
  };
  const event3: CalendarEvent = {
    start: new Date(now.getTime() - 1000 * 60 * 60 * 7),
    end: new Date(now.getTime() - 1000 * 60 * 60 * 6),
    title: "Event 3",
    id: v4(),
  };
  const event4: CalendarEvent = {
    start: new Date(now.getTime() - 1000 * 60 * 60 * 7),
    end: new Date(now.getTime() - 1000 * 60 * 60 * 6),
    title: "Event 4",
    id: v4(),
  };

  return [event1, event2, event3, event4];
}

export function parseEventJSON(eventJSON: string): CalendarEvent | undefined {
  const event = JSON.parse(eventJSON) as CalendarEvent;
  if (!event.id) {
    return undefined;
  }
  return {
    ...event,
    start: new Date(event.start),
    end: new Date(event.end),
  };
}

export function getEventDuration(event: CalendarEvent) {
  return event.end.getTime() - event.start.getTime();
}

export function getLongestEvent(events: CalendarEvent[]): CalendarEvent | undefined {
  return events.reduce<CalendarEvent | undefined>((prev, current) => {
    if (!prev) {
      return current;
    }
    if (getEventDuration(current) > getEventDuration(current)) {
      return current;
    }
    return prev;
  }, undefined);
}

export function getEventsForDay(date: Date, events: CalendarEvent[]): CalendarEvent[] {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart.getTime() + 1000 * 60 * 60 * 24);
  return events.filter(event => event.start.getTime() >= dayStart.getTime() && event.end.getTime() < dayEnd.getTime());
}

export function getEventsOverlappingWithSlotFromBefore(
  slot: CalendarSlotTime,
  events: CalendarEvent[]
): CalendarEvent[] {
  return events
    .filter(event => {
      const eventOverlap = event.start.getTime() < slot.start.getTime() && event.end.getTime() > slot.start.getTime();
      return eventOverlap;
    })
    .reduce<CalendarEvent[]>((accumulator, predecessorEvent) => {
      const eventsOverlappingWithPredecessor = getEventsOverlappingWithSlotFromBefore(predecessorEvent, accumulator);
      if (eventsOverlappingWithPredecessor.length > 0) {
        return accumulator.concat(eventsOverlappingWithPredecessor);
      } else {
        accumulator.push(predecessorEvent);
        return accumulator;
      }
    }, []);
}

export function getEventsOverlappingWithSlotFromAfter(
  slotEvents: CalendarEvent[],
  events: CalendarEvent[]
): CalendarEvent[] {
  const longestSlotEvent = getLongestEvent(slotEvents);
  if (!longestSlotEvent) {
    return [];
  }
  return events
    .filter(event => {
      if (event === longestSlotEvent) {
        return false;
      }
      const eventOverlapWithLongestEvent =
        event.start.getTime() > longestSlotEvent.start.getTime() &&
        event.start.getTime() < longestSlotEvent.end.getTime();
      return eventOverlapWithLongestEvent;
    })
    .reduce<CalendarEvent[]>((accumulator, successorEvent) => {
      const eventsOverlappingWithSuccessor = getEventsOverlappingWithSlotFromAfter([successorEvent], accumulator);
      if (eventsOverlappingWithSuccessor.length > 0) {
        return accumulator.concat(eventsOverlappingWithSuccessor);
      } else {
        accumulator.push(successorEvent);
        return accumulator;
      }
    }, []);
}

export function reduceEventsToDaySlots(date: Date, events: CalendarEvent[]): CalendarSlot[] {
  const daySlotsTimes = getDaySlotsTimes(date);
  const dayEvents = getEventsForDay(date, events);
  const daySlots: CalendarSlot[] = [];
  daySlotsTimes.forEach(slotTimes => {
    const slotEvents = getCalendarEventsForSlot(slotTimes, dayEvents);
    const numberOfRowsBeforeSlot = getEventsOverlappingWithSlotFromBefore(slotTimes, dayEvents).length;
    const numberOfRowAfterSlot = getEventsOverlappingWithSlotFromAfter(slotEvents, dayEvents).length;
    console.log(slotEvents, numberOfRowsBeforeSlot, numberOfRowAfterSlot);
    daySlots.push({
      start: slotTimes.start,
      end: slotTimes.end,
      rows: [
        ...Array(numberOfRowsBeforeSlot)
          .fill(null)
          .map(() => ({ id: v4() })),
        ...slotEvents.map(event => ({ event, id: v4() })),
        ...Array(numberOfRowAfterSlot)
          .fill(null)
          .map(() => ({ id: v4() })),
      ],
    });
  });

  return daySlots;
}
