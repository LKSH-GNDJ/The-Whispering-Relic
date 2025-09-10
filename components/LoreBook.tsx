import React from 'react';
import type { LoreEntry } from '../types';

interface LoreBookProps {
  lore: LoreEntry[];
  isVisible: boolean;
  onClose: () => void;
}

export const LoreBook: React.FC<LoreBookProps> = ({ lore, isVisible, onClose }) => {
  const sortedLore = [...lore].sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div
      className={`fixed top-0 right-0 h-full bg-white/80 backdrop-blur-lg z-30 transition-transform duration-500 ease-in-out border-l border-slate-200 ${
        isVisible ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{ width: 'min(512px, 100vw)' }}
    >
      <div className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-serif-display text-indigo-600">Lore Book</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
            aria-label="Close lore book"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-grow overflow-y-auto pr-2 space-y-4">
          {sortedLore.length === 0 ? (
            <p className="text-slate-500">Discover characters, locations, and items to fill your Lore Book.</p>
          ) : (
            sortedLore.map((entry, index) => (
              <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-200 animate-fade-in">
                <h3 className="font-semibold text-indigo-700 mb-1 font-serif-display text-lg">{entry.title}</h3>
                <p className="text-slate-600 text-base leading-relaxed">{entry.description}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
