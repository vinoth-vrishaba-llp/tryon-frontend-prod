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

// Forward declarations for options used in ConfigState
export interface HairStyleOption {
  id: string;
  name: string;
  prompt: string;
}

export interface FitTypeOption {
  id: string;
  name: string;
  prompt: string;
}

export interface BodyTypeOption {
  id: string;
  name: string;
  prompt: string;
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
  hairStyle: HairStyleOption;
  fitType: FitTypeOption;
  bodyType: BodyTypeOption;
  previewOptions: PreviewOptionsState;
}

export interface Preset {
  id: string;
  name: string;
  config: ConfigState;
}

export interface PresetData {
  id?: string;
  name: string;
  category: 'men' | 'women' | 'kids' | 'jewellery';
  createdAt?: string;
  updatedAt?: string;
  useCustomModel: boolean;
  uploadType: 'parts' | 'full';
  subCategory?: string;
  gender?: string;
  ageGroup?: string;
  accessories?: {
    jasmine: boolean;
    bangles: boolean;
    necklace: boolean;
  };
  skinToneId?: string;
  attireId?: string;
  hairStyleId?: string;
  fitTypeId?: string;
  bodyTypeId?: string;
  poseId: string;
  expressionId: string;
  viewId: string;
  aspectRatioId: string;
  previewOptions?: {
    showOutfitDetails: boolean;
    highlightFabricTexture: boolean;
  };
  timeId: string;
  cameraId: string;
  qualityId: string;
  backgroundId: string;
}

export interface RecommendedPreset {
  id: string;
  name: string;
  description: string;
  category: 'men' | 'women' | 'kids' | 'jewellery';
  subcategory: string;
  preset_data: PresetData;
  thumbnail_url?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  display_order: number;
}

export type BackgroundCategory = 'studio' | 'heritage' | 'urban' | 'nature' | 'traditional' | 'wedding';

export interface BackgroundOption {
  id: string;
  name: string;
  prompt: string;
  category: BackgroundCategory;
  image?: string; // CDN URL for environment/background thumbnail
}

export const BACKGROUND_OPTIONS: BackgroundOption[] = [
  { id: 'white-studio', name: 'White Studio', prompt: 'Place the fully rendered model on a clean, solid, studio-quality white background (#FFFFFF). Soft, even lighting.', category: 'studio' },
  { id: 'temple-corridor', name: 'Temple Mandapam', prompt: 'Place the fully rendered model in an ancient South Indian temple corridor with carved granite pillars. Warm,Spiritual and historic atmosphere.', category: 'heritage' },
  { id: 'outside-mylapore', name: 'Outside Mylapore Temple', prompt: 'Place the model on the vibrant street outside Kapaleeshwarar Temple, Mylapore. The towering, colorful Gopuram is visible in the background. Natural daylight with the hustle and bustle of a traditional Chennai street.', category: 'heritage' },
  { id: 'kochi-cafe', name: 'Kochi Heritage Cafe', prompt: 'Place the model inside a rustic, high-ceilinged heritage cafe in Fort Kochi. Features include wooden rafters, colonial-style windows, tropical plants, and a relaxed, aesthetic atmosphere.', category: 'urban' },
  { id: 'indiranagar-street', name: 'Indiranagar Street, Bangalore', prompt: 'Place the model on a beautiful tree-lined street in Indiranagar, Bangalore. Upscale urban setting with lush green canopies, modern storefronts, and a clean city vibe.', category: 'urban' },
  { id: 'pondicherry-french', name: 'French Colony, Pondicherry', prompt: 'Place the model on a street in the White Town area of Pondicherry. Iconic bright yellow colonial buildings with white trim, bougainvillea flowers spilling over walls, and a clean, European-Indian hybrid aesthetic.', category: 'urban' },
  { id: 'marine-drive-beach', name: 'Mumbai Marine Drive', prompt: "Place the model on the promenade of Marine Drive, Mumbai. The Arabian Sea and the iconic tetrapods are in view, with the Queen's Necklace skyline visible in the distance during a breezy evening.", category: 'urban' },
  { id: 'chennai-central', name: 'Chennai Central Station', prompt: 'Place the model in front of the iconic red brick heritage building of Chennai Central Railway Station. Grand architectural background with Victorian-Gothic details and a sense of historic travel.', category: 'heritage' },
  { id: 'chettinad-wall', name: 'Chettinad Sunlit Wall', prompt: 'Place the fully rendered model against a warm, textured yellow plaster wall typical of a Chettinad house in Tamil Nadu, with dramatic natural shadows cast by coconut palm leaves.', category: 'traditional' },
  { id: 'red-oxide-floor', name: 'Red Oxide Veranda', prompt: 'Place the fully rendered model standing on a traditional red oxide floor in a semi-open veranda, with antique wooden pillars.', category: 'traditional' },
  { id: 'kerala-backwaters', name: 'Kerala Backwaters', prompt: 'Place the fully rendered model on the wooden deck of a traditional houseboat in Alappuzha, Kerala.', category: 'nature' },
  { id: 'mahabalipuram-shore', name: 'Mahabalipuram Shore', prompt: 'Place the fully rendered model on the sandy beach near the Shore Temple in Mahabalipuram, Tamil Nadu.', category: 'nature' },
  { id: 'ooty-tea-garden', name: 'Ooty Tea Garden', prompt: 'Place the fully rendered model standing on a narrow pathway in a lush green tea estate in Ooty/Nilgiris.', category: 'nature' },
  { id: 'chettinad-courtyard', name: 'Chettinad Courtyard', prompt: 'Place the fully rendered model in the central courtyard of a traditional Chettinad mansion.', category: 'traditional' },
  { id: 'royal-crimson', name: 'Royal Crimson Studio', prompt: 'A deep crimson textured plaster wall with a subtle floral leaf pattern. A heavy golden-mustard silk curtain drapes on the right. Features a vintage ornate velvet chair with a floral bouquet, antique candelabras, and a classic Persian rug.', category: 'studio' },
  { id: 'mughal-heritage', name: 'Mughal Heritage Arch', prompt: 'A grand Mughal-style interior with light sandstone walls, intricate arch carvings, and delicate floral murals. Includes a vintage wooden side table with a brass candle stand under soft, diffused morning sunlight.', category: 'heritage' },
  { id: 'rustic-orange', name: 'Rustic Boho Orange', prompt: 'A vibrant, rustic orange-textured wall with an earthy feel. A dark wood carved jali room divider is on the left, and simple wooden shelves with antique pottery and vases are on the right. Features a classic red patterned rug.', category: 'traditional' },
  { id: 'earthy-minimalist', name: 'Earthy Minimalist', prompt: 'A clean, minimalist studio background in warm tan/terracotta. Includes a lush palm plant, a woven vase with dried pampas grass, and natural woven floor mats under soft organic lighting.', category: 'studio' },
  { id: 'turquoise-palace', name: 'Grand Turquoise Hall', prompt: 'A majestic palace hall with turquoise patterned wallpaper and white ornate Victorian arches. Includes a dark carved wooden console table with a flower vase and intricate blue-and-white patterned floor tiles.', category: 'heritage' },
  { id: 'floral-arbour', name: 'Wedding Floral Arbour', prompt: 'A festive backdrop with cream leaf-patterned wallpaper, framed by a lush arch of white and peach roses and greenery. Features hanging crystal beaded globes and a vibrant green grass floor.', category: 'wedding' },
  { id: 'modern-stripes', name: 'Modern Urban Stripes', prompt: 'A contemporary urban background with vertical red, green, and blue stripes. A large green palm leaf overlaps the composition on the left. Features a clean concrete-paved floor under bright natural daylight.', category: 'urban' }
];

