import { useLayoutEffect, useMemo, useState } from "react";
import { usePositionCollector } from "../../positionCollector";
import { useCalendarStore } from "../../store/store";
import { CalendarEventView } from "../../types";
import { EventTile } from "./EventTile";

export function EventsOverlay() {
  const calendarEvents = useCalendarStore(state => state.events);
  const collector = usePositionCollector();

  const [collectedEventsState, setCollectedEventsState] = useState<CalendarEventView[]>([]);

  const displayEvents = useMemo(() => {
    return collectedEventsState
      .filter(eventView => calendarEvents.find(calendarEvent => calendarEvent.id === eventView.event.id))
      .map(eventView => ({
        ...eventView,
        top: eventView.top,
        left: eventView.left,
      }))
  }, [collectedEventsState, calendarEvents]);


  useLayoutEffect(() => {
    setTimeout(() => {
      const collectedEvents = Array.from(collector.eventsMap.values());
      setCollectedEventsState(collectedEvents);
    }, 100);
  }, []);

  return <>
    {
      displayEvents.map(eventView =>
        <EventTile key={eventView.event.id} eventView={eventView} />
      )
    }
  </>;
}