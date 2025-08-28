export function getAllCellToCalculate(cells: Set<string>): Set<string> {
  const result = new Set<string>();
  for (const cell of cells) {
    const [x, y] = cell.split(",").map(Number);

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        result.add(`${x + dx},${y + dy}`);
      }
    }
  }
  return result;
}

export function isCellAliveNextGeneration(
  cells: Set<string>,
  x: number,
  y: number
) {
  const alive = cells.has(`${x},${y}`);
  let count = 0;

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) {
        continue;
      }
      if (cells.has(`${x + dx},${y + dy}`)) {
        count++;
      }
    }
  }
  return (alive && (count === 2 || count === 3)) || (!alive && count === 3);
}

export function computeNextGeneration(cells: Set<string>) {
  const toCheck = getAllCellToCalculate(cells);
  const next = new Set<string>();

  for (const cell of toCheck) {
    const [x, y] = cell.split(",").map(Number);

    if (isCellAliveNextGeneration(cells, x, y)) {
      next.add(cell);
    }
  }
  return next;
}
