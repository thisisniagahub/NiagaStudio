import React from 'react';
// FIX: Added .ts extension to the import from types.ts to ensure correct module resolution.
import { GalleryItem, UserGalleryProps } from '../types.ts';
// FIX: Added .tsx extension to the import from icons.tsx to ensure correct module resolution.
import { TrashIcon } from './icons.tsx';

export const UserGallery: React.FC<UserGalleryProps> = ({ items, onRemix, onDelete }) => {
    if (items.length === 0) {
        return null; // Don't show the gallery if it's empty
    }

    const sortedItems = [...items].sort((a, b) => b.createdAt - a.createdAt);

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent the remix action from firing
        onDelete(id);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Your Creations</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sortedItems.map((item) => (
                    <div 
                        key={item.id} 
                        className="group relative aspect-square bg-surface border border-border rounded-lg overflow-hidden cursor-pointer"
                        onClick={() => onRemix(item)}
                    >
                        <img src={item.imageDataUrl} alt={item.prompt} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                            <p className="text-white text-sm text-center font-semibold">Remix</p>
                        </div>
                        <button 
                            onClick={(e) => handleDelete(e, item.id)}
                            className="absolute top-2 right-2 p-1.5 bg-red-600/80 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-700 transition-all"
                            title="Delete Creation"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
