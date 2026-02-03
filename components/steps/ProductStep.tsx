import React from 'react';
import {
  ImageFile,
  ProductUploadType,
  MEN_CATEGORY_CONFIG,
  MEN_CATEGORIES,
  WOMEN_CATEGORY_CONFIG,
  KIDS_CATEGORY_CONFIG,
  WOMEN_CATEGORIES,
  KIDS_CATEGORIES,
  JEWELLERY_CATEGORIES,
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
  BottomTypeOption,
  BOTTOM_TYPE_OPTIONS_MEN,
  BOTTOM_TYPE_OPTIONS_WOMEN,
  BOTTOM_TYPE_OPTIONS_KIDS
} from '../../types';
import ImageUploadCard from '../ImageUploadCard';
import jasmineBg from '../../Image/jasmine.png';
import TempleGold from '../../Image/Temple_gold.png';
import Haaram from '../../Image/haaram.png';

export type TryOnCategory = 'men' | 'women' | 'kids' | 'jewellery';

interface ProductStepProps {
  category: TryOnCategory;

  // Model selection
  useCustomModel: boolean;
  setUseCustomModel: (val: boolean) => void;
  customModelImage: ImageFile | null;
  setCustomModelImage: (img: ImageFile | null) => void;

  // Upload mode
  uploadType: ProductUploadType;
  setUploadType: (type: ProductUploadType) => void;

  // Product images
  fullProductImage: ImageFile | null;
  setFullProductImage: (img: ImageFile | null) => void;
  productImages: (ImageFile | null)[];
  handleProductImageUpload: (index: number) => (img: ImageFile) => void;
  handleProductImageRemove: (index: number) => () => void;

  // Men specific
  menCategory?: MenProductCategory;
  setMenCategory?: (cat: MenProductCategory) => void;

  // Women specific
  womenCategory?: WomenProductCategory;
  setWomenCategory?: (cat: WomenProductCategory) => void;
  accessories?: SareeAccessoriesState;
  toggleAccessory?: (key: keyof SareeAccessoriesState) => void;

  // Kids specific
  kidsCategory?: KidsProductCategory;
  setKidsCategory?: (cat: KidsProductCategory) => void;
  gender?: KidsGender;
  setGender?: (g: KidsGender) => void;
  ageGroup?: KidsAgeGroup;
  setAgeGroup?: (a: KidsAgeGroup) => void;

  // Jewellery specific
  jewelleryCategory?: JewelleryProductCategory;
  setJewelleryCategory?: (cat: JewelleryProductCategory) => void;
  selectedSkinTone?: SkinToneOption;
  setSelectedSkinTone?: (tone: SkinToneOption) => void;
  selectedAttire?: AttireOption;
  setSelectedAttire?: (attire: AttireOption) => void;

  // Bottom selector
  shouldShowBottomSelector?: boolean;
  selectedBottomType?: BottomTypeOption | null;
  setSelectedBottomType?: (type: BottomTypeOption | null) => void;
}

