import './WeekDaySlot.scss'

import { useEffect, useLayoutEffect, useRef } from 'react';
import { CALENDAR_EVENT_DATE_TYPE, SLOT_HEIGHT } from '../constants';
import { formatSlotDate, getEventEndIfStartInSlot, getEventRequiredSlotsNumber, parseEventJSON } from '../helpers';
import { CalendarEvent, CalendarEventOperations, CalendarSlot } from '../types';
import { usePositionCollector } from '../positionCollector';
import { useCalendarStore } from '../store/store';
import { throttle } from 'lodash';

export type WeekDaySlotProps = {
  slot: CalendarSlot
};
export function WeekDaySlot({ slot }: WeekDaySlotProps) {
  const { removeEvent, editEvent, addEvent, addOrEditEvent } = useCalendarStore(store => ({ removeEvent: store.removeEvent, editEvent: store.editEvent, addEvent: store.addEvent, addOrEditEvent: store.addOrEditEvent }));
  const ref = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const node = ref.current;
    const listenerDragEnter = throttle((dragEvent: DragEvent) => {
      dragEvent.preventDefault();
      const event: CalendarEvent | undefined = parseEventJSON(dragEvent.dataTransfer?.getData(CALENDAR_EVENT_DATE_TYPE) || '{}');

      if (!event || slot.events?.find(slotEvent => slotEvent.id === event.id)) return;
      addOrEditEvent(`${event.id}-dragging`, {
        ...event,
        id: `${event.id}-dragging`,
        start: slot.start,
        operation: CalendarEventOperations.dragging,
        end: getEventEndIfStartInSlot(event, slot),
      });
    }, 50);

    const listenerDragDrop = (dragEvent: DragEvent) => {
      const event: CalendarEvent | undefined = parseEventJSON(dragEvent.dataTransfer?.getData(CALENDAR_EVENT_DATE_TYPE) || '{}');

      console.log('drag drop', event);
      if (!event || slot.events?.find(slotEvent => slotEvent.id === event.id)) return;
      console.log('drag drop', event.id);
      removeEvent(event.id);
      editEvent(`${event.id}-dragging`, {
        ...event,
        start: slot.start,
        end: getEventEndIfStartInSlot(event, slot),
        operation: CalendarEventOperations.none,
      });
      dragEvent.preventDefault();
    };

    const listenerDragOver = (dragEvent: DragEvent) => {
      dragEvent.preventDefault();
    };

    node?.addEventListener('dragenter', listenerDragEnter);
    node?.addEventListener('drop', listenerDragDrop);
    node?.addEventListener('dragover', listenerDragOver);

    return () => {
      node?.removeEventListener('dragenter', listenerDragEnter);
      node?.removeEventListener('drop', listenerDragDrop);
      node?.removeEventListener('dragover', listenerDragOver);
    }
  }, [addEvent, addOrEditEvent, editEvent, removeEvent, slot, slot.events, slot.start])

  return <div ref={ref} className='week-day-slot'>
    {formatSlotDate(slot)}
    <div className="week-day-slot__events-placer">
      {slot.events?.map((event) => (
        <EventDataCollector key={event.id} calendarEvent={event} />
      ))}
    </div>
  </div>;
}

export function EventDataCollector(
  { calendarEvent }: {
    calendarEvent: CalendarEvent
  }
) {
  const ref = useRef<HTMLDivElement>(null);

  const positionCollector = usePositionCollector();

  useLayoutEffect(() => {
    if (!ref.current) return;

    const resizeListener = () => {
      const { top, left, bottom, right } = ref.current!.getBoundingClientRect();
      const topWithScroll = top + window.scrollY;
      positionCollector.eventsMap.set(calendarEvent.id, {
        left: left,
        top: topWithScroll,
        width: right - left,
        height: bottom - topWithScroll,
        event: calendarEvent,
      });
    };
    resizeListener();
    window.addEventListener('resize', resizeListener);
    
    return () => {
      window.removeEventListener('resize', resizeListener);
    }
  }, [calendarEvent, calendarEvent.id, positionCollector.eventsMap]);

  return <div ref={ref} className="week-day-slot__event_data_collector" style={{
    height: getEventRequiredSlotsNumber(calendarEvent) * SLOT_HEIGHT,
  }}
  />
}