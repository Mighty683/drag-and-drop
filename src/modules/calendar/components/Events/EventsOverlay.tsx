import { useLayoutEffect, useMemo, useState } from "react";
import { usePositionCollector } from "../../positionCollector";
import { useCalendarStore } from "../../store/store";
import { EventTile } from "./EventTile";

export function EventsOverlay() {
  const calendarEvents = useCalendarStore(state => state.events);
  const collector = usePositionCollector();
  const [collectTimestamp, setCollectTimestamp] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const collectedEventsState = useMemo(() => Array.from(collector.eventsMap.values()), [collector.eventsMap, collectTimestamp]);

  const displayEvents = useMemo(() => {
    return collectedEventsState
      .filter(eventView => calendarEvents.find(calendarEvent => calendarEvent.id.startsWith(eventView.event.id)))
      .map(eventView => ({
        ...eventView,
        top: eventView.top,
        left: eventView.left,
      }));
  }, [collectedEventsState, calendarEvents]);


  useLayoutEffect(() => {
    setInterval(() => {
      setCollectTimestamp(Date.now());
    }, 30);
  }, []);

  return <>
    {
      displayEvents.map(eventView =>
        <EventTile key={eventView.event.id} eventView={eventView} />
      )
    }
  </>;
}