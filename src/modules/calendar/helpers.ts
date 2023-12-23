import { CalendarEvent, CalendarSlot, CalendarSlotTime, LinkedEventsNode, TimeEvent } from "./types";
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

export function reduceEventsToDaySlots(date: Date, events: CalendarEvent[]): CalendarSlot[] {
  const daySlotsTimes = getDaySlotsTimes(date);
  const dayEvents = getEventsForDay(date, events);
  const eventsNodes = getCalendarLinkedEventsNodes(dayEvents);
  const daySlots: CalendarSlot[] = daySlotsTimes.map(slot => getCalendarSlot(slot, eventsNodes));

  return daySlots;
}

export function getCalendarSlot(
  slotTimes: CalendarSlotTime,
  eventsNodes: LinkedEventsNode<CalendarEvent>[]
): CalendarSlot {
  const slotNode = findSlotNode(slotTimes, eventsNodes);
  const branchEvents = slotNode?.events || [];
  const [previousEvents, eventsStartedInSlot, proceedingEvents] = splitEventsBySlot(slotTimes, branchEvents);

  return {
    start: slotTimes.start,
    end: slotTimes.end,
    rows: [
      ...Array(previousEvents.length)
        .fill(undefined)
        .map(() => ({
          id: v4(),
        })),
      ...eventsStartedInSlot.map(event => ({
        id: event.id,
        event,
      })),
      ...Array(proceedingEvents.length)
        .fill(undefined)
        .map(() => ({
          id: v4(),
        })),
    ],
  };
}

export function splitEventsBySlot(
  slotTimes: CalendarSlotTime,
  events: CalendarEvent[]
): [CalendarEvent[], CalendarEvent[], CalendarEvent[]] {
  return events.reduce<[CalendarEvent[], CalendarEvent[], CalendarEvent[]]>(
    (accumulators, event) => {
      if (event.start.getTime() < slotTimes.start.getTime()) {
        accumulators[0].push(event);
        return accumulators;
      }
      if (event.start.getTime() >= slotTimes.start.getTime() && event.start.getTime() < slotTimes.end.getTime()) {
        accumulators[1].push(event);
        return accumulators;
      }

      accumulators[2].push(event);
      return accumulators;
    },
    [[], [], []]
  );
}

export function isEventInSlot(event: TimeEvent, slot: CalendarSlotTime) {
  return event.start.getTime() >= slot.start.getTime() && event.start.getTime() < slot.end.getTime();
}

export function isEventPartOfNode(event: TimeEvent, node: LinkedEventsNode<CalendarEvent>) {
  return (
    (event.start.getTime() >= node.start.getTime() && event.start.getTime() < node.end.getTime()) ||
    (node.start.getTime() >= event.start.getTime() && node.start.getTime() < event.end.getTime())
  );
}
/**
 * TODO: can we do it without sorting?
 */
export function getCalendarLinkedEventsNodes(events: CalendarEvent[]): LinkedEventsNode<CalendarEvent>[] {
  const nodes: LinkedEventsNode<CalendarEvent>[] = [];
  const sortedDays = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
  for (const event of sortedDays) {
    if (nodes.length === 0) {
      nodes.push({
        events: [event],
        start: event.start,
        end: event.end,
      });
      continue;
    } else {
      let added = false;
      for (const node of nodes) {
        const modifiedNode = tryAddEventToHeadOfNode(event, node);
        if (modifiedNode) {
          added = true;
          break;
        }
      }
      if (!added) {
        nodes.push({
          events: [event],
          start: event.start,
          end: event.end,
        });
      }
    }
  }

  return nodes;
}

export function tryAddEventToHeadOfNode(event: CalendarEvent, node: LinkedEventsNode<CalendarEvent>): boolean {
  if (isEventPartOfNode(event, node)) {
    node.events = [...(node.events || []), event];
    node.start = node.start.getTime() < event.start.getTime() ? node.start : event.start;
    node.end = node.end.getTime() > event.end.getTime() ? node.end : event.end;
    return true;
  }
  return false;
}

export function findSlotNode(
  slotTimes: CalendarSlotTime,
  eventsNodes: LinkedEventsNode<CalendarEvent>[]
): LinkedEventsNode<CalendarEvent> | undefined {
  for (const node of eventsNodes) {
    if (
      node.start.getTime() <= slotTimes.start.getTime() &&
      node.end.getTime() >= slotTimes.end.getTime() &&
      node.events?.some(event => isEventInSlot(event, slotTimes))
    ) {
      return node;
    }
  }
}
