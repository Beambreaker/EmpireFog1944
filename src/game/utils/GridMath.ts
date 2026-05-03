import type { Coord } from '../core/types';

// Manhattan distance — used for sight rings and movement budgeting.
export function manhattanDistance(a: Coord, b: Coord): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// Chebyshev distance — used when 8-directional sight feels more natural
// (i.e. diagonals cost the same as orthogonals).
export function chebyshevDistance(a: Coord, b: Coord): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

export function inBounds(c: Coord, w: number, h: number): boolean {
  return c.x >= 0 && c.y >= 0 && c.x < w && c.y < h;
}

// 4-direction neighbours, used for movement.
export function neighbours4(c: Coord): Coord[] {
  return [
    { x: c.x + 1, y: c.y },
    { x: c.x - 1, y: c.y },
    { x: c.x, y: c.y + 1 },
    { x: c.x, y: c.y - 1 },
  ];
}

export function coordKey(c: Coord): string {
  return `${c.x},${c.y}`;
}
