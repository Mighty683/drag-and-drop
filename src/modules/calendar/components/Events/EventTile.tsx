import { useEffect, useRef } from "react";
import { CalendarEventView } from "../../types";


import './EventTile.scss';

export type EventTileProps = {
  eventView: CalendarEventView;
}

export function EventTile({
  eventView
}: EventTileProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const listener = (event: DragEvent) => {
      console.log('dragstart', event);
      event.dataTransfer?.setData('text/plain', JSON.stringify(eventView.event));
    };
    ref.current?.addEventListener('dragstart', listener);

    return () => {
      ref.current?.removeEventListener('dragstart', listener);
    }
  }, []);
  return <div
    ref={ref}
    style={{
      top: eventView.top,
      left: eventView.left,
      width: eventView.width,
      height: eventView.height,
      backgroundColor: (parseInt(eventView.event.id) % 2) === 0 ? '#ccc' : '#ggg',
    }} className="event-tile" draggable>
    {eventView.event.title}
  </div>
}