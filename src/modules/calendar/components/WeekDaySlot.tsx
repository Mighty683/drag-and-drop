import './WeekDaySlot.scss'

import { useEffect, useRef } from 'react';
import { CALENDAR_EVENT_DATE_TYPE, } from '../constants';
import { formatSlotDate, getEventEndIfStartInSlot, parseEventJSON } from '../helpers';
import { CalendarEvent, CalendarEventOperations, CalendarSlot } from '../types';
import { useCalendarStore } from '../store/store';
import { throttle } from 'lodash';
import { EventTile } from './Events/EventTile';

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

      if (!event || slot.rows?.find(slotRow => slotRow.event?.id === event.id)) return;
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
      if (!event || slot.rows?.find(slotRow => slotRow.event?.id === event.id)) return;
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
  }, [addEvent, addOrEditEvent, editEvent, removeEvent, slot, slot.start])

  return <div ref={ref} className='week-day-slot'>
    {formatSlotDate(slot)}
    <div className="week-day-slot__events-rows">
      {slot.rows?.map((slotRow) => {
        const event = slotRow.event;
        if (!event) return <div className='week-day-slot__empty-row'></div>;
        return <EventTile key={event.id} event={event} />
      })}
    </div>
  </div>;
}
