import React from 'react';

interface ChoiceButtonProps {
  text: string;
  onClick: () => void;
  disabled: boolean;
}

export const ChoiceButton: React.FC<ChoiceButtonProps> = ({ text, onClick, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full text-left p-4 bg-white border border-slate-300 rounded-md font-medium text-slate-700 
                 hover:bg-indigo-50 hover:border-indigo-500 
                 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200
                 transition-all duration-200 ease-in-out 
                 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 focus:ring-indigo-500
                 disabled:cursor-wait shadow-sm"
    >
      {disabled && !text.includes('...') ? <span className="animate-pulse">{text}</span> : text}
    </button>
  );
};