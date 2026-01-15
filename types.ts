// --- FRONTEND TYPES ---
export type Page = 'home' | 'mens' | 'womens' | 'kids' | 'jewellery' | 'dashboard' | 'admin-user-details' | 'reset-password' | 'pricing' | 'add-on-credits' | 'checkout' | 'library';

export type Section = 'men' | 'women' | 'kids' | 'jewellery';

export type ProductUploadType = 'parts' | 'full';

// Payment status type - matches backend exactly
export type PaymentStatus =
  | 'none'       // never paid
  | 'active'     // valid paid subscription
  | 'inactive'   // payment exists but not active (pending / failed / cancelled)
  | 'expired';   // subscription ended

// Plan type
export type PlanType = 'Free' | 'Basic' | 'Pro' | 'Ultimate';

export interface SareeAccessoriesState {
  jasmine: boolean;
  bangles: boolean;
  necklace: boolean;
}

export interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
}

export interface ImageHistoryItem {
  id: string;
  imageDataUrl: string;
  timestamp: number;
  category?: string;
  tags?: string[];
  customAvatarDataUrl?: string;
}

export interface PreviewOptionsState {
  showOutfitDetails: boolean;
  highlightFabricTexture: boolean;
}

export interface ConfigState {
  background: BackgroundOption;
  pose: PoseOption;
  expression: ExpressionOption;
  view: ViewOption;
  time: TimeOption;
  aspectRatio: AspectRatioOption;
  camera: CameraOption;
  quality: ImageQualityOption;
  previewOptions: PreviewOptionsState;
}

export interface Preset {
  id: string;
  name: string;
  config: ConfigState;
}

export interface BackgroundOption {
  id: string;
  name: string;
  prompt: string;
}

export const BACKGROUND_OPTIONS: BackgroundOption[] = [
  {
    id: 'white-studio',
    name: 'White Studio',
    prompt:
      'Place the fully rendered model on a clean, solid, studio-quality white background (#FFFFFF). Soft, even lighting.'
  },
  {
    id: 'temple-corridor',
    name: 'Temple Mandapam',
    prompt:
      'Place the fully rendered model in an ancient South Indian temple corridor with carved granite pillars. Warm, Warm,Spiritual and historic atmosphere, with soft dust motes visible in shafts of light.'
  },
  {
    id: 'outside-mylapore',
    name: 'Outside Mylapore Temple',
    prompt:
      'Place the model on the vibrant street outside Kapaleeshwarar Temple, Mylapore. The towering, colorful Gopuram is visible in the background. Natural daylight with the hustle and bustle of a traditional Chennai street.'
  },
  {
    id: 'kochi-cafe',
    name: 'Kochi Heritage Cafe',
    prompt:
      'Place the model inside a rustic, high-ceilinged heritage cafe in Fort Kochi. Features include wooden rafters, colonial-style windows, tropical plants, and a relaxed, aesthetic atmosphere.'
  },
  {
    id: 'indiranagar-street',
    name: 'Indiranagar Street, Bangalore',
    prompt:
      'Place the model on a beautiful tree-lined street in Indiranagar, Bangalore. Upscale urban setting with lush green canopies, modern storefronts, and a clean city vibe.'
  },
  {
    id: 'pondicherry-french',
    name: 'French Colony, Pondicherry',
    prompt:
      'Place the model on a street in the White Town area of Pondicherry. Iconic bright yellow colonial buildings with white trim, bougainvillea flowers spilling over walls, and a clean, European-Indian hybrid aesthetic.'
  },
  {
    id: 'marine-drive-beach',
    name: 'Mumbai Marine Drive',
    prompt:
      "Place the model on the promenade of Marine Drive, Mumbai. The Arabian Sea and the iconic tetrapods are in view, with the Queen's Necklace skyline visible in the distance during a breezy evening."
  },
  {
    id: 'chennai-central',
    name: 'Chennai Central Station',
    prompt:
      'Place the model in front of the iconic red brick heritage building of Chennai Central Railway Station. Grand architectural background with Victorian-Gothic details and a sense of historic travel.'
  },
  {
    id: 'chettinad-wall',
    name: 'Chettinad Sunlit Wall',
    prompt:
      'Place the fully rendered model against a warm, textured yellow plaster wall typical of a Chettinad house in Tamil Nadu, with dramatic natural shadows cast by coconut palm leaves.'
  },
  {
    id: 'red-oxide-floor',
    name: 'Red Oxide Veranda',
    prompt:
      'Place the fully rendered model standing on a traditional red oxide floor in a semi-open veranda, with antique wooden pillars.'
  },
  {
    id: 'kerala-backwaters',
    name: 'Kerala Backwaters',
    prompt:
      'Place the fully rendered model on the wooden deck of a traditional houseboat in Alappuzha, Kerala.'
  },
  {
    id: 'mahabalipuram-shore',
    name: 'Mahabalipuram Shore',
    prompt:
      'Place the fully rendered model on the sandy beach near the Shore Temple in Mahabalipuram, Tamil Nadu.'
  },
  {
    id: 'ooty-tea-garden',
    name: 'Ooty Tea Garden',
    prompt:
      'Place the fully rendered model standing on a narrow pathway in a lush green tea estate in Ooty/Nilgiris.'
  },
  {
    id: 'chettinad-courtyard',
    name: 'Chettinad Courtyard',
    prompt:
      'Place the fully rendered model in the central courtyard of a traditional Chettinad mansion.'
  }
];

