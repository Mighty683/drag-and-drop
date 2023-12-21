import { create } from 'zustand';
import { CalendarStore } from '../types';
import { createMockEvents } from '../helpers';

export const useCalendarStore = create<CalendarStore>((set) => ({
  events: createMockEvents(),
  displayDate: new Date(),
  setDisplayDate: (date: Date) => set(() => ({ displayDate: date })),
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  removeEvent: (id) =>
    set((state) => ({
      events: state.events.filter((event) => event.id !== id),
    })),
  editEvent: (id, data) =>
    set((state) => ({
      events: state.events.map((event) =>
        event.id === id ? { ...event, ...data } : event
      ),
    })),
}));