export function renderCanvas(
  ctx: CanvasRenderingContext2D,
  cells: Set<string>,
  zoom: number,
  offsetX: number,
  offsetY: number,
  showGrid: boolean,
  mousePos?: { x: number; y: number }
) {
  const cellSize = 50;
  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  if (showGrid) {
    drawGrid(ctx, cellSize, zoom, offsetX, offsetY);
  }

  // highlight cursor cell
  if (mousePos) {
    const cursorCellX = Math.floor((mousePos.x - offsetX) / (cellSize * zoom));
    const cursorCellY = -Math.floor((mousePos.y - offsetY) / (cellSize * zoom));
    ctx.fillStyle = "#474747";
    ctx.fillRect(
      cellSize * cursorCellX * zoom + offsetX,
      -cellSize * cursorCellY * zoom + offsetY,
      cellSize * zoom,
      cellSize * zoom
    );
  }

  ctx.fillStyle = "#FFFFFF";
  for (const cell of cells) {
    const [x, y] = cell.split(",").map(Number);

    ctx.fillRect(
      (cellSize * x + 1) * zoom + offsetX,
      (-cellSize * y + 1) * zoom + offsetY,
      (cellSize - 2) * zoom,
      (cellSize - 2) * zoom
    );
  }
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  cellSize: number,
  zoom: number,
  offsetX: number,
  offsetY: number
) {
  const cellSizeZoomed = cellSize * zoom;
  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;

  let gridFine = 1;
  while (canvasWidth / (gridFine * cellSizeZoomed) > 200) {
    gridFine *= 10;
  }

  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 1;
  drawAlignedGrid(
    ctx,
    gridFine,
    cellSizeZoomed,
    canvasWidth,
    canvasHeight,
    offsetX,
    offsetY
  );

  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 1.5;
  drawAlignedGrid(
    ctx,
    gridFine * 10,
    cellSizeZoomed,
    canvasWidth,
    canvasHeight,
    offsetX,
    offsetY
  );
}

function drawAlignedGrid(
  ctx: CanvasRenderingContext2D,
  gridFine: number,
  cellSizeZoomed: number,
  canvasWidth: number,
  canvasHeight: number,
  offsetX: number,
  offsetY: number
) {
  const scaledStep = gridFine * cellSizeZoomed;
  const startX = ((offsetX % scaledStep) + scaledStep) % scaledStep;
  const startY =
    (((offsetY % scaledStep) + scaledStep) % scaledStep) +
    scaledStep / gridFine;

  for (let x = startX; x < canvasWidth; x += scaledStep) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasHeight);
    ctx.stroke();
  }

  for (let y = startY; y < canvasHeight; y += scaledStep) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidth, y);
    ctx.stroke();
  }
}
