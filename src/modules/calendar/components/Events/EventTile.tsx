import { useEffect, useRef } from "react";
import { CalendarEvent, CalendarEventOperations } from "../../types";


import './EventTile.scss';
import { CALENDAR_EVENT_DATE_TYPE } from "../../constants";
import { useCalendarStore } from "../../store/store";
import { getEventRequiredSlotsNumber } from "../../helpers";

export type EventTileProps = {
  event: CalendarEvent;
  className?: string;
}

export function EventTile({
  event,
  className
}: EventTileProps) {
  const editEvent = useCalendarStore(state => state.editEvent);
  const ref = useRef<HTMLDivElement>(null);
  const operationText = event.operation ? `(${event.operation})` : '';

  useEffect(() => {
    const node = ref.current;
    const dragStartListener = (dragEvent: DragEvent) => {
      dragEvent.dataTransfer?.setData(CALENDAR_EVENT_DATE_TYPE, JSON.stringify(event));
      editEvent(event.id, {
        ...event,
        operation: CalendarEventOperations.dragged
      });
    };
    const dragEndListener = (dragEvent: DragEvent) => {
      const hasData = !!dragEvent.dataTransfer?.getData(CALENDAR_EVENT_DATE_TYPE);

      if (hasData) return;
      editEvent(event.id, {
        ...event,
        operation: CalendarEventOperations.none
      });
    }
    ref.current?.addEventListener('dragstart', dragStartListener);
    ref.current?.addEventListener('dragend', dragEndListener);

    return () => {
      node?.removeEventListener('dragstart', dragStartListener);
    }
  }, [editEvent, event]);

  return <div
    ref={ref}
    style={{
      height: getEventRequiredSlotsNumber(event) * 50,
      pointerEvents: event.operation === CalendarEventOperations.dragging ? 'none' : 'all',
      backgroundColor: `red`
    }} className={`${className} event-tile`} draggable>
    {event.title}
    <br />
    {operationText}
  </div>
}