import { CalendarEvent, CalendarSlot, CalendarSlotTime } from "./types";

import {format} from 'date-fns/format';

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
  return `${format(date.start, 'HH:mm')} - ${format(date.end, 'HH:mm')}`;
}

export function getEventLengthInSlots(event: CalendarEvent) {
  return Math.floor((event.end.getTime() - event.start.getTime()) / thirtyMinutes);
}

export function calendarEventBeginInSlot(slot: CalendarSlot, event: CalendarEvent) {
  return event.start.getTime() > slot.start.getTime() && event.start.getTime() < slot.end.getTime();
}

export function getCalendarEventsForSlot(slot: CalendarSlot, events: CalendarEvent[]): CalendarEvent[] {
  return events.filter((event) => {
    const eventBeginInSlot = calendarEventBeginInSlot(slot, event);
    const eventEndInSlot = event.end.getTime() > slot.start.getTime() && event.end.getTime() < slot.end.getTime();
    const eventInSlot = event.start.getTime() < slot.start.getTime() && event.end.getTime() > slot.end.getTime();
    return eventBeginInSlot || eventEndInSlot || eventInSlot;
  });
}

export function createMockEvents(): CalendarEvent[] {
  const now = new Date();
  const event1: CalendarEvent = {
    start: new Date(now.getTime() + 1000 * 60 * 60 * 2),
    end: new Date(now.getTime() + 1000 * 60 * 60 * 3),
    title: 'Event 1',
    id: '1',
  };
  const event2: CalendarEvent = {
    start: new Date(now.getTime() + 1000 * 60 * 60 * 4),
    end: new Date(now.getTime() + 1000 * 60 * 60 * 5),
    title: 'Event 2',
    id: '2',
  };
  const event3: CalendarEvent = {
    start: new Date(now.getTime() + 1000 * 60 * 60 * 6),
    end: new Date(now.getTime() + 1000 * 60 * 60 * 7),
    title: 'Event 3',
    id: '3',
  };
  const event4: CalendarEvent = {
    start: new Date(now.getTime() + 1000 * 60 * 60 * 6),
    end: new Date(now.getTime() + 1000 * 60 * 60 * 7),
    title: 'Event 4',
    id: '4',
  };

  return [event1, event2, event3, event4];
}