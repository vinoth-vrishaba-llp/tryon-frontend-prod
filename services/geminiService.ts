import {
    WomenProductCategory,
    JewelleryProductCategory,
    ProductUploadType,
    Section,
    KidsProductCategory,
    KidsGender,
    KidsAgeGroup,
    PreviewOptionsState,
    SareeAccessoriesState,
    SkinToneOption,
    AttireOption
} from "../types";
import { getAuthHeadersForFormData } from "./apiClient";
import { encryptData } from "./encryption";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Response from try-on generation
 */
export interface TryOnGenerationResponse {
    image: string;
    creditsUsed: number;
    creditsRemaining: number;
}

/**
 * Generate try-on image
 * Note: Email is now extracted from JWT token on the backend
 */
export const generateTryOnImage = async (
    productImages: File[],
    section: Section,
    category: 'men' | WomenProductCategory | KidsProductCategory | JewelleryProductCategory,
    backgroundPrompt: string,
    posePrompt: string,
    expressionPrompt: string,
    viewPrompt: string,
    timePrompt: string,
    aspectRatio: string,
    cameraPrompt: string,
    quality: 'standard' | 'high' | 'ultra' = 'standard',
    uploadType: ProductUploadType = 'parts',
    customModelImage?: File,
    kidsConfig?: { gender: KidsGender; ageGroup: KidsAgeGroup },
    previewOptions?: PreviewOptionsState,
    sareeAccessories?: SareeAccessoriesState,
    skinTone?: SkinToneOption,
    attire?: AttireOption
): Promise<TryOnGenerationResponse> => {
    const formData = new FormData();

    productImages.forEach((file) => {
        formData.append('productImages', file);
    });

    if (customModelImage) {
        formData.append('customModelImage', customModelImage);
    }

    // Encrypt all prompts before sending for security
    const [
        encryptedBackgroundPrompt,
        encryptedPosePrompt,
        encryptedExpressionPrompt,
        encryptedViewPrompt,
        encryptedTimePrompt,
        encryptedCameraPrompt
    ] = await Promise.all([
        encryptData(backgroundPrompt),
        encryptData(posePrompt),
        encryptData(expressionPrompt),
        encryptData(viewPrompt),
        encryptData(timePrompt),
        encryptData(cameraPrompt)
    ]);

    formData.append('section', section);
    formData.append('category', category);
    formData.append('backgroundPrompt', encryptedBackgroundPrompt);
    formData.append('posePrompt', encryptedPosePrompt);
    formData.append('expressionPrompt', encryptedExpressionPrompt);
    formData.append('viewPrompt', encryptedViewPrompt);
    formData.append('timePrompt', encryptedTimePrompt);
    formData.append('aspectRatio', aspectRatio);
    formData.append('cameraPrompt', encryptedCameraPrompt);
    formData.append('quality', quality);
    formData.append('uploadType', uploadType);
    formData.append('encrypted', 'true');

    if (kidsConfig) formData.append('kidsConfig', JSON.stringify(kidsConfig));
    if (previewOptions) formData.append('previewOptions', JSON.stringify(previewOptions));
    if (sareeAccessories) formData.append('sareeAccessories', JSON.stringify(sareeAccessories));
    if (skinTone) formData.append('skinTone', JSON.stringify(skinTone));
    if (attire) formData.append('attire', JSON.stringify(attire));

    try {
        const response = await fetch(`${BACKEND_URL}/generate-tryon`, {
            method: 'POST',
            headers: getAuthHeadersForFormData(),
            body: formData,
        });

        if (response.status === 401) {
            throw new Error('SESSION_EXPIRED');
        }

        if (response.status === 402) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'PAYMENT_REQUIRED');
        }

        if (response.status === 403) {
            const errorData = await response.json();
            // Include all error metadata for better handling
            const error: any = new Error(errorData.error || 'FEATURE_RESTRICTED');
            error.requiresUpgrade = errorData.requiresUpgrade;
            error.requiresCredits = errorData.requiresCredits;
            error.needed = errorData.needed;
            error.available = errorData.available;
            throw error;
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate image');
        }

        const data = await response.json();
        
        // Return full response with credit information
        return {
            image: data.image,
            creditsUsed: data.creditsUsed,
            creditsRemaining: data.creditsRemaining
        };
    } catch (error: any) {
        console.error('Generation Error:', error);
        throw error;
    }
};