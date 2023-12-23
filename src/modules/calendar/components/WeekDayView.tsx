import { useMemo } from 'react';

import { reduceEventsToDaySlots } from '../helpers';
import { useCalendarStore } from '../store/store';
import { CalendarSlot } from '../types';
import { WeekDaySlot } from './WeekDaySlot';
import './WeekDayView.scss';

export type WeekDayViewProps = {
    date: Date;
};

export function WeekDayView({ date }: WeekDayViewProps) {
    const events = useCalendarStore((state) => state.events);
    const daySlots = useMemo<CalendarSlot[]>(() => {
        return reduceEventsToDaySlots(date, events);
    }, [date, events]);

    return (
        <div className="week-day-view">
            {daySlots.map((slot) => (
                <WeekDaySlot key={slot.start.getTime()} slot={slot} />
            ))}
        </div>
    );
}
