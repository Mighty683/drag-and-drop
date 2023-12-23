import { v4 } from "uuid";
import { isEventInSlot } from "../../helpers";
import {
  LinkedEventsNode,
  CalendarEvent,
  CalendarNodeVirtualGrid,
  CalendarNodeVirtualGridCell,
  CalendarSlotTime,
  CalendarSlotColumn,
  TimeEvent,
} from "../../types";

export const GRID_CELL_DURATION = 1000 * 60 * 30;

export function renderVirtualGridFromNode(node: LinkedEventsNode<CalendarEvent>): CalendarNodeVirtualGrid {
  const nodeEvents = node.events ?? [];
  let gridWidthX = 0;
  let gridHeightY = 0;
  const cells: CalendarNodeVirtualGridCell[] = [];
  for (const processedEvent of nodeEvents) {
    if (!gridWidthX) {
      gridWidthX = 1;
      gridHeightY = 1;
      cells.push({
        event: processedEvent,
        x: 0,
        y: 0,
      });
    } else {
      let bestFittedEventPositionX: number = 0;
      let bestFittedEventPositionY: number = 0;
      for (let rowIndex = 0; rowIndex < gridHeightY; rowIndex++) {
        const newEventPositionY = calculateElementPositionYInGrid(processedEvent, cells);
        const newEventPositionX = calculateElementPositionXInGrid(processedEvent, cells);
        bestFittedEventPositionY = newEventPositionY;
        if (rowIndex === 0 || newEventPositionX <= bestFittedEventPositionX) {
          bestFittedEventPositionX = newEventPositionX;
        }
      }
      const eventRowWidth = bestFittedEventPositionX + 1;
      if (eventRowWidth > gridWidthX) {
        gridWidthX = bestFittedEventPositionX + 1;
      }
      const eventColumnHeight = bestFittedEventPositionY + 1;
      if (eventColumnHeight > gridHeightY) {
        gridHeightY = eventColumnHeight;
      }

      cells.push({
        event: processedEvent,
        x: bestFittedEventPositionX,
        y: bestFittedEventPositionY,
      });
    }
  }

  return {
    widthX: gridWidthX,
    heightY: gridHeightY,
    cells,
  };
}

export function calculateElementPositionYInGrid(
  event: CalendarEvent,
  currentCells: CalendarNodeVirtualGridCell[]
): number {
  const eventsFinishedBefore = currentCells.filter(cell => isEventFinishedBeforeSnappedToGrid(cell.event, event));
  return eventsFinishedBefore.length;
}

export function calculateElementPositionXInGrid(
  event: CalendarEvent,
  currentCells: CalendarNodeVirtualGridCell[]
): number {
  const collidingCells = currentCells.filter(collidingEvent => areEventsOverlappingInGrid(collidingEvent.event, event));
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
  grid: CalendarNodeVirtualGrid
): CalendarSlotColumn[] {
  const slotEvents = grid.cells.filter(cell => isEventInSlot(cell.event, slotTimes));
  const slotColumns: CalendarSlotColumn[] = [];
  for (let columnIndex = 0; columnIndex < grid.widthX; columnIndex++) {
    const eventForColumn = slotEvents.find(cell => cell.x === columnIndex);
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

export function isEventFinishedBeforeSnappedToGrid(eventA: TimeEvent, eventB: TimeEvent) {
  const eventAEndSnappedToGrid = new Date(eventA.end.getTime() + (eventA.end.getTime() % GRID_CELL_DURATION));
  const eventBStartSnappedToGrid = new Date(eventB.start.getTime() - (eventB.start.getTime() % GRID_CELL_DURATION));
  return eventAEndSnappedToGrid.getTime() <= eventBStartSnappedToGrid.getTime();
}

export function areEventsOverlappingInGrid(eventA: TimeEvent, eventB: TimeEvent) {
  const eventAStartSnappedToGrid = new Date(eventA.start.getTime() - (eventA.start.getTime() % GRID_CELL_DURATION));
  const eventAEndSnappedToGrid = new Date(eventA.end.getTime() + (eventA.end.getTime() % GRID_CELL_DURATION));
  const eventBStartSnappedToGrid = new Date(eventB.start.getTime() - (eventB.start.getTime() % GRID_CELL_DURATION));
  const eventBEndSnappedToGrid = new Date(eventB.end.getTime() + (eventB.end.getTime() % GRID_CELL_DURATION));
  return (
    (eventAStartSnappedToGrid.getTime() >= eventBStartSnappedToGrid.getTime() &&
      eventAStartSnappedToGrid.getTime() < eventBEndSnappedToGrid.getTime()) ||
    (eventBStartSnappedToGrid.getTime() >= eventAStartSnappedToGrid.getTime() &&
      eventBStartSnappedToGrid.getTime() < eventAEndSnappedToGrid.getTime())
  );
}
