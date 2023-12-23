import { CalendarEvent, CalendarSlot, CalendarSlotTime, EventTimeTreeNode } from "./types";
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
  const eventsTree = getCalendarEventsTrees(dayEvents);
  const daySlots: CalendarSlot[] = daySlotsTimes.map(slot => getCalendarSlot(slot, eventsTree));

  console.log(eventsTree);
  return daySlots;
}

export function getCalendarSlot(
  slotTimes: CalendarSlotTime,
  eventsTree: EventTimeTreeNode<CalendarEvent>
): CalendarSlot {
  const slotBranch = findBranchMatchingSlot(eventsTree, slotTimes);
  const branchEvents = slotBranch ? reduceBranchToEventsList(slotBranch) : [];
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

export function reduceBranchToEventsList(tree: EventTimeTreeNode<CalendarEvent>): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  if (tree.event) {
    events.push(tree.event);
  }
  for (const child of tree.children) {
    events.push(...reduceBranchToEventsList(child));
  }
  return events;
}

export function findBranchMatchingSlot(
  tree: EventTimeTreeNode<CalendarEvent>,
  slot: CalendarSlotTime
): EventTimeTreeNode<CalendarEvent> | undefined {
  if (!tree.children.length) {
    return undefined;
  }
  for (const branch of tree.children) {
    if ((branch.event && isEventInSlot(branch.event, slot)) || findBranchMatchingSlot(branch, slot)) {
      return branch;
    }
  }
  return undefined;
}

export function getCalendarEventsTrees(dayEvents: CalendarEvent[]): EventTimeTreeNode<CalendarEvent> {
  const tree: EventTimeTreeNode<CalendarEvent> = {
    children: [],
  };
  for (const event of dayEvents) {
    addEventToRoot(tree, event);
  }
  return tree;
}
export function addEventToRoot(tree: EventTimeTreeNode<CalendarEvent>, event: CalendarEvent) {
  if (!tree.children.length) {
    tree.children.push({
      event,
      children: [],
    });
    return;
  }

  let addedToAnyChildren = false;
  for (const child of tree.children) {
    if (addEventToNode(child, event)) {
      addedToAnyChildren = true;
      break;
    }
  }

  if (!addedToAnyChildren) {
    tree.children.push({
      event,
      children: [],
    });
  }
}
/**
 *
 * @param tree
 * @param event
 * @returns true if event was added to tree, false otherwise
 */
export function addEventToNode(tree: EventTimeTreeNode<CalendarEvent>, event: CalendarEvent): boolean {
  if (tree.event && areEventsOverlapping(tree.event, event)) {
    tree.children.push({
      event,
      children: [],
    });
    return true;
  }

  let addedToAnyChildren = false;
  for (const child of tree.children) {
    if (addEventToNode(child, event)) {
      addedToAnyChildren = true;
      break;
    }
  }

  return addedToAnyChildren;
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
