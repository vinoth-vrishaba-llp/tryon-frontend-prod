import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ImageFile,
  ProductUploadType,
  MEN_CATEGORY_CONFIG,
  WOMEN_CATEGORY_CONFIG,
  KIDS_CATEGORY_CONFIG,
  MenProductCategory,
  WomenProductCategory,
  KidsProductCategory,
  JewelleryProductCategory,
  KidsGender,
  KidsAgeGroup,
  SareeAccessoriesState,
  SkinToneOption,
  AttireOption,
  SKIN_TONE_OPTIONS,
  ATTIRE_OPTIONS,
  BACKGROUND_OPTIONS,
  BACKGROUND_OPTIONS_WOMEN,
  BACKGROUND_OPTIONS_MEN,
  BACKGROUND_OPTIONS_KIDS,
  BACKGROUND_OPTIONS_JEWELLERY,
  CAMERA_OPTIONS,
  VIEW_OPTIONS,
  User,
  Page
} from '../types';
import StepWizard, { WizardStep } from './StepWizard';
import ProductStep, { TryOnCategory } from './steps/ProductStep';
import ModelStep from './steps/ModelStep';
import EnvironmentStep from './steps/EnvironmentStep';
import TryOnResult from './TryOnResult';
import { GenerationProgress, GenerationStage } from './HomePage';
import { useConfig } from '../hooks/useConfig';
import { generateTryOnImage } from '../services/geminiService';
import { saveImageToHistory } from '../historyManager';
import { clearAuth } from '../services/apiClient';
import { validateGenerationAttempt, hasActivePaidPlan, hasRemainingCredits } from '../services/authService';
import {
  getPresetsByCategory,
  createPreset,
  deletePreset as deletePresetApi,
  renamePreset as renamePresetApi,
  PresetData
} from '../services/presetService';
import { getRecommendedPresets, RecommendedPreset, createRecommendedPreset } from '../services/recommendedPresetService';
import {
  POSE_OPTIONS,
  POSE_OPTIONS_WOMEN,
  POSE_OPTIONS_MEN,
  POSE_OPTIONS_KIDS,
  POSE_OPTIONS_JEWELLERY,
  EXPRESSION_OPTIONS,
  EXPRESSION_OPTIONS_WOMEN,
  EXPRESSION_OPTIONS_MEN,
  EXPRESSION_OPTIONS_KIDS,
  EXPRESSION_OPTIONS_JEWELLERY,
  VIEW_OPTIONS_WOMEN,
  VIEW_OPTIONS_MEN,
  VIEW_OPTIONS_KIDS,
  VIEW_OPTIONS_JEWELLERY,
  TIME_OPTIONS,
  ASPECT_RATIO_OPTIONS,
  IMAGE_QUALITY_OPTIONS,
  HairStyleOption,
  HAIR_STYLE_OPTIONS_WOMEN,
  HAIR_STYLE_OPTIONS_MEN,
  HAIR_STYLE_OPTIONS_KIDS_BOY,
  HAIR_STYLE_OPTIONS_KIDS_GIRL,
  FIT_TYPE_OPTIONS,
  BODY_TYPE_OPTIONS_MEN,
  BODY_TYPE_OPTIONS_WOMEN,
  BottomTypeOption,
  BOTTOM_TYPE_OPTIONS_MEN,
  BOTTOM_TYPE_OPTIONS_WOMEN,
  BOTTOM_TYPE_OPTIONS_KIDS
} from '../types';

interface TryOnWizardProps {
  user: User;
  category: TryOnCategory;
  onNavigate: (page: Page) => void;
  onCreditsUpdate: (newCredits: number) => void;
}

const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'product',
    title: 'Upload Your Product',
    shortTitle: 'Product',
    description: 'Select model type and upload product images'
  },
  {
    id: 'model',
    title: 'Customize Model',
    shortTitle: 'Model',
    description: 'Choose pose, expression, and view settings'
  },
  {
    id: 'environment',
    title: 'Set Environment & Generate',
    shortTitle: 'Generate',
    description: 'Configure lighting, background, and quality settings'
  }
];

const getCategoryTitle = (category: TryOnCategory): string => {
  switch (category) {
    case 'men': return "Men's Studio";
    case 'women': return "Women's Boutique";
    case 'kids': return "Kids Virtual Try-On";
    case 'jewellery': return "Jewellery Boutique";
  }
};

const getCategorySubtitle = (category: TryOnCategory): string => {
  switch (category) {
    case 'men': return "Realistic garment synthesis with biometric fidelity.";
    case 'women': return "Professional studio renders with personalized identity.";
    case 'kids': return "Realistic style visualization for children.";
    case 'jewellery': return "Hyper-Realistic Virtual Adornment";
  }
};

const getCategoryHistoryLabel = (category: TryOnCategory): string => {
  switch (category) {
    case 'men': return "Men's Apparel";
    case 'women': return "Women's Apparel";
    case 'kids': return "Kids' Apparel";
    case 'jewellery': return "Jewellery";
  }
};

