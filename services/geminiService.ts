import { GoogleGenAI, Type, HarmBlockThreshold, HarmCategory } from "@google/genai";
import type { ScenePayload, LoreEntry } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Define safety settings to restrict harmful content
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

const loreSchema = {
    type: Type.ARRAY,
    description: "A list of key entities (characters, places, items) introduced or significantly updated in this scene. Create entries only for new, important subjects.",
    items: {
        type: Type.OBJECT,
        properties: {
            title: {
                type: Type.STRING,
                description: "The name of the character, place, or item."
            },
            description: {
                type: Type.STRING,
                description: "A brief, one-to-two sentence description for a lore book entry."
            }
        },
        required: ["title", "description"]
    }
} as const;

const sceneSchema = {
  type: Type.OBJECT,
  properties: {
    sceneDescription: {
      type: Type.STRING,
      description: "A detailed, engaging description of the current scene in a text adventure game. Describe the environment, characters, and mood in a tone appropriate for the selected genre. Two paragraphs long."
    },
    imagePrompt: {
      type: Type.STRING,
      description: "A creative, highly detailed, and visually rich prompt for an AI image generator to create a cinematic picture for this scene. Focus on atmosphere, lighting, and key elements."
    },
    choices: {
      type: Type.ARRAY,
      description: "An array of exactly three distinct and compelling actions the player can take next. Phrase them as commands, e.g., 'Explore the dark cave' or 'Inspect the glowing runes'.",
      items: { type: Type.STRING },
      minItems: 3,
      maxItems: 3,
    },
    summaryForNextPrompt: {
        type: Type.STRING,
        description: "A very brief, one-sentence summary of the current situation to be used as context for the next turn. Focus on key characters, locations, and immediate conflicts."
    },
    lore: loreSchema
  },
  required: ["sceneDescription", "imagePrompt", "choices", "summaryForNextPrompt", "lore"]
} as const;

export interface SetupData {
    genre: string;
    tone: string;
    artStyle: string;
    character: string;
    openingPrompt: string;
}

export async function getInitialScene(setup: SetupData): Promise<ScenePayload> {
  const { genre, tone, character, openingPrompt } = setup;
  const prompt = `You are a master storyteller creating a dynamic text adventure. The player has chosen the following settings:
- Genre: ${genre}
- Tone: ${tone}
- Character: "${character}"

The story should begin with this premise: "${openingPrompt || 'A surprising and mysterious event.'}"

Generate the opening scene for this adventure. The tone should match the player's selection. Provide a detailed description of the scene, a visually rich prompt for an AI image generator to illustrate it, three distinct, compelling actions for the player, a brief summary of the scene for the next turn's context, and a list of any important characters, places, or items introduced that should be added to a lore book.`;

  // Fix: Moved safetySettings into the config object to match GenerateContentParameters type.
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: sceneSchema,
      safetySettings,
    },
  });
  
  try {
    const jsonResponse = JSON.parse(response.text);
    return jsonResponse as ScenePayload;
  } catch (e) {
    console.error("Failed to parse JSON response from AI:", response.text, e);
    throw new Error("The storyteller seems to be confused. The response was not in the expected format.");
  }
}

export interface NextSceneSetup {
    genre: string;
    tone: string;
    character: string;
}

export async function getNextScene(storyHistory: readonly string[], playerAction: string, setup: NextSceneSetup, existingLore: readonly LoreEntry[]): Promise<ScenePayload> {
  const { genre, tone, character } = setup;
  const history = storyHistory.join(' ');
  const loreTitles = existingLore.map(l => l.title).join(', ') || 'None yet.';
  const prompt = `You are a master storyteller continuing a text adventure.
- Genre: ${genre}
- Tone: ${tone}
- Player Character: "${character}"
- Existing Lore Book Entries: ${loreTitles}

The story so far (summarized): \`\`\`${history}\`\`\`

The player has just taken the action: "${playerAction}"

Based on this, generate the next part of the story. The tone should remain consistent. Provide a new, detailed scene description, a new visually rich prompt for an AI image generator, three new, distinct, and compelling actions for the player, and a brief summary of the new scene for the next turn's context. Finally, provide a list of any NEW important characters, places, or items introduced in this scene to be added to the lore book. DO NOT repeat entries that are already in the lore book.`;

  // Fix: Moved safetySettings into the config object to match GenerateContentParameters type.
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: sceneSchema,
      safetySettings,
    },
  });
  
  try {
    const jsonResponse = JSON.parse(response.text);
    return jsonResponse as ScenePayload;
  } catch (e) {
    console.error("Failed to parse JSON response from AI:", response.text, e);
    throw new Error("The storyteller seems to be confused. The response was not in the expected format.");
  }
}

export async function generateImage(prompt: string, artStyle: string): Promise<string> {
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: `${prompt}, in the style of ${artStyle}, cinematic, epic, atmospheric, high detail`,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio: '16:9',
    },
  });

  if (response.generatedImages && response.generatedImages.length > 0) {
    return response.generatedImages[0].image.imageBytes;
  }
  throw new Error("Image generation failed or returned no images.");
}
