import React from 'react';
// FIX: Added .ts extension to the import from types.ts to ensure correct module resolution.
import { GalleryItem, GenerationSettings } from '../types.ts';

// Pre-defined examples for the inspiration gallery
const remixExamples: { prompt: string; settings: GenerationSettings }[] = [
    {
        prompt: "الحب",
        settings: { text: "الحب", strokeWidth: "bold", compositionStyle: "square", calligraphyColor: "#EF4444", backgroundColor: "#FFFFFF", addBorder: false, caption: "Love" },
    },
    {
        prompt: "السلام",
        settings: { text: "السلام", strokeWidth: "thin", compositionStyle: "linear", calligraphyColor: "#FAFAFA", backgroundColor: "#1F2937", addBorder: true, caption: "Peace" },
    },
    {
        prompt: "النور",
        settings: { text: "النور", strokeWidth: "medium", compositionStyle: "circular", calligraphyColor: "#FBBF24", backgroundColor: "#4B5563", addBorder: false, caption: "The Light" },
    },
];

interface RemixGalleryProps {
    onRemix: (item: GalleryItem) => void;
}

export const RemixGallery: React.FC<RemixGalleryProps> = ({ onRemix }) => {
    const handleRemixClick = (settings: GenerationSettings, prompt: string) => {
        onRemix({
            id: `remix-${Date.now()}`,
            createdAt: Date.now(),
            imageDataUrl: '', // This will be generated when the user clicks
            settings,
            prompt,
        });
    };
    
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Inspiration Gallery</h2>
            <p className="text-textSecondary mb-4">Click an example to load its settings and generate.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {remixExamples.map((item, index) => (
                    <div key={index} 
                         className="bg-surface border border-border rounded-lg p-4 text-center cursor-pointer hover:shadow-lg hover:border-primary transition-all group"
                         onClick={() => handleRemixClick(item.settings, item.prompt)}
                    >
                        <div className="h-32 flex items-center justify-center rounded-md" style={{ backgroundColor: item.settings.backgroundColor }}>
                            <span className="text-4xl font-serif" style={{ color: item.settings.calligraphyColor }}>{item.prompt}</span>
                        </div>
                        <p className="mt-3 font-semibold text-text group-hover:text-primary">{item.settings.caption}</p>
                        <p className="text-xs text-textSecondary">{item.settings.compositionStyle} style</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
