import { describe, expect, it } from 'vitest';

import { renderVirtualGridFromNode } from './helpers';

describe('grid helpers', () => {
  describe('renderVirtualGridFromNode', () => {
    it('should return the correct grid 2 elements case', () => {
      const grid = renderVirtualGridFromNode({
        start: new Date('2021-01-01 00:00'),
        end: new Date('2021-01-01 01:30'),
        events: [
          {
            start: new Date('2021-01-01 00:00'),
            end: new Date('2021-01-01 01:00'),
            title: 'Event 1',
            id: '1',
          },
          {
            start: new Date('2021-01-01 00:30'),
            end: new Date('2021-01-01 01:30'),
            title: 'Event 2',
            id: '2',
          },
        ],
      });

      expect(grid.widthX).toBe(2);
      expect(grid.cells[0].x).toBe(0);
      expect(grid.cells[1].x).toBe(1);
    });
    it('should return the correct grid 3 elements case', () => {
      const grid = renderVirtualGridFromNode({
        start: new Date('2021-01-01 00:00'),
        end: new Date('2021-01-01 01:30'),
        events: [
          {
            start: new Date('2021-01-01 00:00'),
            end: new Date('2021-01-01 01:00'),
            title: 'Event 1',
            id: '1',
          },
          {
            start: new Date('2021-01-01 00:00'),
            end: new Date('2021-01-01 00:30'),
            title: 'Event 2',
            id: '2',
          },
          {
            start: new Date('2021-01-01 00:30'),
            end: new Date('2021-01-01 01:00'),
            title: 'Event 3',
            id: '3',
          },
        ],
      });

      expect(grid.widthX).toBe(2);
      expect(grid.cells[0].x).toBe(0);
      expect(grid.cells[1].x).toBe(1);
      expect(grid.cells[2].x).toBe(1);
    });
    it('should return the correct grid 4 elements case', () => {
      const grid = renderVirtualGridFromNode({
        start: new Date('2021-01-01 00:00'),
        end: new Date('2021-01-01 01:30'),
        events: [
          {
            start: new Date('2021-01-01 00:00'),
            end: new Date('2021-01-01 01:00'),
            title: 'Event 1',
            id: '1',
          },
          {
            start: new Date('2021-01-01 00:00'),
            end: new Date('2021-01-01 00:30'),
            title: 'Event 2',
            id: '2',
          },
          {
            start: new Date('2021-01-01 00:00'),
            end: new Date('2021-01-01 00:30'),
            title: 'Event 3',
            id: '3',
          },
          {
            start: new Date('2021-01-01 00:00'),
            end: new Date('2021-01-01 00:30'),
            title: 'Event 4',
            id: '4',
          },
        ],
      });

      expect(grid.widthX).toBe(3);
      expect(grid.cells.length).toBe(3);
    });
  });
});