export interface TimeOption {
  id: string;
  name: string;
  prompt: string;
}

export const TIME_OPTIONS: TimeOption[] = [
  { id: 'early-morning', name: 'Early Morning', prompt: 'soft, cool early morning light' },
  { id: 'mid-noon', name: 'Mid Noon', prompt: 'bright, direct mid-day sunlight' },
  { id: 'golden-hour', name: 'Golden Hour', prompt: 'warm, golden hour evening light' },
];

export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

export interface AspectRatioOption {
  id: AspectRatio;
  name: string;
}

export const ASPECT_RATIO_OPTIONS: AspectRatioOption[] = [
  { id: '1:1', name: 'Square (1:1)' },
  { id: '3:4', name: 'Portrait (3:4)' },
  { id: '4:3', name: 'Landscape (4:3)' },
  { id: '9:16', name: 'Story (9:16)' },
  { id: '16:9', name: 'Wide (16:9)' },
];

export interface ImageQualityOption {
  id: 'standard' | 'high' | 'ultra';
  name: string;
  description: string;
}

export const IMAGE_QUALITY_OPTIONS: ImageQualityOption[] = [
  { id: 'standard', name: 'Standard', description: '1K' },
  { id: 'high', name: 'High', description: '2K' },
  { id: 'ultra', name: 'Ultra High', description: '4K' },
];

export interface CameraOption {
  id: string;
  name: string;
  prompt: string;
}

export const CAMERA_OPTIONS: CameraOption[] = [
  {
    id: 'phone',
    name: 'Phone',
    prompt: 'Shot on a modern flagship smartphone. Natural mobile photography aesthetic.'
  },
  {
    id: 'dslr',
    name: 'DSLR',
    prompt: 'Shot on a high-end full-frame DSLR with a prime 85mm f/1.2 lens.'
  },
  {
    id: 'macro',
    name: 'Macro Lens',
    prompt: 'Extreme macro photography focus, razor-sharp shallow depth of field, emphasizing micro-textures and intricate jewelry details.'
  }
];

export type WomenProductCategory = 'saree' | 'chudithar' | 'western';
export type JewelleryProductCategory = 'chain' | 'ring' | 'nose-pin' | 'bangles' | 'bracelet' | 'ear-rings' | 'necklace' | 'anklet' | 'maang-tikka' | 'hip-chain' | 'hip-belt';

export const WOMEN_CATEGORIES: { id: WomenProductCategory; name: string }[] = [
  { id: 'saree', name: 'Saree' },
  { id: 'chudithar', name: 'Chudithar' },
  { id: 'western', name: 'Western Dress' },
];

export const JEWELLERY_CATEGORIES: { id: JewelleryProductCategory; name: string }[] = [
  { id: 'necklace', name: 'Necklace' },
  { id: 'ear-rings', name: 'Ear Rings' },
  { id: 'bangles', name: 'Bangles' },
  { id: 'ring', name: 'Ring' },
  { id: 'nose-pin', name: 'Nose Pin' },
  { id: 'chain', name: 'Chain' },
  { id: 'bracelet', name: 'Bracelet' },
  { id: 'anklet', name: 'Anklet' },
  { id: 'maang-tikka', name: 'Maang Tikka' },
  { id: 'hip-chain', name: 'Hip Chain' },
  { id: 'hip-belt', name: 'Hip Belt' },
];

export interface SkinToneOption {
  id: string;
  name: string;
  hex: string;
  prompt: string;
}

