export interface HistoryEntry {
  sceneDescription: string;
  imageUrl: string;
}

export interface LoreEntry {
  title: string;
  description: string;
}

export interface GameState {
  gamePhase: 'setup' | 'playing';
  storySummaries: string[];
  history: HistoryEntry[];
  loreBook: LoreEntry[];
  currentScene: string;
  currentSummary: string;
  imageUrl: string | null;
  choices: string[];
  isLoading: boolean;
  error: string | null;
  // Setup options
  genre: string;
  tone: string;
  artStyle: string;
  character: string;
}

export interface ScenePayload {
  sceneDescription: string;
  imagePrompt: string;
  choices: string[];
  summaryForNextPrompt: string;
  lore: LoreEntry[];
}
