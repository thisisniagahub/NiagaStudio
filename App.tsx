import React, { useState, useEffect } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { DisplayPanel } from './components/DisplayPanel';
import { ThemeSelector } from './components/ThemeSelector';
import { UserGallery } from './components/UserGallery';
import { RemixGallery } from './components/RemixGallery';
import { HeaderLoader } from './components/HeaderLoader';
import { ChatbotPanel } from './components/ChatbotPanel';
import { ThinkingChatPanel } from './components/ThinkingChatPanel';
import { LiveChatPanel } from './components/LiveChatPanel';
import { LearnPanel } from './components/LearnPanel';
import { generateKuficImage, editImage } from './services/geminiService';
import { saveToGallery, getGalleryItems, deleteFromGallery } from './services/databaseService';
import { GenerationSettings, Theme, GalleryItem } from './types';

// FIX: Added theme definitions locally to satisfy dependency from ThemeSelector and App logic.
const themes: Theme[] = [
  {
    name: 'Modern Light',
    colors: {
      background: '#F9FAFB', surface: '#FFFFFF', primary: '#3B82F6',
      text: '#111827', textSecondary: '#6B7280', border: '#E5E7EB',
      success: '#10B981', error: '#EF4444'
    }
  },
  {
    name: 'Desert Noir',
    colors: {
      background: '#1F2937', surface: '#374151', primary: '#FBBF24',
      text: '#F9FAFB', textSecondary: '#9CA3AF', border: '#4B5563',
      success: '#34D399', error: '#F87171'
    }
  },
    {
    name: 'Cultural Dark',
    colors: {
      background: '#1a1a1a', surface: '#2c2c2c', primary: '#f0ad4e',
      text: '#e0e0e0', textSecondary: '#a0a0a0', border: '#444444',
      success: '#5cb85c', error: '#d9534f'
    }
  },
];


const initialSettings: GenerationSettings = {
  text: 'بسم الله',
  strokeWidth: 'medium',
  compositionStyle: 'square',
  calligraphyColor: '#111827',
  backgroundColor: '#F3F4F6',
  addBorder: false,
  caption: 'In the name of God',
};

type Tab = 'Generator' | 'Co-Pilot' | 'Chat' | 'Live' | 'Learn';

const App: React.FC = () => {
  const [activeTheme, setActiveTheme] = useState<Theme>(themes[0]);
  const [settings, setSettings] = useState<GenerationSettings>(initialSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('Generator');

  useEffect(() => {
    document.documentElement.style.setProperty('--color-background', activeTheme.colors.background);
    document.documentElement.style.setProperty('--color-surface', activeTheme.colors.surface);
    document.documentElement.style.setProperty('--color-primary', activeTheme.colors.primary);
    document.documentElement.style.setProperty('--color-text', activeTheme.colors.text);
    document.documentElement.style.setProperty('--color-text-secondary', activeTheme.colors.textSecondary);
    document.documentElement.style.setProperty('--color-border', activeTheme.colors.border);
    document.documentElement.style.setProperty('--color-success', activeTheme.colors.success);
    document.documentElement.style.setProperty('--color-error', activeTheme.colors.error);
  }, [activeTheme]);

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    const items = await getGalleryItems();
    setGalleryItems(items);
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setImageDataUrl(null);
    try {
      const generatedUrl = await generateKuficImage(settings);
      setImageDataUrl(generatedUrl);
      await saveToGallery({
        createdAt: Date.now(),
        imageDataUrl: generatedUrl,
        settings: settings,
        prompt: settings.text,
      });
      loadGallery(); // Refresh gallery
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleImageEdit = async (prompt: string) => {
      if (!imageDataUrl) return;
      setIsLoading(true);
      setError(null);
      try {
          // Extract base64 and mimeType from data URL
          const [header, base64Data] = imageDataUrl.split(',');
          const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
          
          const editedUrl = await editImage(base64Data, mimeType, prompt);
          setImageDataUrl(editedUrl);
           await saveToGallery({
                createdAt: Date.now(),
                imageDataUrl: editedUrl,
                settings: { ...settings, text: `Edited: ${prompt}`},
                prompt: `Edited from '${settings.text}' with prompt: '${prompt}'`,
            });
            loadGallery();
      } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
          setIsLoading(false);
      }
  };

  const handleDownload = () => {
    if (!imageDataUrl) return;
    const link = document.createElement('a');
    link.href = imageDataUrl;
    link.download = `kufic_${settings.text.substring(0, 10)}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRemix = (item: GalleryItem) => {
    setSettings(item.settings);
    setActiveTab('Generator');
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleDelete = async (id: string) => {
    await deleteFromGallery(id);
    loadGallery();
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'Generator':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <ControlPanel settings={settings} setSettings={setSettings} onGenerate={handleGenerate} isLoading={isLoading} error={error} />
            </div>
            <div className="lg:col-span-2">
              <DisplayPanel isLoading={isLoading} error={error} imageDataUrl={imageDataUrl} onDownload={handleDownload} onImageEdit={handleImageEdit}/>
            </div>
          </div>
        );
      case 'Co-Pilot':
        return <ThinkingChatPanel />;
      case 'Chat':
        return <ChatbotPanel />;
      case 'Live':
        return <LiveChatPanel />;
      case 'Learn':
        return <LearnPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-background text-text min-h-screen font-sans">
      <header className="sticky top-0 bg-surface/80 backdrop-blur-sm border-b border-border z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <HeaderLoader />
          </div>
          <ThemeSelector themes={themes} activeTheme={activeTheme} setActiveTheme={setActiveTheme} />
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8 space-y-12">
        <div className="border-b border-border mb-8">
            <nav className="-mb-px flex space-x-6 overflow-x-auto">
              {(['Generator', 'Co-Pilot', 'Chat', 'Live', 'Learn'] as Tab[]).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab 
                          ? 'border-primary text-primary' 
                          : 'border-transparent text-textSecondary hover:text-text hover:border-border'
                      }`}
                  >
                      {tab}
                  </button>
              ))}
            </nav>
        </div>

        {renderTabContent()}
        
        <div className="mt-16 space-y-8">
          <RemixGallery onRemix={handleRemix} />
          <UserGallery items={galleryItems} onRemix={handleRemix} onDelete={handleDelete} />
        </div>
      </main>
    </div>
  );
};

export default App;