import { create } from "zustand";
import { CalendarStore } from "../types";
import { createMockEvents } from "../helpers";

export const useCalendarStore = create<CalendarStore>((set) => ({
  events: createMockEvents(),
  displayDate: new Date(),
  setDisplayDate: (date: Date) => set(() => ({ displayDate: date })),
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  addOrEditEvent: (id, data) => {
    const event = useCalendarStore
      .getState()
      .events.find((event) => event.id === id);
    if (event) {
      useCalendarStore.getState().editEvent(id, data);
    } else {
      useCalendarStore.getState().addEvent({ ...data, id });
    }
  },
  removeEvent: (id) =>
    set((state) => ({
      events: state.events.filter((event) => event.id !== id),
    })),
  editEvent: (id, data) =>
    set((state) => ({
      events: state.events.map((event) =>
        event.id === id ? { ...event, ...data } : event,
      ),
    })),
  isAnyEventDragging: false,
  setIsAnyEventDragging: (isDragging: boolean) =>
    set(() => ({ isAnyEventDragging: isDragging })),
}));
