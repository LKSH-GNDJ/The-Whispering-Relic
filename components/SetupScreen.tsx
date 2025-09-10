import React, { useState } from 'react';
import { LoadingIndicator } from './LoadingIndicator';

interface SetupData {
  genre: string;
  tone: string;
  artStyle: string;
  character: string;
  openingPrompt: string;
}

interface SetupScreenProps {
  onStart: (setupData: SetupData) => void;
  isLoading: boolean;
  saveExists: boolean;
  onLoadGame: () => void;
}

const GENRES = ["High Fantasy", "Cyberpunk Noir", "Cosmic Horror", "Space Opera"];
const TONES = ["Serious", "Humorous", "Gritty"];
const ART_STYLES = ["Photorealistic", "Oil Painting", "Anime", "Charcoal Sketch"];

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-sm font-medium text-slate-600 mb-2">{children}</label>
);

interface CustomSelectProps {
  label: string;
  name: keyof SetupData;
  options: readonly string[];
  value: string;
  onChange: (name: keyof SetupData, value: string) => void;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ label, name, options, value, onChange }) => (
  <div>
    <Label>{label}</Label>
    <div className="grid grid-cols-2 gap-2">
      {options.map(option => (
        <button
          type="button"
          key={option}
          onClick={() => onChange(name, option)}
          className={`text-center p-3 text-sm rounded-md border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-indigo-500 ${
            value === option
              ? 'bg-indigo-600 border-indigo-600 text-white font-semibold'
              : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200/70 hover:border-slate-300'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  </div>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className="w-full bg-slate-100 border-slate-300 rounded-md p-3 text-slate-900 focus:ring-indigo-500 focus:border-indigo-500" />
);

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
    <textarea {...props} className="w-full bg-slate-100 border border-slate-300 rounded-md p-3 text-slate-900 focus:ring-indigo-500 focus:border-indigo-500" />
);

export const SetupScreen: React.FC<SetupScreenProps> = ({ onStart, isLoading, saveExists, onLoadGame }) => {
  const [setupData, setSetupData] = useState<SetupData>({
    genre: GENRES[0],
    tone: TONES[0],
    artStyle: ART_STYLES[0],
    character: 'A grizzled detective who has seen too much',
    openingPrompt: 'I wake up in a tavern with no memory of how I got here.',
  });

  const handleCustomSelectChange = (name: keyof SetupData, value: string) => {
    setSetupData(prev => ({...prev, [name]: value}));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSetupData(prev => ({ ...prev, [name]: value }));
  };

  const handleSurprise = () => {
    setSetupData(prev => ({ ...prev, openingPrompt: '' }));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading) {
      onStart(setupData);
    }
  };

  return (
    <div className="text-center bg-white p-10 rounded-lg shadow-2xl border border-slate-200 animate-fade-in">
      <h2 className="text-3xl font-semibold mb-2 text-slate-900 font-serif-display">Create Your World</h2>
      <p className="text-slate-600 mb-8 max-w-xl mx-auto">
        Define the foundation of your adventure. The AI will weave a unique story based on your design.
      </p>

      {saveExists && (
        <div className="mb-8 border-b border-slate-200 pb-8">
            <button
                type="button"
                onClick={onLoadGame}
                className="w-full md:w-auto inline-flex items-center justify-center bg-slate-700 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 ease-in-out shadow-lg"
              >
                Continue Adventure
              </button>
              <p className="text-sm text-slate-500 mt-4">--- OR ---</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CustomSelect label="Genre" name="genre" options={GENRES} value={setupData.genre} onChange={handleCustomSelectChange} />
          <CustomSelect label="Tone" name="tone" options={TONES} value={setupData.tone} onChange={handleCustomSelectChange} />
          <CustomSelect label="Art Style" name="artStyle" options={ART_STYLES} value={setupData.artStyle} onChange={handleCustomSelectChange} />
        </div>
        <div>
          <Label>Describe Your Character</Label>
          <Input id="character" name="character" type="text" value={setupData.character} onChange={handleChange} placeholder="e.g., A young elf mage exiled from her homeland" required />
        </div>
        <div>
          <div className="flex justify-between items-center">
             <Label>Seed the Opening Scene</Label>
             <button type="button" onClick={handleSurprise} className="text-sm text-indigo-600 hover:underline font-semibold">Surprise Me</button>
          </div>
          <Textarea id="openingPrompt" name="openingPrompt" rows={2} value={setupData.openingPrompt} onChange={handleChange} placeholder="e.g., I arrive in a bustling port city with a mysterious map." />
        </div>
        <div className="text-center pt-4">
          <button
            type="submit"
            disabled={isLoading || !setupData.character}
            className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 ease-in-out shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 disabled:shadow-none transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <LoadingIndicator />
                <span className="ml-2">Crafting your world...</span>
              </>
            ) : (
              'Begin New Adventure'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};