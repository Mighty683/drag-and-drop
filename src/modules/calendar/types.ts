export type CalendarEvent = {
  start: Date;
  end: Date;
  title: string;
  operation?: CalendarEventOperations;
  id: CalendarEventId;
};

export type CalendarEventId = string;

export type CalendarSlotTime = {
  start: Date;
  end: Date;
};

export type CalendarSlot = CalendarSlotTime & {
  rows: CalendarSlotRow[];
};

export type CalendarSlotRow = {
  event?: CalendarEvent;
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
};