export const SKIN_TONE_OPTIONS: SkinToneOption[] = [
  { id: 'fair', name: 'Fair', hex: '#f9ead3', prompt: 'fair, porcelain skin tone with cool undertones' },
  { id: 'wheatish', name: 'Wheatish', hex: '#e8c08d', prompt: 'warm wheatish skin tone typical of South Asian regions' },
  { id: 'dusky', name: 'Dusky', hex: '#b87d4b', prompt: 'rich dusky, caramel skin tone with golden undertones' },
  { id: 'deep', name: 'Deep', hex: '#634430', prompt: 'deep, ebony skin tone with smooth, radiant texture' },
];

export interface AttireOption {
  id: string;
  name: string;
  prompt: string;
}

export const ATTIRE_OPTIONS: AttireOption[] = [
  { id: 'south-indian-bride', name: 'South Indian Bride', prompt: 'a traditional South Indian bridal look wearing a rich Kanchipuram silk saree (pattu), temple hair styling (Jada) decorated with jasmine flowers, and subtle traditional bridal makeup' },
  { id: 'modern-ethnic', name: 'Modern Ethnic', prompt: 'a chic contemporary ethnic look, wearing a minimalist silk tunic or designer kurti with clean lines' },
  { id: 'western-formal', name: 'Western Formal', prompt: 'an elegant western formal attire, wearing a structured evening gown or a silk cocktail dress' },
  { id: 'casual-chic', name: 'Casual Chic', prompt: 'a relaxed casual chic look, wearing a simple linen top or a soft cotton shirt' },
  { id: 'classic-silk', name: 'Classic Silk', prompt: 'a classic traditional look wearing a rich silk saree with traditional drapes' },
];

export const WOMEN_CATEGORY_CONFIG: Record<WomenProductCategory, { part: string; optional: boolean }[]> = {
  saree: [
    { part: 'Blouse', optional: false },
    { part: 'Pallu & Body', optional: false },
    { part: 'Border', optional: false },
  ],
  chudithar: [
    { part: 'Top', optional: false },
    { part: 'Bottom', optional: true },
    { part: 'Shawl', optional: true },
  ],
  western: [
    { part: 'Top', optional: false },
    { part: 'Bottom', optional: true },
  ],
};

export const MEN_CATEGORY_CONFIG = [
  { part: 'Top', optional: false },
  { part: 'Bottom', optional: true },
];

// --- KIDS SECTION TYPES ---

export type KidsGender = 'boy' | 'girl';
export type KidsAgeGroup = '7-9' | '10-14';
export type KidsProductCategory = 'western' | 'traditional';

export const KIDS_CATEGORIES: { id: KidsProductCategory; name: string }[] = [
  { id: 'western', name: 'Western Wear' },
  { id: 'traditional', name: 'Traditional Wear' },
];

export const KIDS_CATEGORY_CONFIG: Record<KidsProductCategory, { part: string; optional: boolean }[]> = {
  western: [
    { part: 'Top', optional: false },
    { part: 'Bottom', optional: true },
  ],
  traditional: [
    { part: 'Top', optional: false },
    { part: 'Bottom', optional: true },
  ],
};

// Pose Options
export type PoseCategory = 'standing' | 'sitting' | 'movement' | 'leaning' | 'lifestyle' | 'artistic';

export interface PoseOption {
  id: string;
  name: string;
  prompt: string;
  category: PoseCategory;
}

