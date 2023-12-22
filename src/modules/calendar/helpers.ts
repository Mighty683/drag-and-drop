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

export function createMockEvents(): CalendarEvent[] {
  const now = new Date();
  const event1: CalendarEvent = {
    start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0),
    end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 1, 0, 0, 0),
    title: "Event 1",
    id: v4(),
  };
  const event2: CalendarEvent = {
    start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0),
    end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 1, 0, 0, 0),
    title: "Event 2",
    id: v4(),
  };
  const event3: CalendarEvent = {
    start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 2, 0, 0, 0),
    end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 4, 0, 0, 0),
    title: "Event 3",
    id: v4(),
  };
  const event4: CalendarEvent = {
    start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 5, 0, 0, 0),
    end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 5, 30, 0, 0),
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

export function getNumberOfEventsOverlappingWithSlotFromBefore(
  slot: CalendarSlotTime,
  sortedEvents: CalendarEvent[]
): number {
  let slotVisualChainStart = slot.start.getTime();
  let overlappingEventsCount = 0;
  /**
   * Sort events by start date descending
   * because we want to search by slotVisualChainStart and calculate overlapping events
   * thanks to sorting we know that we don't miss chain of events if we find one
   */

  for (const processedEvent of sortedEvents) {
    const startOfProcessedEvent = processedEvent.start.getTime();
    if (startOfProcessedEvent < slotVisualChainStart && processedEvent.end.getTime() > slotVisualChainStart) {
      overlappingEventsCount++;
      if (startOfProcessedEvent < slotVisualChainStart) {
        slotVisualChainStart = startOfProcessedEvent;
      }
    }
  }

  return overlappingEventsCount;
}

export function getNumberOfEventsOverlappingWithSlotFromAfter(
  slot: CalendarSlotTime,
  slotEvents: CalendarEvent[],
  sortedEvents: CalendarEvent[]
): number {
  const slotEnd = slot.end.getTime();
  const longestSlotEvent = getLongestEvent(slotEvents);
  if (!longestSlotEvent) {
    return 0;
  } else {
    let slotVisualChainEnd = longestSlotEvent.end.getTime();
    let overlappingEventsCount = 0;

    /**
     * Sort events by start date ascending
     * because we want to search by slotVisualChainEnd and calculate overlapping events
     * thanks to sorting we know that we don't miss chain of events if we find one
     */

    for (const processedEvent of sortedEvents) {
      const endOfProcessedEvent = processedEvent.end.getTime();
      if (processedEvent.start.getTime() < slotVisualChainEnd && processedEvent.start.getTime() >= slotEnd) {
        overlappingEventsCount++;
        if (endOfProcessedEvent > slotVisualChainEnd) {
          slotVisualChainEnd = endOfProcessedEvent;
        }
      }
    }
    return overlappingEventsCount;
  }
}

export function splitEventsBySlot(
  events: CalendarEvent[],
  slot: CalendarSlotTime
): [CalendarEvent[], CalendarEvent[], CalendarEvent[]] {
  const eventsBeforeSlot = [];
  const eventsInSlot = [];
  const eventsAfterSlot = [];

  for (const event of events) {
    if (event.start.getTime() < slot.start.getTime()) {
      eventsBeforeSlot.push(event);
    } else if (event.start.getTime() >= slot.start.getTime() && event.start.getTime() < slot.end.getTime()) {
      eventsInSlot.push(event);
    } else {
      eventsAfterSlot.push(event);
    }
  }
  return [eventsBeforeSlot, eventsInSlot, eventsAfterSlot];
}

export function reduceEventsToDaySlots(date: Date, events: CalendarEvent[]): CalendarSlot[] {
  const daySlotsTimes = getDaySlotsTimes(date);
  const dayEvents = getEventsForDay(date, events);
  const sortedDayEvents = [...dayEvents].sort((a, b) => b.start.getTime() - a.start.getTime());
  const daySlots: CalendarSlot[] = daySlotsTimes.map(slot => getCalendarSlot(slot, sortedDayEvents));

  return daySlots;
}

export function getCalendarSlot(slotTimes: CalendarSlotTime, sortedDayEvents: CalendarEvent[]): CalendarSlot {
  const [eventsBefore, slotEvents, eventsAfter] = splitEventsBySlot(sortedDayEvents, slotTimes);
  const numberOfRowsBeforeSlot = getNumberOfEventsOverlappingWithSlotFromBefore(slotTimes, eventsBefore);
  const numberOfRowAfterSlot = getNumberOfEventsOverlappingWithSlotFromAfter(slotTimes, slotEvents, eventsAfter);
  return {
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
  };
}
