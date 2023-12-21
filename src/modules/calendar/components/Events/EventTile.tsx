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
  const removeEvent = useCalendarStore(state => state.removeEvent);
  const isAnyEventDragging = useCalendarStore(state => state.isAnyEventDragging);
  const setIsAnyEventDragging = useCalendarStore(state => state.setIsAnyEventDragging);
  const ref = useRef<HTMLDivElement>(null);
  const operationText = event.operation ? `(${event.operation})` : '';

  useEffect(() => {
    const node = ref.current;
    const dragStartListener = (dragEvent: DragEvent) => {
      dragEvent.dataTransfer?.setData(CALENDAR_EVENT_DATE_TYPE, JSON.stringify(event));
      setIsAnyEventDragging(true);
      editEvent(event.id, {
        ...event,
        operation: CalendarEventOperations.dragged
      });
    };
    const dragEndListener = (dragEvent: DragEvent) => {
      console.log(dragEvent.target)
      setIsAnyEventDragging(false);

      removeEvent(`${event?.id}-dragging`);
    }
    ref.current?.addEventListener('dragstart', dragStartListener);
    ref.current?.addEventListener('dragend', dragEndListener);

    return () => {
      node?.removeEventListener('dragstart', dragStartListener);
    }
  }, [editEvent, event, removeEvent, setIsAnyEventDragging]);

  return <div
    ref={ref}
    style={{
      height: getEventRequiredSlotsNumber(event) * 50,
      pointerEvents: isAnyEventDragging ? 'none' : 'all',
      backgroundColor: '#ccc',
      opacity: event.operation === CalendarEventOperations.dragged ? 0.5 : 1
    }} className={`${className} event-tile`} draggable>
    {event.title}
    <br />
    {operationText}
  </div>
}