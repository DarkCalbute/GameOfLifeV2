import { useEffect, useRef, useState } from "react";
import { renderCanvas } from "../../../services/renderCanvas";
import { useGameContext } from "../../../contexts/GameContexts";
import "./Board.css";
import { computeNextGeneration } from "../../../services/gameLogic";

const Board: React.FC = () => {
  const {
    cells,
    setCells,
    isPaused,
    nextTick,
    zoom,
    offsetX,
    offsetY,
    showGrid,
  } = useGameContext();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mousePos, setMousePos] = useState<
    { x: number; y: number } | undefined
  >();

  useEffect(() => {
    const canvas = canvasRef.current;

    let isMouseDown = false;
    let isMouseMoving = false;
    let startMouseX = 0;
    let startMouseY = 0;
    let startOffsetX = 0;
    let startOffsetY = 0;

    if (!canvas) {
      return;
    }

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const onMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      isMouseMoving = false;
      startMouseX = e.clientX;
      startMouseY = e.clientY;
      startOffsetX = offsetX.current;
      startOffsetY = offsetY.current;
    };

    const onMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (isMouseDown) {
        const dx = e.clientX - startMouseX;
        const dy = e.clientY - startMouseY;

        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
          isMouseMoving = true;
        }
        offsetX.current = startOffsetX + dx;
        offsetY.current = startOffsetY + dy;
      }
    };
    
    const onMouseUp = (e: MouseEvent) => {
      isMouseDown = false;

      // click
      if (!isMouseMoving) {
        let newCells = new Set(cells);
        const cellSize = 50;
        const cursorCellX = Math.floor(
          (e.clientX - offsetX.current) / (cellSize * zoom.current)
        );
        const cursorCellY = -Math.floor(
          (e.clientY - offsetY.current) / (cellSize * zoom.current)
        );
        const cell = `${cursorCellX},${cursorCellY}`;
        
        setCells(prev => {
          const newCells = new Set(prev);
          if (newCells.has(cell)) {
            newCells.delete(cell);
          } else {
            newCells.add(cell);
          }
          return newCells;
        });
      }
    };

    const onWheel = (e: WheelEvent) => {
      const zoomFactor = 1.1;

      if (e.deltaY < 0) {
        if (zoom.current < 1) {
          // Block zooming too close
          zoom.current *= zoomFactor;
        }
      } else {
        zoom.current /= zoomFactor;
      }
    };

    handleResize();

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", handleResize);
    }
  }, [setCells, offsetX, offsetY, zoom]);

  useEffect(() => {
    let lastDraw = 0;
    let lastCycle = 0;
    const frameRate = 30;
    const cycleDuration = 50;
    let rafId = 0;

    const loop = (timestamp: number) => {
      rafId = requestAnimationFrame(loop);

      if (!isPaused && timestamp - lastCycle > cycleDuration) {
        nextTick();
        lastCycle = timestamp;
      }

      if (timestamp - lastDraw > 1000 / frameRate) {
        const ctx = canvasRef.current?.getContext("2d");

        if (ctx) {
          renderCanvas(
            ctx,
            cells,
            zoom.current,
            offsetX.current,
            offsetY.current,
            showGrid,
            mousePos
          );
        }
        lastDraw = timestamp;
      }
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [cells, nextTick, showGrid, mousePos, zoom, offsetX, offsetY]);

  return <canvas ref={canvasRef} className="canvas" />;
};

export default Board;
