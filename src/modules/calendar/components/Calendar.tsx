import { DndContext, DragOverlay } from "@dnd-kit/core";
import { WeekView } from "./WeekView";
import { useCalendarStore } from "../store/store";
import { CalendarEvent, CalendarEventOperations, CalendarSlot } from "../types";
import { getEventEndIfStartInSlot } from "../helpers";
import { useState } from "react";
import { EventTile } from "./Events/EventTile";

export function Calendar() {
  const eventsAPI = useCalendarStore((state) => ({
    editEvent: state.editEvent,
    removeEvent: state.removeEvent,
    setIsAnyEventDragging: state.setIsAnyEventDragging,
  }));
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | undefined>(
    undefined,
  );

  return (
    <DndContext
      onDragStart={(props) => {
        const event = props.active.data.current as CalendarEvent;
        eventsAPI.editEvent(event.id, {
          ...event,
          operation: CalendarEventOperations.dragged,
        });
        eventsAPI.setIsAnyEventDragging(true);
        setDraggedEvent(event);
      }}
      onDragEnd={(props) => {
        const event = props.active.data.current as CalendarEvent;
        const targetSlot = props.over?.data.current as CalendarSlot | undefined;
        if (targetSlot) {
          eventsAPI.editEvent(event.id, {
            ...event,
            operation: CalendarEventOperations.none,
            start: targetSlot.start,
            end: getEventEndIfStartInSlot(event, targetSlot),
          });
        } else {
          eventsAPI.editEvent(event.id, {
            ...event,
            operation: undefined,
          });
        }
        eventsAPI.setIsAnyEventDragging(false);
      }}
    >
      <WeekView />
      <DragOverlay>
        {draggedEvent && (
          <EventTile
            event={{
              ...draggedEvent,
              operation: CalendarEventOperations.dragging,
            }}
            className="event-tile--dragged"
            disableDrag={true}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
