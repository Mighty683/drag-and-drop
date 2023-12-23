export type TimeEvent = {
  start: Date;
  end: Date;
};

export type CalendarEvent = TimeEvent & {
  title: string;
  operation?: CalendarEventOperations;
  id: CalendarEventId;
};

export type CalendarEventId = string;

export type CalendarSlotTime = TimeEvent;

export type CalendarSlot = CalendarSlotTime & {
  columns: CalendarSlotColumn[];
};

export type CalendarSlotColumn =
  | {
      id: string;
      event: CalendarEvent;
      inScopeOfSlot: true;
    }
  | {
      id: string;
      event: undefined;
      inScopeOfSlot: false;
    };

export enum CalendarEventOperations {
  dragging = "dragging",
  dragged = "dragged",
  none = "none",
}

export enum CalendarSlotStatus {
  free = "free",
  busy = "busy",
  error = "error",
}

export type CalendarStore = {
  events: CalendarEvent[];
  addEvent: (event: CalendarEvent) => void;
  displayDate: Date;
  setDisplayDate: (date: Date) => void;
  removeEvent: (id: string) => void;
  editEvent: (id: string, data: CalendarEvent) => void;
  addOrEditEvent: (id: string, data: CalendarEvent) => void;
  isAnyEventDragging: boolean;
  setIsAnyEventDragging: (isDragging: boolean) => void;
};

export type LinkedEventsNode<E extends TimeEvent = TimeEvent> = TimeEvent & {
  events?: E[];
};

export type CalendarNodeVirtualGrid = {
  widthX: number;
  heightY: number;
  cells: CalendarNodeVirtualGridCell[];
};

export type CalendarNodeVirtualGridCell = {
  event: CalendarEvent;
  x: number;
  y: number;
};
