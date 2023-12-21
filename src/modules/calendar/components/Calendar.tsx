import { WeekView } from "./WeekView";

import { EventsOverlay } from "./Events/EventsOverlay";
import { PositionCollectorProvider } from "../positionCollector";

export function Calendar() {

  return (
    <PositionCollectorProvider>
      <EventsOverlay />
      <WeekView />
    </PositionCollectorProvider>
  )
}