
import { GoogleGenAI, Type } from "@google/genai";
import { SimulationResult } from "../types";

export interface GameResource {
  title: string;
  uri: string;
}

export class QuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuotaError";
  }
}

export const simulateInteraction = async (gameName: string, stickmanName: string, isVip: boolean = false): Promise<SimulationResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const vipContext = isVip ? "The player is an ELITE VIP MEMBER. The interaction should be even more spectacular, featuring golden power-ups, high-stakes glitches, and a sense of absolute mastery." : "";
  
  const prompt = `Simulate a chaotic interaction where a stickman named ${stickmanName} enters the world of the arcade game ${gameName}. 
  ${vipContext}
  Describe how they break the game rules and what happens. 
  Include 3 specific hilarious events.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scenario: { type: Type.STRING },
            winner: { type: Type.STRING },
            events: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["scenario", "winner", "events"]
        }
      }
    });

    const jsonStr = response.text?.trim() || "{}";
    return JSON.parse(jsonStr) as SimulationResult;
  } catch (e: any) {
    if (e?.message?.includes("429") || e?.message?.includes("quota") || e?.message?.includes("RESOURCE_EXHAUSTED")) {
      throw new QuotaError("API Quota Exhausted. Please switch to a paid API key or wait for the limit to reset.");
    }
    throw e;
  }
};

/**
 * Uses Google Search Grounding to find YouTube videos and gameplay footage.
 */
export const fetchGameResources = async (gameName: string): Promise<GameResource[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find high-quality YouTube gameplay videos and archival footage for the classic arcade game: ${gameName}. Return a list of helpful video links.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const resources: GameResource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web && chunk.web.uri) {
          resources.push({
            title: chunk.web.title || "Gameplay Stream",
            uri: chunk.web.uri,
          });
        }
      });
    }

    return resources.slice(0, 5); // Return top 5 resources
  } catch (e) {
    console.error("Failed to fetch game resources:", e);
    return [];
  }
};
