// @ts-nocheck
import { GoogleGenAI, Modality, Blob, LiveSession, LiveServerMessage } from "@google/genai";
// FIX: Added .ts extension to ensure correct module resolution.
import { GenerationSettings, ChatMessage, AspectRatio } from '../types.ts';

// FIX: Initialize Gemini AI Client. API key must be in environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const constructKuficPrompt = (settings: GenerationSettings): string => {
  return `
    Generate a high-resolution, centered image of the Arabic text "${settings.text}" written in a minimalist, geometric Kufic calligraphy style.

    **Style Specifications:**
    - Art Form: Geometric Kufic calligraphy.
    - Composition: ${settings.compositionStyle}.
    - Stroke Width: ${settings.strokeWidth}.
    - Aesthetics: Clean, precise, and symmetrical.

    **Visual Parameters:**
    - Calligraphy Color: Use the exact hex code ${settings.calligraphyColor}.
    - Background Color: Use the exact hex code ${settings.backgroundColor}.
    - Border: ${settings.addBorder ? `Add a simple, clean 2px border using the calligraphy color.` : 'No border.'}
    - Caption: ${settings.caption ? `Subtly integrate the caption "${settings.caption}" in a small, modern sans-serif font at the bottom.` : 'No caption.'}

    **Technical Requirements:**
    - Output Format: PNG.
    - Resolution: At least 1024x1024 pixels.
    - Ensure sharp edges and perfect geometric lines. The final image should contain only the calligraphy on its colored background as specified. Do not add any other text, watermarks, or signatures.
    `;
};

export const generateKuficImage = async (settings: GenerationSettings): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API key is not configured. Please set the API_KEY environment variable.");
    }
    
    const prompt = constructKuficPrompt(settings);

    try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: prompt }],
          },
          config: {
              responseModalities: [Modality.IMAGE],
          },
        });
        
        const firstPart = response.candidates?.[0]?.content?.parts?.[0];
        if (firstPart && firstPart.inlineData) {
          const base64ImageBytes: string = firstPart.inlineData.data;
          return `data:${firstPart.inlineData.mimeType};base64,${base64ImageBytes}`;
        } else {
          throw new Error("No image was generated. The model's response may have been blocked.");
        }
    } catch (error) {
        console.error("Error generating Kufic image:", error);
        throw new Error("Failed to generate image. The model may have refused the request due to safety settings or an invalid prompt.");
    }
};

export const editImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string> => {
    if (!process.env.API_KEY) throw new Error("API key is not configured.");
    
    try {
        const imagePart = { inlineData: { data: base64ImageData, mimeType } };
        const textPart = { text: prompt };
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [imagePart, textPart] },
            config: { responseModalities: [Modality.IMAGE] },
        });

        const firstPart = response.candidates?.[0]?.content?.parts?.[0];
        if (firstPart && firstPart.inlineData) {
            return `data:${firstPart.inlineData.mimeType};base64,${firstPart.inlineData.data}`;
        } else {
            throw new Error("No edited image was generated.");
        }
    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error("Failed to edit image.");
    }
};

export const generateImagen = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
    if (!process.env.API_KEY) throw new Error("API key is not configured.");

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: aspectRatio,
            },
        });
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error("Error generating with Imagen:", error);
        throw new Error("Failed to generate image with Imagen.");
    }
};

export const generateWithThinking = async (prompt: string, imageFile?: File): Promise<string> => {
    if (!process.env.API_KEY) throw new Error("API key is not configured.");

    try {
        let parts = [{ text: prompt }];
        if (imageFile) {
            const imagePart = await fileToGenerativePart(imageFile);
            parts = [imagePart, { text: prompt }];
        }
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts: parts },
            config: {
                thinkingConfig: { thinkingBudget: 32768 }
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error with Thinking Mode:", error);
        throw new Error("Failed to get a response from Thinking Mode.");
    }
};

export const generateChatResponse = async (history: ChatMessage[]): Promise<string> => {
    if (!process.env.API_KEY) throw new Error("API key is not configured.");

    const geminiHistory = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
    }));

    const lastMessage = geminiHistory.pop();
    if (!lastMessage) return "I'm sorry, I don't have a message to respond to.";

    // FIX: Pass history during chat creation instead of trying to set it later.
    // Use the correct model 'gemini-flash-lite-latest'.
    const chat = ai.chats.create({
        model: 'gemini-flash-lite-latest',
        history: geminiHistory,
        config: {
            systemInstruction: "You are a helpful assistant specializing in Kufic calligraphy, Islamic art, and creative design. Be concise, friendly, and informative.",
        }
    });
    
    try {
        // FIX: The message content is in `lastMessage.parts[0].text`.
        const response = await chat.sendMessage({ message: lastMessage.parts[0].text });
        return response.text;
    } catch (error) {
        console.error("Error generating chat response:", error);
        throw new Error("Failed to get a response.");
    }
};

// --- Live Conversation Service ---

function encode(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

export function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

export async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

export function createBlob(data: Float32Array): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
}

export const startLiveConversation = (callbacks: {
    onopen: () => void;
    onmessage: (message: LiveServerMessage) => Promise<void>;
    onerror: (e: ErrorEvent) => void;
    onclose: (e: CloseEvent) => void;
}): Promise<LiveSession> => {
    if (!process.env.API_KEY) {
        throw new Error("API key is not configured.");
    }

    return ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: callbacks,
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
            systemInstruction: 'You are a friendly and helpful assistant for NiagaStudio, a Kufic calligraphy generator. Keep your responses concise and conversational.',
        },
    });
};