import React, { useState, useRef, useEffect } from 'react';
// FIX: Added .ts extension to the import from types.ts to ensure correct module resolution.
import { Theme } from '../types.ts';

interface ThemeSelectorProps {
  themes: Theme[];
  activeTheme: Theme;
  setActiveTheme: (theme: Theme) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ themes, activeTheme, setActiveTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);
  
  return (
    <div className="relative" ref={wrapperRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 bg-surface border border-border px-3 py-2 rounded-md hover:border-primary">
        <span className="w-4 h-4 rounded-full" style={{ backgroundColor: activeTheme.colors.primary }}></span>
        <span>{activeTheme.name}</span>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-surface rounded-md shadow-lg border border-border z-20">
          {themes.map(theme => (
            <button
              key={theme.name}
              onClick={() => {
                setActiveTheme(theme);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-text hover:bg-background flex items-center gap-2"
            >
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.primary }}></span>
              {theme.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
