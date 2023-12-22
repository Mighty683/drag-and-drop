import './WeekDaySlot.scss'
import { formatSlotDate} from '../helpers';
import { CalendarSlot } from '../types';
import { EventTile } from './Events/EventTile';
import { useDroppable } from '@dnd-kit/core';

export type WeekDaySlotProps = {
  slot: CalendarSlot
};
export function WeekDaySlot({ slot }: WeekDaySlotProps) {
  const droppable = useDroppable({
    id: `droppable-${slot.start.getTime()}`,
    data: slot,
  });

  return <div ref={droppable.setNodeRef} className='week-day-slot' style={{
    backgroundColor: droppable.isOver ? '#aaa' : 'transparent',
  }}>
    {formatSlotDate(slot)}
    <div className="week-day-slot__events-rows">
      {slot.rows?.map((slotRow) => {
        const event = slotRow.event;
        if (!event) return <div key={slotRow.id} className='week-day-slot__empty-row'></div>;
        return <EventTile key={event.id} event={event} />
      })}
    </div>
  </div>;
}
