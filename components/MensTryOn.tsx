import React, { useState, useMemo, useEffect } from 'react';
import {
  ImageFile,
  MEN_CATEGORIES,
  MEN_CATEGORY_CONFIG,
  MenProductCategory,
  BACKGROUND_OPTIONS_MEN,
  POSE_OPTIONS_MEN,
  EXPRESSION_OPTIONS_MEN,
  VIEW_OPTIONS_MEN,
  TIME_OPTIONS,
  ASPECT_RATIO_OPTIONS,
  CAMERA_OPTIONS,
  IMAGE_QUALITY_OPTIONS,
  HAIR_STYLE_OPTIONS_MEN,
  HairStyleOption,
  ProductUploadType,
  User,
  Page,
  BOTTOM_TYPE_OPTIONS_MEN,
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
import { validateGenerationAttempt, hasActivePaidPlan, hasRemainingCredits } from '../services/authService';

interface MensTryOnProps {
  user: User;
  onNavigate: (page: Page) => void;
  onCreditsUpdate: (newCredits: number) => void;
}

const MensTryOn: React.FC<MensTryOnProps> = ({ user, onNavigate, onCreditsUpdate }) => {
  const [category, setCategory] = useState<MenProductCategory>('casual');
  const [uploadType, setUploadType] = useState<ProductUploadType>('parts');
  const [fullProductImage, setFullProductImage] = useState<ImageFile | null>(null);

  const [productImages, setProductImages] = useState<Record<MenProductCategory, (ImageFile | null)[]>>({
    casual: [null, null],
    traditional: [null, null],
    streetwear: [null, null, null],
    formals: [null, null, null],
  });

  const [useCustomModel, setUseCustomModel] = useState<boolean>(false);
  const [customModelImage, setCustomModelImage] = useState<ImageFile | null>(null);
  const [selectedHairStyle, setSelectedHairStyle] = useState<HairStyleOption>(HAIR_STYLE_OPTIONS_MEN[0]);
  const [selectedBottomType, setSelectedBottomType] = useState<BottomTypeOption | null>(null);

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

  const currentCategoryConfig = MEN_CATEGORY_CONFIG[category];
  const currentProductImages = productImages[category];

  const handleProductImageUpload = (index: number) => (imageFile: ImageFile) => {
    setProductImages(prev => ({
      ...prev,
      [category]: prev[category].map((img, i) => i === index ? imageFile : img)
    }));
  };

  const handleProductImageRemove = (index: number) => () => {
    setProductImages(prev => ({
      ...prev,
      [category]: prev[category].map((img, i) => i === index ? null : img)
    }));
  };

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
               partLower.includes('dhoti') ||
               partLower.includes('pajama');
      }
    );

    // Show selector if bottom slot exists and is empty (regardless of optional/required)
    return bottomSlotIndex !== -1 && !currentProductImages[bottomSlotIndex];
  }, [uploadType, currentCategoryConfig, currentProductImages]);

  const isGenerationDisabled = useMemo(() => {
    if (isLoading) return true;
    if (useCustomModel && !customModelImage) return true;
    if (uploadType === 'full') return !fullProductImage;

    // Find the bottom slot index
    const bottomSlotIndex = currentCategoryConfig.findIndex(
      (config) => {
        const partLower = config.part.toLowerCase();
        return partLower.includes('bottom') ||
               partLower.includes('trouser') ||
               partLower.includes('pant') ||
               partLower.includes('jeans') ||
               partLower.includes('dhoti') ||
               partLower.includes('pajama');
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
  }, [isLoading, category, uploadType, fullProductImage, currentProductImages, currentCategoryConfig, useCustomModel, customModelImage, shouldShowBottomSelector, selectedBottomType]);

  const handleGenerate = async () => {
    // CRITICAL: Final validation before generation
    const validation = validateGenerationAttempt(user, config.quality.id);
    if (!validation.allowed) {
      setAccessWarning(validation.error || 'Cannot generate images');
      return;
    }

    const requiredImages = uploadType === 'full'
      ? [fullProductImage!.file]
      : currentProductImages.map(img => img?.file).filter((file): file is File => file !== undefined);

    if (requiredImages.length === 0) return;

    setIsLoading(true);
    setGenStage(GenerationStage.INITIALIZING);
    setError(null);
    setAccessWarning(null);

    try {
      setGenStage(GenerationStage.ANALYZING);
      const response = await generateTryOnImage(
        requiredImages,
        'men',
        category,
        config.background.prompt,
        config.pose.prompt,
        config.expression.prompt,
        config.view.prompt,
        config.time.prompt,
        config.aspectRatio.id,
        config.camera.prompt,
        config.quality.id,
        uploadType,
        useCustomModel && customModelImage ? customModelImage.file : undefined,
        undefined,
        config.previewOptions,
        undefined, undefined, undefined, selectedHairStyle,
        config.fitType, config.bodyType, selectedBottomType
      );

      setGenStage(GenerationStage.FINALIZING);
      const mimeType = response.mimeType || 'image/png';
      const imageUrl = `data:${mimeType};base64,${response.image}`;
      await saveImageToHistory(imageUrl, `Men's ${MEN_CATEGORIES.find(c => c.id === category)?.name}`, response.creditsUsed, useCustomModel && customModelImage ? customModelImage.file : undefined);
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
        onReset={handleReset}
        onRetry={handleGenerate}
        isLoading={isLoading}
      />
    );
  }

  return (
    <div className="container mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-primary">Men's Studio</h2>
        <p className="text-content-tertiary text-sm mt-1">Realistic garment synthesis with biometric fidelity.</p>
      </div>

      {/* Plan Status Warning - only show hard block when no plan AND no credits */}
      {!hasActivePaidPlan(user) && !hasRemainingCredits(user) && (
        <div className="mb-6 p-6 bg-feedback-warning-light border-2 border-feedback-warning rounded-2xl max-w-2xl mx-auto animate-in fade-in slide-in-from-top-4">
          <div className="flex items-start gap-4">
            <svg className="w-8 h-8 text-feedback-warning flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-lg font-black text-content mb-2">
                {user.planType === 'Free' ? 'Upgrade Required' : 'Subscription Expired'}
              </h3>
              <p className="text-content-secondary font-bold mb-3">
                {user.planType === 'Free'
                  ? 'Image generation is only available for paid subscribers. Upgrade now to start creating!'
                  : 'Your subscription has expired and you have no remaining credits. Renew your plan to continue generating images.'}
              </p>
              <button
                onClick={() => onNavigate('pricing')}
                className="px-6 py-3 bg-feedback-warning text-content-inverse font-black rounded-xl hover:opacity-90 transition-colors"
              >
                {user.planType === 'Free' ? 'View Plans & Pricing' : 'Renew Subscription'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Expired but has remaining credits */}
      {!hasActivePaidPlan(user) && hasRemainingCredits(user) && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl max-w-2xl mx-auto animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-blue-800 font-semibold text-sm">
              Your subscription has expired, but you still have <span className="font-black">{user.tokenBalance} credits</span> remaining. You can continue generating until they run out.
            </p>
            <button
              onClick={() => onNavigate('pricing')}
              className="ml-auto px-4 py-2 text-sm bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              Renew Plan
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <GenerationProgress stage={genStage} />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-surface p-3 rounded-xl shadow-sm border border-border max-w-xl mx-auto">
            <h3 className="text-[10px] font-black text-content-disabled mb-2 text-center uppercase tracking-[0.2em]">Identify Source</h3>
            <div className="flex justify-center gap-2 mb-2">
              <button onClick={() => setUseCustomModel(false)} className={`flex-1 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${!useCustomModel ? 'bg-primary text-content-inverse border-primary shadow-md' : 'bg-surface text-content-secondary hover:bg-surface-secondary border-border'}`}>Studio Model</button>
              <button onClick={() => setUseCustomModel(true)} className={`flex-1 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${useCustomModel ? 'bg-primary text-content-inverse border-primary shadow-md' : 'bg-surface text-content-secondary hover:bg-surface-secondary border-border'}`}>Custom Photo</button>
            </div>
            {useCustomModel && (
              <div className="mt-2 max-w-xs mx-auto animate-in fade-in slide-in-from-top-2 duration-300">
                <ImageUploadCard title="Identity Reference" isOptional={false} onImageUpload={setCustomModelImage} onImageRemove={() => setCustomModelImage(null)} imageFile={customModelImage} enableCropping={false} dropzoneClassName="h-20" />
              </div>
            )}
          </div>

          {/* Category Selection */}
          <div className="bg-surface p-5 rounded-xl shadow-md border border-border">
            <h3 className="text-xs font-black text-content-disabled mb-3 text-center uppercase tracking-widest">Select Category</h3>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-4">
              {MEN_CATEGORIES.map(({ id, name }) => (
                <button
                  key={id}
                  onClick={() => setCategory(id)}
                  className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
                    category === id
                      ? 'bg-primary text-content-inverse shadow-xl'
                      : 'bg-surface-tertiary text-content-secondary hover:bg-interactive-hover'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>

            {/* Upload Type Toggle */}
            <div className="flex justify-center gap-4 border-t border-border pt-4">
              <button
                onClick={() => setUploadType('parts')}
                className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                  uploadType === 'parts'
                    ? 'bg-secondary text-content-inverse border-secondary'
                    : 'bg-surface text-content-tertiary border-border hover:bg-surface-secondary'
                }`}
              >
                Upload Components
              </button>
              <button
                onClick={() => setUploadType('full')}
                className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                  uploadType === 'full'
                    ? 'bg-secondary text-content-inverse border-secondary'
                    : 'bg-surface text-content-tertiary border-border hover:bg-surface-secondary'
                }`}
              >
                Full Product Shot
              </button>
            </div>
          </div>

          {/* Hair Style Selection */}
          <div className="bg-surface p-5 rounded-xl shadow-md border border-border">
            <h3 className="font-semibold text-lg text-content-secondary mb-4 text-center">Hair Style</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-2">
              {HAIR_STYLE_OPTIONS_MEN.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedHairStyle(style)}
                  className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
                    selectedHairStyle.id === style.id
                      ? 'bg-primary text-content-inverse shadow-md'
                      : 'bg-surface-tertiary text-content-secondary hover:bg-interactive-hover'
                  }`}
                >
                  {style.image ? (
                    <img
                      src={style.image}
                      alt={style.name}
                      className={`w-32 h-32 rounded-lg object-cover mb-1 border-2 ${
                        selectedHairStyle.id === style.id ? 'border-white' : 'border-transparent'
                      }`}
                      loading="lazy"
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-lg mb-1 flex items-center justify-center ${
                      selectedHairStyle.id === style.id ? 'bg-white/20' : 'bg-gray-100'
                    }`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121A3 3 0 1 0 9.88 9.88m4.242 4.242L9.878 9.879m4.243 4.242a3 3 0 0 1-4.243 0M9.879 9.879a3 3 0 0 1 4.242 0M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
                      </svg>
                    </div>
                  )}
                  <span className="text-xs font-medium text-center leading-tight">{style.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-surface p-5 rounded-xl shadow-md border border-border flex flex-col sm:flex-row items-center justify-between gap-4 hidden">
            <div className="flex flex-col">
              <h3 className="font-bold text-content">Product Upload Mode</h3>
              <p className="text-xs text-content-tertiary">Upload parts or a single full product photo.</p>
            </div>
            <div className="flex gap-1 p-1 bg-surface-tertiary rounded-lg">
              <button onClick={() => setUploadType('parts')} className={`px-4 py-2 text-xs font-black rounded-md transition-all ${uploadType === 'parts' ? 'bg-secondary text-content-inverse shadow-md' : 'text-content-disabled hover:text-content-secondary'}`}>PARTS</button>
              <button onClick={() => setUploadType('full')} className={`px-4 py-2 text-xs font-black rounded-md transition-all ${uploadType === 'full' ? 'bg-secondary text-content-inverse shadow-md' : 'text-content-disabled hover:text-content-secondary'}`}>SINGLE PRODUCT</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {uploadType === 'full' ? (
              <div className="sm:col-span-2 lg:col-span-3">
                <ImageUploadCard
                  title={`Full ${MEN_CATEGORIES.find(c => c.id === category)?.name} Photo`}
                  isOptional={false}
                  onImageUpload={setFullProductImage}
                  onImageRemove={() => setFullProductImage(null)}
                  imageFile={fullProductImage}
                  dropzoneClassName="h-64"
                />
              </div>
            ) : (
              currentCategoryConfig.map((config, index) => (
                <ImageUploadCard
                  key={`${category}-${config.part}`}
                  title={`${config.part} Photo`}
                  isOptional={config.optional}
                  onImageUpload={handleProductImageUpload(index)}
                  onImageRemove={handleProductImageRemove(index)}
                  imageFile={currentProductImages[index]}
                  dropzoneClassName="h-48"
                />
              ))
            )}
          </div>

          {/* Bottom Type Selector */}
          {shouldShowBottomSelector && (
            <div className="bg-surface-secondary border-2 border-border-secondary rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-bold text-content">
                  No Bottom Uploaded - Select Default Bottom Type
                </h3>
              </div>
              <p className="text-sm text-content-secondary mb-4">
                Since you haven't uploaded a bottom, choose what type of bottom should appear on the model:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {BOTTOM_TYPE_OPTIONS_MEN.map((bottomType) => (
                  <button
                    key={bottomType.id}
                    onClick={() => setSelectedBottomType(bottomType)}
                    className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                      selectedBottomType?.id === bottomType.id
                        ? 'border-primary bg-surface-tertiary text-content'
                        : 'border-border bg-surface text-content-secondary hover:border-border-secondary'
                    }`}
                  >
                    {bottomType.name}
                  </button>
                ))}
              </div>
              {selectedBottomType && (
                <p className="text-xs text-feedback-success mt-3 font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Selected: {selectedBottomType.name}
                </p>
              )}
            </div>
          )}

          <ModelCustomizer
          user={user}
            poseOptions={POSE_OPTIONS_MEN} selectedPose={config.pose} onPoseChange={(p) => updateConfig({ pose: p })}
            expressionOptions={EXPRESSION_OPTIONS_MEN} selectedExpression={config.expression} onExpressionChange={(e) => updateConfig({ expression: e })}
            viewOptions={VIEW_OPTIONS_MEN} selectedView={config.view} onViewChange={(v) => updateConfig({ view: v })}
            timeOptions={TIME_OPTIONS} selectedTime={config.time} onTimeChange={(t) => updateConfig({ time: t })}
            aspectRatioOptions={ASPECT_RATIO_OPTIONS} selectedAspectRatio={config.aspectRatio} onAspectRatioChange={(a) => updateConfig({ aspectRatio: a })}
            cameraOptions={CAMERA_OPTIONS} selectedCamera={config.camera} onCameraChange={(c) => updateConfig({ camera: c })}
            qualityOptions={IMAGE_QUALITY_OPTIONS} selectedQuality={config.quality} onQualityChange={(q) => updateConfig({ quality: q })}
            previewOptions={config.previewOptions} onPreviewOptionsChange={(o) => updateConfig({ previewOptions: o })}
            onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo} presets={presets} onSavePreset={savePreset} onLoadPreset={loadPreset} onDeletePreset={deletePreset} onRenamePreset={renamePreset} onClearAllPresets={clearAllPresets}
          />

          <BackgroundSelector options={BACKGROUND_OPTIONS_MEN} selectedBackground={config.background} onBackgroundChange={(b) => updateConfig({ background: b })} onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo} />

          <div className="mt-8 text-center sticky bottom-6 z-20">
            <TokenEstimator imageFiles={[...(uploadType === 'full' ? [fullProductImage?.file] : currentProductImages.map(i => i?.file)), customModelImage?.file]} quality={config.quality} />
            
            {/* CRITICAL: Access Warning Display */}
            {accessWarning && (
              <div className="mb-4 p-4 bg-feedback-error-light border border-feedback-error rounded-xl animate-in fade-in slide-in-from-bottom-2 max-w-xl mx-auto">
                <div className="flex items-start gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-feedback-error flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-feedback-error font-bold text-sm flex-1">{accessWarning}</p>
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
            />
            
            {error && <p className="text-feedback-error mt-4 font-bold">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default MensTryOn;