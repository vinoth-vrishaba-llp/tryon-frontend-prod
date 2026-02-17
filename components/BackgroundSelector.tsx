
import React, { useState } from 'react';
import { BackgroundOption, BackgroundCategory } from '../types';
import {
  LayoutGrid,
  Camera,
  Landmark,
  Building2,
  Trees,
  Home,
  Heart,
  Baby
} from 'lucide-react';

interface BackgroundSelectorProps {
  options: BackgroundOption[];
  selectedBackground: BackgroundOption;
  onBackgroundChange: (background: BackgroundOption) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const CategoryIcons: Record<BackgroundCategory | 'all', React.FC<{ className?: string }>> = {
  all: ({ className }) => <LayoutGrid className={className} />,
  studio: ({ className }) => <Camera className={className} />,
  heritage: ({ className }) => <Landmark className={className} />,
  urban: ({ className }) => <Building2 className={className} />,
  nature: ({ className }) => <Trees className={className} />,
  traditional: ({ className }) => <Home className={className} />,
  wedding: ({ className }) => <Heart className={className} />,
  kids: ({ className }) => <Baby className={className} />,
};

const CategoryLabels: Record<BackgroundCategory | 'all', string> = {
  all: 'All',
  studio: 'Studio',
  heritage: 'Heritage',
  urban: 'Urban',
  nature: 'Nature',
  traditional: 'Traditional',
  wedding: 'Wedding',
  kids: 'kids',
};

const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({ options, selectedBackground, onBackgroundChange, onUndo, onRedo, canUndo, canRedo }) => {
  const [activeCategory, setActiveCategory] = useState<BackgroundCategory | 'all'>('all');

  const categories: (BackgroundCategory | 'all')[] = ['all', 'studio', 'heritage', 'urban', 'nature', 'traditional', 'wedding'];

  const filteredOptions = activeCategory === 'all'
    ? options
    : options.filter(option => option.category === activeCategory);

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

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-gray-100">
        {categories.map(cat => {
          const Icon = CategoryIcons[cat];
          const count = cat === 'all' ? options.length : options.filter(o => o.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                activeCategory === cat
                  ? 'bg-primary text-white border-primary shadow-md'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {CategoryLabels[cat]}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeCategory === cat ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredOptions.map((option) => {
          const CategoryIcon = CategoryIcons[option.category];
          return (
            <button
              key={option.id}
              onClick={() => onBackgroundChange(option)}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-left border flex flex-col gap-1 group ${
                selectedBackground.id === option.id
                  ? 'bg-primary text-white border-primary shadow-md'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="truncate flex-1">{option.name}</span>
                {selectedBackground.id === option.id && (
                  <svg className="w-4 h-4 ml-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className={`flex items-center gap-1 text-[10px] ${
                selectedBackground.id === option.id ? 'text-white/70' : 'text-gray-400'
              }`}>
                <CategoryIcon className="h-3 w-3" />
                <span className="capitalize">{option.category}</span>
              </div>
            </button>
          );
        })}
      </div>

      {filteredOptions.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>No backgrounds in this category</p>
        </div>
      )}
    </div>
  );
};

export default BackgroundSelector;
