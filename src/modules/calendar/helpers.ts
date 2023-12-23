import { format } from 'date-fns/format';
import { v4 } from 'uuid';

import {
    findSlotNode,
    getCalendarLinkedEventsNodes,
} from './modules/linkingEvents/helpers';
import { LinkedEventsNode } from './modules/linkingEvents/types';
import {
    GRID_CELL_DURATION,
    renderVirtualGridFromNode,
} from './modules/virtualGrid/helpers';
import { CalendarNodeVirtualGrid } from './modules/virtualGrid/types';
import {
    CalendarEvent,
    CalendarSlot,
    CalendarSlotColumn,
    CalendarSlotTime,
    TimeEvent,
} from './types';

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
            end: new Date(newDate.getTime() + GRID_CELL_DURATION),
        });
    }
    return slots;
}

export function formatSlotDate(date: CalendarSlot) {
    return `${format(date.start, 'HH:mm')} - ${format(date.end, 'HH:mm')}`;
}

export function getEventRequiredSlotsNumber(event: CalendarEvent) {
    return Math.floor(
        (event.end.getTime() - event.start.getTime()) / GRID_CELL_DURATION,
    );
}

export function getEventEndIfStartInSlot(
    event: CalendarEvent,
    slot: CalendarSlot,
) {
    return new Date(
        slot.start.getTime() + (event.end.getTime() - event.start.getTime()),
    );
}

export function createMockEvents(): CalendarEvent[] {
    const now = new Date();
    const event1: CalendarEvent = {
        start: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            0,
            0,
            0,
            0,
        ),
        end: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            1,
            0,
            0,
            0,
        ),
        title: 'Event 1',
        id: v4(),
    };
    const event2: CalendarEvent = {
        start: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            0,
            0,
            0,
            0,
        ),
        end: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            1,
            0,
            0,
            0,
        ),
        title: 'Event 2',
        id: v4(),
    };
    const event3: CalendarEvent = {
        start: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            2,
            0,
            0,
            0,
        ),
        end: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            4,
            0,
            0,
            0,
        ),
        title: 'Event 3',
        id: v4(),
    };
    const event4: CalendarEvent = {
        start: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            5,
            0,
            0,
            0,
        ),
        end: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            5,
            30,
            0,
            0,
        ),
        title: 'Event 4',
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

export function getLongestEvent(
    events: CalendarEvent[],
): CalendarEvent | undefined {
    return events.reduce<CalendarEvent | undefined>((prev, current) => {
        if (!prev) {
            return current;
        }
        if (getEventDuration(prev) > getEventDuration(current)) {
            return current;
        }
        return prev;
    }, undefined);
}

export function getEventsForDay(
    date: Date,
    events: CalendarEvent[],
): CalendarEvent[] {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + 1000 * 60 * 60 * 24);
    return events.filter(
        (event) =>
            event.start.getTime() >= dayStart.getTime() &&
            event.end.getTime() < dayEnd.getTime(),
    );
}

export function reduceEventsToDaySlots(
    date: Date,
    events: CalendarEvent[],
): CalendarSlot[] {
    const daySlotsTimes = getDaySlotsTimes(date);
    const dayEvents = getEventsForDay(date, events);
    const eventsNodes = getCalendarLinkedEventsNodes(dayEvents);
    const daySlots: CalendarSlot[] = daySlotsTimes.map((slot) =>
        getCalendarSlot(slot, eventsNodes),
    );

    return daySlots;
}

export function getCalendarSlot(
    slotTimes: CalendarSlotTime,
    eventsNodes: LinkedEventsNode<CalendarEvent>[],
): CalendarSlot {
    const slotNode = findSlotNode(slotTimes, eventsNodes);
    if (!slotNode) {
        return {
            start: slotTimes.start,
            end: slotTimes.end,
            columns: [],
        };
    }
    const virtualGrid = renderVirtualGridFromNode(slotNode);
    const columns = reduceGridToSlotColumns(slotTimes, virtualGrid);

    return {
        start: slotTimes.start,
        end: slotTimes.end,
        columns,
    };
}

export function reduceGridToSlotColumns(
    slotTimes: CalendarSlotTime,
    grid: CalendarNodeVirtualGrid,
): CalendarSlotColumn[] {
    const slotEvents = grid.cells.filter((cell) =>
        isEventInSlot(cell.event, slotTimes),
    );
    const slotColumns: CalendarSlotColumn[] = [];
    for (let columnIndex = 0; columnIndex < grid.widthX; columnIndex++) {
        const eventForColumn = slotEvents.find(
            (cell) => cell.x === columnIndex,
        );
        if (eventForColumn) {
            slotColumns.push({
                id: eventForColumn.event.id,
                event: eventForColumn.event,
                inScopeOfSlot: true,
            });
        } else {
            slotColumns.push({
                id: v4(),
                event: undefined,
                inScopeOfSlot: false,
            });
        }
    }

    return slotColumns;
}

export function splitEventsBySlot(
    slotTimes: CalendarSlotTime,
    events: CalendarEvent[],
): [CalendarEvent[], CalendarEvent[], CalendarEvent[]] {
    return events.reduce<[CalendarEvent[], CalendarEvent[], CalendarEvent[]]>(
        (accumulators, event) => {
            if (event.start.getTime() < slotTimes.start.getTime()) {
                accumulators[0].push(event);
                return accumulators;
            }
            if (
                event.start.getTime() >= slotTimes.start.getTime() &&
                event.start.getTime() < slotTimes.end.getTime()
            ) {
                accumulators[1].push(event);
                return accumulators;
            }

            accumulators[2].push(event);
            return accumulators;
        },
        [[], [], []],
    );
}

export function isEventInSlot(event: TimeEvent, slot: CalendarSlotTime) {
    return (
        event.start.getTime() >= slot.start.getTime() &&
        event.start.getTime() < slot.end.getTime()
    );
}

export function compareEventsByStartTimeAscending(
    a: CalendarEvent,
    b: CalendarEvent,
) {
    return a.start.getTime() - b.start.getTime();
}

export function compareEventsByDurationDescending(
    b: CalendarEvent,
    a: CalendarEvent,
) {
    return b.end.getTime() - a.end.getTime();
}
