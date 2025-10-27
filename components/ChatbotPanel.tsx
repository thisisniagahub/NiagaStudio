import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { generateChatResponse } from '../services/geminiService';
import { SendIcon, SpinnerIcon } from './icons';

export const ChatbotPanel: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', content: "Hello! I'm your Kufic art assistant. How can I help you with your design today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const history = [...messages, userMessage];
            const responseContent = await generateChatResponse(history);
            const modelMessage: ChatMessage = { role: 'model', content: responseContent };
            setMessages(prev => [...prev, modelMessage]);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
            // Optionally add an error message to the chat
            const errorBotMessage: ChatMessage = { role: 'model', content: `Sorry, I encountered an error: ${errorMessage}` };
            setMessages(prev => [...prev, errorBotMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-surface p-4 rounded-lg shadow-md border border-border flex flex-col h-[500px]">
            <h2 className="text-xl font-semibold text-text mb-4">Chat Assistant</h2>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-background'}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                         <div className="max-w-[80%] p-3 rounded-lg bg-background flex items-center">
                            <SpinnerIcon className="w-5 h-5" />
                         </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            {error && <p className="text-error text-xs text-center mt-2">{error}</p>}
            <div className="mt-4 flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about Kufic styles..."
                    className="flex-1 p-2 bg-background border border-border rounded-md focus:ring-primary focus:border-primary"
                    disabled={isLoading}
                />
                <button onClick={handleSend} disabled={isLoading || !input.trim()} className="p-2 bg-primary text-white rounded-md hover:opacity-90 disabled:opacity-50">
                    <SendIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
