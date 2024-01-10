import { CalendarEvent } from '../../types';

export const GRID_WIDTH_LIMIT = 3;
export type CalendarNodeVirtualGrid = {
  widthX: number;
  cells: CalendarNodeVirtualGridCell[];
  overflowLimitCells: CalendarNodeVirtualGridCell[];
};

export type CalendarNodeVirtualGridCell = {
  event: CalendarEvent;
  x: number;
};