// Category-specific BACKGROUND OPTIONS
export const BACKGROUND_OPTIONS_WOMEN: BackgroundOption[] = [
  { id: 'white-studio', name: 'White Studio', prompt: 'Place the fully rendered model on a clean, solid, studio-quality white background (#FFFFFF). Soft, even lighting.', category: 'studio' },
  { id: 'temple-corridor', name: 'Temple Mandapam', prompt: 'Place the fully rendered model in an ancient South Indian temple corridor with carved granite pillars. Warm,Spiritual and historic atmosphere.', category: 'heritage' },
  { id: 'outside-mylapore', name: 'Outside Mylapore Temple', prompt: 'Place the model on the vibrant street outside Kapaleeshwarar Temple, Mylapore. The towering, colorful Gopuram is visible in the background. Natural daylight with the hustle and bustle of a traditional Chennai street.', category: 'heritage' },
  { id: 'kochi-cafe', name: 'Kochi Heritage Cafe', prompt: 'Place the model inside a rustic, high-ceilinged heritage cafe in Fort Kochi. Features include wooden rafters, colonial-style windows, tropical plants, and a relaxed, aesthetic atmosphere.', category: 'urban' },
  { id: 'indiranagar-street', name: 'Indiranagar Street, Bangalore', prompt: 'Place the model on a beautiful tree-lined street in Indiranagar, Bangalore. Upscale urban setting with lush green canopies, modern storefronts, and a clean city vibe.', category: 'urban' },
  { id: 'pondicherry-french', name: 'French Colony, Pondicherry', prompt: 'Place the model on a street in the White Town area of Pondicherry. Iconic bright yellow colonial buildings with white trim, bougainvillea flowers spilling over walls, and a clean, European-Indian hybrid aesthetic.', category: 'urban' },
  { id: 'marine-drive-beach', name: 'Mumbai Marine Drive', prompt: "Place the model on the promenade of Marine Drive, Mumbai. The Arabian Sea and the iconic tetrapods are in view, with the Queen's Necklace skyline visible in the distance during a breezy evening.", category: 'urban' },
  { id: 'chennai-central', name: 'Chennai Central Station', prompt: 'Place the model in front of the iconic red brick heritage building of Chennai Central Railway Station. Grand architectural background with Victorian-Gothic details and a sense of historic travel.', category: 'heritage' },
  { id: 'chettinad-wall', name: 'Chettinad Sunlit Wall', prompt: 'Place the fully rendered model against a warm, textured yellow plaster wall typical of a Chettinad house in Tamil Nadu, with dramatic natural shadows cast by coconut palm leaves.', category: 'traditional' },
  { id: 'red-oxide-floor', name: 'Red Oxide Veranda', prompt: 'Place the fully rendered model standing on a traditional red oxide floor in a semi-open veranda, with antique wooden pillars.', category: 'traditional' },
  { id: 'kerala-backwaters', name: 'Kerala Backwaters', prompt: 'Place the fully rendered model on the wooden deck of a traditional houseboat in Alappuzha, Kerala.', category: 'nature' },
  { id: 'mahabalipuram-shore', name: 'Mahabalipuram Shore', prompt: 'Place the fully rendered model on the sandy beach near the Shore Temple in Mahabalipuram, Tamil Nadu.', category: 'nature' },
  { id: 'ooty-tea-garden', name: 'Ooty Tea Garden', prompt: 'Place the fully rendered model standing on a narrow pathway in a lush green tea estate in Ooty/Nilgiris.', category: 'nature' },
  { id: 'chettinad-courtyard', name: 'Chettinad Courtyard', prompt: 'Place the fully rendered model in the central courtyard of a traditional Chettinad mansion.', category: 'traditional' },
  { id: 'royal-crimson', name: 'Royal Crimson Studio', prompt: 'A deep crimson textured plaster wall with a subtle floral leaf pattern. A heavy golden-mustard silk curtain drapes on the right. Features a vintage ornate velvet chair with a floral bouquet, antique candelabras, and a classic Persian rug.', category: 'studio' },
  { id: 'mughal-heritage', name: 'Mughal Heritage Arch', prompt: 'A grand Mughal-style interior with light sandstone walls, intricate arch carvings, and delicate floral murals. Includes a vintage wooden side table with a brass candle stand under soft, diffused morning sunlight.', category: 'heritage' },
  { id: 'rustic-orange', name: 'Rustic Boho Orange', prompt: 'A vibrant, rustic orange-textured wall with an earthy feel. A dark wood carved jali room divider is on the left, and simple wooden shelves with antique pottery and vases are on the right. Features a classic red patterned rug.', category: 'traditional' },
  { id: 'earthy-minimalist', name: 'Earthy Minimalist', prompt: 'A clean, minimalist studio background in warm tan/terracotta. Includes a lush palm plant, a woven vase with dried pampas grass, and natural woven floor mats under soft organic lighting.', category: 'studio' },
  { id: 'turquoise-palace', name: 'Grand Turquoise Hall', prompt: 'A majestic palace hall with turquoise patterned wallpaper and white ornate Victorian arches. Includes a dark carved wooden console table with a flower vase and intricate blue-and-white patterned floor tiles.', category: 'heritage' },
  { id: 'floral-arbour', name: 'Wedding Floral Arbour', prompt: 'A festive backdrop with cream leaf-patterned wallpaper, framed by a lush arch of white and peach roses and greenery. Features hanging crystal beaded globes and a vibrant green grass floor.', category: 'wedding' },
  { id: 'modern-stripes', name: 'Modern Urban Stripes', prompt: 'A contemporary urban background with vertical red, green, and blue stripes. A large green palm leaf overlaps the composition on the left. Features a clean concrete-paved floor under bright natural daylight.', category: 'urban' }
];

export const BACKGROUND_OPTIONS_MEN: BackgroundOption[] = [
  { id: 'white-studio', name: 'White Studio', prompt: 'Place the fully rendered model on a clean, solid, studio-quality white background (#FFFFFF). Soft, even lighting.', category: 'studio' },
  { id: 'temple-corridor', name: 'Temple Mandapam', prompt: 'Place the fully rendered model in an ancient South Indian temple corridor with carved granite pillars. Warm,Spiritual and historic atmosphere.', category: 'heritage' },
  { id: 'outside-mylapore', name: 'Outside Mylapore Temple', prompt: 'Place the model on the vibrant street outside Kapaleeshwarar Temple, Mylapore. The towering, colorful Gopuram is visible in the background. Natural daylight with the hustle and bustle of a traditional Chennai street.', category: 'heritage' },
  { id: 'kochi-cafe', name: 'Kochi Heritage Cafe', prompt: 'Place the model inside a rustic, high-ceilinged heritage cafe in Fort Kochi. Features include wooden rafters, colonial-style windows, tropical plants, and a relaxed, aesthetic atmosphere.', category: 'urban' },
  { id: 'indiranagar-street', name: 'Indiranagar Street, Bangalore', prompt: 'Place the model on a beautiful tree-lined street in Indiranagar, Bangalore. Upscale urban setting with lush green canopies, modern storefronts, and a clean city vibe.', category: 'urban' },
  { id: 'pondicherry-french', name: 'French Colony, Pondicherry', prompt: 'Place the model on a street in the White Town area of Pondicherry. Iconic bright yellow colonial buildings with white trim, bougainvillea flowers spilling over walls, and a clean, European-Indian hybrid aesthetic.', category: 'urban' },
  { id: 'marine-drive-beach', name: 'Mumbai Marine Drive', prompt: "Place the model on the promenade of Marine Drive, Mumbai. The Arabian Sea and the iconic tetrapods are in view, with the Queen's Necklace skyline visible in the distance during a breezy evening.", category: 'urban' },
  { id: 'chennai-central', name: 'Chennai Central Station', prompt: 'Place the model in front of the iconic red brick heritage building of Chennai Central Railway Station. Grand architectural background with Victorian-Gothic details and a sense of historic travel.', category: 'heritage' },
  { id: 'chettinad-wall', name: 'Chettinad Sunlit Wall', prompt: 'Place the fully rendered model against a warm, textured yellow plaster wall typical of a Chettinad house in Tamil Nadu, with dramatic natural shadows cast by coconut palm leaves.', category: 'traditional' },
  { id: 'red-oxide-floor', name: 'Red Oxide Veranda', prompt: 'Place the fully rendered model standing on a traditional red oxide floor in a semi-open veranda, with antique wooden pillars.', category: 'traditional' },
  { id: 'kerala-backwaters', name: 'Kerala Backwaters', prompt: 'Place the fully rendered model on the wooden deck of a traditional houseboat in Alappuzha, Kerala.', category: 'nature' },
  { id: 'mahabalipuram-shore', name: 'Mahabalipuram Shore', prompt: 'Place the fully rendered model on the sandy beach near the Shore Temple in Mahabalipuram, Tamil Nadu.', category: 'nature' },
  { id: 'ooty-tea-garden', name: 'Ooty Tea Garden', prompt: 'Place the fully rendered model standing on a narrow pathway in a lush green tea estate in Ooty/Nilgiris.', category: 'nature' },
  { id: 'chettinad-courtyard', name: 'Chettinad Courtyard', prompt: 'Place the fully rendered model in the central courtyard of a traditional Chettinad mansion.', category: 'traditional' },
  { id: 'royal-crimson', name: 'Royal Crimson Studio', prompt: 'A deep crimson textured plaster wall with a subtle floral leaf pattern. A heavy golden-mustard silk curtain drapes on the right. Features a vintage ornate velvet chair with a floral bouquet, antique candelabras, and a classic Persian rug.', category: 'studio' },
  { id: 'mughal-heritage', name: 'Mughal Heritage Arch', prompt: 'A grand Mughal-style interior with light sandstone walls, intricate arch carvings, and delicate floral murals. Includes a vintage wooden side table with a brass candle stand under soft, diffused morning sunlight.', category: 'heritage' },
  { id: 'rustic-orange', name: 'Rustic Boho Orange', prompt: 'A vibrant, rustic orange-textured wall with an earthy feel. A dark wood carved jali room divider is on the left, and simple wooden shelves with antique pottery and vases are on the right. Features a classic red patterned rug.', category: 'traditional' },
  { id: 'earthy-minimalist', name: 'Earthy Minimalist', prompt: 'A clean, minimalist studio background in warm tan/terracotta. Includes a lush palm plant, a woven vase with dried pampas grass, and natural woven floor mats under soft organic lighting.', category: 'studio' },
  { id: 'turquoise-palace', name: 'Grand Turquoise Hall', prompt: 'A majestic palace hall with turquoise patterned wallpaper and white ornate Victorian arches. Includes a dark carved wooden console table with a flower vase and intricate blue-and-white patterned floor tiles.', category: 'heritage' },
  { id: 'floral-arbour', name: 'Wedding Floral Arbour', prompt: 'A festive backdrop with cream leaf-patterned wallpaper, framed by a lush arch of white and peach roses and greenery. Features hanging crystal beaded globes and a vibrant green grass floor.', category: 'wedding' },
  { id: 'modern-stripes', name: 'Modern Urban Stripes', prompt: 'A contemporary urban background with vertical red, green, and blue stripes. A large green palm leaf overlaps the composition on the left. Features a clean concrete-paved floor under bright natural daylight.', category: 'urban' }
];

