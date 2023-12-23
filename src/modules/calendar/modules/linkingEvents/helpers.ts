import {
  compareEventsByDurationDescending,
  compareEventsByStartTimeAscending,
  isEventInSlot,
} from "../../helpers";
import {
  CalendarEvent,
  LinkedEventsNode,
  CalendarSlotTime,
  TimeEvent,
} from "../../types";

export function getCalendarLinkedEventsNodes(
  events: CalendarEvent[],
): LinkedEventsNode<CalendarEvent>[] {
  const nodes: LinkedEventsNode<CalendarEvent>[] = [];
  const sortedDays = sortEventsForNodeBuild(events);
  for (const event of sortedDays) {
    const shouldStartNewNode =
      nodes.length === 0 || !tryAddEventToAnyNode(event, nodes);
    if (shouldStartNewNode) {
      nodes.push({
        events: [event],
        start: event.start,
        end: event.end,
      });
    }
  }
  return nodes;
}

export function sortEventsForNodeBuild(
  events: CalendarEvent[],
): CalendarEvent[] {
  return [...events].sort((a, b) => {
    const sortByStartTime = compareEventsByStartTimeAscending(a, b);
    if (sortByStartTime !== 0) {
      return sortByStartTime;
    }
    const sortByDuration = compareEventsByDurationDescending(b, a);
    return sortByDuration;
  });
}
export function tryAddEventToAnyNode(
  event: CalendarEvent,
  nodes: LinkedEventsNode<CalendarEvent>[],
): boolean {
  for (const node of nodes) {
    const didAdd = tryAddEventToHeadOfNode(event, node);
    if (didAdd) {
      return true;
    }
  }
  return false;
}

export function tryAddEventToHeadOfNode(
  event: CalendarEvent,
  node: LinkedEventsNode<CalendarEvent>,
): boolean {
  if (isEventPartOfNode(event, node)) {
    node.events = [...(node.events ?? []), event];
    node.start =
      node.start.getTime() < event.start.getTime() ? node.start : event.start;
    node.end = node.end.getTime() > event.end.getTime() ? node.end : event.end;
    return true;
  }
  return false;
}

export function findSlotNode(
  slotTimes: CalendarSlotTime,
  eventsNodes: LinkedEventsNode<CalendarEvent>[],
): LinkedEventsNode<CalendarEvent> | undefined {
  for (const node of eventsNodes) {
    if (
      node.start.getTime() <= slotTimes.start.getTime() &&
      node.end.getTime() >= slotTimes.end.getTime() &&
      node.events?.some((event) => isEventInSlot(event, slotTimes))
    ) {
      return node;
    }
  }
}

export function isEventPartOfNode(
  event: TimeEvent,
  node: LinkedEventsNode<CalendarEvent>,
) {
  return (
    (event.start.getTime() >= node.start.getTime() &&
      event.start.getTime() < node.end.getTime()) ||
    (node.start.getTime() >= event.start.getTime() &&
      node.start.getTime() < event.end.getTime())
  );
}
