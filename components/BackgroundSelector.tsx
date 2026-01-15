
import React from 'react';
import { BackgroundOption } from '../types';

interface BackgroundSelectorProps {
  options: BackgroundOption[];
  selectedBackground: BackgroundOption;
  onBackgroundChange: (background: BackgroundOption) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({ options, selectedBackground, onBackgroundChange, onUndo, onRedo, canUndo, canRedo }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
       <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">Select Environment</h3>
        <div className="flex items-center space-x-2">
            <button 
                onClick={onUndo} 
                disabled={!canUndo} 
                className="p-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all" 
                aria-label="Undo background change"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8a5 5 0 000-10H9" /></svg>
            </button>
            <button 
                onClick={onRedo} 
                disabled={!canRedo} 
                className="p-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all" 
                aria-label="Redo background change"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 15l3-3m0 0l-3-3m3 3H8a5 5 0 000 10h3" /></svg>
            </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onBackgroundChange(option)}
            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-left border flex items-center justify-between group ${
              selectedBackground.id === option.id
                ? 'bg-primary text-white border-primary shadow-md'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <span className="truncate">{option.name}</span>
            {selectedBackground.id === option.id && (
               <svg className="w-4 h-4 ml-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
               </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BackgroundSelector;
