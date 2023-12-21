import { useMemo } from 'react';
import './WeekDayView.scss';
import { getCalendarEventsForSlot, getDaySlotsTimes } from '../helpers';
import { WeekDaySlot } from './WeekDaySlot';
import { useCalendarStore } from '../store/store';
import { CalendarSlot } from '../types';

export type WeekDayViewProps = {
  date: Date;
}

export function WeekDayView({ date }: WeekDayViewProps) {
  const events = useCalendarStore(state => state.events);
  const daySlots = useMemo<CalendarSlot[]>(() => {
    const calendarDaySlots = getDaySlotsTimes(date);
    return calendarDaySlots.map<CalendarSlot>((calendarSlotTime) => ({
      ...calendarSlotTime,
      events: getCalendarEventsForSlot(calendarSlotTime, events)
    }));
  }, [date, events]);

  return <div className='week-day-view'>
    {daySlots.map((slot) => (
      <WeekDaySlot key={slot.start.getTime()} slot={slot} />
    ))}
  </div>
}