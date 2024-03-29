import { useDroppable } from '@dnd-kit/core';

import { formatSlotDate } from '../helpers';
import { CalendarSlot } from '../types';
import { EventTile } from './Events/EventTile';
import './WeekDaySlot.scss';

export type WeekDaySlotProps = {
  slot: CalendarSlot;
};
export function WeekDaySlot({ slot }: WeekDaySlotProps) {
  const droppable = useDroppable({
    id: `droppable-${slot.start.getTime()}`,
    data: slot,
  });

  return (
    <div
      ref={droppable.setNodeRef}
      className="week-day-slot"
      style={{
        backgroundColor: droppable.isOver ? '#aaa' : 'transparent',
      }}
    >
    {formatSlotDate(slot)}
    <div className="week-day-slot__body">
      <div className="week-day-slot__events-rows">
          {slot.visibleColumns?.map((slotRow) => {
            if (!slotRow.inScopeOfSlot)
              return (
                <div key={slotRow.id} className="week-day-slot__empty-row"></div>
              );
            return <EventTile key={slotRow.event.id} event={slotRow.event} />;
          })}
        </div>
      </div>
    </div>
  );
}
