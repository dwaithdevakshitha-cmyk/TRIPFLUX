
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { TravelPlan, GroundingLink, TourPackage, ItineraryDay } from "../types";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateTravelPlan = async (source: string, destination: string, duration: string, interests: string): Promise<{ plan: TravelPlan, sources: GroundingLink[] }> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Create a detailed holiday itinerary for a trip starting from ${source} to ${destination} for ${duration}, focusing on ${interests}. Consider travel time and provide a plan that reflects current events, seasonal closures, and top-rated spots for 2025.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          destination: { type: Type.STRING },
          duration: { type: Type.STRING },
          vibe: { type: Type.STRING },
          itinerary: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.INTEGER },
                title: { type: Type.STRING },
                activities: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      time: { type: Type.STRING },
                      activity: { type: Type.STRING },
                      description: { type: Type.STRING },
                      location: { type: Type.STRING }
                    },
                    required: ["time", "activity", "description"]
                  }
                }
              },
              required: ["day", "title", "activities"]
            }
          },
          estimatedBudget: { type: Type.STRING },
          tips: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["destination", "duration", "itinerary", "estimatedBudget"]
      }
    }
  });

  const sources: GroundingLink[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks) {
    chunks.forEach((chunk: any) => {
      if (chunk.web) {
        sources.push({
          title: chunk.web.title || 'Source',
          uri: chunk.web.uri
        });
      }
    });
  }

  return {
    plan: JSON.parse(response.text.trim()),
    sources
  };
};

export const generateItineraryForPackage = async (title: string, destination: string, duration: string): Promise<ItineraryDay[]> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a day-wise travel itinerary for a tour titled "${title}" to ${destination} for ${duration}. Provide 2-3 activities per day. Return ONLY a JSON array of ItineraryDay objects.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            day: { type: Type.INTEGER },
            title: { type: Type.STRING },
            activities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  activity: { type: Type.STRING },
                  description: { type: Type.STRING },
                  location: { type: Type.STRING }
                },
                required: ["time", "activity", "description"]
              }
            }
          },
          required: ["day", "title", "activities"]
        }
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const extractBulkToursFromMedia = async (fileData: string, mimeType: string): Promise<Partial<TourPackage>[]> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { text: "ACT AS A BULK HOLIDAY PACKAGE SCRAPER. Extract ALL individual tour packages from this document. For each package identify: title, category, destination, dates, price, priceBasis, and duration. Return an array of objects." },
        { inlineData: { data: fileData, mimeType: mimeType } }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING, enum: ['Domestic', 'International', 'Honeymoon', 'Pilgrimage', 'Adventure'] },
            destination: { type: Type.STRING },
            dates: { type: Type.STRING },
            price: { type: Type.STRING },
            priceBasis: { type: Type.STRING, enum: ['Per Person', 'Per Couple', 'Group'] },
            duration: { type: Type.STRING }
          }
        }
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const extractTourFromMedia = async (input: { fileData?: string, mimeType?: string, textPrompt?: string }): Promise<Partial<TourPackage>> => {
  const ai = getAIClient();
  
  const parts: any[] = [
    { text: "ACT AS A HOLIDAY PACKAGE SCRAPER. Identify: Title, Destination, Price, Duration, Highlights, and Features. Return ONLY JSON." }
  ];

  if (input.fileData && input.mimeType) {
    parts.push({ inlineData: { data: input.fileData, mimeType: input.mimeType } });
  }

  if (input.textPrompt) {
    parts.push({ text: `Analyze this reference: ${input.textPrompt}` });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          category: { type: Type.STRING, enum: ['Domestic', 'International', 'Honeymoon', 'Pilgrimage', 'Adventure'] },
          destination: { type: Type.STRING },
          dates: { type: Type.STRING },
          price: { type: Type.STRING },
          priceBasis: { type: Type.STRING, enum: ['Per Person', 'Per Couple', 'Group'] },
          duration: { type: Type.STRING },
          highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
          transportType: { type: Type.STRING },
          features: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });

  return JSON.parse(response.text.trim());
};

export const getLocalRecommendations = async (destination: string, type: string, lat?: number, lng?: number): Promise<{ text: string, links: GroundingLink[] }> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Recommend 5 best ${type} in ${destination}.`,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: lat && lng ? { latLng: { latitude: lat, longitude: lng } } : undefined
      }
    }
  });

  const links: GroundingLink[] = [];
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks) {
    chunks.forEach((chunk: any) => {
      if (chunk.maps) {
        links.push({ title: chunk.maps.title, uri: chunk.maps.uri });
      }
    });
  }

  return { text: response.text || "Here are some recommendations.", links };
};

export const generateDestinationImage = async (prompt: string): Promise<string> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: `A professional high-resolution travel brochure photo for a holiday in ${prompt}, sunny day, cinematic lighting, 8k.` }] }
  });

  let imageUrl = '';
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }
  }
  return imageUrl;
};
