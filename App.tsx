import React, { useReducer, useCallback, useEffect, useState } from 'react';
import type { GameState, GameAction, HistoryEntry } from './types';
import { getInitialScene, getNextScene, generateImage } from './services/geminiService';
import type { SetupData } from './services/geminiService';
import { SetupScreen } from './components/SetupScreen';
import { GameScreen } from './components/GameScreen';
import { AdventureLog } from './components/StartScreen';
import { LoreBook } from './components/LoreBook';

const SAVE_KEY = 'whisperingRelicSave';

const initialState: GameState = {
  gamePhase: 'setup',
  storySummaries: [],
  history: [],
  loreBook: [],
  currentScene: '',
  currentSummary: '',
  imageUrl: null,
  choices: [],
  isLoading: false,
  error: null,
  genre: '',
  tone: '',
  artStyle: '',
  character: '',
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'LOAD_GAME_STATE':
      return action.payload;
    case 'CLEAR_SAVE':
      return {
        ...initialState,
        gamePhase: 'setup'
      };
    case 'START_GAME_INIT':
      return {
        ...initialState,
        isLoading: true,
        gamePhase: 'playing',
        genre: action.payload.genre,
        tone: action.payload.tone,
        artStyle: action.payload.artStyle,
        character: action.payload.character,
      };
    case 'START_GAME_SUCCESS':
      return {
        ...state,
        isLoading: false,
        storySummaries: [action.payload.scene.summaryForNextPrompt],
        currentScene: action.payload.scene.sceneDescription,
        currentSummary: action.payload.scene.summaryForNextPrompt,
        imageUrl: action.payload.imageUrl,
        choices: action.payload.scene.choices,
        loreBook: action.payload.scene.lore || [],
      };
    case 'START_GAME_ERROR':
      return {
        ...initialState,
        error: action.payload,
      };
    case 'TAKE_TURN_INIT':
      return {
        ...state,
        isLoading: true,
        error: null,
        choices: [],
      };
    case 'TAKE_TURN_SUCCESS':
      const currentHistoryEntry: HistoryEntry = {
        sceneDescription: state.currentScene,
        imageUrl: state.imageUrl!,
      };
      const newLore = action.payload.scene.lore || [];
      const existingLoreTitles = new Set(state.loreBook.map(l => l.title.toLowerCase()));
      const uniqueNewLore = newLore.filter(l => !existingLoreTitles.has(l.title.toLowerCase()));

      return {
        ...state,
        isLoading: false,
        history: [...state.history, currentHistoryEntry],
        storySummaries: [...state.storySummaries, action.payload.scene.summaryForNextPrompt],
        loreBook: [...state.loreBook, ...uniqueNewLore],
        currentScene: action.payload.scene.sceneDescription,
        currentSummary: action.payload.scene.summaryForNextPrompt,
        imageUrl: action.payload.imageUrl,
        choices: action.payload.scene.choices,
      };
    case 'TAKE_TURN_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
        choices: action.payload.previousChoices,
      };
    default:
      return state;
  }
}

