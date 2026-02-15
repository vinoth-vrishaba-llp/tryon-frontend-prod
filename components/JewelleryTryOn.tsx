import React, { useState, useMemo, useEffect } from 'react';
import {
  ImageFile, JewelleryProductCategory, JEWELLERY_CATEGORIES,
  BACKGROUND_OPTIONS_JEWELLERY, ProductUploadType, POSE_OPTIONS_JEWELLERY, EXPRESSION_OPTIONS_JEWELLERY,
  VIEW_OPTIONS_JEWELLERY, TIME_OPTIONS, ASPECT_RATIO_OPTIONS, CAMERA_OPTIONS,
  IMAGE_QUALITY_OPTIONS, SKIN_TONE_OPTIONS, ATTIRE_OPTIONS, SkinToneOption, AttireOption,
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
import { validateGenerationAttempt, hasActivePaidPlan, hasRemainingCredits } from '../services/authService';

interface JewelleryTryOnProps {
  user: User;
  onNavigate: (page: Page) => void;
  onCreditsUpdate: (newCredits: number) => void;
}

const JewelleryTryOn: React.FC<JewelleryTryOnProps> = ({ user, onNavigate, onCreditsUpdate }) => {
  const [category, setCategory] = useState<JewelleryProductCategory>('necklace');
  const [uploadType, setUploadType] = useState<ProductUploadType>('full');
  const [productImage, setProductImage] = useState<ImageFile | null>(null);
  const [useCustomModel, setUseCustomModel] = useState<boolean>(false);
  const [customModelImage, setCustomModelImage] = useState<ImageFile | null>(null);

  const [selectedSkinTone, setSelectedSkinTone] = useState<SkinToneOption>(SKIN_TONE_OPTIONS[1]); // Default to Wheatish
  const [selectedAttire, setSelectedAttire] = useState<AttireOption>(ATTIRE_OPTIONS[0]); // Default to South Indian Bride

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

  // Set defaults specialized for Jewellery
  useEffect(() => {
    updateConfig({
      camera: CAMERA_OPTIONS.find(c => c.id === 'macro') || CAMERA_OPTIONS[1],
      view: VIEW_OPTIONS_JEWELLERY.find(v => v.id === 'close-up') || VIEW_OPTIONS_JEWELLERY[0],
      background: BACKGROUND_OPTIONS_JEWELLERY.find(b => b.id === 'temple-corridor') || BACKGROUND_OPTIONS_JEWELLERY[0]
    });
  }, []);

  const isGenerationDisabled = useMemo(() => {
    if (isLoading) return true;
    if (useCustomModel && !customModelImage) return true;
    return !productImage;
  }, [isLoading, productImage, useCustomModel, customModelImage]);

  const handleGenerate = async () => {
    // CRITICAL: Final validation before generation
    const validation = validateGenerationAttempt(user, config.quality.id);
    if (!validation.allowed) {
      setAccessWarning(validation.error || 'Cannot generate images');
      return;
    }

    if (!productImage) return;

    setIsLoading(true);
    setGenStage(GenerationStage.INITIALIZING);
    setError(null);
    setAccessWarning(null);

    try {
      setGenStage(GenerationStage.ANALYZING);
      const response = await generateTryOnImage(
        [productImage.file], 'jewellery', category, config.background.prompt, config.pose.prompt,
        config.expression.prompt, config.view.prompt, config.time.prompt,
        config.aspectRatio.id, config.camera.prompt, config.quality.id,
        uploadType,
        useCustomModel ? customModelImage?.file : undefined,
        undefined, config.previewOptions, undefined, selectedSkinTone, selectedAttire
      );

      setGenStage(GenerationStage.FINALIZING);
      const mimeType = response.mimeType || 'image/png';
      const imageUrl = `data:${mimeType};base64,${response.image}`;
      await saveImageToHistory(imageUrl, "Jewellery", response.creditsUsed, useCustomModel && customModelImage ? customModelImage.file : undefined);
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
      <div className="text-center mb-8">
        <h2 className="text-4xl font-black text-primary tracking-tight">Jewellery Boutique</h2>
        <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">Hyper-Realistic Virtual Adornment</p>
      </div>

      {/* Plan Status Warning - only show hard block when no plan AND no credits */}
      {!hasActivePaidPlan(user) && !hasRemainingCredits(user) && (
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
                  : 'Your subscription has expired and you have no remaining credits. Renew your plan to continue generating images.'}
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
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Identity & Persona Selection */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Identity Selection */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 h-full">
              <h3 className="text-[10px] font-black text-gray-400 mb-4 text-center uppercase tracking-[0.2em]">Model Identity</h3>
              <div className="flex justify-center gap-3 mb-6">
                <button onClick={() => setUseCustomModel(false)} className={`flex-1 px-4 py-3 rounded-xl font-bold border text-xs transition-all ${!useCustomModel ? 'bg-primary text-white border-primary shadow-lg scale-105' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'}`}>Studio Professional</button>
                <button onClick={() => setUseCustomModel(true)} className={`flex-1 px-4 py-3 rounded-xl font-bold border text-xs transition-all ${useCustomModel ? 'bg-primary text-white border-primary shadow-lg scale-105' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'}`}>Personal Portrait</button>
              </div>
              {useCustomModel ? (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                  <ImageUploadCard
                    title="Reference Photo"
                    onImageUpload={setCustomModelImage}
                    onImageRemove={() => setCustomModelImage(null)}
                    imageFile={customModelImage}
                    isOptional={false}
                    enableCropping={true}
                    dropzoneClassName="h-32"
                  />
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in duration-500">
                  {/* Skin Tone Selector */}
                  <div>
                    <p className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-wider">Model Skin Tone</p>
                    <div className="flex justify-between items-center gap-2">
                      {SKIN_TONE_OPTIONS.map((tone) => (
                        <button
                          key={tone.id}
                          onClick={() => setSelectedSkinTone(tone)}
                          className={`flex-1 flex flex-col items-center gap-1.5 group p-1`}
                        >
                          <div
                            className={`w-10 h-10 rounded-full border-4 transition-all ${selectedSkinTone.id === tone.id ? 'border-primary scale-110 shadow-md' : 'border-white hover:border-gray-100'}`}
                            style={{ backgroundColor: tone.hex }}
                          />
                          <span className={`text-[9px] font-bold uppercase tracking-tighter ${selectedSkinTone.id === tone.id ? 'text-primary' : 'text-gray-400'}`}>{tone.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Attire Selector */}
                  <div>
                    <p className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-wider">Model Attire & Styling</p>
                    <div className="grid grid-cols-2 gap-2">
                      {ATTIRE_OPTIONS.map((attire) => (
                        <button
                          key={attire.id}
                          onClick={() => setSelectedAttire(attire)}
                          className={`px-3 py-2 text-[10px] font-black rounded-lg border-2 transition-all text-left ${selectedAttire.id === attire.id ? 'bg-indigo-50 border-primary text-primary' : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'
                            }`}
                        >
                          {attire.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Product Upload Area */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 h-full">
              <h3 className="text-[10px] font-black text-gray-400 mb-4 text-center uppercase tracking-[0.2em]">Jewellery Source</h3>
              <div className="h-full flex flex-col justify-center">
                <ImageUploadCard
                  title={`${JEWELLERY_CATEGORIES.find(c => c.id === category)?.name} Master Image`}
                  isOptional={false}
                  onImageUpload={setProductImage}
                  onImageRemove={() => setProductImage(null)}
                  imageFile={productImage}
                  dropzoneClassName="h-48"
                />
              </div>
            </div>
          </div>

          {/* Jewellery Type Selection */}
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
            <h3 className="font-black text-gray-800 mb-6 text-center uppercase tracking-widest text-sm">Select Ornament Type</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {JEWELLERY_CATEGORIES.map(({ id, name }) => (
                <button
                  key={id}
                  onClick={() => setCategory(id)}
                  className={`px-2 py-3 text-[10px] font-black rounded-xl border-2 transition-all duration-300 uppercase tracking-tighter ${category === id ? 'bg-primary text-white border-primary shadow-xl -translate-y-1' : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100'
                    }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Studio Customization */}
          <ModelCustomizer
          user={user}
            poseOptions={POSE_OPTIONS_JEWELLERY} selectedPose={config.pose} onPoseChange={p => updateConfig({ pose: p })}
            expressionOptions={EXPRESSION_OPTIONS_JEWELLERY} selectedExpression={config.expression} onExpressionChange={e => updateConfig({ expression: e })}
            viewOptions={VIEW_OPTIONS_JEWELLERY} selectedView={config.view} onViewChange={v => updateConfig({ view: v })}
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
            options={BACKGROUND_OPTIONS_JEWELLERY}
            selectedBackground={config.background}
            onBackgroundChange={(b) => updateConfig({ background: b })}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
          />

          <div className="pt-6 text-center sticky bottom-6 z-20">
            <TokenEstimator imageFiles={[productImage?.file, customModelImage?.file]} quality={config.quality} />
            
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
              className="w-full max-w-xl mt-4 py-5 font-black text-xl rounded-2xl shadow-2xl transition-all active:scale-95 ring-8 ring-white disabled:opacity-50"
            />
            
            {error && <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-bold max-w-xl mx-auto shadow-lg">{error}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default JewelleryTryOn;