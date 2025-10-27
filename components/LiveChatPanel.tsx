import React, { useState, useEffect, useRef } from 'react';
// FIX: Module '"@google/genai"' has no exported member 'LiveSession'.
import { LiveServerMessage } from "@google/genai";
import { startLiveConversation, createBlob, decode, decodeAudioData } from '../services/geminiService';
import { MicIcon, MicOffIcon, SpinnerIcon } from './icons';

// FIX: `LiveSession` is not an exported type from `@google/genai`.
// This defines the type by inferring it from the return type of `startLiveConversation`.
type LiveSession = Awaited<ReturnType<typeof startLiveConversation>>;

export const LiveChatPanel: React.FC = () => {
    const [isListening, setIsListening] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [statusText, setStatusText] = useState("Click the mic to start a voice conversation.");

    const sessionRef = useRef<LiveSession | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    
    // For audio playback
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const audioQueueRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    const handleMessage = async (message: LiveServerMessage) => {
        const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
        if (base64EncodedAudioString) {
            if (!outputAudioContextRef.current) {
                // FIX: Property 'webkitAudioContext' does not exist on type 'Window'. Cast to `any` to support older browsers.
                outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            const outputAudioContext = outputAudioContextRef.current;

            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);

            const audioBuffer = await decodeAudioData(
                decode(base64EncodedAudioString),
                outputAudioContext,
                24000,
                1,
            );

            const source = outputAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputAudioContext.destination);
            
            source.addEventListener('ended', () => {
                audioQueueRef.current.delete(source);
            });
            
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            audioQueueRef.current.add(source);
        }

        if (message.serverContent?.interrupted) {
            for (const source of audioQueueRef.current.values()) {
                source.stop();
            }
            audioQueueRef.current.clear();
            nextStartTimeRef.current = 0;
        }
    };

    const stopConversation = () => {
        if (sessionRef.current) {
            sessionRef.current.close();
            sessionRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (scriptProcessorRef.current) {
            scriptProcessorRef.current.disconnect();
            scriptProcessorRef.current = null;
        }
        if (mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        setIsListening(false);
        setStatusText("Click the mic to start a voice conversation.");
    };

    const startConversation = async () => {
        setIsConnecting(true);
        setError(null);
        setStatusText("Connecting...");

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const sessionPromise = startLiveConversation({
                onopen: () => {
                    setStatusText("Connection open. Start speaking.");
                    setIsConnecting(false);
                    setIsListening(true);
                    
                    // FIX: Property 'webkitAudioContext' does not exist on type 'Window'. Cast to `any` to support older browsers.
                    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                    const audioContext = audioContextRef.current;

                    const source = audioContext.createMediaStreamSource(stream);
                    mediaStreamSourceRef.current = source;
                    
                    const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
                    scriptProcessorRef.current = scriptProcessor;

                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        sessionPromise.then((session) => {
                           session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(audioContext.destination);
                },
                onmessage: handleMessage,
                onerror: (e: ErrorEvent) => {
                    console.error("Live session error:", e);
                    setError(`Connection error: ${e.message}`);
                    stopConversation();
                },
                onclose: (e: CloseEvent) => {
                    console.log("Live session closed.");
                    stopConversation();
                },
            });

            sessionRef.current = await sessionPromise;

        } catch (err) {
            console.error("Failed to start conversation:", err);
            setError(err instanceof Error ? err.message : "Could not start microphone.");
            setIsConnecting(false);
            setStatusText("Failed to start. Please check permissions.");
        }
    };

    const handleMicClick = () => {
        if (isListening) {
            stopConversation();
        } else {
            startConversation();
        }
    };

    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            stopConversation();
            if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
                outputAudioContextRef.current.close();
            }
        };
    }, []);

    return (
        <div className="bg-surface p-6 rounded-lg shadow-md border border-border flex flex-col items-center justify-center space-y-4">
            <h2 className="text-xl font-semibold text-text">Live Voice Assistant</h2>
            <p className="text-textSecondary text-sm text-center">{statusText}</p>
            {error && <p className="text-error text-xs">{error}</p>}
            <button
                onClick={handleMicClick}
                disabled={isConnecting}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors
                    ${isConnecting ? 'bg-gray-400 cursor-not-allowed' : ''}
                    ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-opacity-90'}`}
            >
                {isConnecting ? <SpinnerIcon className="w-8 h-8 text-white" /> : (isListening ? <MicOffIcon className="w-8 h-8 text-white" /> : <MicIcon className="w-8 h-8 text-white" />)}
            </button>
        </div>
    );
};
