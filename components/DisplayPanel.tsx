import React, { useState, useEffect } from 'react';
// FIX: Added .tsx extension to ensure correct module resolution.
import { SpinnerIcon, EditIcon } from './icons.tsx';

interface DisplayPanelProps {
  isLoading: boolean;
  error: string | null;
  imageDataUrl: string | null;
  onDownload: () => void;
  onImageEdit: (prompt: string) => Promise<void>;
}

const EditControl: React.FC<{ onImageEdit: (prompt: string) => Promise<void>; isLoading: boolean; }> = ({ onImageEdit, isLoading }) => {
    const [prompt, setPrompt] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || isLoading) return;
        onImageEdit(prompt);
        setPrompt('');
    };

    return (
        <form onSubmit={handleSubmit} className="absolute bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-sm p-4 border-t border-border">
            <div className="flex items-center gap-2">
                <EditIcon className="w-5 h-5 text-textSecondary flex-shrink-0" />
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your edit (e.g., 'add a watercolor texture')..."
                    className="flex-1 p-2 bg-background border border-border rounded-md focus:ring-primary focus:border-primary text-sm"
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading || !prompt.trim()} className="bg-primary text-white font-semibold py-2 px-4 rounded-md hover:opacity-90 disabled:opacity-50">
                    {isLoading ? <SpinnerIcon /> : 'Apply'}
                </button>
            </div>
        </form>
    );
};

// Engaging and mesmerizing spiral snake loader
const KuficSnakeLoader = () => {
    const GRID_SIZE = 21; // Odd number for a perfect center
    const [snake, setSnake] = useState<[number, number][]>([]);
    
    // Pre-calculate the spiral path for the snake to follow
    const [path] = useState(() => {
        const p: [number, number][] = [];
        let x = Math.floor(GRID_SIZE / 2);
        let y = Math.floor(GRID_SIZE / 2);
        let direction = 0; // 0: right, 1: down, 2: left, 3: up
        let stepsInCurrentDirection = 1;
        let stepsTaken = 0;
        let turnCounter = 0;

        while (p.length < GRID_SIZE * GRID_SIZE) {
            // Add current position to path
            if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
               p.push([x, y]);
            }

            // Move one step
            switch (direction) {
                case 0: x++; break; // right
                case 1: y++; break; // down
                case 2: x--; break; // left
                case 3: y--; break; // up
            }
            stepsTaken++;
            
            if (stepsTaken === stepsInCurrentDirection) {
                stepsTaken = 0;
                direction = (direction + 1) % 4;
                turnCounter++;
                if (turnCounter % 2 === 0) {
                    stepsInCurrentDirection++;
                }
            }
        }
        return p;
    });

    const SNAKE_LENGTH = 40;
    const ANIMATION_SPEED_MS = 30;

    useEffect(() => {
        let currentIndex = 0;
        const animateSnake = () => {
            const start = currentIndex;
            const end = start + SNAKE_LENGTH;
            
            let newSnake: [number, number][];

            // Handle wrapping around the path array for a continuous loop
            if (end > path.length) {
                const part1 = path.slice(start, path.length);
                const part2 = path.slice(0, end - path.length);
                newSnake = [...part1, ...part2];
            } else {
                newSnake = path.slice(start, end);
            }

            setSnake(newSnake);
            currentIndex = (currentIndex + 1) % path.length;
        };

        const interval = setInterval(animateSnake, ANIMATION_SPEED_MS);
        return () => clearInterval(interval);
    }, [path]);

    const isSnakeCell = (x: number, y: number) => {
        return snake.some(segment => segment[0] === x && segment[1] === y);
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
                {Array.from({ length: GRID_SIZE }).map((_, y) =>
                    Array.from({ length: GRID_SIZE }).map((_, x) => (
                        <div
                            key={`${y}-${x}`}
                            className={`w-4 h-4 rounded-sm transition-colors duration-300 ${isSnakeCell(x, y) ? 'bg-primary' : 'bg-border/20'}`}
                        />
                    ))
                )}
            </div>
            <p className="text-textSecondary text-sm">Crafting your calligraphy...</p>
            <p className="text-xs text-textSecondary/70 text-center max-w-xs">The AI is carefully placing every line according to Kufic principles.</p>
        </div>
    );
};


export const DisplayPanel: React.FC<DisplayPanelProps> = ({ isLoading, error, imageDataUrl, onDownload, onImageEdit }) => {
  return (
    <div className="bg-surface p-4 rounded-lg shadow-md border border-border flex items-center justify-center aspect-square relative overflow-hidden">
      {isLoading ? (
        <KuficSnakeLoader />
      ) : error ? (
        <div className="text-center p-4">
            <p className="text-error font-semibold">Operation Failed</p>
            <p className="text-textSecondary text-sm mt-2">{error}</p>
        </div>
      ) : imageDataUrl ? (
        <>
          <img src={imageDataUrl} alt="Generated Kufic Calligraphy" className="w-full h-full object-contain"/>
          <button
            onClick={onDownload}
            className="absolute top-4 right-4 bg-primary text-white font-bold py-2 px-4 rounded-md hover:opacity-90 transition-opacity"
          >
            Download
          </button>
          <EditControl onImageEdit={onImageEdit} isLoading={isLoading} />
        </>
      ) : (
        <div className="text-center p-4">
            <p className="text-xl font-semibold text-text">Kufic AI Studio</p>
            <p className="text-textSecondary mt-2">Enter your text and settings on the left, then click "Generate Calligraphy" to see your design here.</p>
        </div>
      )}
    </div>
  );
};