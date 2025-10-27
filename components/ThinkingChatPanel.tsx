import React, { useState, useRef } from 'react';
import { generateWithThinking } from '../services/geminiService';
import { SendIcon, SpinnerIcon } from './icons';

export const ThinkingChatPanel: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setResponse('');

        try {
            const result = await generateWithThinking(prompt, imageFile || undefined);
            setResponse(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const clearImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    return (
        <div className="bg-surface p-6 rounded-lg shadow-md border border-border space-y-4">
            <h2 className="text-xl font-semibold text-text">Creative Co-Pilot (with Thinking)</h2>
            <p className="text-sm text-textSecondary">Use Gemini Pro's advanced reasoning for complex creative prompts. You can optionally upload an image for context.</p>

            <div>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., 'Analyze the geometric principles in the uploaded Kufic art and suggest a new composition based on a circular motif...'"
                    className="w-full p-2 bg-background border border-border rounded-md focus:ring-primary focus:border-primary"
                    rows={4}
                    disabled={isLoading}
                />
            </div>
            
            <div className="flex items-center gap-4">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="hidden"
                />
                <button onClick={() => fileInputRef.current?.click()} className="bg-background border border-border px-4 py-2 rounded-md text-sm hover:border-primary">
                    Upload Image (Optional)
                </button>
                {imagePreview && (
                    <div className="flex items-center gap-2">
                        <img src={imagePreview} alt="Preview" className="w-12 h-12 rounded-md object-cover" />
                        <span className="text-xs text-textSecondary truncate max-w-[150px]">{imageFile?.name}</span>
                        <button onClick={clearImage} className="text-xs text-error hover:underline">Remove</button>
                    </div>
                )}
            </div>

            <button onClick={handleGenerate} disabled={isLoading || !prompt.trim()} className="w-full bg-primary text-white font-bold py-3 px-4 rounded-md hover:opacity-90 disabled:opacity-50 flex items-center justify-center">
                {isLoading ? <SpinnerIcon /> : 'Generate with Thinking'}
            </button>

            {error && <p className="text-error text-sm text-center">{error}</p>}

            {response && (
                <div className="mt-4 p-4 bg-background rounded-md border border-border">
                    <h3 className="font-semibold mb-2">Response:</h3>
                    <p className="text-sm whitespace-pre-wrap">{response}</p>
                </div>
            )}
        </div>
    );
};
