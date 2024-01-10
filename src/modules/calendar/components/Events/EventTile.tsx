import { useDraggable } from '@dnd-kit/core';

import { getEventRequiredSlotsNumber } from '../../helpers';
import { useCalendarStore } from '../../store/store';
import { CalendarEvent, CalendarEventOperations } from '../../types';
import './EventTile.scss';

export type EventTileProps = {
  event: CalendarEvent;
  disableDrag?: boolean;
  className?: string;
};

export function EventTile({ event, className, disableDrag }: EventTileProps) {
  const draggableAPI = useDraggable({
    id: event.id,
    data: event,
    disabled: disableDrag,
  });
  const isAnyEventDragging = useCalendarStore(
    (state) => state.isAnyEventDragging,
  );

  return (
    <div
      ref={draggableAPI.setNodeRef}
      {...draggableAPI.listeners}
      {...draggableAPI.attributes}
      style={{
        height: `${getEventRequiredSlotsNumber(event) * 25}px`,
        pointerEvents: isAnyEventDragging ? 'none' : 'all',
        backgroundColor: '#ccc',
        opacity:
          event.operation === CalendarEventOperations.dragged ||
          event.operation === CalendarEventOperations.dragging
            ? 0.5
            : 1,
      }}
      className={`${className} event-tile`}
      draggable
    >
      {event.title}
    </div>
  );
}