const ProductStep: React.FC<ProductStepProps> = ({
  category,
  useCustomModel,
  setUseCustomModel,
  customModelImage,
  setCustomModelImage,
  uploadType,
  setUploadType,
  fullProductImage,
  setFullProductImage,
  productImages,
  handleProductImageUpload,
  handleProductImageRemove,
  menCategory,
  setMenCategory,
  womenCategory,
  setWomenCategory,
  accessories,
  toggleAccessory,
  kidsCategory,
  setKidsCategory,
  gender,
  setGender,
  ageGroup,
  setAgeGroup,
  jewelleryCategory,
  setJewelleryCategory,
  selectedSkinTone,
  setSelectedSkinTone,
  selectedAttire,
  setSelectedAttire,
  shouldShowBottomSelector,
  selectedBottomType,
  setSelectedBottomType,
}) => {
  const getCategoryConfig = () => {
    switch (category) {
      case 'men':
        return MEN_CATEGORY_CONFIG[menCategory || 'casual'];
      case 'women':
        return WOMEN_CATEGORY_CONFIG[womenCategory || 'saree'];
      case 'kids':
        return KIDS_CATEGORY_CONFIG[kidsCategory || 'western'];
      case 'jewellery':
        return [];
      default:
        return [];
    }
  };

  const categoryConfig = getCategoryConfig();

  return (
    <div className="space-y-6">
      {/* Model Selection - Common for all */}
      <div className="bg-gray-50 p-4 rounded-xl">
        <h3 className="text-xs font-black text-gray-400 mb-3 text-center uppercase tracking-widest">
          Select Your Model
        </h3>
        <div className="flex justify-center gap-2 mb-3 max-w-md mx-auto">
          <button
            onClick={() => setUseCustomModel(false)}
            className={`flex-1 px-4 py-2.5 rounded-lg font-bold border text-sm transition-all ${
              !useCustomModel
                ? 'bg-primary text-white border-primary shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'
            }`}
          >
            {category === 'kids' ? 'Studio Kid Model' : 'Studio Model'}
          </button>
          <button
            onClick={() => setUseCustomModel(true)}
            className={`flex-1 px-4 py-2.5 rounded-lg font-bold border text-sm transition-all ${
              useCustomModel
                ? 'bg-primary text-white border-primary shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'
            }`}
          >
            {category === 'kids' ? 'Personal Photo' : 'Custom Photo'}
          </button>
        </div>

        {useCustomModel && (
          <div className="max-w-sm mx-auto animate-in fade-in slide-in-from-top-2 duration-300">
            <ImageUploadCard
              title="Identity Reference"
              isOptional={false}
              onImageUpload={setCustomModelImage}
              onImageRemove={() => setCustomModelImage(null)}
              imageFile={customModelImage}
              enableCropping={category === 'jewellery'}
              dropzoneClassName="h-24"
            />
          </div>
        )}

        {/* Jewellery specific - Skin tone & Attire when not using custom model */}
        {category === 'jewellery' && !useCustomModel && selectedSkinTone && setSelectedSkinTone && selectedAttire && setSelectedAttire && (
          <div className="space-y-4 mt-4 max-w-lg mx-auto animate-in fade-in duration-500">
            {/* Skin Tone Selector */}
            <div>
              <p className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-wider text-center">Model Skin Tone</p>
              <div className="flex justify-center items-center gap-4">
                {SKIN_TONE_OPTIONS.map((tone) => (
                  <button
                    key={tone.id}
                    onClick={() => setSelectedSkinTone(tone)}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <div
                      className={`w-10 h-10 rounded-full border-4 transition-all ${
                        selectedSkinTone.id === tone.id
                          ? 'border-primary scale-110 shadow-md'
                          : 'border-white hover:border-gray-100'
                      }`}
                      style={{ backgroundColor: tone.hex }}
                    />
                    <span className={`text-[9px] font-bold uppercase tracking-tighter ${
                      selectedSkinTone.id === tone.id ? 'text-primary' : 'text-gray-400'
                    }`}>
                      {tone.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Attire Selector */}
            <div>
              <p className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-wider text-center">Model Attire & Styling</p>
              <div className="grid grid-cols-2 gap-2">
                {ATTIRE_OPTIONS.map((attire) => (
                  <button
                    key={attire.id}
                    onClick={() => setSelectedAttire(attire)}
                    className={`px-3 py-2 text-[10px] font-black rounded-lg border-2 transition-all text-left ${
                      selectedAttire.id === attire.id
                        ? 'bg-indigo-50 border-primary text-primary'
                        : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'
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

      {/* Kids specific - Gender & Age */}
      {category === 'kids' && gender && setGender && ageGroup && setAgeGroup && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="font-semibold text-xs text-gray-400 mb-2 uppercase tracking-widest">Gender</h3>
            <div className="flex gap-2">
              {['boy', 'girl'].map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g as KidsGender)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                    gender === g
                      ? 'bg-secondary text-white shadow-sm'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {g.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="font-semibold text-xs text-gray-400 mb-2 uppercase tracking-widest">Age Group</h3>
            <div className="flex gap-2">
              {['2-3', '5', '7-9', '10-14'].map((a) => (
                <button
                  key={a}
                  onClick={() => setAgeGroup(a as KidsAgeGroup)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                    ageGroup === a
                      ? 'bg-secondary text-white shadow-sm'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {a} YRS
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Men specific - Category Selection */}
      {category === 'men' && menCategory && setMenCategory && (
        <div className="bg-gray-50 p-4 rounded-xl">
          <h3 className="font-semibold text-xs text-gray-400 mb-3 text-center uppercase tracking-widest">Apparel Category</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {MEN_CATEGORIES.map(({ id, name }) => (
              <button
                key={id}
                onClick={() => setMenCategory(id)}
                className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
                  menCategory === id
                    ? 'bg-primary text-white shadow-lg scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Women specific - Category Selection */}
      {category === 'women' && womenCategory && setWomenCategory && (
        <div className="bg-gray-50 p-4 rounded-xl">
          <h3 className="font-semibold text-xs text-gray-400 mb-3 text-center uppercase tracking-widest">Apparel Category</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {WOMEN_CATEGORIES.map(({ id, name }) => (
              <button
                key={id}
                onClick={() => setWomenCategory(id)}
                className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
                  womenCategory === id
                    ? 'bg-primary text-white shadow-lg scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Kids specific - Category Selection */}
      {category === 'kids' && kidsCategory && setKidsCategory && (
        <div className="bg-gray-50 p-4 rounded-xl">
          <h3 className="font-semibold text-xs text-gray-400 mb-3 text-center uppercase tracking-widest">Apparel Style</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {KIDS_CATEGORIES.map(({ id, name }) => (
              <button
                key={id}
                onClick={() => setKidsCategory(id)}
                className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${
                  kidsCategory === id
                    ? 'bg-primary text-white shadow-lg scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Jewellery specific - Category Selection */}
      {category === 'jewellery' && jewelleryCategory && setJewelleryCategory && (
        <div className="bg-gray-50 p-4 rounded-xl">
          <h3 className="font-semibold text-xs text-gray-400 mb-3 text-center uppercase tracking-widest">Select Ornament Type</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {JEWELLERY_CATEGORIES.map(({ id, name }) => (
              <button
                key={id}
                onClick={() => setJewelleryCategory(id)}
                className={`px-2 py-2.5 text-[10px] font-black rounded-lg border-2 transition-all duration-300 uppercase tracking-tighter ${
                  jewelleryCategory === id
                    ? 'bg-primary text-white border-primary shadow-lg'
                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Women Saree Accessories */}
      {category === 'women' && womenCategory === 'saree' && accessories && toggleAccessory && (
        <div className="bg-gray-50 p-4 rounded-xl border-l-4 border-accent">
          <h3 className="font-bold text-sm text-gray-800 mb-3">Accessories</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'jasmine', label: 'Jasmine', image: jasmineBg },
              { id: 'bangles', label: 'Temple Gold', image: TempleGold },
              { id: 'necklace', label: 'Haaram', image: Haaram }
            ].map(acc => (
              <div
                key={acc.id}
                className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                  accessories[acc.id as keyof SareeAccessoriesState]
                    ? 'bg-accent/5 border-accent shadow-sm'
                    : 'bg-white border-transparent opacity-60'
                }`}
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
                <div className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                  accessories[acc.id as keyof SareeAccessoriesState]
                    ? 'bg-accent border-accent'
                    : 'bg-white border-gray-300'
                }`}>
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

      {/* Upload Mode Selector (not for jewellery) */}
      {category !== 'jewellery' && (
        <div className="bg-gray-50 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col">
            <h3 className="font-bold text-gray-800">Upload Mode</h3>
            <p className="text-xs text-gray-500">Choose between multi-part or single product photo.</p>
          </div>
          <div className="flex gap-1 p-1 bg-gray-200 rounded-lg">
            <button
              onClick={() => setUploadType('parts')}
              className={`px-4 py-2 text-xs font-black rounded-md transition-all ${
                uploadType === 'parts'
                  ? 'bg-secondary text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              MULTI-PART
            </button>
            <button
              onClick={() => setUploadType('full')}
              className={`px-4 py-2 text-xs font-black rounded-md transition-all ${
                uploadType === 'full'
                  ? 'bg-secondary text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              SINGLE PRODUCT
            </button>
          </div>
        </div>
      )}

      {/* Product Upload Area */}
      <div>
        <h3 className="text-xs font-black text-gray-400 mb-3 text-center uppercase tracking-widest">
          {category === 'jewellery' ? 'Upload Jewellery Image' : 'Upload Product Images'}
        </h3>

        {category === 'jewellery' ? (
          <div className="max-w-md mx-auto">
            <ImageUploadCard
              title={`${JEWELLERY_CATEGORIES.find(c => c.id === jewelleryCategory)?.name || 'Jewellery'} Image`}
              isOptional={false}
              onImageUpload={setFullProductImage}
              onImageRemove={() => setFullProductImage(null)}
              imageFile={fullProductImage}
              dropzoneClassName="h-48"
            />
          </div>
        ) : uploadType === 'full' ? (
          <div className="max-w-md mx-auto">
            <ImageUploadCard
              title="Full Product Photo"
              isOptional={false}
              onImageUpload={setFullProductImage}
              onImageRemove={() => setFullProductImage(null)}
              imageFile={fullProductImage}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryConfig.map((config, index) => (
              <ImageUploadCard
                key={`${category}-${config.part}-${index}`}
                title={`${config.part} Photo`}
                isOptional={config.optional}
                onImageUpload={handleProductImageUpload(index)}
                onImageRemove={handleProductImageRemove(index)}
                imageFile={productImages[index]}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom Type Selector */}
      {shouldShowBottomSelector && setSelectedBottomType && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-bold text-gray-900">
              No Bottom Uploaded - Select Default Bottom Type
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Since you haven't uploaded a bottom, choose what type of bottom should appear on the model:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {(category === 'men' ? BOTTOM_TYPE_OPTIONS_MEN :
              category === 'women' ? BOTTOM_TYPE_OPTIONS_WOMEN :
              category === 'kids' ? BOTTOM_TYPE_OPTIONS_KIDS :
              []
            ).map((bottomType) => (
              <button
                key={bottomType.id}
                onClick={() => setSelectedBottomType(bottomType)}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  selectedBottomType?.id === bottomType.id
                    ? 'border-blue-600 bg-blue-100 text-blue-900'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                }`}
              >
                {bottomType.name}
              </button>
            ))}
          </div>
          {selectedBottomType && (
            <p className="text-xs text-green-600 mt-3 font-medium flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Selected: {selectedBottomType.name}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductStep;