const TryOnWizard: React.FC<TryOnWizardProps> = ({
  user,
  category,
  onNavigate,
  onCreditsUpdate
}) => {
  // Wizard state
  const [currentStep, setCurrentStep] = useState(0);

  // Model selection
  const [useCustomModel, setUseCustomModel] = useState(false);
  const [customModelImage, setCustomModelImage] = useState<ImageFile | null>(null);

  // Upload mode
  const [uploadType, setUploadType] = useState<ProductUploadType>('parts');

  // Product images
  const [fullProductImage, setFullProductImage] = useState<ImageFile | null>(null);

  // Men's state
  const [menCategory, setMenCategory] = useState<MenProductCategory>('casual');
  const [menProductImages, setMenProductImages] = useState<Record<MenProductCategory, (ImageFile | null)[]>>({
    casual: [null, null],
    traditional: [null, null],
    streetwear: [null, null, null],
    formals: [null, null, null],
  });

  // Women's state
  const [womenCategory, setWomenCategory] = useState<WomenProductCategory>('saree');
  const [womenProductImages, setWomenProductImages] = useState<Record<WomenProductCategory, (ImageFile | null)[]>>({
    saree: [null, null, null],
    chudithar: [null, null, null],
    western: [null, null],
    traditional: [null, null, null],
    streetwear: [null, null, null],
    formals: [null, null, null],
  });
  const [accessories, setAccessories] = useState<SareeAccessoriesState>({
    jasmine: true,
    bangles: true,
    necklace: true
  });

  // Kids state
  const [kidsCategory, setKidsCategory] = useState<KidsProductCategory>('western');
  const [kidsProductImages, setKidsProductImages] = useState<Record<KidsProductCategory, (ImageFile | null)[]>>({
    western: new Array(KIDS_CATEGORY_CONFIG.western.length).fill(null),
    traditional: new Array(KIDS_CATEGORY_CONFIG.traditional.length).fill(null)
  });
  const [gender, setGender] = useState<KidsGender>('boy');
  const [ageGroup, setAgeGroup] = useState<KidsAgeGroup>('7-9');

  // Jewellery state
  const [jewelleryCategory, setJewelleryCategory] = useState<JewelleryProductCategory>('necklace');
  const [selectedSkinTone, setSelectedSkinTone] = useState<SkinToneOption>(SKIN_TONE_OPTIONS[1]);
  const [selectedAttire, setSelectedAttire] = useState<AttireOption>(ATTIRE_OPTIONS[0]);

  // Hair style state
  const [selectedHairStyle, setSelectedHairStyle] = useState<HairStyleOption>(HAIR_STYLE_OPTIONS_WOMEN[0]);

  // Bottom type state
  const [selectedBottomType, setSelectedBottomType] = useState<BottomTypeOption | null>(null);

  // Generation state
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [genStage, setGenStage] = useState<GenerationStage>(GenerationStage.INITIALIZING);
  const [error, setError] = useState<string | null>(null);
  const [accessWarning, setAccessWarning] = useState<string | null>(null);

  // AbortController for cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  // Preset state
  const [presets, setPresets] = useState<PresetData[]>([]);
  const [recommendedPresets, setRecommendedPresets] = useState<RecommendedPreset[]>([]);
  const [presetsLoading, setPresetsLoading] = useState(false);
  const [currentPresetName, setCurrentPresetName] = useState<string | undefined>(undefined);

  // Recommended preset modal state (admin only)
  const [showRecommendedPresetModal, setShowRecommendedPresetModal] = useState(false);
  const [recommendedPresetName, setRecommendedPresetName] = useState('');
  const [recommendedPresetDescription, setRecommendedPresetDescription] = useState('');
  const [savingRecommendedPreset, setSavingRecommendedPreset] = useState(false);
  const [recommendedPresetError, setRecommendedPresetError] = useState<string | null>(null);

  // Config from hook
  const { config, updateConfig } = useConfig();

  // Set jewellery defaults
  useEffect(() => {
    if (category === 'jewellery') {
      updateConfig({
        camera: CAMERA_OPTIONS.find(c => c.id === 'macro') || CAMERA_OPTIONS[1],
        view: VIEW_OPTIONS.find(v => v.id === 'close-up') || VIEW_OPTIONS[0],
        background: BACKGROUND_OPTIONS.find(b => b.id === 'temple-corridor') || BACKGROUND_OPTIONS[0]
      });
    }
  }, [category]);

  // Check access on mount and when quality changes
  useEffect(() => {
    const validation = validateGenerationAttempt(user, config.quality.id);
    if (!validation.allowed) {
      setAccessWarning(validation.error || 'Cannot generate images');
    } else {
      setAccessWarning(null);
    }
  }, [user, config.quality.id, user.paymentStatus, user.planType, user.tokenBalance]);

  // Fetch presets and recommended presets on mount
  useEffect(() => {
    const fetchPresets = async () => {
      setPresetsLoading(true);
      try {
        // Fetch both user presets and recommended presets in parallel
        const [categoryPresets, recommended] = await Promise.all([
          getPresetsByCategory(category),
          getRecommendedPresets(category)
        ]);
        setPresets(categoryPresets);
        setRecommendedPresets(recommended);
      } catch (error) {
        console.error('Failed to fetch presets:', error);
      } finally {
        setPresetsLoading(false);
      }
    };
    fetchPresets();
  }, [category]);

  // Save current settings as a preset
  const handleSavePreset = async (name: string) => {
    try {
      const presetData: Omit<PresetData, 'id' | 'createdAt' | 'updatedAt'> = {
        name,
        category,
        // Step 1 settings
        useCustomModel,
        uploadType,
        subCategory: category === 'men' ? menCategory :
                     category === 'women' ? womenCategory :
                     category === 'kids' ? kidsCategory :
                     category === 'jewellery' ? jewelleryCategory : '',
        gender: category === 'kids' ? gender : undefined,
        ageGroup: category === 'kids' ? ageGroup : undefined,
        accessories: category === 'women' && womenCategory === 'saree' ? accessories : undefined,
        skinToneId: category === 'jewellery' ? selectedSkinTone.id : undefined,
        attireId: category === 'jewellery' ? selectedAttire.id : undefined,
        hairStyleId: (category === 'men' || category === 'women') ? config.hairStyle.id : undefined,
        fitTypeId: (category === 'men' || category === 'women') ? config.fitType.id : undefined,
        bodyTypeId: (category === 'men' || category === 'women') ? config.bodyType.id : undefined,
        // Step 2 settings
        poseId: config.pose.id,
        expressionId: config.expression.id,
        viewId: config.view.id,
        aspectRatioId: config.aspectRatio.id,
        previewOptions: config.previewOptions,
        // Step 3 settings
        timeId: config.time.id,
        cameraId: config.camera.id,
        qualityId: config.quality.id,
        backgroundId: config.background.id
      };

      const newPreset = await createPreset(presetData);
      setPresets(prev => [...prev, newPreset]);
      setCurrentPresetName(newPreset.name);
      return newPreset;
    } catch (error) {
      console.error('Failed to save preset:', error);
      throw error;
    }
  };

  // Load a preset
  const handleLoadPreset = (preset: PresetData) => {
    // Track which preset is loaded
    setCurrentPresetName(preset.name);

    // Step 1 settings
    setUseCustomModel(preset.useCustomModel);
    setUploadType(preset.uploadType as ProductUploadType);

    if (category === 'men' && preset.subCategory) {
      setMenCategory(preset.subCategory as MenProductCategory);
    }
    if (category === 'women' && preset.subCategory) {
      setWomenCategory(preset.subCategory as WomenProductCategory);
    }
    if (category === 'kids') {
      if (preset.subCategory) setKidsCategory(preset.subCategory as KidsProductCategory);
      if (preset.gender) setGender(preset.gender as KidsGender);
      if (preset.ageGroup) setAgeGroup(preset.ageGroup as KidsAgeGroup);
    }
    if (category === 'jewellery') {
      if (preset.subCategory) setJewelleryCategory(preset.subCategory as JewelleryProductCategory);
      if (preset.skinToneId) {
        const skinTone = SKIN_TONE_OPTIONS.find(s => s.id === preset.skinToneId);
        if (skinTone) setSelectedSkinTone(skinTone);
      }
      if (preset.attireId) {
        const attire = ATTIRE_OPTIONS.find(a => a.id === preset.attireId);
        if (attire) setSelectedAttire(attire);
      }
    }
    if (preset.accessories) {
      setAccessories(preset.accessories);
    }

    // Step 2 & 3 settings via config
    const configUpdates: any = {};

    // Load hairStyle, fitType, and bodyType for men/women
    if (preset.hairStyleId) {
      const hairStyleOptions = category === 'men' ? HAIR_STYLE_OPTIONS_MEN :
                               category === 'women' ? HAIR_STYLE_OPTIONS_WOMEN : null;
      if (hairStyleOptions) {
        const hairStyle = hairStyleOptions.find(h => h.id === preset.hairStyleId);
        if (hairStyle) configUpdates.hairStyle = hairStyle;
      }
    }
    if (preset.fitTypeId) {
      const fitType = FIT_TYPE_OPTIONS.find(f => f.id === preset.fitTypeId);
      if (fitType) configUpdates.fitType = fitType;
    }
    if (preset.bodyTypeId) {
      const bodyTypeOptions = category === 'men' ? BODY_TYPE_OPTIONS_MEN :
                              category === 'women' ? BODY_TYPE_OPTIONS_WOMEN : null;
      if (bodyTypeOptions) {
        const bodyType = bodyTypeOptions.find(b => b.id === preset.bodyTypeId);
        if (bodyType) configUpdates.bodyType = bodyType;
      }
    }

    const pose = POSE_OPTIONS.find(p => p.id === preset.poseId);
    if (pose) configUpdates.pose = pose;

    const expression = EXPRESSION_OPTIONS.find(e => e.id === preset.expressionId);
    if (expression) configUpdates.expression = expression;

    const view = VIEW_OPTIONS.find(v => v.id === preset.viewId);
    if (view) configUpdates.view = view;

    const aspectRatio = ASPECT_RATIO_OPTIONS.find(a => a.id === preset.aspectRatioId);
    if (aspectRatio) configUpdates.aspectRatio = aspectRatio;

    const time = TIME_OPTIONS.find(t => t.id === preset.timeId);
    if (time) configUpdates.time = time;

    const camera = CAMERA_OPTIONS.find(c => c.id === preset.cameraId);
    if (camera) configUpdates.camera = camera;

    const quality = IMAGE_QUALITY_OPTIONS.find(q => q.id === preset.qualityId);
    if (quality) configUpdates.quality = quality;

    const background = BACKGROUND_OPTIONS.find(b => b.id === preset.backgroundId);
    if (background) configUpdates.background = background;

    if (preset.previewOptions) {
      configUpdates.previewOptions = preset.previewOptions;
    }

    updateConfig(configUpdates);
  };

  // Delete a preset
  const handleDeletePreset = async (presetId: string) => {
    try {
      await deletePresetApi(presetId);
      setPresets(prev => prev.filter(p => p.id !== presetId));
    } catch (error) {
      console.error('Failed to delete preset:', error);
      throw error;
    }
  };

  // Rename a preset
  const handleRenamePreset = async (presetId: string, newName: string) => {
    try {
      const updated = await renamePresetApi(presetId, newName);
      setPresets(prev => prev.map(p => p.id === presetId ? updated : p));
    } catch (error) {
      console.error('Failed to rename preset:', error);
      throw error;
    }
  };

  // Save as recommended preset (admin only)
  const handleSaveAsRecommendedPreset = async () => {
    if (!recommendedPresetName.trim()) {
      setRecommendedPresetError('Please enter a preset name');
      return;
    }

    try {
      setSavingRecommendedPreset(true);
      setRecommendedPresetError(null);

      // Build preset data from current configuration
      const presetData: PresetData = {
        name: recommendedPresetName,
        category,
        useCustomModel: false, // Recommended presets always use studio model
        uploadType,
        subCategory: category === 'men' ? menCategory :
                     category === 'women' ? womenCategory :
                     category === 'kids' ? kidsCategory :
                     category === 'jewellery' ? jewelleryCategory : '',
        gender: category === 'kids' ? gender : undefined,
        ageGroup: category === 'kids' ? ageGroup : undefined,
        accessories: category === 'women' && womenCategory === 'saree' ? accessories : undefined,
        skinToneId: category === 'jewellery' ? selectedSkinTone.id : undefined,
        attireId: category === 'jewellery' ? selectedAttire.id : undefined,
        hairStyleId: category !== 'jewellery' ? selectedHairStyle.id : undefined,
        fitTypeId: (category === 'men' || category === 'women') ? config.fitType.id : undefined,
        bodyTypeId: (category === 'men' || category === 'women') ? config.bodyType.id : undefined,
        poseId: config.pose.id,
        expressionId: config.expression.id,
        viewId: config.view.id,
        aspectRatioId: config.aspectRatio.id,
        previewOptions: config.previewOptions,
        timeId: config.time.id,
        cameraId: config.camera.id,
        qualityId: config.quality.id,
        backgroundId: config.background.id
      };

      // Get subcategory for the recommended preset
      const subcategory = category === 'men' ? menCategory :
                          category === 'women' ? womenCategory :
                          category === 'kids' ? kidsCategory :
                          category === 'jewellery' ? jewelleryCategory : '';

      await createRecommendedPreset({
        name: recommendedPresetName,
        description: recommendedPresetDescription,
        category,
        subcategory,
        preset_data: presetData,
        is_active: true,
        display_order: 0 // Will be set to appropriate value by admin later
      });

      // Success - close modal and refresh
      setShowRecommendedPresetModal(false);
      setRecommendedPresetName('');
      setRecommendedPresetDescription('');

      // Refresh recommended presets list
      const recommended = await getRecommendedPresets(category);
      setRecommendedPresets(recommended);

      alert('Recommended preset created successfully!');
    } catch (error: any) {
      console.error('Failed to save recommended preset:', error);
      setRecommendedPresetError(error.message || 'Failed to save recommended preset');
    } finally {
      setSavingRecommendedPreset(false);
    }
  };

  // Get current product images based on category
  const getCurrentProductImages = (): (ImageFile | null)[] => {
    switch (category) {
      case 'men':
        return menProductImages[menCategory];
      case 'women':
        return womenProductImages[womenCategory];
      case 'kids':
        return kidsProductImages[kidsCategory];
      case 'jewellery':
        return fullProductImage ? [fullProductImage] : [];
    }
  };

  // Handle product image upload
  const handleProductImageUpload = (index: number) => (imageFile: ImageFile) => {
    switch (category) {
      case 'men':
        setMenProductImages(prev => ({
          ...prev,
          [menCategory]: prev[menCategory].map((img, i) => i === index ? imageFile : img)
        }));
        break;
      case 'women':
        setWomenProductImages(prev => ({
          ...prev,
          [womenCategory]: prev[womenCategory].map((img, i) => i === index ? imageFile : img)
        }));
        break;
      case 'kids':
        setKidsProductImages(prev => ({
          ...prev,
          [kidsCategory]: prev[kidsCategory].map((img, i) => i === index ? imageFile : img)
        }));
        break;
    }
  };

  // Handle product image removal
  const handleProductImageRemove = (index: number) => () => {
    switch (category) {
      case 'men':
        setMenProductImages(prev => ({
          ...prev,
          [menCategory]: prev[menCategory].map((img, i) => i === index ? null : img)
        }));
        break;
      case 'women':
        setWomenProductImages(prev => ({
          ...prev,
          [womenCategory]: prev[womenCategory].map((img, i) => i === index ? null : img)
        }));
        break;
      case 'kids':
        setKidsProductImages(prev => ({
          ...prev,
          [kidsCategory]: prev[kidsCategory].map((img, i) => i === index ? null : img)
        }));
        break;
    }
  };

  // Toggle accessory (women saree)
  const toggleAccessory = (key: keyof SareeAccessoriesState) => {
    setAccessories(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Get category config for validation
  const getCategoryConfig = () => {
    switch (category) {
      case 'men':
        return MEN_CATEGORY_CONFIG[menCategory];
      case 'women':
        return WOMEN_CATEGORY_CONFIG[womenCategory];
      case 'kids':
        return KIDS_CATEGORY_CONFIG[kidsCategory];
      case 'jewellery':
        return [];
    }
  };

  // Get category-specific options
  const getCategoryOptions = () => {
    switch (category) {
      case 'women':
        return {
          poseOptions: POSE_OPTIONS_WOMEN,
          expressionOptions: EXPRESSION_OPTIONS_WOMEN,
          viewOptions: VIEW_OPTIONS_WOMEN,
          hairStyleOptions: HAIR_STYLE_OPTIONS_WOMEN
        };
      case 'men':
        return {
          poseOptions: POSE_OPTIONS_MEN,
          expressionOptions: EXPRESSION_OPTIONS_MEN,
          viewOptions: VIEW_OPTIONS_MEN,
          hairStyleOptions: HAIR_STYLE_OPTIONS_MEN
        };
      case 'kids':
        return {
          poseOptions: POSE_OPTIONS_KIDS,
          expressionOptions: EXPRESSION_OPTIONS_KIDS,
          viewOptions: VIEW_OPTIONS_KIDS,
          hairStyleOptions: gender === 'boy' ? HAIR_STYLE_OPTIONS_KIDS_BOY : HAIR_STYLE_OPTIONS_KIDS_GIRL
        };
      case 'jewellery':
        return {
          poseOptions: POSE_OPTIONS_JEWELLERY,
          expressionOptions: EXPRESSION_OPTIONS_JEWELLERY,
          viewOptions: VIEW_OPTIONS_JEWELLERY,
          hairStyleOptions: [] // No hair style for jewellery
        };
    }
  };

  const categoryOptions = getCategoryOptions();

  // Reset hair style when category or gender changes
  useEffect(() => {
    const options = getCategoryOptions();
    if (options.hairStyleOptions.length > 0) {
      setSelectedHairStyle(options.hairStyleOptions[0]);
    }
  }, [category, gender]);

  // Reset bottom type when category or upload type changes
  useEffect(() => {
    setSelectedBottomType(null);
  }, [category, uploadType, menCategory, womenCategory, kidsCategory]);

  // Helper to check if bottom selector should be shown
  const shouldShowBottomSelector = useMemo(() => {
    if (category === 'jewellery' || uploadType !== 'parts') return false;

    const productImages = getCurrentProductImages();
    const categoryConfig = getCategoryConfig();

    // Find the bottom slot index
    const bottomSlotIndex = categoryConfig.findIndex(
      (config) => {
        const partLower = config.part.toLowerCase();
        return partLower.includes('bottom') ||
               partLower.includes('trouser') ||
               partLower.includes('pant') ||
               partLower.includes('jeans') ||
               partLower.includes('dhoti') ||
               partLower.includes('pajama') ||
               partLower.includes('skirt') ||
               partLower.includes('legging') ||
               partLower.includes('palazzo') ||
               partLower.includes('shorts');
      }
    );

    // Show selector if bottom slot exists and is empty
    return bottomSlotIndex !== -1 && !productImages[bottomSlotIndex];
  }, [category, uploadType, menProductImages, womenProductImages, kidsProductImages, menCategory, womenCategory, kidsCategory]);

  // Check if step 1 (product) is complete
  const isProductStepComplete = useMemo(() => {
    if (useCustomModel && !customModelImage) return false;

    if (category === 'jewellery') {
      return !!fullProductImage;
    }

    if (uploadType === 'full') {
      return !!fullProductImage;
    }

    const productImages = getCurrentProductImages();
    const categoryConfig = getCategoryConfig();

    // Find the bottom slot index
    const bottomSlotIndex = categoryConfig.findIndex(
      (config) => {
        const partLower = config.part.toLowerCase();
        return partLower.includes('bottom') ||
               partLower.includes('trouser') ||
               partLower.includes('pant') ||
               partLower.includes('jeans') ||
               partLower.includes('dhoti') ||
               partLower.includes('pajama') ||
               partLower.includes('skirt') ||
               partLower.includes('legging') ||
               partLower.includes('palazzo') ||
               partLower.includes('shorts');
      }
    );

    // Check if all required parts are uploaded (excluding bottom if selector is shown)
    const hasAllRequired = !categoryConfig.some((config, index) => {
      // If this is the bottom slot and selector is shown, skip this check
      if (index === bottomSlotIndex && shouldShowBottomSelector) {
        return false;
      }
      // Otherwise, check if required part is missing
      return !config.optional && !productImages[index];
    });

    // If bottom selector should be shown and no bottom type selected, incomplete
    if (shouldShowBottomSelector && !selectedBottomType) return false;

    return hasAllRequired;
  }, [
    useCustomModel, customModelImage, category, uploadType, fullProductImage,
    menProductImages, womenProductImages, kidsProductImages, menCategory, womenCategory, kidsCategory,
    shouldShowBottomSelector, selectedBottomType
  ]);

  // Check if generation is disabled
  const isGenerationDisabled = useMemo(() => {
    if (isLoading) return true;
    return !isProductStepComplete;
  }, [isLoading, isProductStepComplete]);

  // Get all image files for token estimation
  const getAllImageFiles = useMemo(() => {
    const files: (File | undefined)[] = [];

    if (category === 'jewellery') {
      files.push(fullProductImage?.file);
    } else if (uploadType === 'full') {
      files.push(fullProductImage?.file);
    } else {
      const productImages = getCurrentProductImages();
      productImages.forEach(img => files.push(img?.file));
    }

    if (useCustomModel && customModelImage) {
      files.push(customModelImage.file);
    }

    return files;
  }, [category, uploadType, fullProductImage, menProductImages, womenProductImages, kidsProductImages, useCustomModel, customModelImage, menCategory, womenCategory, kidsCategory]);

  // Handle generation
  const handleGenerate = async () => {
    const validation = validateGenerationAttempt(user, config.quality.id);
    if (!validation.allowed) {
      setAccessWarning(validation.error || 'Cannot generate images');
      return;
    }

    let requiredImages: File[] = [];

    if (category === 'jewellery') {
      if (fullProductImage) {
        requiredImages = [fullProductImage.file];
      }
    } else if (uploadType === 'full') {
      if (fullProductImage) {
        requiredImages = [fullProductImage.file];
      }
    } else {
      const productImages = getCurrentProductImages();
      requiredImages = productImages
        .map(img => img?.file)
        .filter((file): file is File => file !== undefined);
    }

    if (requiredImages.length === 0) return;

    // Create new AbortController for this generation
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setGenStage(GenerationStage.INITIALIZING);
    setError(null);
    setAccessWarning(null);

    try {
      setGenStage(GenerationStage.ANALYZING);

      const subCategory = category === 'men' ? menCategory :
                          category === 'women' ? womenCategory :
                          category === 'kids' ? kidsCategory :
                          category === 'jewellery' ? jewelleryCategory : category;

      const response = await generateTryOnImage(
        requiredImages,
        category,
        subCategory,
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
        category === 'kids' ? { gender, ageGroup } : undefined,
        config.previewOptions,
        category === 'women' && womenCategory === 'saree' ? accessories : undefined,
        category === 'jewellery' ? selectedSkinTone : undefined,
        category === 'jewellery' ? selectedAttire : undefined,
        category !== 'jewellery' ? selectedHairStyle : undefined,
        category === 'men' || category === 'women' ? config.fitType : undefined,
        category === 'men' || category === 'women' ? config.bodyType : undefined,
        selectedBottomType,
        abortControllerRef.current.signal
      );

      setGenStage(GenerationStage.FINALIZING);
      const mimeType = response.mimeType || 'image/png';
      const imageUrl = `data:${mimeType};base64,${response.image}`;
      await saveImageToHistory(
        imageUrl,
        getCategoryHistoryLabel(category),
        response.creditsUsed,
        useCustomModel && customModelImage ? customModelImage.file : undefined
      );
      setGeneratedImage(imageUrl);

      if (response.creditsRemaining !== undefined) {
        onCreditsUpdate(response.creditsRemaining);
      }
    } catch (e: any) {
      // Handle cancellation - no error, no credits consumed
      if (e.cancelled || e.message === 'GENERATION_CANCELLED') {
        setError(null);
        setAccessWarning(null);
        return;
      }

      if (e.message === 'SESSION_EXPIRED') {
        clearAuth();
        window.location.href = '/';
        return;
      }

      if (e.message?.includes('subscription') || e.message?.includes('plan') ||
          e.message?.includes('quality') || e.message?.includes('upgrade') ||
          e.message?.includes('credit') || e.message?.includes('Insufficient')) {
        setAccessWarning(e.message);
        return;
      }

      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Handle cancel generation
  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
    setError(null);
    setAccessWarning(null);
  };

  // Handle reset after generation
  const handleReset = () => {
    setGeneratedImage(null);
    setIsLoading(false);
    setError(null);
    setAccessWarning(null);
    setCurrentStep(0);
  };

  // Keyboard shortcut for generation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (currentStep === 2 && !isGenerationDisabled) {
          handleGenerate();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, isGenerationDisabled]);

  // Show result page if generated
  if (generatedImage && !isLoading) {
    // Get product images for comparison
    const productImageUrls = uploadType === 'parts'
      ? getCurrentProductImages()
          .filter((img): img is ImageFile => img !== null)
          .map(img => img.previewUrl)
      : fullProductImage
      ? [fullProductImage.previewUrl]
      : [];

    // Get current category based on section
    const getCurrentCategory = (): string => {
      switch (category) {
        case 'men':
          return menCategory;
        case 'women':
          return womenCategory;
        case 'kids':
          return kidsCategory;
        case 'jewellery':
          return jewelleryCategory;
        default:
          return '';
      }
    };

    return (
      <TryOnResult
        imageUrl={generatedImage}
        originalImage={useCustomModel && customModelImage ? customModelImage.previewUrl : undefined}
        productImages={productImageUrls.length > 0 ? productImageUrls : undefined}
        section={category}
        category={getCurrentCategory()}
        qualityUsed={config.quality.id}
        onReset={handleReset}
        onRetry={handleGenerate}
        isLoading={isLoading}
      />
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-primary">{getCategoryTitle(category)}</h2>
          <p className="text-gray-500 text-sm mt-1">{getCategorySubtitle(category)}</p>
        </div>
        <div className="mt-8 flex flex-col items-center gap-6">
          <GenerationProgress stage={genStage} />

          {/* Cancel Generation Button */}
          <button
            onClick={handleCancelGeneration}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all border border-gray-300 shadow-sm hover:shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Cancel Generation
          </button>
          <p className="text-xs text-gray-500">Cancellation will not consume any credits</p>
        </div>
      </div>
    );
  }

  // Determine step can proceed
  const canProceed = currentStep === 0 ? isProductStepComplete : true;

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <ProductStep
            category={category}
            useCustomModel={useCustomModel}
            setUseCustomModel={setUseCustomModel}
            customModelImage={customModelImage}
            setCustomModelImage={setCustomModelImage}
            uploadType={uploadType}
            setUploadType={setUploadType}
            fullProductImage={fullProductImage}
            setFullProductImage={setFullProductImage}
            productImages={getCurrentProductImages()}
            handleProductImageUpload={handleProductImageUpload}
            handleProductImageRemove={handleProductImageRemove}
            // Men specific
            menCategory={category === 'men' ? menCategory : undefined}
            setMenCategory={category === 'men' ? setMenCategory : undefined}
            // Women specific
            womenCategory={category === 'women' ? womenCategory : undefined}
            setWomenCategory={category === 'women' ? setWomenCategory : undefined}
            accessories={category === 'women' ? accessories : undefined}
            toggleAccessory={category === 'women' ? toggleAccessory : undefined}
            // Kids specific
            kidsCategory={category === 'kids' ? kidsCategory : undefined}
            setKidsCategory={category === 'kids' ? setKidsCategory : undefined}
            gender={category === 'kids' ? gender : undefined}
            setGender={category === 'kids' ? setGender : undefined}
            ageGroup={category === 'kids' ? ageGroup : undefined}
            setAgeGroup={category === 'kids' ? setAgeGroup : undefined}
            // Jewellery specific
            jewelleryCategory={category === 'jewellery' ? jewelleryCategory : undefined}
            setJewelleryCategory={category === 'jewellery' ? setJewelleryCategory : undefined}
            selectedSkinTone={category === 'jewellery' ? selectedSkinTone : undefined}
            setSelectedSkinTone={category === 'jewellery' ? setSelectedSkinTone : undefined}
            selectedAttire={category === 'jewellery' ? selectedAttire : undefined}
            setSelectedAttire={category === 'jewellery' ? setSelectedAttire : undefined}
            // Bottom selector
            shouldShowBottomSelector={shouldShowBottomSelector}
            selectedBottomType={selectedBottomType}
            setSelectedBottomType={setSelectedBottomType}
          />
        );

      case 1:
        return (
          <ModelStep
            section={category}
            poseOptions={categoryOptions.poseOptions}
            expressionOptions={categoryOptions.expressionOptions}
            viewOptions={categoryOptions.viewOptions}
            aspectRatioOptions={ASPECT_RATIO_OPTIONS}
            hairStyleOptions={categoryOptions.hairStyleOptions}
            selectedHairStyle={selectedHairStyle}
            onHairStyleChange={setSelectedHairStyle}
            selectedFitType={config.fitType}
            onFitTypeChange={(f) => updateConfig({ fitType: f })}
            selectedBodyType={config.bodyType}
            onBodyTypeChange={(b) => updateConfig({ bodyType: b })}
            selectedPose={config.pose}
            onPoseChange={(p) => updateConfig({ pose: p })}
            selectedExpression={config.expression}
            onExpressionChange={(e) => updateConfig({ expression: e })}
            selectedView={config.view}
            onViewChange={(v) => updateConfig({ view: v })}
            selectedAspectRatio={config.aspectRatio}
            onAspectRatioChange={(a) => updateConfig({ aspectRatio: a })}
            previewOptions={config.previewOptions}
            onPreviewOptionsChange={(o) => updateConfig({ previewOptions: o })}
          />
        );

      case 2:
        const backgroundOptionsForCategory =
          category === 'women' ? BACKGROUND_OPTIONS_WOMEN :
          category === 'men' ? BACKGROUND_OPTIONS_MEN :
          category === 'kids' ? BACKGROUND_OPTIONS_KIDS :
          category === 'jewellery' ? BACKGROUND_OPTIONS_JEWELLERY :
          BACKGROUND_OPTIONS;
        return (
          <EnvironmentStep
            user={user}
            selectedTime={config.time}
            onTimeChange={(t) => updateConfig({ time: t })}
            selectedCamera={config.camera}
            onCameraChange={(c) => updateConfig({ camera: c })}
            selectedQuality={config.quality}
            onQualityChange={(q) => updateConfig({ quality: q })}
            selectedBackground={config.background}
            onBackgroundChange={(b) => updateConfig({ background: b })}
            backgroundOptions={backgroundOptionsForCategory}
            imageFiles={getAllImageFiles}
            isGenerating={isLoading}
            isGenerationDisabled={isGenerationDisabled}
            accessWarning={accessWarning}
            error={error}
            onGenerate={handleGenerate}
            onCancel={handleCancelGeneration}
            onNavigateToPricing={() => onNavigate('pricing')}
            onNavigateToAddons={() => onNavigate('add-on-credits')}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Plan Status Warning */}
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
      {/* Expired but has remaining credits - soft info banner */}
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

      {/* Admin-only: Save as Recommended Preset Button */}
      {user.role === 'admin' && (
        <div className="mb-6 flex justify-center">
          <button
            onClick={() => setShowRecommendedPresetModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Save as Recommended Preset
          </button>
        </div>
      )}

      <StepWizard
        steps={WIZARD_STEPS}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        canProceed={canProceed}
        isLastStep={currentStep === 2}
        isGenerating={isLoading}
        title={getCategoryTitle(category)}
        subtitle={getCategorySubtitle(category)}
        // Preset props
        presets={presets}
        recommendedPresets={recommendedPresets}
        presetsLoading={presetsLoading}
        currentPresetName={currentPresetName}
        onSavePreset={handleSavePreset}
        onLoadPreset={handleLoadPreset}
        onDeletePreset={handleDeletePreset}
        onRenamePreset={handleRenamePreset}
      >
        {renderStepContent()}
      </StepWizard>

      {/* Recommended Preset Modal */}
      {showRecommendedPresetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Save as Recommended Preset
              </h3>
              <button
                onClick={() => {
                  setShowRecommendedPresetModal(false);
                  setRecommendedPresetName('');
                  setRecommendedPresetDescription('');
                  setRecommendedPresetError(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Save the current configuration as a recommended preset that will be visible to all users for quick start.
            </p>

            <div className="space-y-4">
              {/* Preset Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Preset Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={recommendedPresetName}
                  onChange={(e) => setRecommendedPresetName(e.target.value)}
                  placeholder="e.g., Classic Saree Look"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Preset Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={recommendedPresetDescription}
                  onChange={(e) => setRecommendedPresetDescription(e.target.value)}
                  placeholder="Brief description of this preset..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Error Message */}
              {recommendedPresetError && (
                <div className="p-3 bg-red-50 border-2 border-red-200 rounded-xl">
                  <p className="text-sm text-red-700 font-bold">{recommendedPresetError}</p>
                </div>
              )}

              {/* Info Box */}
              <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-xl">
                <p className="text-xs text-blue-700">
                  <strong>Current settings will be saved:</strong> Subcategory ({
                    category === 'men' ? menCategory :
                    category === 'women' ? womenCategory :
                    category === 'kids' ? kidsCategory :
                    jewelleryCategory
                  }), pose, expression, view, background, camera, quality, and all other configured options.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowRecommendedPresetModal(false);
                    setRecommendedPresetName('');
                    setRecommendedPresetDescription('');
                    setRecommendedPresetError(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                  disabled={savingRecommendedPreset}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAsRecommendedPreset}
                  disabled={savingRecommendedPreset}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingRecommendedPreset ? 'Saving...' : 'Save Preset'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TryOnWizard;
