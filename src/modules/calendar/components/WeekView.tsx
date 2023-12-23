import { useMemo } from 'react';

import { getDateWeekDays } from '../helpers';
import { useCalendarStore } from '../store/store';
import { WeekDayView } from './WeekDayView';
import './WeekView.scss';
import { WeekViewHeader } from './WeekViewHeader';

export function WeekView() {
    const displayDate = useCalendarStore((state) => state.displayDate);
    const weekDays = useMemo(() => getDateWeekDays(displayDate), [displayDate]);

    return (
        <div className="week-view">
            <WeekViewHeader />
            <div className="week-view__days">
                {weekDays.map((date) => (
                    <WeekDayView key={date.getTime()} date={date} />
                ))}
            </div>
        </div>
    );
}
