import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ImageFile,
  KidsProductCategory,
  KIDS_CATEGORIES,
  KIDS_CATEGORY_CONFIG,
  KidsGender,
  KidsAgeGroup,
  ProductUploadType,
  BACKGROUND_OPTIONS_KIDS,
  POSE_OPTIONS_KIDS,
  EXPRESSION_OPTIONS_KIDS,
  VIEW_OPTIONS_KIDS,
  TIME_OPTIONS,
  ASPECT_RATIO_OPTIONS,
  CAMERA_OPTIONS,
  IMAGE_QUALITY_OPTIONS,
  HAIR_STYLE_OPTIONS_KIDS_BOY,
  HAIR_STYLE_OPTIONS_KIDS_GIRL,
  HairStyleOption,
  User,
  Page,
  BOTTOM_TYPE_OPTIONS_KIDS,
  BottomTypeOption
} from '../types';
import ImageUploadCard from './ImageUploadCard';
import TryOnResult from './TryOnResult';
import { generateTryOnImage } from '../services/geminiService';
import BackgroundSelector from './BackgroundSelector';
import { GenerationProgress, GenerationStage } from './HomePage';
import { saveImageToHistory } from '../historyManager';
import ModelCustomizer from './ModelCustomizer';
import { useConfig } from '../hooks/useConfig';
import TokenEstimator from './TokenEstimator';
import { clearAuth } from '../services/apiClient';
import GenerateButton from './GenerateButton';
import { validateGenerationAttempt, hasActivePaidPlan } from '../services/authService';

interface KidsTryOnProps {
  user: User;
  onNavigate: (page: Page) => void;
  onCreditsUpdate: (newCredits: number) => void;
}

