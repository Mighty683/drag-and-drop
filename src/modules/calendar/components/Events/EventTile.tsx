import { CalendarEvent, CalendarEventOperations } from "../../types";

import "./EventTile.scss";
import { useCalendarStore } from "../../store/store";
import { getEventRequiredSlotsNumber } from "../../helpers";
import { useDraggable } from "@dnd-kit/core";

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
  const operationText = event.operation ? `(${event.operation})` : "";

  return (
    <div
      ref={draggableAPI.setNodeRef}
      {...draggableAPI.listeners}
      {...draggableAPI.attributes}
      style={{
        height: getEventRequiredSlotsNumber(event) * 50,
        pointerEvents: isAnyEventDragging ? "none" : "all",
        backgroundColor: "#ccc",
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
      <br />
      {operationText}
    </div>
  );
}
