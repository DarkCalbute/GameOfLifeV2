import React, { createContext, useContext, useState, useRef, ReactNode } from "react";
import { computeNextGeneration } from "../services/gameLogic";

type GameContextType = {
  cells: Set<string>;
  generation: number;
  isPaused: boolean;
  showGrid: boolean;
  zoom: React.MutableRefObject<number>;
  offsetX: React.MutableRefObject<number>;
  offsetY: React.MutableRefObject<number>;
  togglePause: () => void;
  nextTick: () => void;
  prevTick: () => void;
  reset: () => void;
  toggleGrid: () => void;
  setCells: React.Dispatch<React.SetStateAction<Set<string>>>;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [cells, setCells] = useState<Set<string>>(new Set(["0,-1", "-1,0", "0,0", "0,1", "1,1"]));
  const [cellsHistory, setCellsHistory] = useState<Set<string>[]>([]);
  const [generation, setGeneration] = useState(0);
  const [isPaused, setPaused] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  const zoom = useRef(1);
  const offsetX = useRef(window.innerWidth / 2);
  const offsetY = useRef(window.innerHeight / 2);

  const togglePause = () => setPaused(!isPaused);

  const nextTick = () => {
    const newCells = computeNextGeneration(cells);

    //setCellsHistory(h => [...h, cells]);
    setGeneration(g => g + 1);
    setCells(newCells);
  };

  const prevTick = () => {
    setCellsHistory(h => {
      if (h.length > 0) {
        const prevGen = h[h.length - 1];
        setCells(prevGen);
        setGeneration(g => Math.max(0, g - 1));
        return h.slice(0, -1);
      }
      return h;
    });
  };

  const reset = () => {
    setPaused(true);
    setCells(new Set(["0,-1", "-1,0", "0,0", "0,1", "1,1"]));
    setCellsHistory([]);
    setGeneration(0);
  };

  const toggleGrid = () => setShowGrid(g => !g);
  
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      togglePause()
    }
  });

  return (
    <GameContext.Provider
      value={{
        cells,
        generation,
        isPaused,
        showGrid,
        zoom,
        offsetX,
        offsetY,
        togglePause,
        nextTick,
        prevTick,
        reset,
        toggleGrid,
        setCells
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const ctx = useContext(GameContext);

  if (!ctx) {
    throw new Error("useGame must be used within GameProvider")
  }
  return ctx;
};