import React, { useState } from 'react';
import {
  TimeOption,
  CameraOption,
  ImageQualityOption,
  BackgroundOption,
  BackgroundCategory,
  TIME_OPTIONS,
  CAMERA_OPTIONS,
  IMAGE_QUALITY_OPTIONS,
  BACKGROUND_OPTIONS,
  User,
  PLAN_CONFIG
} from '../../types';
import TokenEstimator from '../TokenEstimator';
import GenerateButton from '../GenerateButton';
import {
  LayoutGrid,
  Camera,
  Landmark,
  Building2,
  Trees,
  Home,
  Heart
} from 'lucide-react';

const BackgroundCategoryIcons: Record<BackgroundCategory | 'all', React.FC<{ className?: string }>> = {
  all: ({ className }) => <LayoutGrid className={className} />,
  studio: ({ className }) => <Camera className={className} />,
  heritage: ({ className }) => <Landmark className={className} />,
  urban: ({ className }) => <Building2 className={className} />,
  nature: ({ className }) => <Trees className={className} />,
  traditional: ({ className }) => <Home className={className} />,
  wedding: ({ className }) => <Heart className={className} />,
};

const BackgroundCategoryLabels: Record<BackgroundCategory | 'all', string> = {
  all: 'All',
  studio: 'Studio',
  heritage: 'Heritage',
  urban: 'Urban',
  nature: 'Nature',
  traditional: 'Traditional',
  wedding: 'Wedding',
};

interface EnvironmentStepProps {
  user: User;
  selectedTime: TimeOption;
  onTimeChange: (time: TimeOption) => void;
  selectedCamera: CameraOption;
  onCameraChange: (camera: CameraOption) => void;
  selectedQuality: ImageQualityOption;
  onQualityChange: (quality: ImageQualityOption) => void;
  selectedBackground: BackgroundOption;
  onBackgroundChange: (background: BackgroundOption) => void;
  backgroundOptions?: BackgroundOption[];

  // Generation
  imageFiles: (File | undefined)[];
  isGenerating: boolean;
  isGenerationDisabled: boolean;
  accessWarning: string | null;
  error: string | null;
  onGenerate: () => void;
  onCancel?: () => void;
  onNavigateToPricing: () => void;
  onNavigateToAddons: () => void;
}

