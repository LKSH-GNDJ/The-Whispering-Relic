import React from 'react';
import type { HistoryEntry } from '../types';

interface AdventureLogProps {
  history: readonly HistoryEntry[];
  isVisible: boolean;
  onClose: () => void;
}

export const AdventureLog: React.FC<AdventureLogProps> = React.memo(({ history, isVisible, onClose }) => {
  return (
    <div
      className={`fixed top-0 left-0 h-full bg-white/80 backdrop-blur-lg z-30 transition-transform duration-500 ease-in-out border-r border-slate-200 ${
        isVisible ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{ width: 'min(512px, 100vw)' }}
    >
      <div className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-serif-display text-indigo-600">Adventure Log</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
            aria-label="Close log"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-grow overflow-y-auto pr-2 space-y-6">
          {history.length === 0 ? (
            <p className="text-slate-500">Your adventure has just begun. The log will fill as you explore.</p>
          ) : (
            history.map((entry, index) => (
              <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-200 animate-fade-in">
                <img src={entry.imageUrl} alt={`Scene ${index + 1}`} className="w-full aspect-video object-cover rounded-md mb-3" />
                <p className="text-slate-600 whitespace-pre-wrap font-serif-display text-base leading-relaxed">{entry.sceneDescription}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
});
