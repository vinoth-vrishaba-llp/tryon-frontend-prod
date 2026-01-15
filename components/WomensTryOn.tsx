import React, { useState, useMemo, useEffect } from 'react';
import {
  ImageFile, WomenProductCategory, WOMEN_CATEGORIES, WOMEN_CATEGORY_CONFIG,
  BACKGROUND_OPTIONS, ProductUploadType, POSE_OPTIONS, EXPRESSION_OPTIONS,
  VIEW_OPTIONS, TIME_OPTIONS, ASPECT_RATIO_OPTIONS, CAMERA_OPTIONS,
  IMAGE_QUALITY_OPTIONS, SareeAccessoriesState,
  User, Page
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
  const [useCustomModel, setUseCustomModel] = useState<boolean>(false);
  const [customModelImage, setCustomModelImage] = useState<ImageFile | null>(null);

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

  const isGenerationDisabled = useMemo(() => {
    if (isLoading) return true;
    if (useCustomModel && !customModelImage) return true;
    if (uploadType === 'full') return !fullProductImage;
    return WOMEN_CATEGORY_CONFIG[category].some((c, i) => !c.optional && !productImages[category][i]);
  }, [isLoading, category, uploadType, fullProductImage, productImages, useCustomModel, customModelImage]);

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
        undefined, config.previewOptions, accessories
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
        <p className="text-gray-500 text-sm mt-1">Professional studio renders with personalized identity.</p>
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

      {isLoading ? <GenerationProgress stage={genStage} /> : (
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Identity Selection */}
          <div className="bg-white p-2 sm:p-3 rounded-xl shadow-sm border border-gray-100 max-w-xl mx-auto">
            <h3 className="text-[10px] font-black text-gray-400 mb-2 text-center uppercase tracking-[0.2em]">Model Profile</h3>
            <div className="flex justify-center gap-2 mb-2">
              <button onClick={() => setUseCustomModel(false)} className={`flex-1 px-3 py-1.5 rounded-lg font-bold border text-[11px] transition-all ${!useCustomModel ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'}`}>Studio Pro</button>
              <button onClick={() => setUseCustomModel(true)} className={`flex-1 px-3 py-1.5 rounded-lg font-bold border text-[11px] transition-all ${useCustomModel ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'}`}>Custom Avatar</button>
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

          {/* Category Selection */}
          <div className="bg-white p-5 rounded-xl shadow-md border border-gray-50">
            <h3 className="font-semibold text-lg text-gray-700 mb-4 text-center">Apparel Category</h3>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
              {WOMEN_CATEGORIES.map(({ id, name }) => (
                <button
                  key={id}
                  onClick={() => setCategory(id)}
                  className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${category === id ? 'bg-primary text-white shadow-xl scale-105' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Global Upload Mode Selector */}
          <div className="bg-white p-5 rounded-xl shadow-md border border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col">
              <h3 className="font-bold text-gray-800">Upload Presentation</h3>
              <p className="text-xs text-gray-500">Choose between multi-part or single product photo.</p>
            </div>
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
              <button onClick={() => setUploadType('parts')} className={`px-4 py-2 text-xs font-black rounded-md transition-all ${uploadType === 'parts' ? 'bg-secondary text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>MULTI-PART</button>
              <button onClick={() => setUploadType('full')} className={`px-4 py-2 text-xs font-black rounded-md transition-all ${uploadType === 'full' ? 'bg-secondary text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>SINGLE PRODUCT</button>
            </div>
          </div>

          {/* Accessory Adornments (Only for Saree) */}
          {category === 'saree' && (
            <div className="bg-white p-5 rounded-xl shadow-md border-l-4 border-accent">
              <h3 className="font-bold text-lg text-gray-800 mb-4">Accessories</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
               {[
  { id: 'jasmine', label: 'Jasmine', image: jasmineBg },
  { id: 'bangles', label: 'Temple Gold', image: TempleGold },
  { id: 'necklace', label: 'Haaram', image: Haaram }
].map(acc => (
                  <div
                    key={acc.id}
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${accessories[acc.id as keyof SareeAccessoriesState] ? 'bg-accent/5 border-accent shadow-sm' : 'bg-gray-50 border-transparent opacity-60'}`}
                    onClick={() => toggleAccessory(acc.id as keyof SareeAccessoriesState)}
                  >
                    <div className="flex items-center gap-2">
  <img
    src={acc.image}
    alt={acc.label}
    className="w-10 h-10 object-cover rounded-md border border-gray-200"
  />

  <span className="text-xs font-black text-gray-700 uppercase tracking-tighter">
    {acc.label}
  </span>
</div>
                    <div className={`w-4 h-4 rounded-full border-2 transition-all ${accessories[acc.id as keyof SareeAccessoriesState] ? 'bg-accent border-accent' : 'bg-white border-gray-300'}`}>
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

          {/* Studio Customization */}
          <ModelCustomizer
          user={user}
            poseOptions={POSE_OPTIONS} selectedPose={config.pose} onPoseChange={p => updateConfig({ pose: p })}
            expressionOptions={EXPRESSION_OPTIONS} selectedExpression={config.expression} onExpressionChange={e => updateConfig({ expression: e })}
            viewOptions={VIEW_OPTIONS} selectedView={config.view} onViewChange={v => updateConfig({ view: v })}
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
            options={BACKGROUND_OPTIONS}
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
              className="w-full max-w-xl mt-4 py-4 font-black text-xl rounded-2xl shadow-2xl transition-all active:scale-95 ring-4 ring-white disabled:opacity-50"
            />
            
            {error && <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-bold max-w-xl mx-auto shadow-lg">{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default WomensTryOn;