const EnvironmentStep: React.FC<EnvironmentStepProps> = ({
  user,
  selectedTime,
  onTimeChange,
  selectedCamera,
  onCameraChange,
  selectedQuality,
  onQualityChange,
  selectedBackground,
  onBackgroundChange,
  backgroundOptions,
  imageFiles,
  isGenerating,
  isGenerationDisabled,
  accessWarning,
  error,
  onGenerate,
  onCancel,
  onNavigateToPricing,
  onNavigateToAddons
}) => {
  const [activeBackgroundCategory, setActiveBackgroundCategory] = useState<BackgroundCategory | 'all'>('all');

  // Use provided options or fall back to default
  const allBackgroundOptions = backgroundOptions || BACKGROUND_OPTIONS;

  const backgroundCategories: (BackgroundCategory | 'all')[] = ['all', 'studio', 'heritage', 'urban', 'nature', 'traditional', 'wedding'];

  const filteredBackgroundOptions = activeBackgroundCategory === 'all'
    ? allBackgroundOptions
    : allBackgroundOptions.filter(option => option.category === activeBackgroundCategory);

  // Plan-restricted quality logic
  const isQualityAllowed = (qualityId: string): boolean => {
    const planConfig = PLAN_CONFIG[user.planType];
    if (!planConfig) return false;
    return planConfig.allowedQualities.includes(qualityId);
  };

  const getQualityUpgradeMessage = (qualityId: string): string => {
    if (qualityId === 'high' || qualityId === 'ultra') {
      return 'Upgrade to Pro or Ultimate plan';
    }
    return '';
  };

  return (
    <div className="space-y-6">
      {/* Time of Day */}
      <div className="bg-surface-secondary p-4 rounded-xl">
        <h4 className="text-xs font-black text-content-disabled mb-3 uppercase tracking-widest">Time of Day</h4>
        <div className="flex flex-wrap gap-2">
          {TIME_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => onTimeChange(option)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                selectedTime.id === option.id
                  ? 'bg-secondary text-content-inverse shadow-md'
                  : 'bg-surface text-content-secondary hover:bg-interactive-hover border border-border'
              }`}
            >
              {option.name}
            </button>
          ))}
        </div>
      </div>

      {/* Camera Type */}
      <div className="bg-surface-secondary p-4 rounded-xl">
        <h4 className="text-xs font-black text-content-disabled mb-3 uppercase tracking-widest">Camera Type</h4>
        <div className="flex flex-wrap gap-2">
          {CAMERA_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => onCameraChange(option)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                selectedCamera.id === option.id
                  ? 'bg-secondary text-content-inverse shadow-md'
                  : 'bg-surface text-content-secondary hover:bg-interactive-hover border border-border'
              }`}
            >
              {option.name}
            </button>
          ))}
        </div>
      </div>

      {/* Image Quality */}
      <div className="bg-surface-secondary p-4 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-black text-content-disabled uppercase tracking-widest">Image Quality</h4>
          {user.planType === 'Basic' && (
            <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full border border-orange-200">
              Basic Plan: 1K Only
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {IMAGE_QUALITY_OPTIONS.map((option) => {
            const isLocked = !isQualityAllowed(option.id);
            const isSelected = selectedQuality.id === option.id;

            return (
              <div key={option.id} className="relative group/opt">
                <button
                  onClick={() => !isLocked && onQualityChange(option)}
                  disabled={isLocked}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex flex-col items-center ${
                    isSelected
                      ? 'bg-secondary text-content-inverse shadow-md'
                      : isLocked
                        ? 'bg-surface-tertiary text-content-disabled cursor-not-allowed border-2 border-dashed border-border-secondary'
                        : 'bg-surface text-content-secondary hover:bg-interactive-hover border border-border'
                  }`}
                >
                  <div className={`flex items-center gap-1 ${isLocked ? 'opacity-60' : ''}`}>
                    <span>{option.name}</span>
                    {isLocked && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-[10px] opacity-75 font-normal ${isLocked ? 'opacity-50' : ''}`}>
                    {option.description}
                  </span>
                </button>

                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 bg-surface-inverse text-content-inverse p-3 rounded-lg text-[11px] shadow-2xl opacity-0 invisible group-hover/opt:opacity-100 group-hover/opt:visible transition-all z-30 pointer-events-none border border-secondary">
                  <p className="font-bold border-b border-secondary mb-1 pb-1">
                    {option.id === 'standard' ? 'Fast & Efficient' : option.id === 'high' ? 'High Detail' : 'Ultra-HD'}
                  </p>
                  <p className="leading-relaxed mb-2">
                    {option.id === 'standard'
                      ? 'Standard 1K resolution. ~15s generation.'
                      : option.id === 'high'
                        ? 'Enhanced 2K resolution. ~30s generation.'
                        : 'Studio-grade 4K resolution. ~45s generation.'}
                  </p>

                  {isLocked && (
                    <div className="mt-2 pt-2 border-t border-orange-700 bg-orange-900/30 -mx-3 -mb-3 px-3 py-2 rounded-b-lg">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-orange-300 font-bold text-xs">
                          {getQualityUpgradeMessage(option.id)}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-surface-inverse rotate-45 border-r border-b border-secondary"></div>
                </div>
              </div>
            );
          })}
        </div>

        {user.planType === 'Basic' && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-xs font-bold text-amber-800 mb-1">Basic Plan: Standard Quality Only</p>
                <p className="text-xs text-amber-700">
                  Upgrade to Pro or Ultimate to unlock High (2K) and Ultra (4K) quality rendering.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Background Selection */}
      <div className="bg-surface-secondary p-4 rounded-xl">
        <h4 className="text-xs font-black text-content-disabled mb-3 uppercase tracking-widest">Environment Background</h4>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-4 pb-3 border-b border-border">
          {backgroundCategories.map(cat => {
            const Icon = BackgroundCategoryIcons[cat];
            const count = cat === 'all' ? allBackgroundOptions.length : allBackgroundOptions.filter(o => o.category === cat).length;
            if (count === 0 && cat !== 'all') return null;
            return (
              <button
                key={cat}
                onClick={() => setActiveBackgroundCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  activeBackgroundCategory === cat
                    ? 'bg-primary text-content-inverse border-primary shadow-md'
                    : 'bg-surface text-content-secondary border-border hover:bg-surface-secondary hover:border-border-secondary'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {BackgroundCategoryLabels[cat]}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeBackgroundCategory === cat ? 'bg-white/20' : 'bg-surface-tertiary'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredBackgroundOptions.map((option) => {
            const CategoryIcon = BackgroundCategoryIcons[option.category];
            return (
              <button
                key={option.id}
                onClick={() => onBackgroundChange(option)}
                className={`group relative rounded-xl overflow-hidden transition-all ${
                  selectedBackground.id === option.id
                    ? 'ring-2 ring-primary ring-offset-2 shadow-lg'
                    : 'border border-border hover:border-border-secondary hover:shadow-md'
                }`}
              >
                {/* Background Image or Placeholder */}
                {option.image ? (
                  <div className="aspect-[4/3] w-full">
                    <img
                      src={option.image}
                      alt={option.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className={`aspect-[4/3] w-full flex items-center justify-center ${
                    selectedBackground.id === option.id ? 'bg-primary' : 'bg-surface-tertiary'
                  }`}>
                    <CategoryIcon className={`h-10 w-10 ${
                      selectedBackground.id === option.id ? 'text-content-inverse' : 'text-content-disabled'
                    }`} />
                  </div>
                )}

                {/* Name Overlay */}
                <div className={`absolute bottom-0 left-0 right-0 px-2 py-1.5 ${
                  option.image
                    ? 'bg-gradient-to-t from-black/70 to-transparent'
                    : selectedBackground.id === option.id ? 'bg-primary' : 'bg-surface border-t'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold truncate ${
                      option.image || selectedBackground.id === option.id ? 'text-content-inverse' : 'text-content-secondary'
                    }`}>
                      {option.name}
                    </span>
                    {selectedBackground.id === option.id && (
                      <svg className="w-4 h-4 text-content-inverse flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className={`flex items-center gap-1 text-[9px] ${
                    option.image || selectedBackground.id === option.id ? 'text-content-inverse/70' : 'text-content-disabled'
                  }`}>
                    <CategoryIcon className="h-2.5 w-2.5" />
                    <span className="capitalize">{option.category}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {filteredBackgroundOptions.length === 0 && (
          <div className="text-center py-6 text-content-disabled">
            <p className="text-sm">No backgrounds in this category</p>
          </div>
        )}
      </div>

      {/* Token Estimator */}
      <div className="mt-6">
        <TokenEstimator imageFiles={imageFiles} quality={selectedQuality} />
      </div>

      {/* Access Warning */}
      {accessWarning && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-red-600 font-bold text-sm flex-1">{accessWarning}</p>
          </div>
        </div>
      )}

      {/* Generate Button */}
      <div className="text-center pt-4">
        {isGenerating ? (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 text-primary">
              <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="font-bold">Generating your image...</span>
            </div>
            {onCancel && (
              <button
                onClick={onCancel}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all border border-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Cancel
              </button>
            )}
            <p className="text-xs text-gray-500">Cancellation will not consume any credits</p>
          </div>
        ) : (
          <GenerateButton
            user={user}
            quality={selectedQuality.id}
            onClick={onGenerate}
            disabled={isGenerationDisabled}
            loading={isGenerating}
            onNavigateToPricing={onNavigateToPricing}
            onNavigateToAddons={onNavigateToAddons}
            className="w-full max-w-md py-4 font-black text-xl rounded-2xl shadow-2xl transition-all active:scale-95 ring-4 ring-white disabled:opacity-50"
          />
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-bold shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default EnvironmentStep;
