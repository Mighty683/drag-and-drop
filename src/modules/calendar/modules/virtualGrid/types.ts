import { CalendarEvent } from '../../types';

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
