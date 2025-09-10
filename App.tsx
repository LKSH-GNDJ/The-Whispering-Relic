import React, { useState, useCallback } from 'react';
import type { GameState, HistoryEntry } from './types';
import { getInitialScene, getNextScene, generateImage } from './services/geminiService';
import { SetupScreen } from './components/SetupScreen';
import { GameScreen } from './components/GameScreen';
import { AdventureLog } from './components/StartScreen'; // Re-purposing StartScreen for AdventureLog

interface SetupData {
  genre: string;
  tone: string;
  artStyle: string;
  character: string;
  openingPrompt: string;
}

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    gamePhase: 'setup',
    storySummaries: [],
    history: [],
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
  });
  const [isLogVisible, setIsLogVisible] = useState(false);

  const handleStartGame = useCallback(async (setupData: SetupData) => {
    setGameState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      gamePhase: 'playing',
      genre: setupData.genre,
      tone: setupData.tone,
      artStyle: setupData.artStyle,
      character: setupData.character,
      history: [],
      storySummaries: [],
    }));

    try {
      const scenePayload = await getInitialScene(setupData);
      const imageBytes = await generateImage(scenePayload.imagePrompt, setupData.artStyle);
      const imageUrl = `data:image/jpeg;base64,${imageBytes}`;

      setGameState(prev => ({
        ...prev,
        storySummaries: [scenePayload.summaryForNextPrompt],
        currentScene: scenePayload.sceneDescription,
        currentSummary: scenePayload.summaryForNextPrompt,
        imageUrl: imageUrl,
        choices: scenePayload.choices,
        isLoading: false,
      }));
    } catch (err) {
      console.error(err);
      setGameState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to start the adventure. Please try again.',
        gamePhase: 'setup'
      }));
    }
  }, []);

  const handlePlayerAction = useCallback(async (action: string) => {
    const currentHistoryEntry: HistoryEntry = {
      sceneDescription: gameState.currentScene,
      imageUrl: gameState.imageUrl!,
    };
    setGameState(prev => ({ ...prev, isLoading: true, error: null, choices: [] }));

    try {
      const setup = {
        genre: gameState.genre,
        tone: gameState.tone,
        character: gameState.character,
      };
      const scenePayload = await getNextScene(gameState.storySummaries, action, setup);
      const imageBytes = await generateImage(scenePayload.imagePrompt, gameState.artStyle);
      const newImageUrl = `data:image/jpeg;base64,${imageBytes}`;

      setGameState(prev => ({
        ...prev,
        history: [...prev.history, currentHistoryEntry],
        storySummaries: [...prev.storySummaries, scenePayload.summaryForNextPrompt],
        currentScene: scenePayload.sceneDescription,
        currentSummary: scenePayload.summaryForNextPrompt,
        imageUrl: newImageUrl,
        choices: scenePayload.choices,
        isLoading: false,
      }));
    } catch (err)
 {
      console.error(err);
      const previousChoices = gameState.choices.length > 0 ? gameState.choices : Array(3).fill('...');
      setGameState(prev => ({
        ...prev,
        isLoading: false,
        error: 'The story could not continue. Please try again.',
        choices: previousChoices,
        // Restore current scene on error instead of losing it
        history: prev.history.slice(0, -1),
      }));
    }
  }, [gameState.storySummaries, gameState.genre, gameState.tone, gameState.character, gameState.artStyle, gameState.choices, gameState.currentScene, gameState.imageUrl]);

  return (
    <>
      <AdventureLog history={gameState.history} isVisible={isLogVisible} onClose={() => setIsLogVisible(false)} />
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
        <main className={`w-full max-w-7xl mx-auto transition-transform duration-500 ease-in-out ${isLogVisible ? '-translate-x-1/2 lg:-translate-x-64' : ''}`}>
          <header className="text-center mb-6">
            <h1 className="text-4xl md:text-6xl font-bold text-indigo-600 tracking-wider font-serif-display" style={{ textShadow: '0 0 25px rgba(99, 102, 241, 0.2)' }}>
              The Whispering Relic
            </h1>
            <p className="text-slate-500 text-lg">An AI-Powered Adventure</p>
          </header>

          {gameState.error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center mb-4">
              <p>{gameState.error}</p>
            </div>
          )}

          {gameState.gamePhase === 'playing' && (
             <button
              onClick={() => setIsLogVisible(true)}
              className="fixed top-4 left-4 z-20 bg-white/70 backdrop-blur-sm p-2 rounded-full text-slate-600 hover:text-indigo-600 transition-colors shadow-md"
              aria-label="Show Adventure Log"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </button>
          )}

          {gameState.gamePhase === 'setup' ? (
            <SetupScreen onStart={handleStartGame} isLoading={gameState.isLoading} />
          ) : (
            <GameScreen gameState={gameState} onPlayerAction={handlePlayerAction} />
          )}
        </main>
        <footer className="w-full max-w-4xl mx-auto text-center mt-8 text-xs text-slate-400">
          <p>This adventure is dynamically generated by Google's Gemini and Imagen models. Every journey is unique.</p>
        </footer>
      </div>
    </>
  );
};

export default App;