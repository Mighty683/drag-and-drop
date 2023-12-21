import { useEffect, useRef } from "react";
import { CalendarEventOperations, CalendarEventView } from "../../types";


import './EventTile.scss';
import { CALENDAR_EVENT_DATE_TYPE } from "../../constants";
import { useCalendarStore } from "../../store/store";

export type EventTileProps = {
  eventView: CalendarEventView;
}

export function EventTile({
  eventView
}: EventTileProps) {
  const editEvent = useCalendarStore(state => state.editEvent);
  const ref = useRef<HTMLDivElement>(null);
  const operationText = eventView.event.operation ? `(${eventView.event.operation})` : '';

  useEffect(() => {
    const node = ref.current;
    const dragStartListener = (event: DragEvent) => {
      event.dataTransfer?.setData(CALENDAR_EVENT_DATE_TYPE, JSON.stringify(eventView.event));
      editEvent(eventView.event.id, {
        ...eventView.event,
        operation: CalendarEventOperations.dragged
      });
    };
    const dragEndListener = (event: DragEvent) => {
      const hasData = !!event.dataTransfer?.getData(CALENDAR_EVENT_DATE_TYPE);

      if (hasData) return;
      editEvent(eventView.event.id, {
        ...eventView.event,
        operation: CalendarEventOperations.none
      });
    }
    ref.current?.addEventListener('dragstart', dragStartListener);
    ref.current?.addEventListener('dragend', dragEndListener);

    return () => {
      node?.removeEventListener('dragstart', dragStartListener);
    }
  }, [editEvent, eventView.event]);

  return <div
    ref={ref}
    style={{
      top: eventView.top,
      left: eventView.left,
      width: eventView.width,
      height: eventView.height,
      pointerEvents: eventView.event.operation === CalendarEventOperations.dragging ? 'none' : 'all',
      backgroundColor: (parseInt(eventView.event.id) % 2) === 0 ? '#ccc' : '#ggg',
    }} className="event-tile" draggable>
    {eventView.event.title}
    <br />
    {operationText}
  </div>
}