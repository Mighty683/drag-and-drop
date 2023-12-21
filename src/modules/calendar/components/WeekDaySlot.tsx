import { useLayoutEffect, useRef } from 'react';
import { SLOT_HEIGHT } from '../constants';
import { formatSlotDate, getEventLengthInSlots } from '../helpers';
import { CalendarEvent, CalendarSlot } from '../types';
import './WeekDaySlot.scss'
import { usePositionCollector } from '../positionCollector';
export type WeekDaySlotProps = {
  slot: CalendarSlot
};
export function WeekDaySlot({ slot }: WeekDaySlotProps) {
  return <div className='week-day-slot'>
    {formatSlotDate(slot)}
    <div className="week-day-slot__events-placer">
      {slot.events?.map((event) => (
        <EventDataCollector key={event.id} calendarEvent={event} />
      ))}
    </div>
  </div>;
};

export function EventDataCollector(
  { calendarEvent }: {
    calendarEvent: CalendarEvent
  }
) {
  const ref = useRef<HTMLDivElement>(null);

  const positionCollector = usePositionCollector();

  useLayoutEffect(() => {
    if (!ref.current) return;
    const { top, left, bottom, right } = ref.current.getBoundingClientRect();
    positionCollector.eventsMap.set(calendarEvent.id, {
      left: left,
      top: top,
      width: right - left,
      height: bottom - top,
      event: calendarEvent,
    });
  }, []);

  return <div ref={ref} className="week-day-slot__event_data_collector" style={{
    height: getEventLengthInSlots(calendarEvent) * SLOT_HEIGHT,
  }}
  />
}