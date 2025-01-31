import { DndContext, DragOverlay } from '@dnd-kit/core';
import { useState } from 'react';

import { getEventEndIfStartInSlot } from '../helpers';
import { useCalendarStore } from '../store/store';
import { CalendarEvent, CalendarEventOperations, CalendarSlot } from '../types';
import { EventTile } from './Events/EventTile';
import { WeekView } from './WeekView';

export function Calendar() {
  const eventsAPI = useCalendarStore((state) => ({
    addEvent: state.addEvent,
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
        eventsAPI.removeEvent(event.id);
        eventsAPI.setIsAnyEventDragging(true);
        setDraggedEvent(event);
      }}
      onDragEnd={(props) => {
        const targetSlot = props.over?.data.current as CalendarSlot | undefined;
        console.log(event, targetSlot, props);
        if (!draggedEvent) {
          return;
        }
        if (targetSlot) {
          eventsAPI.addEvent({
            ...draggedEvent,
            operation: CalendarEventOperations.none,
            start: targetSlot.start,
            end: getEventEndIfStartInSlot(draggedEvent, targetSlot),
          });
        } else {
          eventsAPI.editEvent(draggedEvent.id, {
            ...draggedEvent,
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