export const BACKGROUND_OPTIONS_KIDS: BackgroundOption[] = [
  { id: 'white-studio', name: 'White Studio', prompt: 'Place the fully rendered model on a clean, solid, studio-quality white background (#FFFFFF). Soft, even lighting.', category: 'studio' },
  { id: 'temple-corridor', name: 'Temple Mandapam', prompt: 'Place the fully rendered model in an ancient South Indian temple corridor with carved granite pillars. Warm,Spiritual and historic atmosphere.', category: 'heritage' },
  { id: 'outside-mylapore', name: 'Outside Mylapore Temple', prompt: 'Place the model on the vibrant street outside Kapaleeshwarar Temple, Mylapore. The towering, colorful Gopuram is visible in the background. Natural daylight with the hustle and bustle of a traditional Chennai street.', category: 'heritage' },
  { id: 'kochi-cafe', name: 'Kochi Heritage Cafe', prompt: 'Place the model inside a rustic, high-ceilinged heritage cafe in Fort Kochi. Features include wooden rafters, colonial-style windows, tropical plants, and a relaxed, aesthetic atmosphere.', category: 'urban' },
  { id: 'indiranagar-street', name: 'Indiranagar Street, Bangalore', prompt: 'Place the model on a beautiful tree-lined street in Indiranagar, Bangalore. Upscale urban setting with lush green canopies, modern storefronts, and a clean city vibe.', category: 'urban' },
  { id: 'pondicherry-french', name: 'French Colony, Pondicherry', prompt: 'Place the model on a street in the White Town area of Pondicherry. Iconic bright yellow colonial buildings with white trim, bougainvillea flowers spilling over walls, and a clean, European-Indian hybrid aesthetic.', category: 'urban' },
  { id: 'marine-drive-beach', name: 'Mumbai Marine Drive', prompt: "Place the model on the promenade of Marine Drive, Mumbai. The Arabian Sea and the iconic tetrapods are in view, with the Queen's Necklace skyline visible in the distance during a breezy evening.", category: 'urban' },
  { id: 'chennai-central', name: 'Chennai Central Station', prompt: 'Place the model in front of the iconic red brick heritage building of Chennai Central Railway Station. Grand architectural background with Victorian-Gothic details and a sense of historic travel.', category: 'heritage' },
  { id: 'chettinad-wall', name: 'Chettinad Sunlit Wall', prompt: 'Place the fully rendered model against a warm, textured yellow plaster wall typical of a Chettinad house in Tamil Nadu, with dramatic natural shadows cast by coconut palm leaves.', category: 'traditional' },
  { id: 'red-oxide-floor', name: 'Red Oxide Veranda', prompt: 'Place the fully rendered model standing on a traditional red oxide floor in a semi-open veranda, with antique wooden pillars.', category: 'traditional' },
  { id: 'kerala-backwaters', name: 'Kerala Backwaters', prompt: 'Place the fully rendered model on the wooden deck of a traditional houseboat in Alappuzha, Kerala.', category: 'nature' },
  { id: 'mahabalipuram-shore', name: 'Mahabalipuram Shore', prompt: 'Place the fully rendered model on the sandy beach near the Shore Temple in Mahabalipuram, Tamil Nadu.', category: 'nature' },
  { id: 'ooty-tea-garden', name: 'Ooty Tea Garden', prompt: 'Place the fully rendered model standing on a narrow pathway in a lush green tea estate in Ooty/Nilgiris.', category: 'nature' },
  { id: 'chettinad-courtyard', name: 'Chettinad Courtyard', prompt: 'Place the fully rendered model in the central courtyard of a traditional Chettinad mansion.', category: 'traditional' },
  { id: 'royal-crimson', name: 'Royal Crimson Studio', prompt: 'A deep crimson textured plaster wall with a subtle floral leaf pattern. A heavy golden-mustard silk curtain drapes on the right. Features a vintage ornate velvet chair with a floral bouquet, antique candelabras, and a classic Persian rug.', category: 'studio' },
  { id: 'mughal-heritage', name: 'Mughal Heritage Arch', prompt: 'A grand Mughal-style interior with light sandstone walls, intricate arch carvings, and delicate floral murals. Includes a vintage wooden side table with a brass candle stand under soft, diffused morning sunlight.', category: 'heritage' },
  { id: 'rustic-orange', name: 'Rustic Boho Orange', prompt: 'A vibrant, rustic orange-textured wall with an earthy feel. A dark wood carved jali room divider is on the left, and simple wooden shelves with antique pottery and vases are on the right. Features a classic red patterned rug.', category: 'traditional' },
  { id: 'earthy-minimalist', name: 'Earthy Minimalist', prompt: 'A clean, minimalist studio background in warm tan/terracotta. Includes a lush palm plant, a woven vase with dried pampas grass, and natural woven floor mats under soft organic lighting.', category: 'studio' },
  { id: 'turquoise-palace', name: 'Grand Turquoise Hall', prompt: 'A majestic palace hall with turquoise patterned wallpaper and white ornate Victorian arches. Includes a dark carved wooden console table with a flower vase and intricate blue-and-white patterned floor tiles.', category: 'heritage' },
  { id: 'floral-arbour', name: 'Wedding Floral Arbour', prompt: 'A festive backdrop with cream leaf-patterned wallpaper, framed by a lush arch of white and peach roses and greenery. Features hanging crystal beaded globes and a vibrant green grass floor.', category: 'wedding' },
  { id: 'modern-stripes', name: 'Modern Urban Stripes', prompt: 'A contemporary urban background with vertical red, green, and blue stripes. A large green palm leaf overlaps the composition on the left. Features a clean concrete-paved floor under bright natural daylight.', category: 'urban' },
  { id: 'kids-teddy-wood', name: 'Cozy Teddy Wood', prompt: 'A cozy studio setting with dark brown horizontal wooden planks as a backdrop. Heart-shaped felt bunting in golden-tan hangs across the wall. A soft shaggy cream rug covers the floor. A brown plush teddy bear with an orange scarf sits on the floor.', category: 'studio' },
  { id: 'kids-boho-nursery', name: 'Boho Nursery', prompt: 'A bright, airy white studio with a minimalist boho nursery aesthetic. Features a rattan child-sized armchair in the center. A wooden ladder with a small heart ornament leans against the white wall. A white plush bunny sits on a small wooden stool. Includes dried pampas grass and a toy wooden cart.', category: 'studio' },
  { id: 'minimal-alcoves', name: 'Arched Alcoves', prompt: 'A sophisticated minimalist background with a textured off-white wall. Features five recessed arched alcoves of varying sizes, softly illuminated from within. Each alcove contains a simple earthy ceramic pot or vase. Light wood flooring.', category: 'studio' },
  { id: 'minimal-floral-studio', name: 'Minimal Floral', prompt: 'An ultra-clean, minimalist white studio background. Two elegant ceramic vases containing soft pink, yellow, and purple flowers are positioned at the bottom corners, framing the center. Soft, diffused lighting.', category: 'studio' },
  { id: 'kids-palm-curtain', name: 'Palm & Stool Studio', prompt: "A professional children's photography studio with a soft beige fabric curtain backdrop. A plush velvet beige stool sits on a circular woven jute rug. A green palm frond enters the frame from the right, adding a fresh, natural aesthetic. Bright, soft studio lighting.", category: 'studio' },
  { id: 'kids-lemon-studio', name: 'Lemon Blossom Studio', prompt: 'A clean, high-key white studio background. Features a tall rustic wooden bar-style stool. Next to it sits a large wicker basket overflowing with vibrant yellow flowers and fresh greenery. Natural, warm daylight atmosphere.', category: 'studio' },
  { id: 'kids-classic-panel', name: 'Classic Paneled Room', prompt: 'An elegant interior with white-painted wall molding and decorative panels. A textured wicker or jute rug covers the floor. The space feels premium and bright, suitable for high-end fashion catalog photography.', category: 'studio' },
  { id: 'kids-solid-blue', name: 'Solid Sky Blue', prompt: 'A clean, solid vibrant sky blue studio cyclorama background. Perfect for modern, energetic fashion shots with minimal distractions and even, shadowless lighting.', category: 'studio' }
];

