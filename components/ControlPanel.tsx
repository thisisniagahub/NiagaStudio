import React from 'react';
// FIX: Added .ts extension to the import from types.ts to ensure correct module resolution.
import { GenerationSettings, StrokeWidth, CompositionStyle } from '../types.ts';
// FIX: Added .tsx extension to the import from icons.tsx to ensure correct module resolution.
import { SpinnerIcon } from './icons.tsx';

interface ControlPanelProps {
  settings: GenerationSettings;
  setSettings: React.Dispatch<React.SetStateAction<GenerationSettings>>;
  onGenerate: () => void;
  isLoading: boolean;
  error: string | null;
}

const RadioGroup = ({ label, name, options, selected, onChange }: { label: string, name: string, options: string[], selected: string, onChange: (value: string) => void }) => (
    <div>
        <label className="block text-sm font-medium text-textSecondary mb-2">{label}</label>
        <div className="grid grid-cols-2 gap-2">
            {options.map(option => (
                <label key={option} className={`cursor-pointer p-2 text-center rounded-md border text-sm ${selected === option ? 'bg-primary text-white border-primary' : 'bg-background border-border hover:border-primary'}`}>
                    <input type="radio" name={name} value={option} checked={selected === option} onChange={() => onChange(option)} className="sr-only"/>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                </label>
            ))}
        </div>
    </div>
);

export const ControlPanel: React.FC<ControlPanelProps> = ({ settings, setSettings, onGenerate, isLoading, error }) => {
  const handleSettingChange = (field: keyof GenerationSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const strokeWidths: StrokeWidth[] = ['thin', 'medium', 'thick', 'bold'];
  const compositionStyles: CompositionStyle[] = ['square', 'linear', 'diamond', 'circular'];

  return (
    <div className="bg-surface p-6 rounded-lg shadow-md border border-border space-y-6">
      <h2 className="text-xl font-semibold text-text">Generator Settings</h2>
      <div>
        <label htmlFor="text" className="block text-sm font-medium text-textSecondary mb-1">Text to Generate</label>
        <textarea
          id="text"
          value={settings.text}
          onChange={(e) => handleSettingChange('text', e.target.value)}
          className="w-full p-2 bg-background border border-border rounded-md focus:ring-primary focus:border-primary"
          rows={3}
          dir="rtl"
          placeholder="Enter Arabic text..."
        />
      </div>
      
      <RadioGroup label="Composition Style" name="compositionStyle" options={compositionStyles} selected={settings.compositionStyle} onChange={(value) => handleSettingChange('compositionStyle', value as CompositionStyle)} />
      <RadioGroup label="Stroke Width" name="strokeWidth" options={strokeWidths} selected={settings.strokeWidth} onChange={(value) => handleSettingChange('strokeWidth', value as StrokeWidth)} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="calligraphyColor" className="block text-sm font-medium text-textSecondary mb-1">Calligraphy Color</label>
          <input type="color" id="calligraphyColor" value={settings.calligraphyColor} onChange={(e) => handleSettingChange('calligraphyColor', e.target.value)} className="w-full h-10 p-1 border border-border rounded-md" />
        </div>
        <div>
          <label htmlFor="backgroundColor" className="block text-sm font-medium text-textSecondary mb-1">Background Color</label>
          <input type="color" id="backgroundColor" value={settings.backgroundColor} onChange={(e) => handleSettingChange('backgroundColor', e.target.value)} className="w-full h-10 p-1 border border-border rounded-md" />
        </div>
      </div>

      <div>
        <label htmlFor="caption" className="block text-sm font-medium text-textSecondary mb-1">Caption (Optional)</label>
        <input
          type="text"
          id="caption"
          value={settings.caption}
          onChange={(e) => handleSettingChange('caption', e.target.value)}
          className="w-full p-2 bg-background border border-border rounded-md focus:ring-primary focus:border-primary"
          placeholder="e.g. English translation"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="addBorder"
          checked={settings.addBorder}
          onChange={(e) => handleSettingChange('addBorder', e.target.checked)}
          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
        />
        <label htmlFor="addBorder" className="ml-2 block text-sm text-text">Add Border</label>
      </div>
      
      <button
        onClick={onGenerate}
        disabled={isLoading}
        className="w-full bg-primary text-white font-bold py-3 px-4 rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-opacity"
      >
        Generate Calligraphy
      </button>
      {error && <p className="text-error text-sm text-center">{error}</p>}
    </div>
  );
};