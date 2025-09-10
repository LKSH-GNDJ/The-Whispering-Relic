import type { SetupData } from './services/geminiService';

export interface HistoryEntry {
  readonly sceneDescription: string;
  readonly imageUrl: string;
}

export interface LoreEntry {
  readonly title: string;
  readonly description: string;
}

export interface GameState {
  readonly gamePhase: 'setup' | 'playing';
  readonly storySummaries: readonly string[];
  readonly history: readonly HistoryEntry[];
  readonly loreBook: readonly LoreEntry[];
  readonly currentScene: string;
  readonly currentSummary: string;
  readonly imageUrl: string | null;
  readonly choices: readonly string[];
  readonly isLoading: boolean;
  readonly error: string | null;
  // Setup options
  readonly genre: string;
  readonly tone: string;
  readonly artStyle: string;
  readonly character: string;
}

export interface ScenePayload {
  sceneDescription: string;
  imagePrompt: string;
  choices: string[];
  summaryForNextPrompt: string;
  lore: LoreEntry[];
}

// Reducer Action Types
export type GameAction =
  | { type: 'LOAD_GAME_STATE'; payload: GameState }
  | { type: 'START_GAME_INIT'; payload: SetupData }
  | { type: 'START_GAME_SUCCESS'; payload: { scene: ScenePayload; imageUrl: string } }
  | { type: 'START_GAME_ERROR'; payload: string }
  | { type: 'TAKE_TURN_INIT' }
  | { type: 'TAKE_TURN_SUCCESS'; payload: { scene: ScenePayload; imageUrl: string } }
  | { type: 'TAKE_TURN_ERROR'; payload: { error: string; previousChoices: readonly string[] } }
  | { type: 'CLEAR_SAVE' };
