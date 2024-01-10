import { v4 } from 'uuid';

import { isEventInSlot } from '../../helpers';
import {
  CalendarEvent,
  CalendarSlotColumn,
  CalendarSlotTime,
  GRID_CELL_DURATION,
  RoundingDirection,
} from '../../types';
import { LinkedEventsNode } from '../linkingEvents/types';
import {
  CalendarNodeVirtualGrid,
  CalendarNodeVirtualGridCell,
  GRID_WIDTH_LIMIT,
} from './types';

export function renderVirtualGridFromNode(
  node: LinkedEventsNode<CalendarEvent>,
): CalendarNodeVirtualGrid {
  const nodeEvents = node.events ?? [];
  let gridWidthX = 0;
  const cells: CalendarNodeVirtualGridCell[] = [];
  const overflowLimitCells: CalendarNodeVirtualGridCell[] = [];
  for (const processedEvent of nodeEvents) {
    if (!gridWidthX) {
      gridWidthX = 1;
      cells.push({
        event: processedEvent,
        x: 0,
      });
    } else {
      const newEventPositionX = calculateElementPositionXInGrid(
        processedEvent,
        cells,
      );
      const eventRowWidth = newEventPositionX + 1;
      if (eventRowWidth > gridWidthX && eventRowWidth <= GRID_WIDTH_LIMIT) {
        gridWidthX = eventRowWidth;
      }

      if (eventRowWidth > GRID_WIDTH_LIMIT) {
        overflowLimitCells.push({
          event: processedEvent,
          x: newEventPositionX,
        });
      } else {
        cells.push({
          event: processedEvent,
          x: newEventPositionX,
        });
      }
    }
  }

  return {
    widthX: gridWidthX,
    cells,
    overflowLimitCells,
  };
}

export function calculateElementPositionYInGrid(
  event: CalendarEvent,
  currentCells: CalendarNodeVirtualGridCell[],
): number {
  const eventsFinishedBefore = currentCells.filter((cell) =>
    isEventFinishedBeforeSnappedToGrid(cell.event, event),
  );
  return eventsFinishedBefore.length;
}

export function calculateElementPositionXInGrid(
  event: CalendarEvent,
  currentCells: CalendarNodeVirtualGridCell[],
): number {
  const collidingCells = currentCells.filter((collidingEvent) =>
    areEventsOverlappingInGrid(collidingEvent.event, event),
  );
  const firstCollidingCell = collidingCells[0];
  if (!firstCollidingCell) {
    return 0;
  }

  if (firstCollidingCell.x !== 0) {
    return firstCollidingCell.x - 1;
  }

  const lastCollidingCell = collidingCells[collidingCells.length - 1];
  return lastCollidingCell.x + 1;
}

export function reduceGridToSlotColumns(
  slotTimes: CalendarSlotTime,
  grid: CalendarNodeVirtualGrid,
): CalendarSlotColumn[] {
  const slotEvents = grid.cells.filter((cell) =>
    isEventInSlot(cell.event, slotTimes),
  );
  const slotColumns: CalendarSlotColumn[] = [];
  for (let columnIndex = 0; columnIndex < grid.widthX; columnIndex++) {
    const eventForColumn = slotEvents.find((cell) => cell.x === columnIndex);
    if (eventForColumn) {
      slotColumns.push({
        id: eventForColumn.event.id,
        event: eventForColumn.event,
        inScopeOfSlot: true,
      });
    } else {
      slotColumns.push({
        id: v4(),
        event: undefined,
        inScopeOfSlot: false,
      });
    }
  }

  return slotColumns;
}

export function isEventFinishedBeforeSnappedToGrid(
  eventA: CalendarEvent,
  eventB: CalendarEvent,
) {
  const eventAEndSnappedToGrid = snapDateToGrid(
    eventA.end,
    RoundingDirection.up,
  );
  const eventBStartSnappedToGrid = snapDateToGrid(
    eventB.start,
    RoundingDirection.down,
  );
  return eventAEndSnappedToGrid.getTime() <= eventBStartSnappedToGrid.getTime();
}

export function areEventsOverlappingInGrid(
  eventA: CalendarEvent,
  eventB: CalendarEvent,
) {
  const eventAStartSnappedToGrid = snapDateToGrid(
    eventA.start,
    RoundingDirection.down,
  );
  const eventAEndSnappedToGrid = snapDateToGrid(
    eventA.end,
    RoundingDirection.up,
  );
  const eventBStartSnappedToGrid = snapDateToGrid(
    eventB.start,
    RoundingDirection.down,
  );
  const eventBEndSnappedToGrid = snapDateToGrid(
    eventB.end,
    RoundingDirection.up,
  );
  return (
    (eventAStartSnappedToGrid.getTime() >= eventBStartSnappedToGrid.getTime() &&
      eventAStartSnappedToGrid.getTime() < eventBEndSnappedToGrid.getTime()) ||
    (eventBStartSnappedToGrid.getTime() >= eventAStartSnappedToGrid.getTime() &&
      eventBStartSnappedToGrid.getTime() < eventAEndSnappedToGrid.getTime())
  );
}

export function snapDateToGrid(date: Date, direction: RoundingDirection): Date {
  const dateTime = date.getTime();
  const directionMultiplier = direction === RoundingDirection.down ? -1 : 1;
  return new Date(
    dateTime + directionMultiplier * (dateTime % GRID_CELL_DURATION),
  );
}
