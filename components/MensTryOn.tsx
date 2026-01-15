import React, { useState, useMemo, useEffect } from 'react';
import {
  ImageFile,
  MEN_CATEGORY_CONFIG,
  BACKGROUND_OPTIONS,
  POSE_OPTIONS,
  EXPRESSION_OPTIONS,
  VIEW_OPTIONS,
  TIME_OPTIONS,
  ASPECT_RATIO_OPTIONS,
  CAMERA_OPTIONS,
  IMAGE_QUALITY_OPTIONS,
  ProductUploadType,
  User,
  Page
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

interface MensTryOnProps {
  user: User;
  onNavigate: (page: Page) => void;
  onCreditsUpdate: (newCredits: number) => void;
}

const MensTryOn: React.FC<MensTryOnProps> = ({ user, onNavigate, onCreditsUpdate }) => {
  const [uploadType, setUploadType] = useState<ProductUploadType>('parts');
  const [fullProductImage, setFullProductImage] = useState<ImageFile | null>(null);
  const [productImages, setProductImages] = useState<(ImageFile | null)[]>(new Array(MEN_CATEGORY_CONFIG.length).fill(null));

  const [useCustomModel, setUseCustomModel] = useState<boolean>(false);
  const [customModelImage, setCustomModelImage] = useState<ImageFile | null>(null);

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

  const handleProductImageUpload = (index: number) => (imageFile: ImageFile) => {
    setProductImages(prev => {
      const newImages = [...prev];
      newImages[index] = imageFile;
      return newImages;
    });
  };

  const handleProductImageRemove = (index: number) => () => {
    setProductImages(prev => {
      const newImages = [...prev];
      newImages[index] = null;
      return newImages;
    });
  };

  const isGenerationDisabled = useMemo(() => {
    if (isLoading) return true;
    if (useCustomModel && !customModelImage) return true;
    if (uploadType === 'full') return !fullProductImage;
    return MEN_CATEGORY_CONFIG.some((config, index) => !config.optional && !productImages[index]);
  }, [isLoading, productImages, uploadType, fullProductImage, useCustomModel, customModelImage]);

  const handleGenerate = async () => {
    // CRITICAL: Final validation before generation
    const validation = validateGenerationAttempt(user, config.quality.id);
    if (!validation.allowed) {
      setAccessWarning(validation.error || 'Cannot generate images');
      return;
    }

    const requiredImages = uploadType === 'full'
      ? [fullProductImage!.file]
      : productImages.map(img => img?.file).filter((file): file is File => file !== undefined);

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
        'men',
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
        config.previewOptions
      );

      setGenStage(GenerationStage.FINALIZING);
      const imageUrl = `data:image/png;base64,${response.image}`;
      await saveImageToHistory(imageUrl, "Men's Apparel", response.creditsUsed, useCustomModel && customModelImage ? customModelImage.file : undefined);
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
        <p className="text-gray-500 text-sm mt-1">Realistic garment synthesis with biometric fidelity.</p>
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
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 max-w-xl mx-auto">
            <h3 className="text-[10px] font-black text-gray-400 mb-2 text-center uppercase tracking-[0.2em]">Identify Source</h3>
            <div className="flex justify-center gap-2 mb-2">
              <button onClick={() => setUseCustomModel(false)} className={`flex-1 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${!useCustomModel ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'}`}>Studio Model</button>
              <button onClick={() => setUseCustomModel(true)} className={`flex-1 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${useCustomModel ? 'bg-primary text-white border-primary shadow-md' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'}`}>Custom Photo</button>
            </div>
            {useCustomModel && (
              <div className="mt-2 max-w-xs mx-auto animate-in fade-in slide-in-from-top-2 duration-300">
                <ImageUploadCard title="Identity Reference" isOptional={false} onImageUpload={setCustomModelImage} onImageRemove={() => setCustomModelImage(null)} imageFile={customModelImage} enableCropping={false} dropzoneClassName="h-20" />
              </div>
            )}
          </div>

          <div className="bg-white p-5 rounded-xl shadow-md border border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col">
              <h3 className="font-bold text-gray-800">Product Upload Mode</h3>
              <p className="text-xs text-gray-500">Upload parts or a single full product photo.</p>
            </div>
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
              <button onClick={() => setUploadType('parts')} className={`px-4 py-2 text-xs font-black rounded-md transition-all ${uploadType === 'parts' ? 'bg-secondary text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>PARTS</button>
              <button onClick={() => setUploadType('full')} className={`px-4 py-2 text-xs font-black rounded-md transition-all ${uploadType === 'full' ? 'bg-secondary text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>SINGLE PRODUCT</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {uploadType === 'full' ? (
              <div className="md:col-span-2">
                <ImageUploadCard title="Full Product Photo" isOptional={false} onImageUpload={setFullProductImage} onImageRemove={() => setFullProductImage(null)} imageFile={fullProductImage} />
              </div>
            ) : (
              MEN_CATEGORY_CONFIG.map((config, index) => (
                <ImageUploadCard key={config.part} title={`${config.part} Photo`} isOptional={config.optional} onImageUpload={handleProductImageUpload(index)} onImageRemove={handleProductImageRemove(index)} imageFile={productImages[index]} />
              ))
            )}
          </div>

          <ModelCustomizer
          user={user}
            poseOptions={POSE_OPTIONS} selectedPose={config.pose} onPoseChange={(p) => updateConfig({ pose: p })}
            expressionOptions={EXPRESSION_OPTIONS} selectedExpression={config.expression} onExpressionChange={(e) => updateConfig({ expression: e })}
            viewOptions={VIEW_OPTIONS} selectedView={config.view} onViewChange={(v) => updateConfig({ view: v })}
            timeOptions={TIME_OPTIONS} selectedTime={config.time} onTimeChange={(t) => updateConfig({ time: t })}
            aspectRatioOptions={ASPECT_RATIO_OPTIONS} selectedAspectRatio={config.aspectRatio} onAspectRatioChange={(a) => updateConfig({ aspectRatio: a })}
            cameraOptions={CAMERA_OPTIONS} selectedCamera={config.camera} onCameraChange={(c) => updateConfig({ camera: c })}
            qualityOptions={IMAGE_QUALITY_OPTIONS} selectedQuality={config.quality} onQualityChange={(q) => updateConfig({ quality: q })}
            previewOptions={config.previewOptions} onPreviewOptionsChange={(o) => updateConfig({ previewOptions: o })}
            onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo} presets={presets} onSavePreset={savePreset} onLoadPreset={loadPreset} onDeletePreset={deletePreset} onRenamePreset={renamePreset} onClearAllPresets={clearAllPresets}
          />

          <BackgroundSelector options={BACKGROUND_OPTIONS} selectedBackground={config.background} onBackgroundChange={(b) => updateConfig({ background: b })} onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo} />

          <div className="mt-8 text-center sticky bottom-6 z-20">
            <TokenEstimator imageFiles={[...(uploadType === 'full' ? [fullProductImage?.file] : productImages.map(i => i?.file)), customModelImage?.file]} quality={config.quality} />
            
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
            />
            
            {error && <p className="text-red-500 mt-4 font-bold">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default MensTryOn;