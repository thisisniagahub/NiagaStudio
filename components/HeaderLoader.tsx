import React, { useState, useEffect } from 'react';

// Helper to generate all points for a line using Bresenham's algorithm for a continuous path
const generateLine = (p1: [number, number], p2: [number, number]): [number, number][] => {
    const points: [number, number][] = [];
    let [x1, y1] = p1;
    let [x2, y2] = p2;
    const dx = Math.abs(x2 - x1);
    const dy = -Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx + dy;

    while (true) {
        points.push([x1, y1]);
        if (x1 === x2 && y1 === y2) break;
        const e2 = 2 * err;
        if (e2 >= dy) {
            err += dy;
            x1 += sx;
        }
        if (e2 <= dx) {
            err += dx;
            y1 += sy;
        }
    }
    return points;
};

// Creates a continuous path that traces the letters of "NIAGASTUDIO"
const createTracingPath = (): [number, number][] => {
  const segments: [number, number][][] = [];

  const addStroke = (p1: [number, number], p2: [number, number]) => {
    segments.push(generateLine(p1, p2));
  };
  
  // Define letter strokes by their start and end points
  // N (width 4, height 7)
  addStroke([0, 6], [0, 0]);
  addStroke([0, 0], [4, 6]);
  addStroke([4, 6], [4, 0]);

  // I (x-offset 6)
  addStroke([6, 0], [6, 6]);

  // A (x-offset 8, width 4)
  addStroke([8, 6], [8, 0]);
  addStroke([8, 0], [12, 0]);
  addStroke([12, 0], [12, 6]);
  addStroke([8, 3], [12, 3]);
  
  // G (x-offset 14, width 4)
  addStroke([18, 0], [14, 0]);
  addStroke([14, 0], [14, 6]);
  addStroke([14, 6], [18, 6]);
  addStroke([18, 6], [18, 4]);
  addStroke([18, 4], [16, 4]);
  
  // A (x-offset 20, width 4)
  addStroke([20, 6], [20, 0]);
  addStroke([20, 0], [24, 0]);
  addStroke([24, 0], [24, 6]);
  addStroke([20, 3], [24, 3]);
  
  // S (x-offset 26, width 4)
  addStroke([30, 0], [26, 0]);
  addStroke([26, 0], [26, 3]);
  addStroke([26, 3], [30, 3]);
  addStroke([30, 3], [30, 6]);
  addStroke([30, 6], [26, 6]);
  
  // T (x-offset 32, width 4)
  addStroke([32, 0], [36, 0]);
  addStroke([34, 0], [34, 6]);

  // U (x-offset 38, width 4)
  addStroke([38, 0], [38, 6]);
  addStroke([38, 6], [42, 6]);
  addStroke([42, 6], [42, 0]);
  
  // D (x-offset 44, width 4)
  addStroke([44, 0], [44, 6]);
  addStroke([44, 6], [48, 3]);
  addStroke([48, 3], [44, 0]);
  
  // I (x-offset 50, width 0)
  addStroke([50, 0], [50, 6]);
  
  // O (x-offset 52, width 4)
  addStroke([54, 0], [52, 3]);
  addStroke([52, 3], [54, 6]);
  addStroke([54, 6], [56, 3]);
  addStroke([56, 3], [54, 0]);
  
  // Flatten all segments into a single path array
  return segments.flat();
};

const letterPath = createTracingPath();
const GRID_WIDTH = 150;
const GRID_HEIGHT = 8;
const ANIMATION_SPEED_MS = 40; // Slower for a more graceful effect

const createEmptyGrid = () => Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(0));

export const HeaderLoader: React.FC = () => {
    const [animationState, setAnimationState] = useState({
        grid: createEmptyGrid(),
        pathIndex: 0,
    });

    useEffect(() => {
        const animationInterval = setInterval(() => {
            setAnimationState(prevState => {
                let { grid, pathIndex } = prevState;

                // When the animation cycle is complete, reset the grid and index to loop
                if (pathIndex >= letterPath.length) {
                    grid = createEmptyGrid();
                    pathIndex = 0;
                }

                const [x, y] = letterPath[pathIndex];
                const newGrid = grid.map(row => [...row]);

                if (y >= 0 && y < GRID_HEIGHT && x >= 0 && x < GRID_WIDTH) {
                    newGrid[y][x] = 1; // Mark cell as active/drawn
                }

                return { grid: newGrid, pathIndex: pathIndex + 1 };
            });
        }, ANIMATION_SPEED_MS);

        return () => clearInterval(animationInterval);
    }, []);

    return (
        <div className="flex items-center h-[44px]">
            <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${GRID_WIDTH}, 1fr)` }}>
                {animationState.grid.map((row, y) =>
                    row.map((cell, x) => (
                        <div
                            key={`${y}-${x}`}
                            className={`w-[5px] h-[5px] rounded-sm transition-colors duration-300 ${cell === 1 ? 'bg-primary' : 'bg-border'}`}
                        />
                    ))
                )}
            </div>
        </div>
    );
};