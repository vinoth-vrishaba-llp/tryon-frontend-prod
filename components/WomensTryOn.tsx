import React, { useState, useMemo, useEffect } from 'react';
import {
  ImageFile, WomenProductCategory, WOMEN_CATEGORIES, WOMEN_CATEGORY_CONFIG,
  BACKGROUND_OPTIONS_WOMEN, ProductUploadType, POSE_OPTIONS_WOMEN, EXPRESSION_OPTIONS_WOMEN,
  VIEW_OPTIONS_WOMEN, TIME_OPTIONS, ASPECT_RATIO_OPTIONS, CAMERA_OPTIONS,
  IMAGE_QUALITY_OPTIONS, SareeAccessoriesState, HAIR_STYLE_OPTIONS_WOMEN,
  HairStyleOption,
  User, Page,
  BOTTOM_TYPE_OPTIONS_WOMEN,
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
import jasmineBg from '../Image/jasmine.png';
import TempleGold from '../Image/Temple_gold.png';
import Haaram from '../Image/haaram.png';

interface WomensTryOnProps {
  user: User;
  onNavigate: (page: Page) => void;
  onCreditsUpdate: (newCredits: number) => void;
}

const WomensTryOn: React.FC<WomensTryOnProps> = ({ user, onNavigate, onCreditsUpdate }) => {
  const [category, setCategory] = useState<WomenProductCategory>('saree');
  const [uploadType, setUploadType] = useState<ProductUploadType>('parts');
  const [fullProductImage, setFullProductImage] = useState<ImageFile | null>(null);
  const [accessories, setAccessories] = useState<SareeAccessoriesState>({ jasmine: true, bangles: true, necklace: true });
  const [selectedHairStyle, setSelectedHairStyle] = useState<HairStyleOption>(HAIR_STYLE_OPTIONS_WOMEN[0]);
  const [useCustomModel, setUseCustomModel] = useState<boolean>(false);
  const [customModelImage, setCustomModelImage] = useState<ImageFile | null>(null);
  const [selectedBottomType, setSelectedBottomType] = useState<BottomTypeOption | null>(null);

  const [productImages, setProductImages] = useState<Record<WomenProductCategory, (ImageFile | null)[]>>({
    saree: [null, null, null], chudithar: [null, null, null], western: [null, null],
  });

  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [genStage, setGenStage] = useState<GenerationStage>(GenerationStage.INITIALIZING);
  const [error, setError] = useState<string | null>(null);
  const [accessWarning, setAccessWarning] = useState<string | null>(null);

  const {
    config, updateConfig, undo, redo, canUndo, canRedo,
    presets, savePreset, loadPreset, deletePreset, renamePreset, clearAllPresets
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

  const handleProductImageUpload = (index: number) => (imageFile: ImageFile) => {
    setProductImages(prev => ({ ...prev, [category]: prev[category].map((img, i) => i === index ? imageFile : img) }));
  };
  const handleProductImageRemove = (index: number) => {
  setProductImages(prev => ({
    ...prev,
    [category]: prev[category].map((img, i) => (i === index ? null : img)),
  }));
};


  const toggleAccessory = (key: keyof SareeAccessoriesState) => {
    setAccessories(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Determine if bottom selector should be shown
  const shouldShowBottomSelector = useMemo(() => {
    if (uploadType !== 'parts') return false;

    const currentCategoryConfig = WOMEN_CATEGORY_CONFIG[category];
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
               partLower.includes('palazzo');
      }
    );

    // Show selector if bottom slot exists and is empty (regardless of optional/required)
    return bottomSlotIndex !== -1 && !productImages[category][bottomSlotIndex];
  }, [uploadType, category, productImages]);

  const isGenerationDisabled = useMemo(() => {
    if (isLoading) return true;
    if (useCustomModel && !customModelImage) return true;
    if (uploadType === 'full') return !fullProductImage;

    const currentCategoryConfig = WOMEN_CATEGORY_CONFIG[category];

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
               partLower.includes('palazzo');
      }
    );

    // Check if all required parts are uploaded (excluding bottom if selector is shown)
    const hasAllRequired = !currentCategoryConfig.some((config, index) => {
      // If this is the bottom slot and selector is shown, skip this check
      if (index === bottomSlotIndex && shouldShowBottomSelector) {
        return false;
      }
      // Otherwise, check if required part is missing
      return !config.optional && !productImages[category][index];
    });

    // If bottom selector should be shown and no bottom type selected, disable generation
    if (shouldShowBottomSelector && !selectedBottomType) return true;

    return !hasAllRequired;
  }, [isLoading, category, uploadType, fullProductImage, productImages, useCustomModel, customModelImage, shouldShowBottomSelector, selectedBottomType]);

  const handleGenerate = async () => {
    // CRITICAL: Final validation before generation
    const validation = validateGenerationAttempt(user, config.quality.id);
    if (!validation.allowed) {
      setAccessWarning(validation.error || 'Cannot generate images');
      return;
    }

    const images = uploadType === 'full'
      ? [fullProductImage!.file]
      : productImages[category].map(i => i?.file).filter(Boolean) as File[];

    setIsLoading(true);
    setGenStage(GenerationStage.INITIALIZING);
    setError(null);
    setAccessWarning(null);

    try {
      setGenStage(GenerationStage.ANALYZING);
      const response = await generateTryOnImage(
        images, 'women', category, config.background.prompt, config.pose.prompt,
        config.expression.prompt, config.view.prompt, config.time.prompt,
        config.aspectRatio.id, config.camera.prompt, config.quality.id,
        uploadType,
        useCustomModel ? customModelImage?.file : undefined,
        undefined, config.previewOptions, accessories,
        undefined, undefined, selectedHairStyle,
        config.fitType, config.bodyType, selectedBottomType
      );

      setGenStage(GenerationStage.FINALIZING);
      const imageUrl = `data:image/png;base64,${response.image}`;
      await saveImageToHistory(imageUrl, "Women's Apparel", response.creditsUsed, useCustomModel && customModelImage ? customModelImage.file : undefined);
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
      
      setError(e.message);
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

  const allSelectedFiles = useMemo(() => {
    const pImages = uploadType === 'full'
      ? [fullProductImage?.file]
      : productImages[category].map(i => i?.file);
    return [...pImages, useCustomModel ? customModelImage?.file : null];
  }, [category, uploadType, fullProductImage, productImages, useCustomModel, customModelImage]);

  if (generatedImage && !isLoading) {
    return <TryOnResult
      imageUrl={generatedImage}
      originalImage={useCustomModel && customModelImage ? customModelImage.previewUrl : undefined}
      onReset={handleReset}
      onRetry={handleGenerate}
      isLoading={isLoading}
    />;
  }

  return (
    <div className="container mx-auto">
      <div className="text-center mb-5">
        <h2 className="text-3xl font-bold text-primary">Women's Boutique</h2>
        <p className="text-content-tertiary text-sm mt-1">Professional studio renders with personalized identity.</p>
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

      {isLoading ? <GenerationProgress stage={genStage} /> : (
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Identity Selection */}
          <div className="bg-surface p-2 sm:p-3 rounded-xl shadow-sm border border-border max-w-xl mx-auto">
            <h3 className="text-[10px] font-black text-content-disabled mb-2 text-center uppercase tracking-[0.2em]">Model Profile</h3>
            <div className="flex justify-center gap-2 mb-2">
              <button onClick={() => setUseCustomModel(false)} className={`flex-1 px-3 py-1.5 rounded-lg font-bold border text-[11px] transition-all ${!useCustomModel ? 'bg-primary text-content-inverse border-primary shadow-md' : 'bg-surface text-content-secondary hover:bg-surface-secondary border-border'}`}>Studio Pro</button>
              <button onClick={() => setUseCustomModel(true)} className={`flex-1 px-3 py-1.5 rounded-lg font-bold border text-[11px] transition-all ${useCustomModel ? 'bg-primary text-content-inverse border-primary shadow-md' : 'bg-surface text-content-secondary hover:bg-surface-secondary border-border'}`}>Custom Avatar</button>
            </div>
            {useCustomModel && (
              <div className="max-w-xs mx-auto animate-in fade-in slide-in-from-top-2 duration-300">
                <ImageUploadCard
                  title="Reference Photo"
                  onImageUpload={setCustomModelImage}
                  onImageRemove={() => setCustomModelImage(null)}
                  imageFile={customModelImage}
                  isOptional={false}
                  enableCropping={false}
                  dropzoneClassName="h-20"
                />
              </div>
            )}
          </div>

          {/* Hair Style Selection */}
          <div className="bg-surface p-5 rounded-xl shadow-md border border-border">
            <h3 className="font-semibold text-lg text-content-secondary mb-4 text-center">Hair Style</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-2">
              {HAIR_STYLE_OPTIONS_WOMEN.map((style) => (
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

          {/* Category Selection */}
          <div className="bg-surface p-5 rounded-xl shadow-md border border-border">
            <h3 className="font-semibold text-lg text-content-secondary mb-4 text-center">Apparel Category</h3>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
              {WOMEN_CATEGORIES.map(({ id, name }) => (
                <button
                  key={id}
                  onClick={() => setCategory(id)}
                  className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${category === id ? 'bg-primary text-content-inverse shadow-xl scale-105' : 'bg-surface-tertiary text-content-secondary hover:bg-interactive-hover'
                    }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Global Upload Mode Selector */}
          <div className="bg-surface p-5 rounded-xl shadow-md border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col">
              <h3 className="font-bold text-content">Upload Presentation</h3>
              <p className="text-xs text-content-tertiary">Choose between multi-part or single product photo.</p>
            </div>
            <div className="flex gap-1 p-1 bg-surface-tertiary rounded-lg">
              <button onClick={() => setUploadType('parts')} className={`px-4 py-2 text-xs font-black rounded-md transition-all ${uploadType === 'parts' ? 'bg-secondary text-content-inverse shadow-md' : 'text-content-disabled hover:text-content-secondary'}`}>MULTI-PART</button>
              <button onClick={() => setUploadType('full')} className={`px-4 py-2 text-xs font-black rounded-md transition-all ${uploadType === 'full' ? 'bg-secondary text-content-inverse shadow-md' : 'text-content-disabled hover:text-content-secondary'}`}>SINGLE PRODUCT</button>
            </div>
          </div>

          {/* Accessory Adornments (Only for Saree) */}
          {category === 'saree' && (
            <div className="bg-surface p-5 rounded-xl shadow-md border-l-4 border-accent">
              <h3 className="font-bold text-lg text-content mb-4">Accessories</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
               {[
  { id: 'jasmine', label: 'Jasmine', image: jasmineBg },
  { id: 'bangles', label: 'Bangles', image: TempleGold },
  { id: 'necklace', label: 'Haaram', image: Haaram }
].map(acc => (
                  <div
                    key={acc.id}
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${accessories[acc.id as keyof SareeAccessoriesState] ? 'bg-accent/5 border-accent shadow-sm' : 'bg-surface-secondary border-transparent opacity-60'}`}
                    onClick={() => toggleAccessory(acc.id as keyof SareeAccessoriesState)}
                  >
                    <div className="flex items-center gap-2">
  <img
    src={acc.image}
    alt={acc.label}
    className="w-10 h-10 object-cover rounded-md border border-border"
  />

  <span className="text-xs font-black text-content-secondary uppercase tracking-tighter">
    {acc.label}
  </span>
</div>
                    <div className={`w-4 h-4 rounded-full border-2 transition-all ${accessories[acc.id as keyof SareeAccessoriesState] ? 'bg-accent border-accent' : 'bg-surface border-border-secondary'}`}>
                      {accessories[acc.id as keyof SareeAccessoriesState] && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Product Upload Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {uploadType === 'full' ? (
              <div className="sm:col-span-2 lg:col-span-3">
                <ImageUploadCard title="Full Product Photo" isOptional={false} onImageUpload={setFullProductImage} onImageRemove={() => setFullProductImage(null)} imageFile={fullProductImage} />
              </div>
            ) : (
              WOMEN_CATEGORY_CONFIG[category].map((c, i) => (
                <ImageUploadCard key={c.part} title={`${c.part} Photo`} isOptional={c.optional} onImageUpload={handleProductImageUpload(i)} onImageRemove={() => handleProductImageRemove(i)} imageFile={productImages[category][i]} />
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {BOTTOM_TYPE_OPTIONS_WOMEN.map((bottomType) => (
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

          {/* Studio Customization */}
          <ModelCustomizer
          user={user}
            poseOptions={POSE_OPTIONS_WOMEN} selectedPose={config.pose} onPoseChange={p => updateConfig({ pose: p })}
            expressionOptions={EXPRESSION_OPTIONS_WOMEN} selectedExpression={config.expression} onExpressionChange={e => updateConfig({ expression: e })}
            viewOptions={VIEW_OPTIONS_WOMEN} selectedView={config.view} onViewChange={v => updateConfig({ view: v })}
            timeOptions={TIME_OPTIONS} selectedTime={config.time} onTimeChange={t => updateConfig({ time: t })}
            aspectRatioOptions={ASPECT_RATIO_OPTIONS} selectedAspectRatio={config.aspectRatio} onAspectRatioChange={a => updateConfig({ aspectRatio: a })}
            cameraOptions={CAMERA_OPTIONS} selectedCamera={config.camera} onCameraChange={c => updateConfig({ camera: c })}
            qualityOptions={IMAGE_QUALITY_OPTIONS} selectedQuality={config.quality} onQualityChange={q => updateConfig({ quality: q })}
            previewOptions={config.previewOptions} onPreviewOptionsChange={o => updateConfig({ previewOptions: o })}
            onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo}
            presets={presets} onSavePreset={savePreset} onLoadPreset={loadPreset}
            onDeletePreset={deletePreset} onRenamePreset={renamePreset} onClearAllPresets={clearAllPresets}
          />

          <BackgroundSelector
            options={BACKGROUND_OPTIONS_WOMEN}
            selectedBackground={config.background}
            onBackgroundChange={(b) => updateConfig({ background: b })}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
          />

          <div className="pt-6 text-center sticky bottom-6 z-20">
            <TokenEstimator imageFiles={allSelectedFiles} quality={config.quality} />
            
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
              className="w-full max-w-xl mt-4 py-4 font-black text-xl rounded-2xl shadow-2xl transition-all active:scale-95 ring-4 ring-white disabled:opacity-50"
            />

            {error && <div className="mt-4 p-4 bg-feedback-error-light text-feedback-error rounded-xl border border-feedback-error font-bold max-w-xl mx-auto shadow-lg">{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default WomensTryOn;