const App: React.FC = () => {
  const [gameState, dispatch] = useReducer(gameReducer, initialState);
  const [isLogVisible, setIsLogVisible] = useState(false);
  const [isLoreBookVisible, setIsLoreBookVisible] = useState(false);
  const [saveExists, setSaveExists] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(SAVE_KEY)) {
        setSaveExists(true);
      }
    } catch (error) {
      console.error("Could not access localStorage:", error);
    }
  }, []);

  const saveGame = useCallback(() => {
    if (gameState.gamePhase !== 'playing') return;
    try {
      const stateToSave = { ...gameState, isLoading: false, error: null };
      localStorage.setItem(SAVE_KEY, JSON.stringify(stateToSave));
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save game:", error);
      // This error state should be managed in the reducer if it needs to be displayed
    }
  }, [gameState]);

  const loadGame = useCallback(() => {
    try {
      const savedGame = localStorage.getItem(SAVE_KEY);
      if (savedGame) {
        dispatch({ type: 'LOAD_GAME_STATE', payload: JSON.parse(savedGame) });
      }
    } catch (error) {
      console.error("Failed to load game:", error);
      localStorage.removeItem(SAVE_KEY);
      setSaveExists(false);
      dispatch({ type: 'START_GAME_ERROR', payload: "Failed to load save data. It might be corrupted." });
    }
  }, []);

  const handleStartGame = useCallback(async (setupData: SetupData) => {
    localStorage.removeItem(SAVE_KEY);
    setSaveExists(false);
    dispatch({ type: 'START_GAME_INIT', payload: setupData });

    try {
      const scenePayload = await getInitialScene(setupData);
      const imageBytes = await generateImage(scenePayload.imagePrompt, setupData.artStyle);
      dispatch({
        type: 'START_GAME_SUCCESS',
        payload: { scene: scenePayload, imageUrl: `data:image/jpeg;base64,${imageBytes}` }
      });
    } catch (err) {
      console.error(err);
      dispatch({ type: 'START_GAME_ERROR', payload: (err as Error).message || 'Failed to start. Please try again.' });
    }
  }, []);

  const handlePlayerAction = useCallback(async (action: string) => {
    const { storySummaries, genre, tone, character, artStyle, loreBook, choices } = gameState;
    dispatch({ type: 'TAKE_TURN_INIT' });

    try {
      const scenePayload = await getNextScene(
        storySummaries,
        action,
        { genre, tone, character },
        loreBook
      );
      const imageBytes = await generateImage(scenePayload.imagePrompt, artStyle);
      dispatch({
        type: 'TAKE_TURN_SUCCESS',
        payload: { scene: scenePayload, imageUrl: `data:image/jpeg;base64,${imageBytes}` }
      });
    } catch (err) {
      console.error(err);
      dispatch({
        type: 'TAKE_TURN_ERROR',
        payload: {
          error: (err as Error).message || 'The story could not continue. Please try again.',
          previousChoices: choices.length > 0 ? choices : Array(3).fill('...'),
        }
      });
    }
  }, [gameState]);


  return (
    <>
      <AdventureLog history={gameState.history} isVisible={isLogVisible} onClose={() => setIsLogVisible(false)} />
      <LoreBook lore={gameState.loreBook} isVisible={isLoreBookVisible} onClose={() => setIsLoreBookVisible(false)} />
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
        <main className={`w-full max-w-7xl mx-auto transition-transform duration-500 ease-in-out ${isLogVisible ? 'translate-x-64' : ''} ${isLoreBookVisible ? '-translate-x-64' : ''}`}>
          <header className="text-center mb-6">
            <h1 className="text-4xl md:text-6xl font-bold text-indigo-600 tracking-wider font-serif-display" style={{ textShadow: '0 0 25px rgba(99, 102, 241, 0.2)' }}>
              The Whispering Relic
            </h1>
            <p className="text-slate-500 text-lg">An AI-Powered Adventure</p>
            <p className="text-sm italic text-slate-600 mt-2 max-w-2xl mx-auto">
              This adventure is dynamically generated by Google's Gemini and Imagen models. Every journey is unique.
            </p>
          </header>

          {gameState.error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center mb-4">
              <p>{gameState.error}</p>
            </div>
          )}

          {gameState.gamePhase === 'playing' && (
            <div className="fixed top-4 left-4 z-20 flex gap-2">
               <button onClick={() => setIsLogVisible(true)} className="bg-white/70 backdrop-blur-sm p-2 rounded-full text-slate-600 hover:text-indigo-600 transition-colors shadow-md" aria-label="Show Adventure Log">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </button>
               <button onClick={() => setIsLoreBookVisible(true)} className="bg-white/70 backdrop-blur-sm p-2 rounded-full text-slate-600 hover:text-indigo-600 transition-colors shadow-md" aria-label="Show Lore Book">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" /></svg>
              </button>
              <button onClick={saveGame} className="bg-white/70 backdrop-blur-sm p-2 rounded-full text-slate-600 hover:text-indigo-600 transition-colors shadow-md" aria-label="Save Game">
                {justSaved ? (
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                )}
              </button>
            </div>
          )}

          {gameState.gamePhase === 'setup' ? (
            <SetupScreen onStart={handleStartGame} isLoading={gameState.isLoading} saveExists={saveExists} onLoadGame={loadGame} />
          ) : (
            <GameScreen
              imageUrl={gameState.imageUrl}
              currentScene={gameState.currentScene}
              choices={gameState.choices}
              isLoading={gameState.isLoading}
              onPlayerAction={handlePlayerAction}
            />
          )}
        </main>
      </div>
    </>
  );
};

export default App;