import React from 'react';
import { LoadingIndicator } from './LoadingIndicator';
import { ChoiceButton } from './ChoiceButton';
import { CustomActionInput } from './CustomActionInput';

interface GameScreenProps {
  imageUrl: string | null;
  currentScene: string;
  choices: readonly string[];
  isLoading: boolean;
  onPlayerAction: (action: string) => void;
}

const ImageDisplay: React.FC<{ src: string | null; isLoading: boolean }> = React.memo(({ src, isLoading }) => (
  <div className="aspect-video w-full bg-slate-100 rounded-lg shadow-xl overflow-hidden border border-slate-200 relative flex items-center justify-center transition-all duration-500">
    {(isLoading && !src) && (
      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 shimmer">
        <LoadingIndicator />
        <p className="mt-2 text-sm font-semibold">The world is taking shape...</p>
      </div>
    )}
    {src && <img src={src} alt="Current scene" className="w-full h-full object-cover transition-opacity duration-1000" style={{ opacity: isLoading ? 0.4 : 1 }} />}
  </div>
));

const StoryText: React.FC<{ text: string; isLoading: boolean }> = React.memo(({ text, isLoading }) => (
  <div className={`transition-opacity duration-500 ${isLoading ? 'opacity-60' : 'opacity-100'}`}>
    <p className="text-slate-700 text-lg leading-relaxed whitespace-pre-wrap font-serif-display animate-fade-in">
      {text || "Your story unfolds..."}
    </p>
  </div>
));

const ActionPanel: React.FC<{ choices: readonly string[], onPlayerAction: (action: string) => void, isLoading: boolean }> = React.memo(({ choices, onPlayerAction, isLoading }) => (
  <div className="flex flex-col space-y-3 justify-start h-full">
    <p className="text-sm text-indigo-500 mb-1 font-semibold tracking-wide">WHAT DO YOU DO?</p>
    <div className="flex-grow space-y-3">
      {choices.length > 0 ? (
        choices.map((choice, index) => (
          <ChoiceButton key={index} text={choice} onClick={() => onPlayerAction(choice)} disabled={isLoading} />
        ))
      ) : (
        Array(3).fill(0).map((_, index) => (
          <ChoiceButton key={index} text="..." onClick={() => {}} disabled={true} />
        ))
      )}
    </div>
    <CustomActionInput onAction={onPlayerAction} disabled={isLoading} />
  </div>
));

export const GameScreen: React.FC<GameScreenProps> = React.memo(({ imageUrl, currentScene, choices, isLoading, onPlayerAction }) => {
  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-5 lg:gap-8">
        <div className="lg:col-span-3 mb-6 lg:mb-0">
          <ImageDisplay src={imageUrl} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200 flex-grow">
            <StoryText key={currentScene} text={currentScene} isLoading={isLoading} />
          </div>
          <ActionPanel choices={choices} onPlayerAction={onPlayerAction} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
});
