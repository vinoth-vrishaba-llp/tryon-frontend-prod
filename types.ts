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
  image?: string;
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

export type BackgroundCategory = 'studio' | 'heritage' | 'urban' | 'nature' | 'traditional' | 'wedding' | 'kids';

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
  { id: 'white-studio', name: 'White Studio', prompt: 'Place the fully rendered model on a clean, solid, studio-quality white background (#FFFFFF). Soft, even lighting.', category: 'studio',image:"https://cdn.hyperreach.site/assets/real_bg/white_studio.webp" },
  { id: 'temple-corridor', name: 'Temple Mandapam', prompt: 'Place the fully rendered model in an ancient South Indian temple corridor with carved granite pillars. Warm,Spiritual and historic atmosphere.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/real_bg/temple_mandapam.webp"},
  { id: 'outside-mylapore', name: 'Outside Mylapore Temple', prompt: 'Place the model on the vibrant street outside Kapaleeshwarar Temple, Mylapore. The towering, colorful Gopuram is visible in the background. Natural daylight with the hustle and bustle of a traditional Chennai street.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/real_bg/outside_mylapore_temple.webp" },
  { id: 'kochi-cafe', name: 'Kochi Heritage Cafe', prompt: 'Place the model inside a rustic, high-ceilinged heritage cafe in Fort Kochi. Features include wooden rafters, colonial-style windows, tropical plants, and a relaxed, aesthetic atmosphere.', category: 'urban' ,image:"https://cdn.hyperreach.site/assets/real_bg/kochi_heritage_cafe.webp"},
  { id: 'indiranagar-street', name: 'Indiranagar Street, Bangalore', prompt: 'Place the model on a beautiful tree-lined street in Indiranagar, Bangalore. Upscale urban setting with lush green canopies, modern storefronts, and a clean city vibe.', category: 'urban' ,image:"https://cdn.hyperreach.site/assets/real_bg/indiranagar_street_banglore.webp"},
  { id: 'pondicherry-french', name: 'French Colony, Pondicherry', prompt: 'Place the model on a street in the White Town area of Pondicherry. Iconic bright yellow colonial buildings with white trim, bougainvillea flowers spilling over walls, and a clean, European-Indian hybrid aesthetic.', category: 'urban' ,image:"https://cdn.hyperreach.site/assets/real_bg/french_colony_pondicherry.webp"},
  { id: 'marine-drive-beach', name: 'Mumbai Marine Drive', prompt: "Place the model on the promenade of Marine Drive, Mumbai. The Arabian Sea and the iconic tetrapods are in view, with the Queen's Necklace skyline visible in the distance during a breezy evening.", category: 'urban' ,image:"https://cdn.hyperreach.site/assets/real_bg/mumbai_marine_drive.webp"},
  { id: 'chennai-central', name: 'Chennai Central Station', prompt: 'Place the model in front of the iconic red brick heritage building of Chennai Central Railway Station. Grand architectural background with Victorian-Gothic details and a sense of historic travel.', category: 'heritage' ,image:"https://cdn.hyperreach.site/assets/real_bg/chennai_central.webp"},
  { id: 'chettinad-wall', name: 'Chettinad Sunlit Wall', prompt: 'Place the fully rendered model against a warm, textured yellow plaster wall typical of a Chettinad house in Tamil Nadu, with dramatic natural shadows cast by coconut palm leaves.', category: 'traditional' ,image:"https://cdn.hyperreach.site/assets/real_bg/chettinad_wall.webp"},
  { id: 'red-oxide-floor', name: 'Red Oxide Veranda', prompt: 'Place the fully rendered model standing on a traditional red oxide floor in a semi-open veranda, with antique wooden pillars.', category: 'traditional' ,image:"https://cdn.hyperreach.site/assets/real_bg/red_oxide_floor.webp"},
  { id: 'kerala-backwaters', name: 'Kerala Backwaters', prompt: 'Place the fully rendered model on the wooden deck of a traditional houseboat in Alappuzha, Kerala.', category: 'nature' ,image:"https://cdn.hyperreach.site/assets/real_bg/kerala_backwaters.webp"},
  { id: 'mahabalipuram-shore', name: 'Mahabalipuram Shore', prompt: 'Place the fully rendered model on the sandy beach near the Shore Temple in Mahabalipuram, Tamil Nadu.', category: 'nature' ,image:"https://cdn.hyperreach.site/assets/real_bg/mahabalipuram_shore.webp"},
  { id: 'ooty-tea-garden', name: 'Ooty Tea Garden', prompt: 'Place the fully rendered model standing on a narrow pathway in a lush green tea estate in Ooty/Nilgiris.', category: 'nature' ,image:"https://cdn.hyperreach.site/assets/real_bg/ooty_tea_garden.webp"},
  { id: 'chettinad-courtyard', name: 'Chettinad Courtyard', prompt: 'Place the fully rendered model in the central courtyard of a traditional Chettinad mansion.', category: 'traditional' ,image:"https://cdn.hyperreach.site/assets/real_bg/chettinad_courtyard.webp"},
  { id: 'royal-crimson', name: 'Royal Crimson Studio', prompt: 'A deep crimson textured plaster wall with a subtle floral leaf pattern. A heavy golden-mustard silk curtain drapes on the right. Features a vintage ornate velvet chair with a floral bouquet, antique candelabras, and a classic Persian rug.', category: 'studio',image:"https://cdn.hyperreach.site/assets/real_bg/royal_crimson.webp" },
  { id: 'mughal-heritage', name: 'Mughal Heritage Arch', prompt: 'A grand Mughal-style interior with light sandstone walls, intricate arch carvings, and delicate floral murals. Includes a vintage wooden side table with a brass candle stand under soft, diffused morning sunlight.', category: 'heritage' ,image:"https://cdn.hyperreach.site/assets/real_bg/mughal_heritage.webp"},
  { id: 'rustic-orange', name: 'Rustic Boho Orange', prompt: 'A vibrant, rustic orange-textured wall with an earthy feel. A dark wood carved jali room divider is on the left, and simple wooden shelves with antique pottery and vases are on the right. Features a classic red patterned rug.', category: 'traditional' ,image:"https://cdn.hyperreach.site/assets/real_bg/rustic_orange.webp"},
  { id: 'earthy-minimalist', name: 'Earthy Minimalist', prompt: 'A clean, minimalist studio background in warm tan/terracotta. Includes a lush palm plant, a woven vase with dried pampas grass, and natural woven floor mats under soft organic lighting.', category: 'studio' ,image:"https://cdn.hyperreach.site/assets/real_bg/earthy_minimalist.webp"},
  { id: 'turquoise-palace', name: 'Grand Turquoise Hall', prompt: 'A majestic palace hall with turquoise patterned wallpaper and white ornate Victorian arches. Includes a dark carved wooden console table with a flower vase and intricate blue-and-white patterned floor tiles.', category: 'heritage' ,image:"https://cdn.hyperreach.site/assets/real_bg/turquoise_palace.webp"},
  { id: 'floral-arbour', name: 'Wedding Floral Arbour', prompt: 'A festive backdrop with cream leaf-patterned wallpaper, framed by a lush arch of white and peach roses and greenery. Features hanging crystal beaded globes and a vibrant green grass floor.', category: 'wedding' ,image:"https://cdn.hyperreach.site/assets/real_bg/floral_arbour.webp"},
  { id: 'modern-stripes', name: 'Modern Urban Stripes', prompt: 'A contemporary urban background with vertical red, green, and blue stripes. A large green palm leaf overlaps the composition on the left. Features a clean concrete-paved floor under bright natural daylight.', category: 'urban' ,image:"https://cdn.hyperreach.site/assets/real_bg/modern_stripes.webp"},
  { id: 'traditional-wooden-door', name: 'Ancient Wooden Door', prompt: 'An ancient, intricately carved double wooden door set within a weathered mud-brick and plaster wall. The door features traditional geometric patterns and heavy brass rings. Natural, direct daylight creates soft shadows on the textured clay surface, giving a rustic, historical feel.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/heritage/traditional-wooden.webp"},
  { id: 'carved-temple-pillars', name: 'Stone Temple Interior', prompt: 'Inside a magnificent ancient stone temple with towering pillars covered in incredibly detailed carvings of deities and floral patterns. The warm, golden stone glows under diffused sunlight coming from above. Symmetrical architectural perspective with deep depth of field.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/heritage/temple-pillars.webp" },
  { id: 'medieval-stone-street', name: 'Medieval Italian Street', prompt: 'A sun-drenched cobblestone street in a medieval Italian village. An old stone building with wooden shutters and a vaulted archway frames the path. Vibrant pink oleander flowers and a large agave plant add natural color. Warm late afternoon golden light.', category: 'urban',image:"https://cdn.hyperreach.site/assets/heritage/medivel-stone.webp" },
  { id: 'arched-stone-colonnade', name: 'Arched Colonnade', prompt: 'A long colonnade of classic stone arches casting long, rhythmic geometric shadows across a paved floor. The ceiling features dark wooden beams. Warm side-lighting highlights the texture of the weathered sandstone pillars and creates high-contrast atmosphere.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/heritage/corridor-historic.webp" },
  { id: 'ancient-sculpted-hall', name: 'Sculpted Pillars Hall', prompt: 'A majestic corridor lined with ancient, highly decorative stone pillars featuring deep relief carvings. The perspective draws the eye down a path of weathered stone tiles towards a dark, mysterious interior. Atmospheric lighting with rich textures.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/heritage/ancient-sculpted.webp"},
  { id: 'red-brick-vaulted-hall', name: 'Red Brick Vaults', prompt: 'A grand hallway featuring high vaulted ceilings and multiple rows of massive red brick arches. The floor is made of polished light stone. Soft, even lighting emphasizes the architectural symmetry and the warm, rich tones of the historical brickwork.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/heritage/red-brick.webp" },
  { id: 'mughal-heritage-arch', name: 'Mughal Heritage View', prompt: 'A view through a grand red sandstone archway looking towards a majestic domed monument. The arch features intricate geometric carvings. Clear bright sky in the background creates a sharp architectural silhouette with professional catalog lighting.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/heritage/mughal-heritage.webp"},
  { id: 'white-palace-veranda', name: 'Palace Scalloped Veranda', prompt: 'An elegant white-painted palace veranda with traditional scalloped arches and decorative pillars. A warm terracotta floor leads towards a distant doorway. Ornate blue glass lanterns hang from the ceiling. Bright, airy, and luxurious atmosphere.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/heritage/white-palace.webp"},
  { id: 'hampi-ruins-sunset', name: 'Ancient Ruins Sunset', prompt: 'The majestic ruins of an ancient stone temple complex at sunset. Features large stone elephant sculptures guarding a staircase. A weathered red structure stands in the background against a soft blue and orange sky with light cinematic clouds.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/heritage/humpi-ruins.webp"},
  { id: 'lotus-scalloped-arches', name: 'Lotus Scalloped Arches', prompt: 'A series of elegant, recursive scalloped arches made of smooth ochre-colored stone. The view looks through multiple layers of arches into a sunlit green courtyard. Intricate floral carvings decorate the top edges of the arches.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/heritage/lotus-scalloped.webp" },
  { id: 'sandstone-jali-palace', name: 'Sandstone Jali Palace', prompt: 'A detailed view of a traditional palace exterior featuring a life-sized stone elephant sculpture. The background wall is covered in incredibly fine jali (lattice) work and arched alcoves carved into yellow sandstone. Warm, golden architectural lighting.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/heritage/sandstone-jali.webp"},
  { id: 'royal-sandstone-interior', name: 'Royal Sandstone Hall', prompt: 'An ornate red sandstone interior hall with massive pillars covered in delicate geometric and floral carvings. Intricate jali windows allow soft, directional light to filter through, creating a warm, atmospheric glow on the ancient stone floor.', category: 'heritage' ,image:"https://cdn.hyperreach.site/assets/heritage/royal-sandstone.webp"},
  { id: 'copper-oxide-studio', name: 'Copper Oxide Wall', prompt: 'A minimalist studio backdrop featuring a heavily textured reddish-brown copper oxide wall. The surface has rich metallic patinas and industrial rust details. Professional flat lighting creating a warm, gritty atmosphere.', category: 'studio', image:"https://cdn.hyperreach.site/assets/real_bg/copper-oxide-wall.webp"},
  { id: 'nordic-minimalist-interior', name: 'Nordic Minimalist Room', prompt: 'A clean, bright Nordic-style room with white wainscoted walls and a warm wooden parquet floor. The space is decorated with a tall green palm tree, a wooden ladder leaning against the wall, and a patterned rug. Natural window light creates a soft, inviting fashion studio look.', category: 'studio', image:"https://cdn.hyperreach.site/assets/real_bg/nordic-minimalist-room.webp" },
  { id: 'luxury-floral-moulding', name: 'Floral Moulding Studio', prompt: 'A sophisticated studio set with deep grey-taupe classical wall mouldings. Multiple elegant vases with tall, blooming white flower branches are arranged on a light wooden floor. Soft, warm cinematic lighting with elegant shadows.', category: 'studio', image:"https://cdn.hyperreach.site/assets/real_bg/floral-moulding-studio.webp" },
  { id: 'al-seef-historic-courtyard', name: 'Desert Heritage Wooden Door', prompt: 'A traditional Middle Eastern heritage courtyard wall with a weathered wooden double door set into sand-colored plaster. Rough adobe textures, exposed wooden beams, and soft directional sunlight casting sharp geometric shadows across stone flooring. Warm, dry atmosphere with historic Gulf architecture character.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/urban/al-seef.webp"},
  { id: 'jodhpur-blue-city-door', name: 'Jodhpur Blue City Entrance', prompt: 'A vivid cobalt-blue plaster wall featuring a deep red carved wooden door with brass accents. Hand-painted Rajasthani mural figures flank the doorway. Flat frontal daylight emphasizes saturated color, cultural ornamentation, and aged wall textures typical of the Blue City of Jodhpur.', category: 'urban' ,image:"https://cdn.hyperreach.site/assets/urban/jodhpur-blue-city.webp"},
  { id: 'medieval-red-brick-door', name: 'Medieval Brick Facade Door', prompt: 'A narrow historic wooden door embedded in an ornate red brick and stone facade. Decorative brick recesses frame the doorway, with weathered wood grain and uneven masonry textures. Natural diffused daylight creates a grounded, old-world European medieval atmosphere.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/urban/medieval-red.webp" },
  { id: 'arequipa-red-stone-door', name: 'Volcanic Stone Courtyard Door', prompt: 'A carved wooden double door set into a deep red volcanic stone wall, characteristic of Arequipa architecture. Intricate floral wood carvings, heavy shadows, and warm directional sunlight. Minimal surroundings emphasize texture, mass, and colonial South American heritage.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/urban/arequipa-red.webp" },
  { id: 'bougainvillea-green-door', name: 'Mediterranean Floral Entryway', prompt: 'A dark green arched wooden front door set in a white stucco wall, framed by cascading pink bougainvillea vines. Soft natural daylight creates dappled leaf shadows. Mediterranean residential charm with balanced color contrast and calm, inviting composition.', category: 'urban',image:"https://cdn.hyperreach.site/assets/urban/bougainvillea-green.webp" },
  { id: 'blue-wall-bicycle', name: 'Minimal Blue Alley Bicycle', prompt: 'A single black bicycle leaning against a faded blue plaster wall in a narrow stone alley. Simple composition with muted tones, surface wear, and soft ambient daylight. Quiet urban stillness with strong color blocking and minimal distractions.', category: 'urban',image:"https://cdn.hyperreach.site/assets/urban/blue-wall.webp" },
  { id: 'hoi-an-backstreet-vehicles', name: 'Hoi An Colonial Passage', prompt: 'A narrow colonial alleyway with repeating archways, lined with parked bicycles and motorbikes. Aged plaster walls, teal metal shutters, and warm sunlight filtering through. Strong depth perspective and everyday Southeast Asian street life atmosphere.', category: 'urban',image:"https://cdn.hyperreach.site/assets/urban/hoi-an.webp" },
  { id: 'kek-lok-si-temple-arch', name: 'Chinese Temple Moon Gate', prompt: 'A circular moon gate framed by richly painted Buddhist murals and red architectural detailing. Hanging lanterns, layered temple roofs, and symmetrical composition. Bright daylight enhances saturated colors and ceremonial East Asian temple aesthetics.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/urban/kek-lok.webp" },
  { id: 'georgetown-colonial-house', name: 'Colonial Shophouse Facade', prompt: 'A pastel-toned colonial-era building facade with closed grey wooden shutters and patterned vertical tiles. Flat frontal lighting highlights symmetry, surface aging, and Southeast Asian heritage architecture. Calm, documentary-style urban composition.', category: 'urban',image:"https://cdn.hyperreach.site/assets/urban/georgetown-colonial.webp" },
  { id: 'graffiti-underpass', name: 'Urban Graffiti Tunnel', prompt: 'A long tiled pedestrian underpass covered in layered graffiti murals and neon paint splashes. Artificial overhead lighting creates a moody gradient glow and deep perspective. Gritty urban atmosphere with strong symmetry and vanishing point.', category: 'urban',image:"https://cdn.hyperreach.site/assets/urban/graffiti-underpass.webp" },
  { id: 'mandalay-heritage-building', name: 'Myanmar Heritage Facade', prompt: 'A pale yellow historic building with closed grey wooden doors and ornamental vertical columns. Subtle surface wear, flat daylight, and symmetrical framing. Quiet civic or religious architecture common in Mandalay, Myanmar.', category: 'heritage' ,image:"https://cdn.hyperreach.site/assets/urban/mandalay-hritage.webp"},
  { id: 'park-brick-walkway', name: 'Tree-Lined Brick Path', prompt: 'A gently curving red brick walking path surrounded by lush green grass and mature trees. Overcast daylight softens shadows, creating a peaceful park environment with strong leading lines and natural symmetry.', category: 'nature',image:"https://cdn.hyperreach.site/assets/urban/park-brick.webp" },
  { id: 'formal-park-path', name: 'Symmetrical Garden Walkway', prompt: 'A wide stone-tiled pedestrian path bordered by manicured hedges and evenly spaced trees. Bright daylight with clean shadows. Formal park landscaping with balanced composition and open, orderly atmosphere.', category: 'nature',image:"https://cdn.hyperreach.site/assets/urban/formal-park.webp" },
  { id: 'yellow-alley-bicycle', name: 'Sunlit Yellow Alley', prompt: 'A vintage bicycle resting against a textured yellow plaster wall in a narrow urban alley. Strong sunlight creates high contrast shadows and depth. Warm tones and linear perspective dominate the composition.', category: 'urban',image:"https://cdn.hyperreach.site/assets/urban/yellow-alley.webp" },
  { id: 'jodhpur-blue-stairway', name: 'Blue City Stone Steps', prompt: 'A steep stone stairway enclosed by intensely blue-painted plaster walls. Chipped paint, uneven steps, and directional daylight create strong texture contrast. Authentic residential passageway from Jodhpur\'s Blue City.', category: 'urban',image:"https://cdn.hyperreach.site/assets/urban/jodhpur-blue.webp" },
  { id: 'ooty-weathered-blue-door', name: 'Weathered Hill Station Door', prompt: 'A faded blue wooden door set into a peeling yellow plaster wall with exposed brick patches. Soft natural daylight emphasizes age, texture, and patina. Quiet South Indian hill-station residential character.', category: 'heritage' ,image:"https://cdn.hyperreach.site/assets/urban/ooty-weathered.webp"},
];

export const BACKGROUND_OPTIONS_MEN: BackgroundOption[] = [
  { id: 'white-studio', name: 'White Studio', prompt: 'Place the fully rendered model on a clean, solid, studio-quality white background (#FFFFFF). Soft, even lighting.', category: 'studio',image:"https://cdn.hyperreach.site/assets/real_bg/white_studio.webp" },
  { id: 'temple-corridor', name: 'Temple Mandapam', prompt: 'Place the fully rendered model in an ancient South Indian temple corridor with carved granite pillars. Warm,Spiritual and historic atmosphere.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/real_bg/temple_mandapam.webp"},
  { id: 'outside-mylapore', name: 'Outside Mylapore Temple', prompt: 'Place the model on the vibrant street outside Kapaleeshwarar Temple, Mylapore. The towering, colorful Gopuram is visible in the background. Natural daylight with the hustle and bustle of a traditional Chennai street.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/real_bg/outside_mylapore_temple.webp" },
  { id: 'kochi-cafe', name: 'Kochi Heritage Cafe', prompt: 'Place the model inside a rustic, high-ceilinged heritage cafe in Fort Kochi. Features include wooden rafters, colonial-style windows, tropical plants, and a relaxed, aesthetic atmosphere.', category: 'urban' ,image:"https://cdn.hyperreach.site/assets/real_bg/kochi_heritage_cafe.webp"},
  { id: 'indiranagar-street', name: 'Indiranagar Street, Bangalore', prompt: 'Place the model on a beautiful tree-lined street in Indiranagar, Bangalore. Upscale urban setting with lush green canopies, modern storefronts, and a clean city vibe.', category: 'urban' ,image:"https://cdn.hyperreach.site/assets/real_bg/indiranagar_street_banglore.webp"},
  { id: 'pondicherry-french', name: 'French Colony, Pondicherry', prompt: 'Place the model on a street in the White Town area of Pondicherry. Iconic bright yellow colonial buildings with white trim, bougainvillea flowers spilling over walls, and a clean, European-Indian hybrid aesthetic.', category: 'urban' ,image:"https://cdn.hyperreach.site/assets/real_bg/french_colony_pondicherry.webp"},
  { id: 'marine-drive-beach', name: 'Mumbai Marine Drive', prompt: "Place the model on the promenade of Marine Drive, Mumbai. The Arabian Sea and the iconic tetrapods are in view, with the Queen's Necklace skyline visible in the distance during a breezy evening.", category: 'urban' ,image:"https://cdn.hyperreach.site/assets/real_bg/mumbai_marine_drive.webp"},
  { id: 'chennai-central', name: 'Chennai Central Station', prompt: 'Place the model in front of the iconic red brick heritage building of Chennai Central Railway Station. Grand architectural background with Victorian-Gothic details and a sense of historic travel.', category: 'heritage' ,image:"https://cdn.hyperreach.site/assets/real_bg/chennai_central.webp"},
  { id: 'chettinad-wall', name: 'Chettinad Sunlit Wall', prompt: 'Place the fully rendered model against a warm, textured yellow plaster wall typical of a Chettinad house in Tamil Nadu, with dramatic natural shadows cast by coconut palm leaves.', category: 'traditional' ,image:"https://cdn.hyperreach.site/assets/real_bg/chettinad_wall.webp"},
  { id: 'red-oxide-floor', name: 'Red Oxide Veranda', prompt: 'Place the fully rendered model standing on a traditional red oxide floor in a semi-open veranda, with antique wooden pillars.', category: 'traditional' ,image:"https://cdn.hyperreach.site/assets/real_bg/red_oxide_floor.webp"},
  { id: 'kerala-backwaters', name: 'Kerala Backwaters', prompt: 'Place the fully rendered model on the wooden deck of a traditional houseboat in Alappuzha, Kerala.', category: 'nature' ,image:"https://cdn.hyperreach.site/assets/real_bg/kerala_backwaters.webp"},
  { id: 'mahabalipuram-shore', name: 'Mahabalipuram Shore', prompt: 'Place the fully rendered model on the sandy beach near the Shore Temple in Mahabalipuram, Tamil Nadu.', category: 'nature' ,image:"https://cdn.hyperreach.site/assets/real_bg/mahabalipuram_shore.webp"},
  { id: 'ooty-tea-garden', name: 'Ooty Tea Garden', prompt: 'Place the fully rendered model standing on a narrow pathway in a lush green tea estate in Ooty/Nilgiris.', category: 'nature' ,image:"https://cdn.hyperreach.site/assets/real_bg/ooty_tea_garden.webp"},
  { id: 'chettinad-courtyard', name: 'Chettinad Courtyard', prompt: 'Place the fully rendered model in the central courtyard of a traditional Chettinad mansion.', category: 'traditional' ,image:"https://cdn.hyperreach.site/assets/real_bg/chettinad_courtyard.webp"},
  { id: 'royal-crimson', name: 'Royal Crimson Studio', prompt: 'A deep crimson textured plaster wall with a subtle floral leaf pattern. A heavy golden-mustard silk curtain drapes on the right. Features a vintage ornate velvet chair with a floral bouquet, antique candelabras, and a classic Persian rug.', category: 'studio',image:"https://cdn.hyperreach.site/assets/real_bg/royal_crimson.webp" },
  { id: 'mughal-heritage', name: 'Mughal Heritage Arch', prompt: 'A grand Mughal-style interior with light sandstone walls, intricate arch carvings, and delicate floral murals. Includes a vintage wooden side table with a brass candle stand under soft, diffused morning sunlight.', category: 'heritage' ,image:"https://cdn.hyperreach.site/assets/real_bg/mughal_heritage.webp"},
  { id: 'rustic-orange', name: 'Rustic Boho Orange', prompt: 'A vibrant, rustic orange-textured wall with an earthy feel. A dark wood carved jali room divider is on the left, and simple wooden shelves with antique pottery and vases are on the right. Features a classic red patterned rug.', category: 'traditional' ,image:"https://cdn.hyperreach.site/assets/real_bg/rustic_orange.webp"},
  { id: 'earthy-minimalist', name: 'Earthy Minimalist', prompt: 'A clean, minimalist studio background in warm tan/terracotta. Includes a lush palm plant, a woven vase with dried pampas grass, and natural woven floor mats under soft organic lighting.', category: 'studio' ,image:"https://cdn.hyperreach.site/assets/real_bg/earthy_minimalist.webp"},
  { id: 'turquoise-palace', name: 'Grand Turquoise Hall', prompt: 'A majestic palace hall with turquoise patterned wallpaper and white ornate Victorian arches. Includes a dark carved wooden console table with a flower vase and intricate blue-and-white patterned floor tiles.', category: 'heritage' ,image:"https://cdn.hyperreach.site/assets/real_bg/turquoise_palace.webp"},
  { id: 'floral-arbour', name: 'Wedding Floral Arbour', prompt: 'A festive backdrop with cream leaf-patterned wallpaper, framed by a lush arch of white and peach roses and greenery. Features hanging crystal beaded globes and a vibrant green grass floor.', category: 'wedding' ,image:"https://cdn.hyperreach.site/assets/real_bg/floral_arbour.webp"},
  { id: 'modern-stripes', name: 'Modern Urban Stripes', prompt: 'A contemporary urban background with vertical red, green, and blue stripes. A large green palm leaf overlaps the composition on the left. Features a clean concrete-paved floor under bright natural daylight.', category: 'urban' ,image:"https://cdn.hyperreach.site/assets/real_bg/modern_stripes.webp"},
  { id: 'traditional-wooden-door', name: 'Ancient Wooden Door', prompt: 'An ancient, intricately carved double wooden door set within a weathered mud-brick and plaster wall. The door features traditional geometric patterns and heavy brass rings. Natural, direct daylight creates soft shadows on the textured clay surface, giving a rustic, historical feel.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/heritage/traditional-wooden.webp"},
  { id: 'carved-temple-pillars', name: 'Stone Temple Interior', prompt: 'Inside a magnificent ancient stone temple with towering pillars covered in incredibly detailed carvings of deities and floral patterns. The warm, golden stone glows under diffused sunlight coming from above. Symmetrical architectural perspective with deep depth of field.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/heritage/temple-pillars.webp" },
  { id: 'medieval-stone-street', name: 'Medieval Italian Street', prompt: 'A sun-drenched cobblestone street in a medieval Italian village. An old stone building with wooden shutters and a vaulted archway frames the path. Vibrant pink oleander flowers and a large agave plant add natural color. Warm late afternoon golden light.', category: 'urban',image:"https://cdn.hyperreach.site/assets/heritage/medivel-stone.webp" },
  { id: 'arched-stone-colonnade', name: 'Arched Colonnade', prompt: 'A long colonnade of classic stone arches casting long, rhythmic geometric shadows across a paved floor. The ceiling features dark wooden beams. Warm side-lighting highlights the texture of the weathered sandstone pillars and creates high-contrast atmosphere.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/heritage/corridor-historic.webp" },
  { id: 'ancient-sculpted-hall', name: 'Sculpted Pillars Hall', prompt: 'A majestic corridor lined with ancient, highly decorative stone pillars featuring deep relief carvings. The perspective draws the eye down a path of weathered stone tiles towards a dark, mysterious interior. Atmospheric lighting with rich textures.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/heritage/ancient-sculpted.webp"},
  { id: 'red-brick-vaulted-hall', name: 'Red Brick Vaults', prompt: 'A grand hallway featuring high vaulted ceilings and multiple rows of massive red brick arches. The floor is made of polished light stone. Soft, even lighting emphasizes the architectural symmetry and the warm, rich tones of the historical brickwork.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/heritage/red-brick.webp" },
  { id: 'mughal-heritage-arch', name: 'Mughal Heritage View', prompt: 'A view through a grand red sandstone archway looking towards a majestic domed monument. The arch features intricate geometric carvings. Clear bright sky in the background creates a sharp architectural silhouette with professional catalog lighting.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/heritage/mughal-heritage.webp"},
  { id: 'white-palace-veranda', name: 'Palace Scalloped Veranda', prompt: 'An elegant white-painted palace veranda with traditional scalloped arches and decorative pillars. A warm terracotta floor leads towards a distant doorway. Ornate blue glass lanterns hang from the ceiling. Bright, airy, and luxurious atmosphere.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/heritage/white-palace.webp"},
  { id: 'hampi-ruins-sunset', name: 'Ancient Ruins Sunset', prompt: 'The majestic ruins of an ancient stone temple complex at sunset. Features large stone elephant sculptures guarding a staircase. A weathered red structure stands in the background against a soft blue and orange sky with light cinematic clouds.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/heritage/humpi-ruins.webp"},
  { id: 'lotus-scalloped-arches', name: 'Lotus Scalloped Arches', prompt: 'A series of elegant, recursive scalloped arches made of smooth ochre-colored stone. The view looks through multiple layers of arches into a sunlit green courtyard. Intricate floral carvings decorate the top edges of the arches.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/heritage/lotus-scalloped.webp" },
  { id: 'sandstone-jali-palace', name: 'Sandstone Jali Palace', prompt: 'A detailed view of a traditional palace exterior featuring a life-sized stone elephant sculpture. The background wall is covered in incredibly fine jali (lattice) work and arched alcoves carved into yellow sandstone. Warm, golden architectural lighting.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/heritage/sandstone-jali.webp"},
  { id: 'royal-sandstone-interior', name: 'Royal Sandstone Hall', prompt: 'An ornate red sandstone interior hall with massive pillars covered in delicate geometric and floral carvings. Intricate jali windows allow soft, directional light to filter through, creating a warm, atmospheric glow on the ancient stone floor.', category: 'heritage' ,image:"https://cdn.hyperreach.site/assets/heritage/royal-sandstone.webp"},
  { id: 'copper-oxide-studio', name: 'Copper Oxide Wall', prompt: 'A minimalist studio backdrop featuring a heavily textured reddish-brown copper oxide wall. The surface has rich metallic patinas and industrial rust details. Professional flat lighting creating a warm, gritty atmosphere.', category: 'studio', image:"https://cdn.hyperreach.site/assets/real_bg/copper-oxide-wall.webp"},
  { id: 'nordic-minimalist-interior', name: 'Nordic Minimalist Room', prompt: 'A clean, bright Nordic-style room with white wainscoted walls and a warm wooden parquet floor. The space is decorated with a tall green palm tree, a wooden ladder leaning against the wall, and a patterned rug. Natural window light creates a soft, inviting fashion studio look.', category: 'studio', image:"https://cdn.hyperreach.site/assets/real_bg/nordic-minimalist-room.webp" },
  { id: 'luxury-floral-moulding', name: 'Floral Moulding Studio', prompt: 'A sophisticated studio set with deep grey-taupe classical wall mouldings. Multiple elegant vases with tall, blooming white flower branches are arranged on a light wooden floor. Soft, warm cinematic lighting with elegant shadows.', category: 'studio', image:"https://cdn.hyperreach.site/assets/real_bg/floral-moulding-studio.webp" },
  { id: 'al-seef-historic-courtyard', name: 'Desert Heritage Wooden Door', prompt: 'A traditional Middle Eastern heritage courtyard wall with a weathered wooden double door set into sand-colored plaster. Rough adobe textures, exposed wooden beams, and soft directional sunlight casting sharp geometric shadows across stone flooring. Warm, dry atmosphere with historic Gulf architecture character.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/urban/al-seef.webp"},
  { id: 'jodhpur-blue-city-door', name: 'Jodhpur Blue City Entrance', prompt: 'A vivid cobalt-blue plaster wall featuring a deep red carved wooden door with brass accents. Hand-painted Rajasthani mural figures flank the doorway. Flat frontal daylight emphasizes saturated color, cultural ornamentation, and aged wall textures typical of the Blue City of Jodhpur.', category: 'urban' ,image:"https://cdn.hyperreach.site/assets/urban/jodhpur-blue-city.webp"},
  { id: 'medieval-red-brick-door', name: 'Medieval Brick Facade Door', prompt: 'A narrow historic wooden door embedded in an ornate red brick and stone facade. Decorative brick recesses frame the doorway, with weathered wood grain and uneven masonry textures. Natural diffused daylight creates a grounded, old-world European medieval atmosphere.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/urban/medieval-red.webp" },
  { id: 'arequipa-red-stone-door', name: 'Volcanic Stone Courtyard Door', prompt: 'A carved wooden double door set into a deep red volcanic stone wall, characteristic of Arequipa architecture. Intricate floral wood carvings, heavy shadows, and warm directional sunlight. Minimal surroundings emphasize texture, mass, and colonial South American heritage.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/urban/arequipa-red.webp" },
  { id: 'bougainvillea-green-door', name: 'Mediterranean Floral Entryway', prompt: 'A dark green arched wooden front door set in a white stucco wall, framed by cascading pink bougainvillea vines. Soft natural daylight creates dappled leaf shadows. Mediterranean residential charm with balanced color contrast and calm, inviting composition.', category: 'urban',image:"https://cdn.hyperreach.site/assets/urban/bougainvillea-green.webp" },
  { id: 'blue-wall-bicycle', name: 'Minimal Blue Alley Bicycle', prompt: 'A single black bicycle leaning against a faded blue plaster wall in a narrow stone alley. Simple composition with muted tones, surface wear, and soft ambient daylight. Quiet urban stillness with strong color blocking and minimal distractions.', category: 'urban',image:"https://cdn.hyperreach.site/assets/urban/blue-wall.webp" },
  { id: 'hoi-an-backstreet-vehicles', name: 'Hoi An Colonial Passage', prompt: 'A narrow colonial alleyway with repeating archways, lined with parked bicycles and motorbikes. Aged plaster walls, teal metal shutters, and warm sunlight filtering through. Strong depth perspective and everyday Southeast Asian street life atmosphere.', category: 'urban',image:"https://cdn.hyperreach.site/assets/urban/hoi-an.webp" },
  { id: 'kek-lok-si-temple-arch', name: 'Chinese Temple Moon Gate', prompt: 'A circular moon gate framed by richly painted Buddhist murals and red architectural detailing. Hanging lanterns, layered temple roofs, and symmetrical composition. Bright daylight enhances saturated colors and ceremonial East Asian temple aesthetics.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/urban/kek-lok.webp" },
  { id: 'georgetown-colonial-house', name: 'Colonial Shophouse Facade', prompt: 'A pastel-toned colonial-era building facade with closed grey wooden shutters and patterned vertical tiles. Flat frontal lighting highlights symmetry, surface aging, and Southeast Asian heritage architecture. Calm, documentary-style urban composition.', category: 'urban',image:"https://cdn.hyperreach.site/assets/urban/georgetown-colonial.webp" },
  { id: 'graffiti-underpass', name: 'Urban Graffiti Tunnel', prompt: 'A long tiled pedestrian underpass covered in layered graffiti murals and neon paint splashes. Artificial overhead lighting creates a moody gradient glow and deep perspective. Gritty urban atmosphere with strong symmetry and vanishing point.', category: 'urban',image:"https://cdn.hyperreach.site/assets/urban/graffiti-underpass.webp" },
  { id: 'mandalay-heritage-building', name: 'Myanmar Heritage Facade', prompt: 'A pale yellow historic building with closed grey wooden doors and ornamental vertical columns. Subtle surface wear, flat daylight, and symmetrical framing. Quiet civic or religious architecture common in Mandalay, Myanmar.', category: 'heritage' ,image:"https://cdn.hyperreach.site/assets/urban/mandalay-hritage.webp"},
  { id: 'park-brick-walkway', name: 'Tree-Lined Brick Path', prompt: 'A gently curving red brick walking path surrounded by lush green grass and mature trees. Overcast daylight softens shadows, creating a peaceful park environment with strong leading lines and natural symmetry.', category: 'nature',image:"https://cdn.hyperreach.site/assets/urban/park-brick.webp" },
  { id: 'formal-park-path', name: 'Symmetrical Garden Walkway', prompt: 'A wide stone-tiled pedestrian path bordered by manicured hedges and evenly spaced trees. Bright daylight with clean shadows. Formal park landscaping with balanced composition and open, orderly atmosphere.', category: 'nature',image:"https://cdn.hyperreach.site/assets/urban/formal-park.webp" },
  { id: 'yellow-alley-bicycle', name: 'Sunlit Yellow Alley', prompt: 'A vintage bicycle resting against a textured yellow plaster wall in a narrow urban alley. Strong sunlight creates high contrast shadows and depth. Warm tones and linear perspective dominate the composition.', category: 'urban',image:"https://cdn.hyperreach.site/assets/urban/yellow-alley.webp" },
  { id: 'jodhpur-blue-stairway', name: 'Blue City Stone Steps', prompt: 'A steep stone stairway enclosed by intensely blue-painted plaster walls. Chipped paint, uneven steps, and directional daylight create strong texture contrast. Authentic residential passageway from Jodhpur\'s Blue City.', category: 'urban',image:"https://cdn.hyperreach.site/assets/urban/jodhpur-blue.webp" },
  { id: 'ooty-weathered-blue-door', name: 'Weathered Hill Station Door', prompt: 'A faded blue wooden door set into a peeling yellow plaster wall with exposed brick patches. Soft natural daylight emphasizes age, texture, and patina. Quiet South Indian hill-station residential character.', category: 'heritage' ,image:"https://cdn.hyperreach.site/assets/urban/ooty-weathered.webp"},
];

export const BACKGROUND_OPTIONS_KIDS: BackgroundOption[] = [
  { id: 'white-studio', name: 'White Studio', prompt: 'Place the fully rendered model on a clean, solid, studio-quality white background (#FFFFFF). Soft, even lighting.', category: 'studio',image:"https://cdn.hyperreach.site/assets/real_bg/white_studio.webp" },
  { id: 'temple-corridor', name: 'Temple Mandapam', prompt: 'Place the fully rendered model in an ancient South Indian temple corridor with carved granite pillars. Warm,Spiritual and historic atmosphere.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/real_bg/temple_mandapam.webp"},
  { id: 'kochi-cafe', name: 'Kochi Heritage Cafe', prompt: 'Place the model inside a rustic, high-ceilinged heritage cafe in Fort Kochi. Features include wooden rafters, colonial-style windows, tropical plants, and a relaxed, aesthetic atmosphere.', category: 'urban' ,image:"https://cdn.hyperreach.site/assets/real_bg/kochi_heritage_cafe.webp"},
  { id: 'indiranagar-street', name: 'Indiranagar Street, Bangalore', prompt: 'Place the model on a beautiful tree-lined street in Indiranagar, Bangalore. Upscale urban setting with lush green canopies, modern storefronts, and a clean city vibe.', category: 'urban' ,image:"https://cdn.hyperreach.site/assets/real_bg/indiranagar_street_banglore.webp"},
  { id: 'pondicherry-french', name: 'French Colony, Pondicherry', prompt: 'Place the model on a street in the White Town area of Pondicherry. Iconic bright yellow colonial buildings with white trim, bougainvillea flowers spilling over walls, and a clean, European-Indian hybrid aesthetic.', category: 'urban' ,image:"https://cdn.hyperreach.site/assets/real_bg/french_colony_pondicherry.webp"},
  { id: 'marine-drive-beach', name: 'Mumbai Marine Drive', prompt: "Place the model on the promenade of Marine Drive, Mumbai. The Arabian Sea and the iconic tetrapods are in view, with the Queen's Necklace skyline visible in the distance during a breezy evening.", category: 'urban' ,image:"https://cdn.hyperreach.site/assets/real_bg/mumbai_marine_drive.webp"},
  { id: 'chettinad-wall', name: 'Chettinad Sunlit Wall', prompt: 'Place the fully rendered model against a warm, textured yellow plaster wall typical of a Chettinad house in Tamil Nadu, with dramatic natural shadows cast by coconut palm leaves.', category: 'traditional' ,image:"https://cdn.hyperreach.site/assets/real_bg/chettinad_wall.webp"},
  { id: 'red-oxide-floor', name: 'Red Oxide Veranda', prompt: 'Place the fully rendered model standing on a traditional red oxide floor in a semi-open veranda, with antique wooden pillars.', category: 'traditional' ,image:"https://cdn.hyperreach.site/assets/real_bg/red_oxide_floor.webp"},
  { id: 'kerala-backwaters', name: 'Kerala Backwaters', prompt: 'Place the fully rendered model on the wooden deck of a traditional houseboat in Alappuzha, Kerala.', category: 'nature' ,image:"https://cdn.hyperreach.site/assets/real_bg/kerala_backwaters.webp"},
  { id: 'ooty-tea-garden', name: 'Ooty Tea Garden', prompt: 'Place the fully rendered model standing on a narrow pathway in a lush green tea estate in Ooty/Nilgiris.', category: 'nature' ,image:"https://cdn.hyperreach.site/assets/real_bg/ooty_tea_garden.webp"},
  { id: 'chettinad-courtyard', name: 'Chettinad Courtyard', prompt: 'Place the fully rendered model in the central courtyard of a traditional Chettinad mansion.', category: 'traditional' ,image:"https://cdn.hyperreach.site/assets/real_bg/chettinad_courtyard.webp"},
  { id: 'royal-crimson', name: 'Royal Crimson Studio', prompt: 'A deep crimson textured plaster wall with a subtle floral leaf pattern. A heavy golden-mustard silk curtain drapes on the right. Features a vintage ornate velvet chair with a floral bouquet, antique candelabras, and a classic Persian rug.', category: 'studio',image:"https://cdn.hyperreach.site/assets/real_bg/royal_crimson.webp" },
  { id: 'mughal-heritage', name: 'Mughal Heritage Arch', prompt: 'A grand Mughal-style interior with light sandstone walls, intricate arch carvings, and delicate floral murals. Includes a vintage wooden side table with a brass candle stand under soft, diffused morning sunlight.', category: 'heritage' ,image:"https://cdn.hyperreach.site/assets/real_bg/mughal_heritage.webp"},
  { id: 'rustic-orange', name: 'Rustic Boho Orange', prompt: 'A vibrant, rustic orange-textured wall with an earthy feel. A dark wood carved jali room divider is on the left, and simple wooden shelves with antique pottery and vases are on the right. Features a classic red patterned rug.', category: 'traditional' ,image:"https://cdn.hyperreach.site/assets/real_bg/rustic_orange.webp"},
  { id: 'earthy-minimalist', name: 'Earthy Minimalist', prompt: 'A clean, minimalist studio background in warm tan/terracotta. Includes a lush palm plant, a woven vase with dried pampas grass, and natural woven floor mats under soft organic lighting.', category: 'studio' ,image:"https://cdn.hyperreach.site/assets/real_bg/earthy_minimalist.webp"},
  { id: 'turquoise-palace', name: 'Grand Turquoise Hall', prompt: 'A majestic palace hall with turquoise patterned wallpaper and white ornate Victorian arches. Includes a dark carved wooden console table with a flower vase and intricate blue-and-white patterned floor tiles.', category: 'heritage' ,image:"https://cdn.hyperreach.site/assets/real_bg/turquoise_palace.webp"},
  { id: 'floral-arbour', name: 'Wedding Floral Arbour', prompt: 'A festive backdrop with cream leaf-patterned wallpaper, framed by a lush arch of white and peach roses and greenery. Features hanging crystal beaded globes and a vibrant green grass floor.', category: 'wedding' ,image:"https://cdn.hyperreach.site/assets/real_bg/floral_arbour.webp"},
  { id: 'modern-stripes', name: 'Modern Urban Stripes', prompt: 'A contemporary urban background with vertical red, green, and blue stripes. A large green palm leaf overlaps the composition on the left. Features a clean concrete-paved floor under bright natural daylight.', category: 'urban' ,image:"https://cdn.hyperreach.site/assets/real_bg/modern_stripes.webp"},
  {
    id: 'kids-teddy-wood',
    name: 'Cozy Teddy Wood',
    prompt: 'A cozy studio setting with dark brown horizontal wooden planks as a backdrop. Heart-shaped felt bunting in golden-tan hangs across the wall. A soft shaggy cream rug covers the floor. A brown plush teddy bear with an orange scarf sits on the floor.', category: 'kids', image: "https://cdn.hyperreach.site/assets/kids-background/teddy-wood.webp"
  },
  {
    id: 'kids-boho-nursery',
    name: 'Boho Nursery',
    prompt: 'A bright, airy white studio with a minimalist boho nursery aesthetic. Features a rattan child-sized armchair in the center. A wooden ladder with a small heart ornament leans against the white wall. A white plush bunny sits on a small wooden stool. Includes dried pampas grass and a toy wooden cart.', category: 'kids', image: "https://cdn.hyperreach.site/assets/kids-background/boho-nusery.webp"
  },
  {
    id: 'minimal-alcoves',
    name: 'Arched Alcoves',
    prompt: 'A sophisticated minimalist background with a textured off-white wall. Features five recessed arched alcoves of varying sizes, softly illuminated from within. Each alcove contains a simple earthy ceramic pot or vase. Light wood flooring.', category: 'kids', image: "https://cdn.hyperreach.site/assets/kids-background/minimal-alcoves.webp"
  },
  {
    id: 'minimal-floral-studio',
    name: 'Minimal Floral',
    prompt: 'An ultra-clean, minimalist white studio background. Two elegant ceramic vases containing soft pink, yellow, and purple flowers are positioned at the bottom corners, framing the center. Soft, diffused lighting.', category: 'kids', image: "https://cdn.hyperreach.site/assets/kids-background/minimal-floral.webp"
  },
  {
    id: 'kids-palm-curtain',
    name: 'Palm & Stool Studio',
    prompt: 'A professional children’s photography studio with a soft beige fabric curtain backdrop. A plush velvet beige stool sits on a circular woven jute rug. A green palm frond enters the frame from the right, adding a fresh, natural aesthetic. Bright, soft studio lighting.', category: 'kids', image: "https://cdn.hyperreach.site/assets/kids-background/palm-curtain.webp"
  },
  {
    id: 'kids-lemon-studio',
    name: 'Lemon Blossom Studio',
    prompt: 'A clean, high-key white studio background. Features a tall rustic wooden bar-style stool. Next to it sits a large wicker basket overflowing with vibrant yellow flowers and fresh greenery. Natural, warm daylight atmosphere.',category: 'kids', image: "https://cdn.hyperreach.site/assets/kids-background/lemon-blossom.webp"
  },
  {
    id: 'kids-classic-panel',
    name: 'Classic Paneled Room',
    prompt: 'An elegant interior with white-painted wall molding and decorative panels. A textured wicker or jute rug covers the floor. The space feels premium and bright, suitable for high-end fashion catalog photography.',category: 'kids', image: "https://cdn.hyperreach.site/assets/kids-background/classic-pannel.webp"
  },
  {
    id: 'kids-solid-blue',
    name: 'Solid Sky Blue',
    prompt: 'A clean, solid vibrant sky blue studio cyclorama background. Perfect for modern, energetic fashion shots with minimal distractions and even, shadowless lighting.',category: 'kids', image: "https://cdn.hyperreach.site/assets/kids-background/sky-blue.webp"
  },
  { id: 'traditional-wooden-door', name: 'Ancient Wooden Door', prompt: 'An ancient, intricately carved double wooden door set within a weathered mud-brick and plaster wall. The door features traditional geometric patterns and heavy brass rings. Natural, direct daylight creates soft shadows on the textured clay surface, giving a rustic, historical feel.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/heritage/traditional-wooden.webp"},
  { id: 'carved-temple-pillars', name: 'Stone Temple Interior', prompt: 'Inside a magnificent ancient stone temple with towering pillars covered in incredibly detailed carvings of deities and floral patterns. The warm, golden stone glows under diffused sunlight coming from above. Symmetrical architectural perspective with deep depth of field.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/heritage/temple-pillars.webp" },
  { id: 'medieval-stone-street', name: 'Medieval Italian Street', prompt: 'A sun-drenched cobblestone street in a medieval Italian village. An old stone building with wooden shutters and a vaulted archway frames the path. Vibrant pink oleander flowers and a large agave plant add natural color. Warm late afternoon golden light.', category: 'urban',image:"https://cdn.hyperreach.site/assets/heritage/medivel-stone.webp" },
  { id: 'arched-stone-colonnade', name: 'Arched Colonnade', prompt: 'A long colonnade of classic stone arches casting long, rhythmic geometric shadows across a paved floor. The ceiling features dark wooden beams. Warm side-lighting highlights the texture of the weathered sandstone pillars and creates high-contrast atmosphere.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/heritage/corridor-historic.webp" },
  { id: 'ancient-sculpted-hall', name: 'Sculpted Pillars Hall', prompt: 'A majestic corridor lined with ancient, highly decorative stone pillars featuring deep relief carvings. The perspective draws the eye down a path of weathered stone tiles towards a dark, mysterious interior. Atmospheric lighting with rich textures.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/heritage/ancient-sculpted.webp"},
  { id: 'red-brick-vaulted-hall', name: 'Red Brick Vaults', prompt: 'A grand hallway featuring high vaulted ceilings and multiple rows of massive red brick arches. The floor is made of polished light stone. Soft, even lighting emphasizes the architectural symmetry and the warm, rich tones of the historical brickwork.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/heritage/red-brick.webp" },
  { id: 'mughal-heritage-arch', name: 'Mughal Heritage View', prompt: 'A view through a grand red sandstone archway looking towards a majestic domed monument. The arch features intricate geometric carvings. Clear bright sky in the background creates a sharp architectural silhouette with professional catalog lighting.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/heritage/mughal-heritage.webp"},
  { id: 'white-palace-veranda', name: 'Palace Scalloped Veranda', prompt: 'An elegant white-painted palace veranda with traditional scalloped arches and decorative pillars. A warm terracotta floor leads towards a distant doorway. Ornate blue glass lanterns hang from the ceiling. Bright, airy, and luxurious atmosphere.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/heritage/white-palace.webp"},
  { id: 'hampi-ruins-sunset', name: 'Ancient Ruins Sunset', prompt: 'The majestic ruins of an ancient stone temple complex at sunset. Features large stone elephant sculptures guarding a staircase. A weathered red structure stands in the background against a soft blue and orange sky with light cinematic clouds.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/heritage/humpi-ruins.webp"},
  { id: 'lotus-scalloped-arches', name: 'Lotus Scalloped Arches', prompt: 'A series of elegant, recursive scalloped arches made of smooth ochre-colored stone. The view looks through multiple layers of arches into a sunlit green courtyard. Intricate floral carvings decorate the top edges of the arches.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/heritage/lotus-scalloped.webp" },
  { id: 'sandstone-jali-palace', name: 'Sandstone Jali Palace', prompt: 'A detailed view of a traditional palace exterior featuring a life-sized stone elephant sculpture. The background wall is covered in incredibly fine jali (lattice) work and arched alcoves carved into yellow sandstone. Warm, golden architectural lighting.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/heritage/sandstone-jali.webp"},
  { id: 'royal-sandstone-interior', name: 'Royal Sandstone Hall', prompt: 'An ornate red sandstone interior hall with massive pillars covered in delicate geometric and floral carvings. Intricate jali windows allow soft, directional light to filter through, creating a warm, atmospheric glow on the ancient stone floor.', category: 'heritage' ,image:"https://cdn.hyperreach.site/assets/heritage/royal-sandstone.webp"},
  { id: 'copper-oxide-studio', name: 'Copper Oxide Wall', prompt: 'A minimalist studio backdrop featuring a heavily textured reddish-brown copper oxide wall. The surface has rich metallic patinas and industrial rust details. Professional flat lighting creating a warm, gritty atmosphere.', category: 'studio', image:"https://cdn.hyperreach.site/assets/real_bg/copper-oxide-wall.webp"},
  { id: 'nordic-minimalist-interior', name: 'Nordic Minimalist Room', prompt: 'A clean, bright Nordic-style room with white wainscoted walls and a warm wooden parquet floor. The space is decorated with a tall green palm tree, a wooden ladder leaning against the wall, and a patterned rug. Natural window light creates a soft, inviting fashion studio look.', category: 'studio', image:"https://cdn.hyperreach.site/assets/real_bg/nordic-minimalist-room.webp" },
  { id: 'luxury-floral-moulding', name: 'Floral Moulding Studio', prompt: 'A sophisticated studio set with deep grey-taupe classical wall mouldings. Multiple elegant vases with tall, blooming white flower branches are arranged on a light wooden floor. Soft, warm cinematic lighting with elegant shadows.', category: 'studio', image:"https://cdn.hyperreach.site/assets/real_bg/floral-moulding-studio.webp" },
  { id: 'al-seef-historic-courtyard', name: 'Desert Heritage Wooden Door', prompt: 'A traditional Middle Eastern heritage courtyard wall with a weathered wooden double door set into sand-colored plaster. Rough adobe textures, exposed wooden beams, and soft directional sunlight casting sharp geometric shadows across stone flooring. Warm, dry atmosphere with historic Gulf architecture character.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/urban/al-seef.webp"},
  { id: 'jodhpur-blue-city-door', name: 'Jodhpur Blue City Entrance', prompt: 'A vivid cobalt-blue plaster wall featuring a deep red carved wooden door with brass accents. Hand-painted Rajasthani mural figures flank the doorway. Flat frontal daylight emphasizes saturated color, cultural ornamentation, and aged wall textures typical of the Blue City of Jodhpur.', category: 'urban' ,image:"https://cdn.hyperreach.site/assets/urban/jodhpur-blue-city.webp"},
  { id: 'medieval-red-brick-door', name: 'Medieval Brick Facade Door', prompt: 'A narrow historic wooden door embedded in an ornate red brick and stone facade. Decorative brick recesses frame the doorway, with weathered wood grain and uneven masonry textures. Natural diffused daylight creates a grounded, old-world European medieval atmosphere.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/urban/medieval-red.webp" },
  { id: 'arequipa-red-stone-door', name: 'Volcanic Stone Courtyard Door', prompt: 'A carved wooden double door set into a deep red volcanic stone wall, characteristic of Arequipa architecture. Intricate floral wood carvings, heavy shadows, and warm directional sunlight. Minimal surroundings emphasize texture, mass, and colonial South American heritage.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/urban/arequipa-red.webp" },
  { id: 'bougainvillea-green-door', name: 'Mediterranean Floral Entryway', prompt: 'A dark green arched wooden front door set in a white stucco wall, framed by cascading pink bougainvillea vines. Soft natural daylight creates dappled leaf shadows. Mediterranean residential charm with balanced color contrast and calm, inviting composition.', category: 'urban',image:"https://cdn.hyperreach.site/assets/urban/bougainvillea-green.webp" },
  { id: 'blue-wall-bicycle', name: 'Minimal Blue Alley Bicycle', prompt: 'A single black bicycle leaning against a faded blue plaster wall in a narrow stone alley. Simple composition with muted tones, surface wear, and soft ambient daylight. Quiet urban stillness with strong color blocking and minimal distractions.', category: 'urban',image:"https://cdn.hyperreach.site/assets/urban/blue-wall.webp" },
  { id: 'hoi-an-backstreet-vehicles', name: 'Hoi An Colonial Passage', prompt: 'A narrow colonial alleyway with repeating archways, lined with parked bicycles and motorbikes. Aged plaster walls, teal metal shutters, and warm sunlight filtering through. Strong depth perspective and everyday Southeast Asian street life atmosphere.', category: 'urban',image:"https://cdn.hyperreach.site/assets/urban/hoi-an.webp" },
  { id: 'kek-lok-si-temple-arch', name: 'Chinese Temple Moon Gate', prompt: 'A circular moon gate framed by richly painted Buddhist murals and red architectural detailing. Hanging lanterns, layered temple roofs, and symmetrical composition. Bright daylight enhances saturated colors and ceremonial East Asian temple aesthetics.', category: 'heritage',image:"https://cdn.hyperreach.site/assets/urban/kek-lok.webp" },
  { id: 'georgetown-colonial-house', name: 'Colonial Shophouse Facade', prompt: 'A pastel-toned colonial-era building facade with closed grey wooden shutters and patterned vertical tiles. Flat frontal lighting highlights symmetry, surface aging, and Southeast Asian heritage architecture. Calm, documentary-style urban composition.', category: 'urban',image:"https://cdn.hyperreach.site/assets/urban/georgetown-colonial.webp" },
  { id: 'graffiti-underpass', name: 'Urban Graffiti Tunnel', prompt: 'A long tiled pedestrian underpass covered in layered graffiti murals and neon paint splashes. Artificial overhead lighting creates a moody gradient glow and deep perspective. Gritty urban atmosphere with strong symmetry and vanishing point.', category: 'urban',image:"https://cdn.hyperreach.site/assets/urban/graffiti-underpass.webp" },
  { id: 'mandalay-heritage-building', name: 'Myanmar Heritage Facade', prompt: 'A pale yellow historic building with closed grey wooden doors and ornamental vertical columns. Subtle surface wear, flat daylight, and symmetrical framing. Quiet civic or religious architecture common in Mandalay, Myanmar.', category: 'heritage' ,image:"https://cdn.hyperreach.site/assets/urban/mandalay-hritage.webp"},
  { id: 'park-brick-walkway', name: 'Tree-Lined Brick Path', prompt: 'A gently curving red brick walking path surrounded by lush green grass and mature trees. Overcast daylight softens shadows, creating a peaceful park environment with strong leading lines and natural symmetry.', category: 'nature',image:"https://cdn.hyperreach.site/assets/urban/park-brick.webp" },
  { id: 'formal-park-path', name: 'Symmetrical Garden Walkway', prompt: 'A wide stone-tiled pedestrian path bordered by manicured hedges and evenly spaced trees. Bright daylight with clean shadows. Formal park landscaping with balanced composition and open, orderly atmosphere.', category: 'nature',image:"https://cdn.hyperreach.site/assets/urban/formal-park.webp" },
  { id: 'yellow-alley-bicycle', name: 'Sunlit Yellow Alley', prompt: 'A vintage bicycle resting against a textured yellow plaster wall in a narrow urban alley. Strong sunlight creates high contrast shadows and depth. Warm tones and linear perspective dominate the composition.', category: 'urban',image:"https://cdn.hyperreach.site/assets/urban/yellow-alley.webp" },
  { id: 'jodhpur-blue-stairway', name: 'Blue City Stone Steps', prompt: 'A steep stone stairway enclosed by intensely blue-painted plaster walls. Chipped paint, uneven steps, and directional daylight create strong texture contrast. Authentic residential passageway from Jodhpur\'s Blue City.', category: 'urban',image:"https://cdn.hyperreach.site/assets/urban/jodhpur-blue.webp" },
  { id: 'ooty-weathered-blue-door', name: 'Weathered Hill Station Door', prompt: 'A faded blue wooden door set into a peeling yellow plaster wall with exposed brick patches. Soft natural daylight emphasizes age, texture, and patina. Quiet South Indian hill-station residential character.', category: 'heritage' ,image:"https://cdn.hyperreach.site/assets/urban/ooty-weathered.webp"},
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
  { id: 'bun', name: 'Bun', prompt: 'black hair styled into a neat, professional bun',image:"https://cdn.hyperreach.site/assets/women-hair/bun.webp" },
  { id: 'long-wavy', name: 'Long Wavy', prompt: 'long black flowing wavy hair with natural volume' ,image:"https://cdn.hyperreach.site/assets/women-hair/long-wavy.webp"},
  { id: 'french-braid', name: 'French Braid', prompt: 'black hair elegantly styled into a French braid' ,image:"https://cdn.hyperreach.site/assets/women-hair/french-braid.webp"},
  { id: 'fishtail-braid', name: 'Fishtail Braid', prompt: 'black hair intricately styled into a fishtail braid' ,image:"https://cdn.hyperreach.site/assets/women-hair/fishtail-braid.webp"},
  { id: 'chignon', name: 'Chignon', prompt: 'black hair in sophisticated low chignon knot' ,image:"https://cdn.hyperreach.site/assets/women-hair/chignon.webp"},
  { id: 'pony-tail', name: 'Pony Tail', prompt: 'black hair in high, sleek pony tail' ,image:"https://cdn.hyperreach.site/assets/women-hair/pony.webp"},
  { id: 'short-bob', name: 'Short Bob', prompt: 'black hair classic short bob cut' ,image:"https://cdn.hyperreach.site/assets/women-hair/short-bob.webp"},
  { id: 'layered-cut', name: 'Layered Cut', prompt: 'black hair in modern layered haircut' ,image:"https://cdn.hyperreach.site/assets/women-hair/layered.webp"},
  { id: 'messy-bun', name: 'Messy Bun', prompt: 'black hair in relaxed, stylish messy bun' ,image:"https://cdn.hyperreach.site/assets/women-hair/messy.webp"},
];

export const HAIR_STYLE_OPTIONS_MEN: HairStyleOption[] = [
  { id: 'french-crop', name: 'French Crop', prompt: 'modern French crop with short sides and textured top',image:"https://cdn.hyperreach.site/assets/men-hair/french.webp"},
  { id: 'short-pompadour', name: 'Pompadour', prompt: 'short pompadour with volume' ,image:"https://cdn.hyperreach.site/assets/men-hair/pompadour.webp"},
  { id: 'classic-quiff', name: 'Classic Quiff', prompt: 'classic quiff hairstyle' ,image:"https://cdn.hyperreach.site/assets/men-hair/classic-quiff.webp"},
  { id: 'textured-crop', name: 'Textured Crop', prompt: 'short textured crop' ,image:"https://cdn.hyperreach.site/assets/men-hair/textured.webp"},
  { id: 'buzz-twist', name: 'Buzz Twist', prompt: 'buzz cut with a stylish twist',image:"https://cdn.hyperreach.site/assets/men-hair/buzz-twist.webp" },
  { id: 'buzz-fade', name: 'Buzz Fade', prompt: 'buzz cut with a clean skin fade' ,image:"https://cdn.hyperreach.site/assets/men-hair/buzz-fade.webp"},
  { id: 'slick-fade', name: 'Slick Fade', prompt: 'slicked back hair with a fade' ,image:"https://cdn.hyperreach.site/assets/men-hair/slick-fade.webp"},
  { id: 'natural-fade', name: 'Natural Fade', prompt: 'natural fade haircut' ,image:"https://cdn.hyperreach.site/assets/men-hair/natural-fade.webp"},
  { id: 'curly-fade', name: 'Curly Taper Fade', prompt: 'curly hair with a taper fade' ,image:"https://cdn.hyperreach.site/assets/men-hair/curly-trapper.webp"},
  { id: 'curly-fringe', name: 'Curly Fringe', prompt: 'curly hair styled with a fringe' ,image:"https://cdn.hyperreach.site/assets/men-hair/curly-finge.webp"},
  { id: 'comb-over', name: 'Comb-Over', prompt: 'classic comb-over' ,image:"https://cdn.hyperreach.site/assets/men-hair/comb-over.webp"},
  { id: 'taper-combover', name: 'Taper Combover', prompt: 'taper faded combover' ,image:"https://cdn.hyperreach.site/assets/men-hair/trapper-comb.webp"},
  { id: 'bro-flow', name: 'Bro Flow', prompt: 'long hair in a "bro flow" style' ,image:"https://cdn.hyperreach.site/assets/men-hair/bro.webp"},
  { id: 'side-swept', name: 'Side-Swept', prompt: 'medium side-swept hairstyle' ,image:"https://cdn.hyperreach.site/assets/men-hair/side-swept.webp"},
];

export const HAIR_STYLE_OPTIONS_KIDS_BOY: HairStyleOption[] = [
  { id: 'caesar', name: 'Caesar Cut', prompt: 'short Caesar cut with straight fringe',image:"https://cdn.hyperreach.site/assets/kid-boy-hair/ceasar.webp"},
  { id: 'textured-crop', name: 'Textured Crop', prompt: 'short textured crop for kids' ,image:"https://cdn.hyperreach.site/assets/kid-boy-hair/textured.webp"},
  { id: 'faux-hawk', name: 'Faux Hawk', prompt: 'playful faux hawk hairstyle' ,image:"https://cdn.hyperreach.site/assets/kid-boy-hair/faux.webp"},
  { id: 'crew-cut', name: 'Crew Cut', prompt: 'classic neat crew cut' ,image:"https://cdn.hyperreach.site/assets/kid-boy-hair/crew.webp"},
  { id: 'side-part', name: 'Side Part', prompt: 'tidy side part hairstyle' ,image:"https://cdn.hyperreach.site/assets/kid-boy-hair/side.webp"},
  { id: 'taper-fade', name: 'Taper Fade', prompt: 'clean taper fade' ,image:"https://cdn.hyperreach.site/assets/kid-boy-hair/traper-fade.webp"},
  { id: 'low-fade', name: 'Low Fade', prompt: 'low skin fade' ,image:"https://cdn.hyperreach.site/assets/kid-boy-hair/low-fade.webp"},
  { id: 'high-fade', name: 'High Fade', prompt: 'high skin fade' ,image:"https://cdn.hyperreach.site/assets/kid-boy-hair/high-fade.webp"},
];

export const HAIR_STYLE_OPTIONS_KIDS_GIRL: HairStyleOption[] = [
  { id: 'crew-cut', name: 'Crew Cut', prompt: 'short hair on top with even shorter sides',image:"https://cdn.hyperreach.site/assets/kid-girl-hair/crew.webp" },
  { id: 'caesar', name: 'Caesar Cut', prompt: 'short haircut with a small straight fringe',image:"https://cdn.hyperreach.site/assets/kid-girl-hair/ceasar.webp" },
  { id: 'ivy-league', name: 'Ivy League', prompt: 'neat short haircut styled to the side' ,image:"https://cdn.hyperreach.site/assets/kid-girl-hair/ivy.webp"},
  { id: 'comb-over', name: 'Comb Over', prompt: 'hair combed neatly to one side' ,image:"https://cdn.hyperreach.site/assets/kid-girl-hair/comb.webp"},
  { id: 'spiky', name: 'Spiky', prompt: 'short spiky hair' ,image:"https://cdn.hyperreach.site/assets/kid-girl-hair/spiky.webp"},
  { id: 'flat-top', name: 'Flat Top', prompt: 'classic flat top cut',image:"https://cdn.hyperreach.site/assets/kid-girl-hair/flat.webp" },
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
  { id: 'lean-back', name: 'Lean Back', prompt: 'leaning back against a flat surface', category: 'leaning',image:'https://cdn.hyperreach.site/assets/men_pose/look_at_back.webp'},
  { id: 'side-lean', name: 'Side Lean', prompt: 'leaning sideways against a pillar or wall', category: 'leaning',image:'https://cdn.hyperreach.site/assets/men_pose/side_lean.webp' },
  { id: 'lean-rail', name: 'Lean on Railing', prompt: 'leaning against a balcony or veranda railing', category: 'leaning',image:'https://cdn.hyperreach.site/assets/men_pose/lean_on_railing.webp' },
  { id: 'walking-motion', name: 'Walk Forward', prompt: 'captured mid-stride walking towards the camera', category: 'movement',image:'https://cdn.hyperreach.site/assets/men_pose/walk_forward.webp' },
  { id: 'dynamic-stride', name: 'Runway Step', prompt: 'large confident stride forward', category: 'movement',image:'https://cdn.hyperreach.site/assets/men_pose/runway_step.webp' },
  { id: 'twirling', name: 'Graceful Twirl', prompt: 'motion-blur stabilized twirl, garment flared out', category: 'movement',image:'https://cdn.hyperreach.site/assets/men_pose/Graceful_twirl.webp' },
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
  { id: 'one-hand-pocket', name: 'Hand in Pocket', prompt: 'modern standing posture with one hand tucked casually into a pocket', category: 'standing', image:'https://cdn.hyperreach.site/assets/kids_pose/hand_in_pocket.webp' },
  { id: 'both-hands-pockets', name: 'Hands in Pockets', prompt: 'casual standing stance with both hands deep in pockets', category: 'standing', image:'https://cdn.hyperreach.site/assets/kids_pose/hands_in_pockets.webp' },
  { id: 'fashion-stance', name: 'Model Pose', prompt: 'sophisticated high-fashion stance, body angled at 45 degrees', category: 'standing', image:'https://cdn.hyperreach.site/assets/kids_pose/Model_pose.webp' },
  { id: 'looking-down', name: 'Look Down', prompt: 'standing pose with head tilted down', category: 'standing', image:'https://cdn.hyperreach.site/assets/kids_pose/look_down.webp'},
  { id: 'lean-chair', name: 'Lean on Chair', prompt: 'relaxed leaning posture against a studio chair', category: 'leaning', image:'https://cdn.hyperreach.site/assets/kids_pose/lean_on_chair.webp'},
  { id: 'casual-lean', name: 'Lean on Wall', prompt: 'relaxed leaning posture against a solid wall', category: 'leaning' , image:'https://cdn.hyperreach.site/assets/kids_pose/lean_on_wall.webp'},
  { id: 'lean-on-table', name: 'Lean on Table', prompt: 'leaning forward against a wooden table', category: 'leaning' , image:'https://cdn.hyperreach.site/assets/kids_pose/Lean_on_table.webp'},
  { id: 'lean-back', name: 'Lean Back', prompt: 'leaning back against a flat surface', category: 'leaning' , image:'https://cdn.hyperreach.site/assets/kids_pose/lean_back.webp'},
  { id: 'side-lean', name: 'Side Lean', prompt: 'leaning sideways against a pillar or wall', category: 'leaning' , image:'https://cdn.hyperreach.site/assets/kids_pose/side_lean.webp'},
  { id: 'lean-rail', name: 'Lean on Railing', prompt: 'leaning against a balcony or veranda railing', category: 'leaning' , image:'https://cdn.hyperreach.site/assets/kids_pose/lean_on_railling.webp'},
  { id: 'walking-motion', name: 'Walk Forward', prompt: 'captured mid-stride walking towards the camera', category: 'movement' , image:'https://cdn.hyperreach.site/assets/kids_pose/walk_forward.webp'},
  { id: 'dynamic-stride', name: 'Runway Step', prompt: 'large confident stride forward', category: 'movement' , image:'https://cdn.hyperreach.site/assets/kids_pose/Runway_step.webp'},
  { id: 'twirling', name: 'Graceful Twirl', prompt: 'motion-blur stabilized twirl, garment flared out', category: 'movement' , image:'https://cdn.hyperreach.site/assets/kids_pose/Graceful Twirl.webp'},
  { id: 'sitting-chair', name: 'Sit on Chair', prompt: 'sitting upright on a minimalist chair', category: 'sitting' , image:'https://cdn.hyperreach.site/assets/kids_pose/sit_on_chair.webp'},
  { id: 'sitting-floor', name: 'Sit on Floor', prompt: 'relaxed floor-sitting pose', category: 'sitting' , image:'https://cdn.hyperreach.site/assets/kids_pose/sit_on_floar.webp'},
  { id: 'speaking-mobile', name: 'Talk on Phone', prompt: 'candid lifestyle shot holding a smartphone to the ear', category: 'lifestyle' , image:'https://cdn.hyperreach.site/assets/kids_pose/talk_on_phone.webp'},
  { id: 'watching-mobile', name: 'Look at Phone', prompt: 'natural pose looking down at a mobile screen', category: 'lifestyle' , image:'https://cdn.hyperreach.site/assets/kids_pose/look_at_phone.webp'},
  { id: 'looking-back', name: 'Look Back', prompt: 'body facing away but head turned back over the shoulder', category: 'artistic' , image:'https://cdn.hyperreach.site/assets/kids_pose/look_back.webp'},
  { id: 'adjusting-hair', name: 'Fix Hair', prompt: 'artistic candid pose with one hand gently tucked behind the ear', category: 'artistic' , image:'https://cdn.hyperreach.site/assets/kids_pose/fix_hair.webp'},
];

export const POSE_OPTIONS_JEWELLERY: PoseOption[] = [
  { id: 'standing-neutral', name: 'Stand Straight', prompt: 'standing in a graceful, forward-facing model posture', category: 'standing'},
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
  { id: 'neutral', name: 'Calm & Poised', prompt: 'serene, calm facial expression', image:"https://cdn.hyperreach.site/assets/women-expression/calm.webp"},
  { id: 'subtle-smile', name: 'Warm Glow', prompt: 'a gentle, inviting smile that reaches the eyes', image:"https://cdn.hyperreach.site/assets/women-expression/warm.webp" },
  { id: 'confident', name: 'Piercing Gaze', prompt: 'self-assured, bold expression with a slight smirk', image:"https://cdn.hyperreach.site/assets/women-expression/piercing.webp"},
  { id: 'serious-fashion', name: 'Editorial Intense', prompt: 'vogue-style serious expression',image:"https://cdn.hyperreach.site/assets/women-expression/editorial.webp" },
  { id: 'playful', name: 'Joyful Laugh', prompt: 'candid laughter, eyes crinkled with joy',image:"https://cdn.hyperreach.site/assets/women-expression/joyful.webp" },
  { id: 'surprised', name: 'Surprised Delight', prompt: 'wide-eyed, genuine expression of joyful surprise with a slight open mouth',image:"https://cdn.hyperreach.site/assets/women-expression/surprised.webp" },
  { id: 'thoughtful', name: 'Pensive Mood', prompt: 'thoughtful, pensive expression with eyes looking slightly off-camera',image:"https://cdn.hyperreach.site/assets/women-expression/pensive.webp" },
  { id: 'shy-smile', name: 'Bashful Glow', prompt: 'looking down with a shy, bashful, and sweet smile', image:"https://cdn.hyperreach.site/assets/women-expression/bash.webp" },
  { id: 'full-laughter', name: 'Vibrant Laughter', prompt: 'unrestrained, full-faced laughter with head tilted slightly back',image:"https://cdn.hyperreach.site/assets/women-expression/vibrant.webp" },
  { id: 'dreamy', name: 'Dreamy Focus', prompt: 'a soft, dreamy expression with a serene and focused gaze',image:"https://cdn.hyperreach.site/assets/women-expression/dreamy.webp"},
];

export const EXPRESSION_OPTIONS_MEN: ExpressionOption[] = [
  { id: 'neutral', name: 'Calm & Poised', prompt: 'serene, calm facial expression',image:"https://cdn.hyperreach.site/assets/men-expression/calm.webp"},
  { id: 'subtle-smile', name: 'Warm Glow', prompt: 'a gentle, inviting smile that reaches the eyes',image:"https://cdn.hyperreach.site/assets/men-expression/warm.webp"},
  { id: 'confident', name: 'Piercing Gaze', prompt: 'self-assured, bold expression with a slight smirk',image:"https://cdn.hyperreach.site/assets/men-expression/piercing.webp" },
  { id: 'serious-fashion', name: 'Editorial Intense', prompt: 'vogue-style serious expression',image:"https://cdn.hyperreach.site/assets/men-expression/editorial.webp"},
  { id: 'playful', name: 'Joyful Laugh', prompt: 'candid laughter, eyes crinkled with joy',image:"https://cdn.hyperreach.site/assets/men-expression/joyful.webp"},
  { id: 'candid-glance', name: 'Candid Glance', prompt: 'looking slightly away with a natural, unposed facial expression as if unaware of the camera',image:"https://cdn.hyperreach.site/assets/men-expression/candid.webp"},
  { id: 'surprised', name: 'Surprised Delight', prompt: 'wide-eyed, genuine expression of joyful surprise with a slight open mouth',image:"https://cdn.hyperreach.site/assets/men-expression/surprised.webp"},
  { id: 'thoughtful', name: 'Pensive Mood', prompt: 'thoughtful, pensive expression with eyes looking slightly off-camera',image:"https://cdn.hyperreach.site/assets/men-expression/pensive.webp"},
  { id: 'shy-smile', name: 'Bashful Glow', prompt: 'looking down with a shy, bashful, and sweet smile',image:"https://cdn.hyperreach.site/assets/men-expression/bash.webp"},
  { id: 'full-laughter', name: 'Vibrant Laughter', prompt: 'unrestrained, full-faced laughter with head tilted slightly back',image:"https://cdn.hyperreach.site/assets/men-expression/vibrant.webp" },
  { id: 'dreamy', name: 'Dreamy Focus', prompt: 'a soft, dreamy expression with a serene and focused gaze',image:"https://cdn.hyperreach.site/assets/men-expression/dreamy.webp"},
];

export const EXPRESSION_OPTIONS_KIDS: ExpressionOption[] = [
  { id: 'neutral', name: 'Calm & Poised', prompt: 'serene, calm facial expression',image:"https://cdn.hyperreach.site/assets/kid-expression/calm-and-poised.webp"},
  { id: 'subtle-smile', name: 'Warm Glow', prompt: 'a gentle, inviting smile that reaches the eyes' ,image:"https://cdn.hyperreach.site/assets/kid-expression/warm.webp"},
  { id: 'confident', name: 'Piercing Gaze', prompt: 'self-assured, bold expression with a slight smirk' ,image:"https://cdn.hyperreach.site/assets/kid-expression/piercing.webp"},
  { id: 'serious-fashion', name: 'Editorial Intense', prompt: 'vogue-style serious expression' ,image:"https://cdn.hyperreach.site/assets/kid-expression/editorial.webp"},
  { id: 'playful', name: 'Joyful Laugh', prompt: 'candid laughter, eyes crinkled with joy' ,image:"https://cdn.hyperreach.site/assets/kid-expression/joyful.webp"},
  { id: 'candid-glance', name: 'Candid Glance', prompt: 'looking slightly away with a natural, unposed facial expression as if unaware of the camera' ,image:"https://cdn.hyperreach.site/assets/kid-expression/candid.webp"},
  { id: 'surprised', name: 'Surprised Delight', prompt: 'wide-eyed, genuine expression of joyful surprise with a slight open mouth' ,image:"https://cdn.hyperreach.site/assets/kid-expression/suprised.webp"},
  { id: 'thoughtful', name: 'Pensive Mood', prompt: 'thoughtful, pensive expression with eyes looking slightly off-camera' ,image:"https://cdn.hyperreach.site/assets/kid-expression/pensive.webp"},
  { id: 'shy-smile', name: 'Bashful Glow', prompt: 'looking down with a shy, bashful, and sweet smile' ,image:"https://cdn.hyperreach.site/assets/kid-expression/bash.webp"},
  { id: 'full-laughter', name: 'Vibrant Laughter', prompt: 'unrestrained, full-faced laughter with head tilted slightly back' ,image:"https://cdn.hyperreach.site/assets/kid-expression/vibrant.webp"},
  { id: 'dreamy', name: 'Dreamy Focus', prompt: 'a soft, dreamy expression with a serene and focused gaze' ,image:"https://cdn.hyperreach.site/assets/kid-expression/dreamy.webp"},
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
  { id: 'front-view', name: 'Direct Frontal', prompt: 'full frontal camera angle',image:"https://cdn.hyperreach.site/assets/women-view/direct.webp" },
  { id: 'three-quarter-view', name: '3/4 Perspective', prompt: 'three-quarter perspective',image:"https://cdn.hyperreach.site/assets/women-view/3-4%20.webp"  },
  { id: 'side-view', name: 'Side Profile', prompt: 'clean 90-degree side profile',image:"https://cdn.hyperreach.site/assets/women-view/side.webp"  },
  { id: 'dynamic-side', name: '45-Degree Side', prompt: 'cinematic 45-degree angle focusing on jewelry depth' ,image:"https://cdn.hyperreach.site/assets/women-view/45.webp" },
  { id: 'back-view', name: 'Rear View', prompt: 'full rear view',image:"https://cdn.hyperreach.site/assets/women-view/rear.webp" },
  { id: 'low-angle', name: 'Hero Angle', prompt: 'low-angle upward shot',image:"https://cdn.hyperreach.site/assets/women-view/hero.webp"  },
  { id: 'close-up', name: 'Portrait Close-up', prompt: 'head and shoulders shot',image:"https://cdn.hyperreach.site/assets/women-view/potrait.webp"  },
  { id: 'extreme-macro', name: 'Micro Detail', prompt: 'extreme microscopic focus on jewelry textures and gemstone facets',image:"https://cdn.hyperreach.site/assets/women-view/micro.webp"  },
  { id: 'waist-up', name: 'Medium Shot', prompt: 'waist-up camera framing' ,image:"https://cdn.hyperreach.site/assets/women-view/medium.webp" },
  { id: 'birds-eye', name: 'Bird\'s Eye View', prompt: 'top-down vertical view from above, artistic perspective' ,image:"https://cdn.hyperreach.site/assets/women-view/bird.webp" },
];

export const VIEW_OPTIONS_MEN: ViewOption[] = [
  { id: 'front-view', name: 'Direct Frontal', prompt: 'full frontal camera angle' ,image:"https://cdn.hyperreach.site/assets/men-view/direct_front.webp"},
  { id: 'three-quarter-view', name: '3/4 Perspective', prompt: 'three-quarter perspective' ,image:"https://cdn.hyperreach.site/assets/men-view/3-4.webp"},
  { id: 'side-view', name: 'Side Profile', prompt: 'clean 90-degree side profile' ,image:"https://cdn.hyperreach.site/assets/men-view/side%20.webp"},
  { id: 'dynamic-side', name: '45-Degree Side', prompt: 'cinematic 45-degree angle focusing on jewelry depth' ,image:"https://cdn.hyperreach.site/assets/men-view/45-degree.webp"},
  { id: 'back-view', name: 'Rear View', prompt: 'full rear view' ,image:"https://cdn.hyperreach.site/assets/men-view/rearview.webp"},
  { id: 'low-angle', name: 'Hero Angle', prompt: 'low-angle upward shot' ,image:"https://cdn.hyperreach.site/assets/men-view/hero.webp"},
  { id: 'close-up', name: 'Portrait Close-up', prompt: 'head and shoulders shot' ,image:"https://cdn.hyperreach.site/assets/men-view/potrainclose-up.webp"},
  { id: 'extreme-macro', name: 'Micro Detail', prompt: 'extreme microscopic focus on jewelry textures and gemstone facets' ,image:"https://cdn.hyperreach.site/assets/men-view/micro%20detail.webp"},
  { id: 'waist-up', name: 'Medium Shot', prompt: 'waist-up camera framing' ,image:"https://cdn.hyperreach.site/assets/men-view/medium%20.webp"},
  { id: 'birds-eye', name: 'Bird\'s Eye View', prompt: 'top-down vertical view from above, artistic perspective' ,image:"https://cdn.hyperreach.site/assets/men-view/bird%20eye.webp"},
];

export const VIEW_OPTIONS_KIDS: ViewOption[] = [
  { id: 'front-view', name: 'Direct Frontal', prompt: 'full frontal camera angle',image:"https://cdn.hyperreach.site/assets/kid-view/direct.webp" },
  { id: 'three-quarter-view', name: '3/4 Perspective', prompt: 'three-quarter perspective' ,image:"https://cdn.hyperreach.site/assets/kid-view/3-4.webp"},
  { id: 'side-view', name: 'Side Profile', prompt: 'clean 90-degree side profile' ,image:"https://cdn.hyperreach.site/assets/kid-view/side.webp"},
  { id: 'dynamic-side', name: '45-Degree Side', prompt: 'cinematic 45-degree angle focusing on jewelry depth' ,image:"https://cdn.hyperreach.site/assets/kid-view/45.webp"},
  { id: 'back-view', name: 'Rear View', prompt: 'full rear view' ,image:"https://cdn.hyperreach.site/assets/kid-view/rear.webp"},
  { id: 'low-angle', name: 'Hero Angle', prompt: 'low-angle upward shot' ,image:"https://cdn.hyperreach.site/assets/kid-view/hero.webp"},
  { id: 'close-up', name: 'Portrait Close-up', prompt: 'head and shoulders shot' ,image:"https://cdn.hyperreach.site/assets/kid-view/potrait.webp"},
  { id: 'extreme-macro', name: 'Micro Detail', prompt: 'extreme microscopic focus on jewelry textures and gemstone facets' ,image:"https://cdn.hyperreach.site/assets/kid-view/micro.webp"},
  { id: 'waist-up', name: 'Medium Shot', prompt: 'waist-up camera framing' ,image:"https://cdn.hyperreach.site/assets/kid-view/medium.webp"},
  { id: 'birds-eye', name: 'Bird\'s Eye View', prompt: 'top-down vertical view from above, artistic perspective' ,image:"https://cdn.hyperreach.site/assets/kid-view/bird.png"},
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

  // Avatar
  avatar?: string;

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
    invoiceHistory: { id: string; date: string; amount: string; planType: string; status: string; startDate: string; endDate: string }[];
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

// --- ADMIN USER IMAGES TYPES ---

export interface AdminUserImage {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  creditsUsed: number;
  quality: string;
  section: string;
  category: string;
  createdAt: string;
  promptData?: {
    background?: string;
    pose?: string;
    expression?: string;
    view?: string;
    fullPrompt?: string;
  };
}

export interface AdminUserImagesPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface AdminUserImagesFilterOptions {
  sections: string[];
  categories: string[];
  qualities: string[];
}

export interface AdminUserImagesFilters {
  section?: string;
  category?: string;
  quality?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AdminUserImagesResponse {
  images: AdminUserImage[];
  pagination: AdminUserImagesPagination;
  filterOptions?: AdminUserImagesFilterOptions;
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
    allowedQualities: ['standard', 'high', 'ultra'] as const
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