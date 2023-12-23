import { CalendarEvent, CalendarSlot, CalendarSlotTime, LinkedEventsNode } from "./types";
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
  const branchEvents = slotNode ? reduceNodeToEventsList(slotNode) : [];
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

export function isEventInSlot(event: CalendarEvent, slot: CalendarSlotTime) {
  return event.start.getTime() >= slot.start.getTime() && event.start.getTime() < slot.end.getTime();
}

export function areEventsOverlapping(eventA: CalendarEvent, eventB: CalendarEvent) {
  return (
    (eventA.start.getTime() >= eventB.start.getTime() && eventA.start.getTime() < eventB.end.getTime()) ||
    (eventB.start.getTime() >= eventA.start.getTime() && eventB.start.getTime() < eventA.end.getTime())
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
        event,
      });
      continue;
    } else {
      let added = false;
      for (const node of nodes) {
        const modifiedNode = tryAddEventToHeadOfNode(event, node);
        if (modifiedNode.event === event) {
          added = true;
          break;
        }
      }
      if (!added) {
        nodes.push({
          event,
        });
      }
    }
  }

  return nodes;
}

export function tryAddEventToHeadOfNode(
  event: CalendarEvent,
  node: LinkedEventsNode<CalendarEvent>
): LinkedEventsNode<CalendarEvent> {
  if (node.event && areEventsOverlapping(event, node.event)) {
    node.next = {
      event: node.event,
      next: node.next,
    };
    node.event = event;
    return node;
  } else if (node.next) {
    let nextNode: LinkedEventsNode<CalendarEvent> | undefined = node.next;
    while (nextNode) {
      if (nextNode.event && areEventsOverlapping(event, nextNode.event)) {
        node.next = {
          event: node.event,
          next: node.next,
        };
        node.event = event;
        return node;
      }
      nextNode = nextNode.next;
    }
  }
  return node;
}

export function findSlotNode(
  slotTimes: CalendarSlotTime,
  eventsNodes: LinkedEventsNode<CalendarEvent>[]
): LinkedEventsNode<CalendarEvent> | undefined {
  for (const node of eventsNodes) {
    if (doesNodeContainSlot(node, slotTimes)) {
      return node;
    }
  }
}

export function doesNodeContainSlot(node: LinkedEventsNode<CalendarEvent>, slot: CalendarSlotTime) {
  if (node.event && isEventInSlot(node.event, slot)) {
    return true;
  }
  if (node.next) {
    return doesNodeContainSlot(node.next, slot);
  }
  return false;
}

export function reduceNodeToEventsList(node: LinkedEventsNode<CalendarEvent>): CalendarEvent[] {
  if (!node.event) {
    return [];
  }
  if (!node.next) {
    return [node.event];
  }
  return [node.event, ...reduceNodeToEventsList(node.next)];
}
