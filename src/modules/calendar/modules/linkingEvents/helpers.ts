import { isEventInSlot } from "../../helpers";
import { CalendarEvent, LinkedEventsNode, CalendarSlotTime, TimeEvent } from "../../types";

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

export function isEventPartOfNode(event: TimeEvent, node: LinkedEventsNode<CalendarEvent>) {
  return (
    (event.start.getTime() >= node.start.getTime() && event.start.getTime() < node.end.getTime()) ||
    (node.start.getTime() >= event.start.getTime() && node.start.getTime() < event.end.getTime())
  );
}
