// FIX: Added full type definitions for the application.
export type StrokeWidth = 'thin' | 'medium' | 'thick' | 'bold';
export type CompositionStyle = 'square' | 'linear' | 'diamond' | 'circular';
export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export interface GenerationSettings {
  text: string;
  strokeWidth: StrokeWidth;
  compositionStyle: CompositionStyle;
  calligraphyColor: string;
  backgroundColor: string;
  addBorder: boolean;
  caption: string;
}

export interface GalleryItem {
  id: string;
  createdAt: number;
  imageDataUrl: string;
  settings: GenerationSettings;
  prompt: string;
}

export interface Theme {
  name: string;
  colors: {
    background: string;
    surface: string;
    primary: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    error: string;
  };
}

export interface UserGalleryProps {
  items: GalleryItem[];
  onRemix: (item: GalleryItem) => void;
  onDelete: (id: string) => void;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  imageUrl?: string;
}