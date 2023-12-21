import { WeekViewHeader } from "./WeekViewHeader";
import { WeekDayView } from "./WeekDayView";
import { useMemo } from "react";
import { useCalendarStore } from "../store/store";
import { getDateWeekDays } from "../helpers";

import './WeekView.scss';

export function WeekView() {
  const displayDate = useCalendarStore(state => state.displayDate);
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
  )
}