export const BACKGROUND_OPTIONS_JEWELLERY: BackgroundOption[] = [
  { id: 'white-studio', name: 'White Studio', prompt: 'Place the fully rendered model on a clean, solid, studio-quality white background (#FFFFFF). Soft, even lighting.', category: 'studio' },
  { id: 'temple-corridor', name: 'Temple Mandapam', prompt: 'Place the fully rendered model in an ancient South Indian temple corridor with carved granite pillars. Warm,Spiritual and historic atmosphere.', category: 'heritage' },
  { id: 'outside-mylapore', name: 'Outside Mylapore Temple', prompt: 'Place the model on the vibrant street outside Kapaleeshwarar Temple, Mylapore. The towering, colorful Gopuram is visible in the background. Natural daylight with the hustle and bustle of a traditional Chennai street.', category: 'heritage' },
  { id: 'kochi-cafe', name: 'Kochi Heritage Cafe', prompt: 'Place the model inside a rustic, high-ceilinged heritage cafe in Fort Kochi. Features include wooden rafters, colonial-style windows, tropical plants, and a relaxed, aesthetic atmosphere.', category: 'urban' },
  { id: 'indiranagar-street', name: 'Indiranagar Street, Bangalore', prompt: 'Place the model on a beautiful tree-lined street in Indiranagar, Bangalore. Upscale urban setting with lush green canopies, modern storefronts, and a clean city vibe.', category: 'urban' },
  { id: 'pondicherry-french', name: 'French Colony, Pondicherry', prompt: 'Place the model on a street in the White Town area of Pondicherry. Iconic bright yellow colonial buildings with white trim, bougainvillea flowers spilling over walls, and a clean, European-Indian hybrid aesthetic.', category: 'urban' },
  { id: 'marine-drive-beach', name: 'Mumbai Marine Drive', prompt: "Place the model on the promenade of Marine Drive, Mumbai. The Arabian Sea and the iconic tetrapods are in view, with the Queen's Necklace skyline visible in the distance during a breezy evening.", category: 'urban' },
  { id: 'chennai-central', name: 'Chennai Central Station', prompt: 'Place the model in front of the iconic red brick heritage building of Chennai Central Railway Station. Grand architectural background with Victorian-Gothic details and a sense of historic travel.', category: 'heritage' },
  { id: 'chettinad-wall', name: 'Chettinad Sunlit Wall', prompt: 'Place the fully rendered model against a warm, textured yellow plaster wall typical of a Chettinad house in Tamil Nadu, with dramatic natural shadows cast by coconut palm leaves.', category: 'traditional' },
  { id: 'red-oxide-floor', name: 'Red Oxide Veranda', prompt: 'Place the fully rendered model standing on a traditional red oxide floor in a semi-open veranda, with antique wooden pillars.', category: 'traditional' },
  { id: 'kerala-backwaters', name: 'Kerala Backwaters', prompt: 'Place the fully rendered model on the wooden deck of a traditional houseboat in Alappuzha, Kerala.', category: 'nature' },
  { id: 'mahabalipuram-shore', name: 'Mahabalipuram Shore', prompt: 'Place the fully rendered model on the sandy beach near the Shore Temple in Mahabalipuram, Tamil Nadu.', category: 'nature' },
  { id: 'ooty-tea-garden', name: 'Ooty Tea Garden', prompt: 'Place the fully rendered model standing on a narrow pathway in a lush green tea estate in Ooty/Nilgiris.', category: 'nature' },
  { id: 'chettinad-courtyard', name: 'Chettinad Courtyard', prompt: 'Place the fully rendered model in the central courtyard of a traditional Chettinad mansion.', category: 'traditional' },
  { id: 'royal-crimson', name: 'Royal Crimson Studio', prompt: 'A deep crimson textured plaster wall with a subtle floral leaf pattern. A heavy golden-mustard silk curtain drapes on the right. Features a vintage ornate velvet chair with a floral bouquet, antique candelabras, and a classic Persian rug.', category: 'studio' },
  { id: 'mughal-heritage', name: 'Mughal Heritage Arch', prompt: 'A grand Mughal-style interior with light sandstone walls, intricate arch carvings, and delicate floral murals. Includes a vintage wooden side table with a brass candle stand under soft, diffused morning sunlight.', category: 'heritage' },
  { id: 'rustic-orange', name: 'Rustic Boho Orange', prompt: 'A vibrant, rustic orange-textured wall with an earthy feel. A dark wood carved jali room divider is on the left, and simple wooden shelves with antique pottery and vases are on the right. Features a classic red patterned rug.', category: 'traditional' },
  { id: 'earthy-minimalist', name: 'Earthy Minimalist', prompt: 'A clean, minimalist studio background in warm tan/terracotta. Includes a lush palm plant, a woven vase with dried pampas grass, and natural woven floor mats under soft organic lighting.', category: 'studio' },
  { id: 'turquoise-palace', name: 'Grand Turquoise Hall', prompt: 'A majestic palace hall with turquoise patterned wallpaper and white ornate Victorian arches. Includes a dark carved wooden console table with a flower vase and intricate blue-and-white patterned floor tiles.', category: 'heritage' },
  { id: 'floral-arbour', name: 'Wedding Floral Arbour', prompt: 'A festive backdrop with cream leaf-patterned wallpaper, framed by a lush arch of white and peach roses and greenery. Features hanging crystal beaded globes and a vibrant green grass floor.', category: 'wedding' },
  { id: 'modern-stripes', name: 'Modern Urban Stripes', prompt: 'A contemporary urban background with vertical red, green, and blue stripes. A large green palm leaf overlaps the composition on the left. Features a clean concrete-paved floor under bright natural daylight.', category: 'urban' }
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

export type WomenProductCategory = 'saree' | 'chudithar' | 'western' | 'traditional' | 'streetwear' | 'formals';
export type MenProductCategory = 'casual' | 'traditional' | 'streetwear' | 'formals';
export type JewelleryProductCategory = 'chain' | 'ring' | 'nose-pin' | 'bangles' | 'bracelet' | 'ear-rings' | 'necklace' | 'anklet' | 'maang-tikka' | 'hip-chain' | 'hip-belt';

export const WOMEN_CATEGORIES: { id: WomenProductCategory; name: string }[] = [
  { id: 'saree', name: 'Saree' },
  { id: 'chudithar', name: 'Chudithar' },
  { id: 'western', name: 'Western Dress' },
  { id: 'traditional', name: 'Traditional' },
  { id: 'streetwear', name: 'Streetwear' },
  { id: 'formals', name: 'Formals' },
];

export const MEN_CATEGORIES: { id: MenProductCategory; name: string }[] = [
  { id: 'casual', name: 'Casual' },
  { id: 'traditional', name: 'Traditional' },
  { id: 'streetwear', name: 'Streetwear' },
  { id: 'formals', name: 'Formals' },
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

// Hair Style Options
export const HAIR_STYLE_OPTIONS_WOMEN: HairStyleOption[] = [
  { id: 'bun', name: 'Bun', prompt: 'black hair styled into a neat, professional bun' },
  { id: 'long-wavy', name: 'Long Wavy', prompt: 'long black flowing wavy hair with natural volume' },
  { id: 'french-braid', name: 'French Braid', prompt: 'black hair elegantly styled into a French braid' },
  { id: 'fishtail-braid', name: 'Fishtail Braid', prompt: 'black hair intricately styled into a fishtail braid' },
  { id: 'chignon', name: 'Chignon', prompt: 'black hair in sophisticated low chignon knot' },
  { id: 'pony-tail', name: 'Pony Tail', prompt: 'black hair in high, sleek pony tail' },
  { id: 'short-bob', name: 'Short Bob', prompt: 'black hair classic short bob cut' },
  { id: 'layered-cut', name: 'Layered Cut', prompt: 'black hair in modern layered haircut' },
  { id: 'messy-bun', name: 'Messy Bun', prompt: 'black hair in relaxed, stylish messy bun' },
];

export const HAIR_STYLE_OPTIONS_MEN: HairStyleOption[] = [
  { id: 'french-crop', name: 'French Crop', prompt: 'modern French crop with short sides and textured top' },
  { id: 'short-pompadour', name: 'Pompadour', prompt: 'short pompadour with volume' },
  { id: 'classic-quiff', name: 'Classic Quiff', prompt: 'classic quiff hairstyle' },
  { id: 'textured-crop', name: 'Textured Crop', prompt: 'short textured crop' },
  { id: 'buzz-twist', name: 'Buzz Twist', prompt: 'buzz cut with a stylish twist' },
  { id: 'buzz-fade', name: 'Buzz Fade', prompt: 'buzz cut with a clean skin fade' },
  { id: 'slick-fade', name: 'Slick Fade', prompt: 'slicked back hair with a fade' },
  { id: 'natural-fade', name: 'Natural Fade', prompt: 'natural fade haircut' },
  { id: 'curly-fade', name: 'Curly Taper Fade', prompt: 'curly hair with a taper fade' },
  { id: 'curly-fringe', name: 'Curly Fringe', prompt: 'curly hair styled with a fringe' },
  { id: 'comb-over', name: 'Comb-Over', prompt: 'classic comb-over' },
  { id: 'taper-combover', name: 'Taper Combover', prompt: 'taper faded combover' },
  { id: 'bro-flow', name: 'Bro Flow', prompt: 'long hair in a "bro flow" style' },
  { id: 'side-swept', name: 'Side-Swept', prompt: 'medium side-swept hairstyle' },
];

export const HAIR_STYLE_OPTIONS_KIDS_BOY: HairStyleOption[] = [
  { id: 'caesar', name: 'Caesar Cut', prompt: 'short Caesar cut with straight fringe' },
  { id: 'textured-crop', name: 'Textured Crop', prompt: 'short textured crop for kids' },
  { id: 'faux-hawk', name: 'Faux Hawk', prompt: 'playful faux hawk hairstyle' },
  { id: 'crew-cut', name: 'Crew Cut', prompt: 'classic neat crew cut' },
  { id: 'side-part', name: 'Side Part', prompt: 'tidy side part hairstyle' },
  { id: 'taper-fade', name: 'Taper Fade', prompt: 'clean taper fade' },
  { id: 'low-fade', name: 'Low Fade', prompt: 'low skin fade' },
  { id: 'high-fade', name: 'High Fade', prompt: 'high skin fade' },
];

export const HAIR_STYLE_OPTIONS_KIDS_GIRL: HairStyleOption[] = [
  { id: 'crew-cut', name: 'Crew Cut', prompt: 'short hair on top with even shorter sides' },
  { id: 'caesar', name: 'Caesar Cut', prompt: 'short haircut with a small straight fringe' },
  { id: 'ivy-league', name: 'Ivy League', prompt: 'neat short haircut styled to the side' },
  { id: 'comb-over', name: 'Comb Over', prompt: 'hair combed neatly to one side' },
  { id: 'spiky', name: 'Spiky', prompt: 'short spiky hair' },
  { id: 'flat-top', name: 'Flat Top', prompt: 'classic flat top cut' },
];

export const FIT_TYPE_OPTIONS: FitTypeOption[] = [
  { id: 'loose', name: 'Loose', prompt: 'relaxed, oversized fit with ample drape' },
  { id: 'regular', name: 'Regular', prompt: 'standard proportional fit, true to size' },
  { id: 'tight', name: 'Tight', prompt: 'form-fitting, snug fit highlighting the body contours' },
];

export const BODY_TYPE_OPTIONS_MEN: BodyTypeOption[] = [
  { id: 'slim', name: 'Slim', prompt: 'slim, lean athletic build' },
  { id: 'muscular', name: 'Muscular', prompt: 'v-tapered muscular build, broad shoulders, defined chest' },
  { id: 'heavy', name: 'Heavy / Plus', prompt: 'plus-size, heavy-set large build with realistic body mass' },
];

export const BODY_TYPE_OPTIONS_WOMEN: BodyTypeOption[] = [
  { id: 'slim', name: 'Slim', prompt: 'slim, slender body frame' },
  { id: 'curvy', name: 'Curvy', prompt: 'curvy hourglass figure, defined waist and hips' },
  { id: 'chubby', name: 'Chubby', prompt: 'chubby, soft plus-size body type with realistic curves' },
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
  traditional: [
    { part: 'Kurta/Lehenga Top', optional: false },
    { part: 'Skirt/Bottom', optional: false },
    { part: 'Dupatta', optional: true },
  ],
  streetwear: [
    { part: 'Top (Oversized/Crop)', optional: false },
    { part: 'Bottom (Cargo/Jeans)', optional: false },
    { part: 'Outerwear', optional: true },
  ],
  formals: [
    { part: 'Shirt/Blouse', optional: false },
    { part: 'Trousers/Skirt', optional: false },
    { part: 'Blazer/Coat', optional: true },
  ],
};

export const MEN_CATEGORY_CONFIG: Record<MenProductCategory, { part: string; optional: boolean }[]> = {
  casual: [
    { part: 'Top', optional: false },
    { part: 'Bottom', optional: true },
  ],
  traditional: [
    { part: 'Kurta/Sherwani', optional: false },
    { part: 'Dhoti/Pajama', optional: false },
  ],
  streetwear: [
    { part: 'Top (Hoodie/T-shirt)', optional: false },
    { part: 'Bottom (Jeans/Joggers)', optional: false },
    { part: 'Outerwear/Jacket', optional: true },
  ],
  formals: [
    { part: 'Shirt', optional: false },
    { part: 'Trousers', optional: false },
    { part: 'Blazer/Waistcoat', optional: true },
  ],
};

// --- KIDS SECTION TYPES ---

export type KidsGender = 'boy' | 'girl';
export type KidsAgeGroup = '2-3' | '5' | '7-9' | '10-14';
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

// --- BOTTOM TYPE OPTIONS ---

export interface BottomTypeOption {
  id: string;
  name: string;
  prompt: string;
}

export const BOTTOM_TYPE_OPTIONS_MEN: BottomTypeOption[] = [
  { id: 'jeans', name: 'Jeans', prompt: 'blue denim jeans with a complementary color to the top' },
  { id: 'trousers', name: 'Trousers', prompt: 'formal trousers in a complementary neutral color' },
  { id: 'shorts', name: 'Shorts', prompt: 'casual shorts in a matching color scheme' },
  { id: 'joggers', name: 'Joggers', prompt: 'athletic joggers in a coordinating color' },
  { id: 'chinos', name: 'Chinos', prompt: 'casual chinos in a neutral complementary tone' },
];

export const BOTTOM_TYPE_OPTIONS_WOMEN: BottomTypeOption[] = [
  { id: 'jeans', name: 'Jeans', prompt: 'blue denim jeans with a complementary color to the top' },
  { id: 'trousers', name: 'Trousers', prompt: 'formal trousers in a complementary neutral color' },
  { id: 'skirt', name: 'Skirt', prompt: 'knee-length skirt in a matching color scheme' },
  { id: 'shorts', name: 'Shorts', prompt: 'casual shorts in a coordinating color' },
  { id: 'leggings', name: 'Leggings', prompt: 'fitted leggings in a complementary solid color' },
  { id: 'palazzo', name: 'Palazzo', prompt: 'wide-leg palazzo pants in a matching color palette' },
];

export const BOTTOM_TYPE_OPTIONS_KIDS: BottomTypeOption[] = [
  { id: 'jeans', name: 'Jeans', prompt: 'denim jeans in a color that matches the top' },
  { id: 'trousers', name: 'Trousers', prompt: 'casual trousers in a complementary color' },
  { id: 'shorts', name: 'Shorts', prompt: 'shorts in a coordinating color scheme' },
  { id: 'skirt', name: 'Skirt', prompt: 'skirt in a matching color to the top' },
  { id: 'leggings', name: 'Leggings', prompt: 'leggings in a solid complementary color' },
];

// Pose Options
export type PoseCategory = 'standing' | 'sitting' | 'movement' | 'leaning' | 'lifestyle' | 'artistic';

export interface PoseOption {
  id: string;
  name: string;
  prompt: string;
  category: PoseCategory;
  image?: string; // CDN URL for pose thumbnail (e.g., https://cdn.hyperreach.site/assets/poses/standing_neutral.webp)
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

// Category-specific POSE OPTIONS
export const POSE_OPTIONS_WOMEN: PoseOption[] = [
  { id: 'standing-neutral', name: 'Stand Straight', prompt: 'standing in a graceful, forward-facing model posture', category: 'standing',image:'https://cdn.hyperreach.site/assets/women_pose/Stand_straight.webp' },
  { id: 'hands-on-hips', name: 'Hands on Waist', prompt: 'empowered stance with both hands placed firmly on hips', category: 'standing',image:'https://cdn.hyperreach.site/assets/women_pose/Hand_on_waist.webp' },
  { id: 'crossed-arms', name: 'Bold Arms Crossed', prompt: 'authoritative stance with arms crossed naturally', category: 'standing',image:'https://cdn.hyperreach.site/assets/women_pose/bold_arm_cross.webp' },
  { id: 'one-hand-pocket', name: 'Hand in Pocket', prompt: 'modern standing posture with one hand tucked casually into a pocket', category: 'standing',image:'https://cdn.hyperreach.site/assets/women_pose/hand_in_pocket.webp' },
  { id: 'both-hands-pockets', name: 'Hands in Pockets', prompt: 'casual standing stance with both hands deep in pockets', category: 'standing',image:'https://cdn.hyperreach.site/assets/women_pose/hands_in_pockets.webp' },
  { id: 'fashion-stance', name: 'Model Pose', prompt: 'sophisticated high-fashion stance, body angled at 45 degrees', category: 'standing',image:'https://cdn.hyperreach.site/assets/women_pose/Model_pose.webp' },
  { id: 'looking-down', name: 'Look Down', prompt: 'standing pose with head tilted down', category: 'standing',image:'https://cdn.hyperreach.site/assets/women_pose/look_down.webp' },
  { id: 'lean-chair', name: 'Lean on Chair', prompt: 'relaxed leaning posture against a studio chair', category: 'leaning',image:'https://cdn.hyperreach.site/assets/women_pose/Lean_on_chair.webp' },
  { id: 'casual-lean', name: 'Lean on Wall', prompt: 'relaxed leaning posture against a solid wall', category: 'leaning',image:'https://cdn.hyperreach.site/assets/women_pose/Lean_on_wall.webp' },
  { id: 'lean-on-table', name: 'Lean on Table', prompt: 'leaning forward against a wooden table', category: 'leaning',image:'https://cdn.hyperreach.site/assets/women_pose/Lean_on_table.webp' },
  { id: 'lean-back', name: 'Lean Back', prompt: 'leaning back against a flat surface', category: 'leaning',image:'https://cdn.hyperreach.site/assets/women_pose/Lean_back.webp' },
  { id: 'side-lean', name: 'Side Lean', prompt: 'leaning sideways against a pillar or wall', category: 'leaning',image:'https://cdn.hyperreach.site/assets/women_pose/Side_lean.webp' },
  { id: 'lean-rail', name: 'Lean on Railing', prompt: 'leaning against a balcony or veranda railing', category: 'leaning',image:'https://cdn.hyperreach.site/assets/women_pose/Lean_on_railling.webp' },
  { id: 'walking-motion', name: 'Walk Forward', prompt: 'captured mid-stride walking towards the camera', category: 'movement',image:'https://cdn.hyperreach.site/assets/women_pose/walk_forward.webp' },
  { id: 'dynamic-stride', name: 'Runway Step', prompt: 'large confident stride forward', category: 'movement',image:'https://cdn.hyperreach.site/assets/women_pose/Runway_step.webp' },
  { id: 'twirling', name: 'Graceful Twirl', prompt: 'motion-blur stabilized twirl, garment flared out', category: 'movement',image:'https://cdn.hyperreach.site/assets/women_pose/Graceful_twirl.webp' },
  { id: 'sitting-chair', name: 'Sit on Chair', prompt: 'sitting upright on a minimalist chair', category: 'sitting',image:'https://cdn.hyperreach.site/assets/women_pose/Sit_on_chair.webp' },
  { id: 'sitting-floor', name: 'Sit on Floor', prompt: 'relaxed floor-sitting pose', category: 'sitting',image:'https://cdn.hyperreach.site/assets/women_pose/sit_on_floor.webp' },
  { id: 'speaking-mobile', name: 'Talk on Phone', prompt: 'candid lifestyle shot holding a smartphone to the ear', category: 'lifestyle',image:'https://cdn.hyperreach.site/assets/women_pose/Talk_on_phone.webp' },
  { id: 'watching-mobile', name: 'Look at Phone', prompt: 'natural pose looking down at a mobile screen', category: 'lifestyle',image:'https://cdn.hyperreach.site/assets/women_pose/look_at_phone.webp' },
  { id: 'looking-back', name: 'Look Back', prompt: 'body facing away but head turned back over the shoulder', category: 'artistic',image:'https://cdn.hyperreach.site/assets/women_pose/look_back.webp' },
  { id: 'adjusting-hair', name: 'Fix Hair', prompt: 'artistic candid pose with one hand gently tucked behind the ear', category: 'artistic',image:'https://cdn.hyperreach.site/assets/women_pose/fix_hair.webp' },
];

export const POSE_OPTIONS_MEN: PoseOption[] = [
  { id: 'standing-neutral', name: 'Stand Straight', prompt: 'standing in a graceful, forward-facing model posture', category: 'standing' ,image:'https://cdn.hyperreach.site/assets/men_pose/Stand_Straight.webp' },
  { id: 'hands-on-hips', name: 'Hands on Waist', prompt: 'empowered stance with both hands placed firmly on hips', category: 'standing',image:'https://cdn.hyperreach.site/assets/men_pose/Hands_on_waist.webp' },
  { id: 'crossed-arms', name: 'Bold Arms Crossed', prompt: 'authoritative stance with arms crossed naturally', category: 'standing',image:'https://cdn.hyperreach.site/assets/men_pose/bold_arms_closed.webp' },
  { id: 'one-hand-pocket', name: 'Hand in Pocket', prompt: 'modern standing posture with one hand tucked casually into a pocket', category: 'standing',image:'https://cdn.hyperreach.site/assets/men_pose/hand_in_pocket.webp' },
  { id: 'both-hands-pockets', name: 'Hands in Pockets', prompt: 'casual standing stance with both hands deep in pockets', category: 'standing',image:'https://cdn.hyperreach.site/assets/men_pose/hands_in_pockets.webp' },
  { id: 'fashion-stance', name: 'Model Pose', prompt: 'sophisticated high-fashion stance, body angled at 45 degrees', category: 'standing',image:'https://cdn.hyperreach.site/assets/men_pose/model_pose.webp' },
  { id: 'looking-down', name: 'Look Down', prompt: 'standing pose with head tilted down', category: 'standing',image:'https://cdn.hyperreach.site/assets/men_pose/look_down.webp' }, 
  { id: 'lean-chair', name: 'Lean on Chair', prompt: 'relaxed leaning posture against a studio chair', category: 'leaning',image:'https://cdn.hyperreach.site/assets/men_pose/lean_on_chair.webp' },
  { id: 'casual-lean', name: 'Lean on Wall', prompt: 'relaxed leaning posture against a solid wall', category: 'leaning',image:'https://cdn.hyperreach.site/assets/men_pose/lean_on_wall.webp' },
  { id: 'lean-on-table', name: 'Lean on Table', prompt: 'leaning forward against a wooden table', category: 'leaning',image:'https://cdn.hyperreach.site/assets/men_pose/lean_on_table.webp' },
  { id: 'lean-back', name: 'Lean Back', prompt: 'leaning back against a flat surface', category: 'leaning',image:'https://cdn.hyperreach.site/assets/men_pose/lean_at_back.webp' },
  { id: 'side-lean', name: 'Side Lean', prompt: 'leaning sideways against a pillar or wall', category: 'leaning',image:'https://cdn.hyperreach.site/assets/men_pose/side_lean.webp' },
  { id: 'lean-rail', name: 'Lean on Railing', prompt: 'leaning against a balcony or veranda railing', category: 'leaning',image:'https://cdn.hyperreach.site/assets/men_pose/lean_on_railing.webp' },
  { id: 'walking-motion', name: 'Walk Forward', prompt: 'captured mid-stride walking towards the camera', category: 'movement',image:'https://cdn.hyperreach.site/assets/men_pose/walk_forward.webp' },
  { id: 'dynamic-stride', name: 'Runway Step', prompt: 'large confident stride forward', category: 'movement',image:'https://cdn.hyperreach.site/assets/men_pose/runway_step.webp' },
  { id: 'twirling', name: 'Graceful Twirl', prompt: 'motion-blur stabilized twirl, garment flared out', category: 'movement',image:'https://cdn.hyperreach.site/assets/men_pose/G raceful_twirl.webp' },
  { id: 'sitting-chair', name: 'Sit on Chair', prompt: 'sitting upright on a minimalist chair', category: 'sitting',image:'https://cdn.hyperreach.site/assets/men_pose/sit_on_chair.webp' },
  { id: 'sitting-floor', name: 'Sit on Floor', prompt: 'relaxed floor-sitting pose', category: 'sitting',image:'https://cdn.hyperreach.site/assets/men_pose/sit_on_floor.webp' },
  { id: 'speaking-mobile', name: 'Talk on Phone', prompt: 'candid lifestyle shot holding a smartphone to the ear', category: 'lifestyle',image:'https://cdn.hyperreach.site/assets/men_pose/talk_on_phone.webp' },
  { id: 'watching-mobile', name: 'Look at Phone', prompt: 'natural pose looking down at a mobile screen', category: 'lifestyle',image:'https://cdn.hyperreach.site/assets/men_pose/look_at_phone.webp' },
  { id: 'looking-back', name: 'Look Back', prompt: 'body facing away but head turned back over the shoulder', category: 'artistic',image:'https://cdn.hyperreach.site/assets/men_pose/look_at_back.webp' },
  { id: 'adjusting-hair', name: 'Fix Hair', prompt: 'artistic candid pose with one hand gently tucked behind the ear', category: 'artistic',image:'https://cdn.hyperreach.site/assets/men_pose/fix_hair.webp' },
];

export const POSE_OPTIONS_KIDS: PoseOption[] = [
  { id: 'standing-neutral', name: 'Stand Straight', prompt: 'standing in a graceful, forward-facing model posture', category: 'standing', image:'https://cdn.hyperreach.site/assets/kids_pose/standing_straight.webp' },
  { id: 'hands-on-hips', name: 'Hands on Waist', prompt: 'empowered stance with both hands placed firmly on hips', category: 'standing', image:'https://cdn.hyperreach.site/assets/kids_pose/hands_on_waist.webp' },
  { id: 'crossed-arms', name: 'Bold Arms Crossed', prompt: 'authoritative stance with arms crossed naturally', category: 'standing', image:'https://cdn.hyperreach.site/assets/kids_pose/bold_arm_crossed.webp' },
  { id: 'one-hand-pocket', name: 'Hand in Pocket', prompt: 'modern standing posture with one hand tucked casually into a pocket', category: 'standing', image:'https://cdn.hyperreach.site/assets/kids_pose/one_hand_pocket.webp' },
  { id: 'both-hands-pockets', name: 'Hands in Pockets', prompt: 'casual standing stance with both hands deep in pockets', category: 'standing', image:'https://cdn.hyperreach.site/assets/kids_pose/both_hands_pockets.webp' },
  { id: 'fashion-stance', name: 'Model Pose', prompt: 'sophisticated high-fashion stance, body angled at 45 degrees', category: 'standing', image:'https://cdn.hyperreach.site/assets/kids_pose/model_pose.webp' },
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

export const POSE_OPTIONS_JEWELLERY: PoseOption[] = [
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
  image?: string; // CDN URL for expression thumbnail
}

export const EXPRESSION_OPTIONS: ExpressionOption[] = [
  { id: 'neutral', name: 'Calm & Poised', prompt: 'serene, calm facial expression' },
  { id: 'subtle-smile', name: 'Warm Glow', prompt: 'a gentle, inviting smile that reaches the eyes' },
  { id: 'confident', name: 'Piercing Gaze', prompt: 'self-assured, bold expression with a slight smirk' },
  { id: 'serious-fashion', name: 'Editorial Intense', prompt: 'vogue-style serious expression' },
  { id: 'playful', name: 'Joyful Laugh', prompt: 'candid laughter, eyes crinkled with joy' },
  { id: 'candid-glance', name: 'Candid Glance', prompt: 'looking slightly away with a natural, unposed facial expression as if unaware of the camera' },
  { id: 'surprised', name: 'Surprised Delight', prompt: 'wide-eyed, genuine expression of joyful surprise with a slight open mouth' },
  { id: 'thoughtful', name: 'Pensive Mood', prompt: 'thoughtful, pensive expression with eyes looking slightly off-camera' },
  { id: 'shy-smile', name: 'Bashful Glow', prompt: 'looking down with a shy, bashful, and sweet smile' },
  { id: 'full-laughter', name: 'Vibrant Laughter', prompt: 'unrestrained, full-faced laughter with head tilted slightly back' },
  { id: 'dreamy', name: 'Dreamy Focus', prompt: 'a soft, dreamy expression with a serene and focused gaze' },
];

// Category-specific EXPRESSION OPTIONS
export const EXPRESSION_OPTIONS_WOMEN: ExpressionOption[] = [
  { id: 'neutral', name: 'Calm & Poised', prompt: 'serene, calm facial expression' },
  { id: 'subtle-smile', name: 'Warm Glow', prompt: 'a gentle, inviting smile that reaches the eyes' },
  { id: 'confident', name: 'Piercing Gaze', prompt: 'self-assured, bold expression with a slight smirk' },
  { id: 'serious-fashion', name: 'Editorial Intense', prompt: 'vogue-style serious expression' },
  { id: 'playful', name: 'Joyful Laugh', prompt: 'candid laughter, eyes crinkled with joy' },
  { id: 'candid-glance', name: 'Candid Glance', prompt: 'looking slightly away with a natural, unposed facial expression as if unaware of the camera' },
  { id: 'surprised', name: 'Surprised Delight', prompt: 'wide-eyed, genuine expression of joyful surprise with a slight open mouth' },
  { id: 'thoughtful', name: 'Pensive Mood', prompt: 'thoughtful, pensive expression with eyes looking slightly off-camera' },
  { id: 'shy-smile', name: 'Bashful Glow', prompt: 'looking down with a shy, bashful, and sweet smile' },
  { id: 'full-laughter', name: 'Vibrant Laughter', prompt: 'unrestrained, full-faced laughter with head tilted slightly back' },
  { id: 'dreamy', name: 'Dreamy Focus', prompt: 'a soft, dreamy expression with a serene and focused gaze' },
];

export const EXPRESSION_OPTIONS_MEN: ExpressionOption[] = [
  { id: 'neutral', name: 'Calm & Poised', prompt: 'serene, calm facial expression' },
  { id: 'subtle-smile', name: 'Warm Glow', prompt: 'a gentle, inviting smile that reaches the eyes' },
  { id: 'confident', name: 'Piercing Gaze', prompt: 'self-assured, bold expression with a slight smirk' },
  { id: 'serious-fashion', name: 'Editorial Intense', prompt: 'vogue-style serious expression' },
  { id: 'playful', name: 'Joyful Laugh', prompt: 'candid laughter, eyes crinkled with joy' },
  { id: 'candid-glance', name: 'Candid Glance', prompt: 'looking slightly away with a natural, unposed facial expression as if unaware of the camera' },
  { id: 'surprised', name: 'Surprised Delight', prompt: 'wide-eyed, genuine expression of joyful surprise with a slight open mouth' },
  { id: 'thoughtful', name: 'Pensive Mood', prompt: 'thoughtful, pensive expression with eyes looking slightly off-camera' },
  { id: 'shy-smile', name: 'Bashful Glow', prompt: 'looking down with a shy, bashful, and sweet smile' },
  { id: 'full-laughter', name: 'Vibrant Laughter', prompt: 'unrestrained, full-faced laughter with head tilted slightly back' },
  { id: 'dreamy', name: 'Dreamy Focus', prompt: 'a soft, dreamy expression with a serene and focused gaze' },
];

export const EXPRESSION_OPTIONS_KIDS: ExpressionOption[] = [
  { id: 'neutral', name: 'Calm & Poised', prompt: 'serene, calm facial expression' },
  { id: 'subtle-smile', name: 'Warm Glow', prompt: 'a gentle, inviting smile that reaches the eyes' },
  { id: 'confident', name: 'Piercing Gaze', prompt: 'self-assured, bold expression with a slight smirk' },
  { id: 'serious-fashion', name: 'Editorial Intense', prompt: 'vogue-style serious expression' },
  { id: 'playful', name: 'Joyful Laugh', prompt: 'candid laughter, eyes crinkled with joy' },
  { id: 'candid-glance', name: 'Candid Glance', prompt: 'looking slightly away with a natural, unposed facial expression as if unaware of the camera' },
  { id: 'surprised', name: 'Surprised Delight', prompt: 'wide-eyed, genuine expression of joyful surprise with a slight open mouth' },
  { id: 'thoughtful', name: 'Pensive Mood', prompt: 'thoughtful, pensive expression with eyes looking slightly off-camera' },
  { id: 'shy-smile', name: 'Bashful Glow', prompt: 'looking down with a shy, bashful, and sweet smile' },
  { id: 'full-laughter', name: 'Vibrant Laughter', prompt: 'unrestrained, full-faced laughter with head tilted slightly back' },
  { id: 'dreamy', name: 'Dreamy Focus', prompt: 'a soft, dreamy expression with a serene and focused gaze' },
];

export const EXPRESSION_OPTIONS_JEWELLERY: ExpressionOption[] = [
  { id: 'neutral', name: 'Calm & Poised', prompt: 'serene, calm facial expression' },
  { id: 'subtle-smile', name: 'Warm Glow', prompt: 'a gentle, inviting smile that reaches the eyes' },
  { id: 'confident', name: 'Piercing Gaze', prompt: 'self-assured, bold expression with a slight smirk' },
  { id: 'serious-fashion', name: 'Editorial Intense', prompt: 'vogue-style serious expression' },
  { id: 'playful', name: 'Joyful Laugh', prompt: 'candid laughter, eyes crinkled with joy' },
  { id: 'candid-glance', name: 'Candid Glance', prompt: 'looking slightly away with a natural, unposed facial expression as if unaware of the camera' },
  { id: 'surprised', name: 'Surprised Delight', prompt: 'wide-eyed, genuine expression of joyful surprise with a slight open mouth' },
  { id: 'thoughtful', name: 'Pensive Mood', prompt: 'thoughtful, pensive expression with eyes looking slightly off-camera' },
  { id: 'shy-smile', name: 'Bashful Glow', prompt: 'looking down with a shy, bashful, and sweet smile' },
  { id: 'full-laughter', name: 'Vibrant Laughter', prompt: 'unrestrained, full-faced laughter with head tilted slightly back' },
  { id: 'dreamy', name: 'Dreamy Focus', prompt: 'a soft, dreamy expression with a serene and focused gaze' },
];

export interface ViewOption {
  id: string;
  name: string;
  prompt: string;
  image?: string; // CDN URL for view/angle thumbnail
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

// Category-specific VIEW OPTIONS
export const VIEW_OPTIONS_WOMEN: ViewOption[] = [
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

export const VIEW_OPTIONS_MEN: ViewOption[] = [
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

export const VIEW_OPTIONS_KIDS: ViewOption[] = [
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

export const VIEW_OPTIONS_JEWELLERY: ViewOption[] = [
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

// --- REPORT/FEEDBACK TYPES ---

export type FeedbackType = 'like' | 'dislike';

export type IssueCategory =
  | 'poor-quality'
  | 'wrong-colors'
  | 'incorrect-fit'
  | 'unnatural-pose'
  | 'background-issues'
  | 'facial-features'
  | 'product-mismatch'
  | 'other';

export type ReportStatus = 'new' | 'reviewed' | 'resolved';

export interface Report {
  id: string;
  reportId?: string;
  userId: string;
  historyId?: string;
  userEmail: string;
  userName: string;
  feedbackType: FeedbackType;
  issueCategory: IssueCategory;
  customMessage: string;
  section: Section;
  category: string;
  qualityUsed: string;
  isRead: boolean;
  status: ReportStatus;
  adminNotes?: string;
  createdAt: string;
  // File URLs
  generatedImageUrl?: string;
  productImageUrls?: string[];
}

export interface CreateReportData {
  feedbackType: FeedbackType;
  issueCategory: IssueCategory;
  customMessage: string;
  historyId?: string;
  section: Section;
  category: string;
  qualityUsed: string;
  // Files will be sent as FormData
}

export const ISSUE_CATEGORIES: { value: IssueCategory; label: string; description: string }[] = [
  { value: 'poor-quality', label: 'Poor Quality/Blurry', description: 'Image is low quality or blurry' },
  { value: 'wrong-colors', label: 'Wrong Colors', description: 'Colors don\'t match the product' },
  { value: 'incorrect-fit', label: 'Incorrect Fit/Draping', description: 'Garment doesn\'t fit properly' },
  { value: 'unnatural-pose', label: 'Unnatural Pose', description: 'Model pose looks unnatural' },
  { value: 'background-issues', label: 'Background Issues', description: 'Problems with background/lighting' },
  { value: 'facial-features', label: 'Facial Features Incorrect', description: 'Face or features look wrong' },
  { value: 'product-mismatch', label: 'Product Not Matching', description: 'Product doesn\'t match upload' },
  { value: 'other', label: 'Other', description: 'Other issues' }
];

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