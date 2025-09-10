
import { GoogleGenAI, Type } from "@google/genai";
import type { ScenePayload } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

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
    }
  },
  required: ["sceneDescription", "imagePrompt", "choices", "summaryForNextPrompt"]
};

interface SetupData {
    genre: string;
    tone: string;
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

Generate the opening scene for this adventure. The tone should match the player's selection. Provide a detailed description of the scene, a visually rich prompt for an AI image generator to illustrate it, three distinct, compelling actions for the player, and a brief summary of the scene for the next turn's context.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: sceneSchema,
    },
  });

  const jsonResponse = JSON.parse(response.text);
  return jsonResponse as ScenePayload;
}

interface NextSceneSetup {
    genre: string;
    tone: string;
    character: string;
}

export async function getNextScene(storyHistory: string[], playerAction: string, setup: NextSceneSetup): Promise<ScenePayload> {
  const { genre, tone, character } = setup;
  const history = storyHistory.join(' ');
  const prompt = `You are a master storyteller continuing a text adventure.
- Genre: ${genre}
- Tone: ${tone}
- Player Character: "${character}"

The story so far (summarized): \`\`\`${history}\`\`\`

The player has just taken the action: "${playerAction}"

Based on this, generate the next part of the story. The tone should remain consistent. Provide a new, detailed scene description, a new visually rich prompt for an AI image generator, three new, distinct, and compelling actions for the player, and a brief summary of the new scene for the next turn's context. Ensure the story progresses and the actions are meaningful.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: sceneSchema,
    },
  });

  const jsonResponse = JSON.parse(response.text);
  return jsonResponse as ScenePayload;
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