export const POSE_OPTIONS: PoseOption[] = [
  { id: 'standing-neutral', name: 'Stand Straight', prompt: 'standing in a graceful, forward-facing model posture', category: 'standing' },
  { id: 'hands-on-hips', name: 'Hands on Waist', prompt: 'empowered stance with both hands placed firmly on hips', category: 'standing' },
  { id: 'crossed-arms', name: 'Bold Arms Crossed', prompt: 'authoritative stance with arms crossed naturally', category: 'standing' },
  { id: 'one-hand-pocket', name: 'Hand in Pocket', prompt: 'modern standing posture with one hand tucked casually into a pocket', category: 'standing' },
  { id: 'both-hands-pockets', name: 'Hands in Pockets', prompt: 'casual standing stance with both hands deep in pockets', category: 'standing' },
  { id: 'fashion-stance', name: 'Model Pose', prompt: 'sophisticated high-fashion stance, body angled at 45 degrees', category: 'standing' },
  { id: 'looking-down', name: 'Look Down', prompt: 'standing pose with head tilted down', category: 'standing' },
  { id: 'lean-chair', name: 'Lean on Chair', prompt: 'relaxed leaning posture against a studio chair', category: 'leaning' },
  { id: 'casual-lean', name: 'Lean on Wall', prompt: 'relaxed leaning posture against a solid wall', category: 'leaning' },
  { id: 'lean-on-table', name: 'Lean on Table', prompt: 'leaning forward against a wooden table', category: 'leaning' },
  { id: 'lean-back', name: 'Lean Back', prompt: 'leaning back against a flat surface', category: 'leaning' },
  { id: 'side-lean', name: 'Side Lean', prompt: 'leaning sideways against a pillar or wall', category: 'leaning' },
  { id: 'lean-rail', name: 'Lean on Railing', prompt: 'leaning against a balcony or veranda railing', category: 'leaning' },
  { id: 'walking-motion', name: 'Walk Forward', prompt: 'captured mid-stride walking towards the camera', category: 'movement' },
  { id: 'dynamic-stride', name: 'Runway Step', prompt: 'large confident stride forward', category: 'movement' },
  { id: 'twirling', name: 'Graceful Twirl', prompt: 'motion-blur stabilized twirl, garment flared out', category: 'movement' },
  { id: 'sitting-chair', name: 'Sit on Chair', prompt: 'sitting upright on a minimalist chair', category: 'sitting' },
  { id: 'sitting-floor', name: 'Sit on Floor', prompt: 'relaxed floor-sitting pose', category: 'sitting' },
  { id: 'speaking-mobile', name: 'Talk on Phone', prompt: 'candid lifestyle shot holding a smartphone to the ear', category: 'lifestyle' },
  { id: 'watching-mobile', name: 'Look at Phone', prompt: 'natural pose looking down at a mobile screen', category: 'lifestyle' },
  { id: 'looking-back', name: 'Look Back', prompt: 'body facing away but head turned back over the shoulder', category: 'artistic' },
  { id: 'adjusting-hair', name: 'Fix Hair', prompt: 'artistic candid pose with one hand gently tucked behind the ear', category: 'artistic' },
];

export interface ExpressionOption {
  id: string;
  name: string;
  prompt: string;
}

export const EXPRESSION_OPTIONS: ExpressionOption[] = [
  { id: 'neutral', name: 'Calm & Poised', prompt: 'serene, calm facial expression' },
  { id: 'subtle-smile', name: 'Warm Glow', prompt: 'a gentle, inviting smile that reaches the eyes' },
  { id: 'confident', name: 'Piercing Gaze', prompt: 'self-assured, bold expression with a slight smirk' },
  { id: 'serious-fashion', name: 'Editorial Intense', prompt: 'vogue-style serious expression' },
  { id: 'playful', name: 'Joyful Laugh', prompt: 'candid laughter, eyes crinkled with joy' },
  {
    id: 'candid-glance',
    name: 'Candid Glance',
    prompt:
      'looking slightly away with a natural, unposed facial expression as if unaware of the camera'
  },
  {
    id: 'surprised',
    name: 'Surprised Delight',
    prompt:
      'wide-eyed, genuine expression of joyful surprise with a slight open mouth'
  },
  {
    id: 'thoughtful',
    name: 'Pensive Mood',
    prompt:
      'thoughtful, pensive expression with eyes looking slightly off-camera'
  },
  {
    id: 'shy-smile',
    name: 'Bashful Glow',
    prompt:
      'looking down with a shy, bashful, and sweet smile'
  },
  {
    id: 'full-laughter',
    name: 'Vibrant Laughter',
    prompt:
      'unrestrained, full-faced laughter with head tilted slightly back'
  },
  {
    id: 'dreamy',
    name: 'Dreamy Focus',
    prompt:
      'a soft, dreamy expression with a serene and focused gaze'
  },
];

export interface ViewOption {
  id: string;
  name: string;
  prompt: string;
}

export const VIEW_OPTIONS: ViewOption[] = [
  { id: 'front-view', name: 'Direct Frontal', prompt: 'full frontal camera angle' },
  { id: 'three-quarter-view', name: '3/4 Perspective', prompt: 'three-quarter perspective' },
  { id: 'side-view', name: 'Side Profile', prompt: 'clean 90-degree side profile' },
  { id: 'dynamic-side', name: '45-Degree Side', prompt: 'cinematic 45-degree angle focusing on jewelry depth' },
  { id: 'back-view', name: 'Rear View', prompt: 'full rear view' },
  { id: 'low-angle', name: 'Hero Angle', prompt: 'low-angle upward shot' },
  { id: 'close-up', name: 'Portrait Close-up', prompt: 'head and shoulders shot' },
  { id: 'extreme-macro', name: 'Micro Detail', prompt: 'extreme microscopic focus on jewelry textures and gemstone facets' },
  { id: 'waist-up', name: 'Medium Shot', prompt: 'waist-up camera framing' },
  { id: 'birds-eye', name: 'Bird\'s Eye View', prompt: 'top-down vertical view from above, artistic perspective' },
];

