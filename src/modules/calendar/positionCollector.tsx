import { createContext, useContext, useEffect, useRef } from "react";
import { CalendarPositionCollector } from "./types";

export const PositionCollectorContextRef = createContext<CalendarPositionCollector>({
  eventsMap: new Map(),
  positionLeft: 0,
  positionTop: 0,
});

PositionCollectorContextRef.Provider

export function PositionCollectorProvider({ children }: React.PropsWithChildren<Record<string, never>>) {
  const collector = useRef<CalendarPositionCollector>({
    eventsMap: new Map(),
    positionLeft: 0,
    positionTop: 0,
  });
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const { left, top } = wrapperRef.current.getBoundingClientRect();
    collector.current.positionLeft = left;
    collector.current.positionTop = top;
  }, []);

  return (
    <PositionCollectorContextRef.Provider value={collector.current}>
      <div ref={wrapperRef}>
        {children}
      </div>
    </PositionCollectorContextRef.Provider>
  );
}
export function usePositionCollector() {
  return useContext(PositionCollectorContextRef);
}