const KidsTryOn: React.FC<KidsTryOnProps> = ({ user, onNavigate, onCreditsUpdate }) => {
  const [gender, setGender] = useState<KidsGender>('boy');
  const [ageGroup, setAgeGroup] = useState<KidsAgeGroup>('7-9');
  const [category, setCategory] = useState<KidsProductCategory>('western');
  const [uploadType, setUploadType] = useState<ProductUploadType>('parts');
  const [fullDressImage, setFullDressImage] = useState<ImageFile | null>(null);
  const [useCustomModel, setUseCustomModel] = useState<boolean>(false);
  const [customModelImage, setCustomModelImage] = useState<ImageFile | null>(null);
  const [selectedHairStyle, setSelectedHairStyle] = useState<HairStyleOption>(HAIR_STYLE_OPTIONS_KIDS_BOY[0]);
  const [selectedBottomType, setSelectedBottomType] = useState<BottomTypeOption | null>(null);

  // Get hair style options based on gender
  const hairStyleOptions = gender === 'boy' ? HAIR_STYLE_OPTIONS_KIDS_BOY : HAIR_STYLE_OPTIONS_KIDS_GIRL;

  // Reset hair style when gender changes
  const handleGenderChange = (newGender: KidsGender) => {
    setGender(newGender);
    const newOptions = newGender === 'boy' ? HAIR_STYLE_OPTIONS_KIDS_BOY : HAIR_STYLE_OPTIONS_KIDS_GIRL;
    setSelectedHairStyle(newOptions[0]);
  };

  const [productImages, setProductImages] = useState<Record<KidsProductCategory, (ImageFile | null)[]>>({
    western: new Array(KIDS_CATEGORY_CONFIG.western.length).fill(null),
    traditional: new Array(KIDS_CATEGORY_CONFIG.traditional.length).fill(null),
  });

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [genStage, setGenStage] = useState<GenerationStage>(GenerationStage.INITIALIZING);
  const [error, setError] = useState<string | null>(null);
  const [accessWarning, setAccessWarning] = useState<string | null>(null);

  const {
    config, updateConfig, undo, redo, canUndo, canRedo,
    presets, savePreset, loadPreset, deletePreset,
    renamePreset, clearAllPresets
  } = useConfig();

  // CRITICAL: Check access on mount and when quality changes
  useEffect(() => {
    const validation = validateGenerationAttempt(user, config.quality.id);

    if (!validation.allowed) {
      setAccessWarning(validation.error || 'Cannot generate images');
    } else {
      setAccessWarning(null);
    }
  }, [user, config.quality.id, user.paymentStatus, user.planType, user.tokenBalance]);

  // Reset bottom type selection when category or upload type changes
  useEffect(() => {
    setSelectedBottomType(null);
  }, [category, uploadType]);

  const currentCategoryConfig = KIDS_CATEGORY_CONFIG[category];
  const currentProductImages = productImages[category];

  const handleProductImageUpload = useCallback((index: number) => (imageFile: ImageFile) => {
    setProductImages(prev => ({
      ...prev,
      [category]: prev[category].map((img, i) => i === index ? imageFile : img)
    }));
  }, [category]);

  const handleProductImageRemove = useCallback((index: number) => () => {
    setProductImages(prev => ({
      ...prev,
      [category]: prev[category].map((img, i) => i === index ? null : img)
    }));
  }, [category]);

  // Determine if bottom selector should be shown
  const shouldShowBottomSelector = useMemo(() => {
    if (uploadType !== 'parts') return false;

    // Get the bottom slot index from config (any slot with bottom-related keywords)
    const bottomSlotIndex = currentCategoryConfig.findIndex(
      (config) => {
        const partLower = config.part.toLowerCase();
        return partLower.includes('bottom') ||
               partLower.includes('trouser') ||
               partLower.includes('pant') ||
               partLower.includes('jeans') ||
               partLower.includes('skirt') ||
               partLower.includes('legging') ||
               partLower.includes('shorts');
      }
    );

    // Show selector if bottom slot exists and is empty (regardless of optional/required)
    return bottomSlotIndex !== -1 && !currentProductImages[bottomSlotIndex];
  }, [uploadType, currentCategoryConfig, currentProductImages]);

  const isGenerationDisabled = useMemo(() => {
    if (isLoading) return true;
    if (useCustomModel && !customModelImage) return true;
    if (uploadType === 'full') return !fullDressImage;

    // Find the bottom slot index
    const bottomSlotIndex = currentCategoryConfig.findIndex(
      (config) => {
        const partLower = config.part.toLowerCase();
        return partLower.includes('bottom') ||
               partLower.includes('trouser') ||
               partLower.includes('pant') ||
               partLower.includes('jeans') ||
               partLower.includes('skirt') ||
               partLower.includes('legging') ||
               partLower.includes('shorts');
      }
    );

    // Check if all required parts are uploaded (excluding bottom if selector is shown)
    const hasAllRequired = !currentCategoryConfig.some((config, index) => {
      // If this is the bottom slot and selector is shown, skip this check
      if (index === bottomSlotIndex && shouldShowBottomSelector) {
        return false;
      }
      // Otherwise, check if required part is missing
      return !config.optional && !currentProductImages[index];
    });

    // If bottom selector should be shown and no bottom type selected, disable generation
    if (shouldShowBottomSelector && !selectedBottomType) return true;

    return !hasAllRequired;
  }, [isLoading, uploadType, fullDressImage, currentCategoryConfig, currentProductImages, useCustomModel, customModelImage, shouldShowBottomSelector, selectedBottomType]);

  const handleGenerate = async () => {
    // CRITICAL: Final validation before generation
    const validation = validateGenerationAttempt(user, config.quality.id);
    if (!validation.allowed) {
      setAccessWarning(validation.error || 'Cannot generate images');
      return;
    }

    const requiredProductImages = uploadType === 'full'
      ? (fullDressImage ? [fullDressImage.file] : [])
      : currentProductImages.map(img => img?.file).filter((file): file is File => file !== undefined);

    if (requiredProductImages.length === 0) return;

    setIsLoading(true);
    setGenStage(GenerationStage.INITIALIZING);
    setError(null);
    setAccessWarning(null);
    setGeneratedImage(null);

    try {
      setGenStage(GenerationStage.ANALYZING);
      const response = await generateTryOnImage(
        requiredProductImages, 'kids', category,
        config.background.prompt, config.pose.prompt, config.expression.prompt,
        config.view.prompt, config.time.prompt, config.aspectRatio.id,
        config.camera.prompt, config.quality.id, uploadType,
        useCustomModel && customModelImage ? customModelImage.file : undefined,
        { gender, ageGroup },
        config.previewOptions,
        undefined, undefined, undefined, selectedHairStyle,
        undefined, undefined, selectedBottomType
      );

      setGenStage(GenerationStage.FINALIZING);
      const imageUrl = `data:image/png;base64,${response.image}`;
      await saveImageToHistory(imageUrl, "Kids' Apparel", response.creditsUsed, useCustomModel && customModelImage ? customModelImage.file : undefined);
      setGeneratedImage(imageUrl);

      // Update credits in real-time
      if (response.creditsRemaining !== undefined) {
        onCreditsUpdate(response.creditsRemaining);
      }
    } catch (e: any) {
      if (e.message === 'SESSION_EXPIRED') {
        clearAuth();
        window.location.href = '/';
        return;
      }
      
      // Handle access control errors from backend
      if (e.message?.includes('subscription') || e.message?.includes('plan')) {
        setAccessWarning(e.message);
        return;
      }
      
      if (e.message?.includes('quality') || e.message?.includes('upgrade')) {
        setAccessWarning(e.message);
        return;
      }
      
      if (e.message?.includes('credit') || e.message?.includes('Insufficient')) {
        setAccessWarning(e.message);
        return;
      }
      
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
      setGeneratedImage(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setGeneratedImage(null);
    setIsLoading(false);
    setError(null);
    setAccessWarning(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (!isGenerationDisabled) {
          handleGenerate();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGenerationDisabled]);

  if (generatedImage && !isLoading) {
    return (
      <TryOnResult
        imageUrl={generatedImage}
        originalImage={useCustomModel && customModelImage ? customModelImage.previewUrl : undefined}
        onReset={handleReset} onRetry={handleGenerate} isLoading={isLoading}
      />
    );
  }

  return (
    <div className="container mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-primary">Kids Virtual Try-On</h2>
        <p className="text-gray-500 text-sm mt-1">Realistic style visualization for children.</p>
      </div>

      {/* CRITICAL: Plan Status Warning */}
      {!hasActivePaidPlan(user) && (
        <div className="mb-6 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-2xl max-w-2xl mx-auto animate-in fade-in slide-in-from-top-4">
          <div className="flex items-start gap-4">
            <svg className="w-8 h-8 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-lg font-black text-yellow-900 mb-2">
                {user.planType === 'Free' ? 'Upgrade Required' : 'Subscription Expired'}
              </h3>
              <p className="text-yellow-700 font-bold mb-3">
                {user.planType === 'Free' 
                  ? 'Image generation is only available for paid subscribers. Upgrade now to start creating!'
                  : 'Your subscription has expired. Renew your plan to continue generating images.'}
              </p>
              <button
                onClick={() => onNavigate('pricing')}
                className="px-6 py-3 bg-yellow-600 text-white font-black rounded-xl hover:bg-yellow-700 transition-colors"
              >
                {user.planType === 'Free' ? 'View Plans & Pricing' : 'Renew Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <GenerationProgress stage={genStage} />
        </div>
      ) : (
        <>
          <div className="max-w-2xl mx-auto mb-6 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-[10px] font-black text-gray-400 mb-3 text-center uppercase tracking-[0.2em]">Select Your Model</h3>
            <div className="flex justify-center gap-2 mb-2">
              <button
                onClick={() => setUseCustomModel(false)}
                className={`flex-1 px-4 py-2 rounded-lg font-bold border text-xs transition-all ${!useCustomModel ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'}`}
              >
                Studio Kid Model
              </button>
              <button
                onClick={() => setUseCustomModel(true)}
                className={`flex-1 px-4 py-2 rounded-lg font-bold border text-xs transition-all ${useCustomModel ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'}`}
              >
                Personal Photo
              </button>
            </div>

            {useCustomModel && (
              <div className="mt-2 max-w-sm mx-auto">
                <ImageUploadCard
                  title="Identity Reference"
                  isOptional={false}
                  onImageUpload={setCustomModelImage}
                  onImageRemove={() => setCustomModelImage(null)}
                  imageFile={customModelImage}
                  enableCropping={false}
                  dropzoneClassName="h-24"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto mb-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="font-semibold text-xs text-gray-400 mb-2 uppercase tracking-widest">Gender</h3>
              <div className="flex gap-2">
                {['boy', 'girl'].map((g) => (
                  <button key={g} onClick={() => handleGenderChange(g as KidsGender)} className={`flex-1 py-1.5 rounded-md text-sm font-bold transition-all ${gender === g ? 'bg-secondary text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{g.toUpperCase()}</button>
                ))}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="font-semibold text-xs text-gray-400 mb-2 uppercase tracking-widest">Age</h3>
              <div className="flex gap-2">
                {['2-3', '5', '7-9', '10-14'].map((a) => (
                  <button key={a} onClick={() => setAgeGroup(a as KidsAgeGroup)} className={`flex-1 py-1.5 rounded-md text-sm font-bold transition-all ${ageGroup === a ? 'bg-secondary text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{a} YRS</button>
                ))}
              </div>
            </div>
          </div>

          {/* Hair Style Selection */}
          <div className="bg-white p-5 rounded-xl shadow-md border border-gray-50 max-w-5xl mx-auto mb-6">
            <h3 className="font-semibold text-lg text-gray-700 mb-4 text-center">Hair Style</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {hairStyleOptions.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedHairStyle(style)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    selectedHairStyle.id === style.id
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {style.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {uploadType === 'full' ? (
              <div className="sm:col-span-2">
                <ImageUploadCard title={`Full ${category === 'western' ? 'Western' : 'Traditional'} Outfit`} isOptional={false} onImageUpload={setFullDressImage} onImageRemove={() => setFullDressImage(null)} imageFile={fullDressImage} />
              </div>
            ) : (
              currentCategoryConfig.map((config, index) => (
                <ImageUploadCard key={`${category}-${config.part}`} title={`${config.part} Photo`} isOptional={config.optional} onImageUpload={handleProductImageUpload(index)} onImageRemove={handleProductImageRemove(index)} imageFile={currentProductImages[index]} />
              ))
            )}
          </div>

          {/* Bottom Type Selector */}
          {shouldShowBottomSelector && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 max-w-5xl mx-auto">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-bold text-gray-900">
                  No Bottom Uploaded - Select Default Bottom Type
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Since you haven't uploaded a bottom, choose what type of bottom should appear on the model:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {BOTTOM_TYPE_OPTIONS_KIDS.map((bottomType) => (
                  <button
                    key={bottomType.id}
                    onClick={() => setSelectedBottomType(bottomType)}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      selectedBottomType?.id === bottomType.id
                        ? 'border-blue-600 bg-blue-100 text-blue-900'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                    }`}
                  >
                    {bottomType.name}
                  </button>
                ))}
              </div>
              {selectedBottomType && (
                <p className="text-xs text-green-600 mt-3 font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Selected: {selectedBottomType.name}
                </p>
              )}
            </div>
          )}

          <div className="mt-8 max-w-5xl mx-auto">
            <ModelCustomizer
            user={user}
              poseOptions={POSE_OPTIONS_KIDS} selectedPose={config.pose} onPoseChange={(p) => updateConfig({ pose: p })}
              expressionOptions={EXPRESSION_OPTIONS_KIDS} selectedExpression={config.expression} onExpressionChange={(e) => updateConfig({ expression: e })}
              viewOptions={VIEW_OPTIONS_KIDS} selectedView={config.view} onViewChange={(v) => updateConfig({ view: v })}
              timeOptions={TIME_OPTIONS} selectedTime={config.time} onTimeChange={(t) => updateConfig({ time: t })}
              aspectRatioOptions={ASPECT_RATIO_OPTIONS} selectedAspectRatio={config.aspectRatio} onAspectRatioChange={(a) => updateConfig({ aspectRatio: a })}
              cameraOptions={CAMERA_OPTIONS} selectedCamera={config.camera} onCameraChange={(c) => updateConfig({ camera: c })}
              qualityOptions={IMAGE_QUALITY_OPTIONS} selectedQuality={config.quality} onQualityChange={(q) => updateConfig({ quality: q })}
              onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo} presets={presets} onSavePreset={savePreset} onLoadPreset={loadPreset}
              onDeletePreset={deletePreset} onRenamePreset={renamePreset} onClearAllPresets={clearAllPresets} previewOptions={config.previewOptions} onPreviewOptionsChange={(o) => updateConfig({ previewOptions: o })}
            />
          </div>

          <div className="mt-8 max-w-5xl mx-auto">
            <BackgroundSelector options={BACKGROUND_OPTIONS_KIDS} selectedBackground={config.background} onBackgroundChange={(b) => updateConfig({ background: b })} onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo} />
          </div>

          <div className="mt-8 text-center sticky bottom-8 z-20">
            <TokenEstimator imageFiles={[...(uploadType === 'full' ? [fullDressImage?.file] : currentProductImages.map(i => i?.file)), customModelImage?.file]} quality={config.quality} />
            
            {/* CRITICAL: Access Warning Display */}
            {accessWarning && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl animate-in fade-in slide-in-from-bottom-2 max-w-xl mx-auto">
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-red-600 font-bold text-sm flex-1">{accessWarning}</p>
                </div>
              </div>
            )}
            
            {/* CRITICAL: Smart Generate Button */}
            <GenerateButton
              user={user}
              quality={config.quality.id}
              onClick={handleGenerate}
              disabled={isGenerationDisabled}
              loading={isLoading}
              onNavigateToPricing={() => onNavigate('pricing')}
              onNavigateToAddons={() => onNavigate('add-on-credits')}
              className="w-full max-w-xs mt-4 px-8 py-4 font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
            />
            
            {error && <p className="text-red-500 mt-4 font-bold">{error}</p>}
          </div>
        </>
      )}
    </div>
  );
};

export default KidsTryOn;