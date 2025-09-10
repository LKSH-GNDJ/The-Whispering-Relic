import React, { useState } from 'react';

interface CustomActionInputProps {
  onAction: (action: string) => void;
  disabled: boolean;
}

export const CustomActionInput: React.FC<CustomActionInputProps> = ({ onAction, disabled }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onAction(text.trim());
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full pt-2">
      <label htmlFor="custom-action" className="sr-only">Enter a custom action</label>
      <div className="flex items-center gap-2">
        <input
          id="custom-action"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Or type your own action..."
          disabled={disabled}
          className="flex-grow bg-white border border-slate-300 rounded-md p-4 text-slate-800 shadow-sm
                     focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none
                     disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200
                     transition-all duration-200 ease-in-out disabled:cursor-wait"
        />
        <button
          type="submit"
          disabled={disabled || !text.trim()}
          className="p-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-bold rounded-md
                     transition-all duration-300 ease-in-out shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 disabled:shadow-none
                     transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed"
          aria-label="Submit custom action"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 12h14" />
          </svg>
        </button>
      </div>
    </form>
  );
};