export interface Plan {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  credits: number;
  features: { name: string; included: boolean }[];
  idealFor: string;
  color: string;
  buttonColor: string;
  popular?: boolean;
  billingCycle: 'monthly' | 'yearly';
}

// UPDATED User interface with proper paymentStatus type
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';

  brandName?: string;
  mobile?: string;
  website?: string;

  tokenBalance: number;

  planType: PlanType;

  // Subscription
  paymentStatus: PaymentStatus;
  subscriptionExpiry?: string;   // frontend alias
  subscriptionStart?: string;
  subscriptionEnd?: string;

  // Backend passthrough (optional)
  fullName?: string;
  creditsBalance?: number;
  isActive?: boolean;
  createdAt?: string;
  lastLogin?: string;
}


// NEW: Access Control Types
export interface SubscriptionStatus {
  hasActivePlan: boolean;
  planType: PlanType;
  paymentStatus: PaymentStatus;
  creditsRemaining: number;
  subscriptionEnd: string | null;
  canGenerateImages: boolean;
  canPurchaseAddons: boolean;
  isExpired: boolean;
  isFree: boolean;
}


export interface AccessControlResponse {
  allowed: boolean;
  reason?: string;
  redirectTo?: string;
  requiresPlan?: boolean;
  requiresUpgrade?: boolean;
  requiresCredits?: boolean;
  needed?: number;
  available?: number;
}

export interface CreditHistoryItem {
  id: string;
  date: string;
  action: 'Generate' | 'Regenerate';
  quality: 'Standard' | 'Pro';
  credits: number;
}

export interface UserDashboardData {
  totalTryOns: number;
  usageThisMonth: number;
  costSaved: number;
  creditHistory: CreditHistoryItem[];
  planDetails: {
    status: 'Active' | 'Cancelled';
    invoiceHistory: { id: string; date: string; amount: string; status: string }[];
  };
}

export interface AdminDashboardData {
  kpis: {
    totalUsers: number;
    totalBrands: number;
    mrr: string;
    addonRevenue: string;
    growthRate: string;
    totalImages: number;
  };
  maintenanceMode: boolean;
  users: (User & { status: 'Active' | 'Blocked'; signupDate: string })[];
  analytics: {
    usageByPeriod: { label: string; value: number }[];
    breakdown: {
      quality: { standard: number; pro: number };
      category: { men: number; women: number; kids: number };
      model: { studio: number; custom: number };
    };
  };
  systemHealth: {
    apiSuccessRate: string;
    latency: string;
    errorLogs: { timestamp: string; message: string; source: string }[];
  };
}

export interface SignupData {
  fullName: string;
  brandName: string;
  email: string;
  mobile: string;
  website: string;
  password?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface UserDetails extends User {
  status: 'Active' | 'Blocked';
  signupDate: string;
  usageInsights: {
    categories: { label: string; value: number }[];
    models: { label: string; value: number }[];
    totalImages: number;
    totalTokens: string;
    peakUsage: { day: string; time: string };
    usageTrend: { label: string; value: number }[];
    avgCreditsPerSession: number;
    lastActive: string;
  };
}

// NEW: Credit cost configuration
export const CREDIT_COSTS = {
  standard: 3,  // 1K quality
  high: 5,      // 2K quality
  ultra: 10     // 4K quality
} as const;

// NEW: Plan configuration
export const PLAN_CONFIG = {
  Basic: {
    credits: 75,
    monthlyPrice: 750,
    yearlyPrice: 7500,
    allowedQualities: ['standard'] as const
  },
  Pro: {
    credits: 250,
    monthlyPrice: 2500,
    yearlyPrice: 25000,
    allowedQualities: ['standard', 'high', 'ultra'] as const
  },
  Ultimate: {
    credits: 900,
    monthlyPrice: 9000,
    yearlyPrice: 90000,
    allowedQualities: ['standard', 'high', 'ultra'] as const
  },
  Free: {
    credits: 0,
    monthlyPrice: 0,
    yearlyPrice: 0,
    allowedQualities: [] as const
  }
} as const;

// NEW: Addon pack configuration
export const ADDON_PACKS = {
  'flash-s': { credits: 50, price: 399 },
  'flash-m': { credits: 150, price: 999 },
  'flash-l': { credits: 300, price: 1799 }
} as const;