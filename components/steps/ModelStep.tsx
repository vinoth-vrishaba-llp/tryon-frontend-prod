import React, { useState } from 'react';
import {
  PoseOption,
  ExpressionOption,
  ViewOption,
  AspectRatioOption,
  PreviewOptionsState,
  PoseCategory,
  HairStyleOption,
  FitTypeOption,
  BodyTypeOption,
  FIT_TYPE_OPTIONS,
  BODY_TYPE_OPTIONS_MEN,
  BODY_TYPE_OPTIONS_WOMEN,
  Section
} from '../../types';
import {
  LayoutGrid,
  Users,
  Armchair,
  ArrowLeftRight,
  Zap,
  ShoppingBag,
  Palette
} from 'lucide-react';

interface ModelStepProps {
  // Section to determine which body type options to show
  section?: Section;
  // Options arrays (category-specific)
  poseOptions: PoseOption[];
  expressionOptions: ExpressionOption[];
  viewOptions: ViewOption[];
  aspectRatioOptions: AspectRatioOption[];
  // Hair style
  hairStyleOptions?: HairStyleOption[];
  selectedHairStyle?: HairStyleOption;
  onHairStyleChange?: (style: HairStyleOption) => void;
  // Fit type
  selectedFitType?: FitTypeOption;
  onFitTypeChange?: (fit: FitTypeOption) => void;
  // Body type
  selectedBodyType?: BodyTypeOption;
  onBodyTypeChange?: (body: BodyTypeOption) => void;
  // Selected values
  selectedPose: PoseOption;
  onPoseChange: (pose: PoseOption) => void;
  selectedExpression: ExpressionOption;
  onExpressionChange: (expression: ExpressionOption) => void;
  selectedView: ViewOption;
  onViewChange: (view: ViewOption) => void;
  selectedAspectRatio: AspectRatioOption;
  onAspectRatioChange: (ratio: AspectRatioOption) => void;
  previewOptions: PreviewOptionsState;
  onPreviewOptionsChange: (options: PreviewOptionsState) => void;
}

const CategoryIcons: Record<PoseCategory | 'all', React.FC<{ className?: string }>> = {
  all: ({ className }) => <LayoutGrid className={className} />,
  standing: ({ className }) => <Users className={className} />,
  sitting: ({ className }) => <Armchair className={className} />,
  leaning: ({ className }) => <ArrowLeftRight className={className} />,
  movement: ({ className }) => <Zap className={className} />,
  lifestyle: ({ className }) => <ShoppingBag className={className} />,
  artistic: ({ className }) => <Palette className={className} />,
};

const ToggleOption = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (val: boolean) => void }) => (
  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
    <span className="text-sm font-medium text-gray-700">{label}</span>
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        checked ? 'bg-primary' : 'bg-gray-300'
      }`}
    >
      <span
        className={`${
          checked ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
      />
    </button>
  </div>
);

const ModelStep: React.FC<ModelStepProps> = ({
  section,
  poseOptions,
  expressionOptions,
  viewOptions,
  aspectRatioOptions,
  hairStyleOptions,
  selectedHairStyle,
  onHairStyleChange,
  selectedFitType,
  onFitTypeChange,
  selectedBodyType,
  onBodyTypeChange,
  selectedPose,
  onPoseChange,
  selectedExpression,
  onExpressionChange,
  selectedView,
  onViewChange,
  selectedAspectRatio,
  onAspectRatioChange,
  previewOptions,
  onPreviewOptionsChange
}) => {
  const [showPoseGallery, setShowPoseGallery] = useState(false);
  const [activePoseCategory, setActivePoseCategory] = useState<PoseCategory | 'all'>('all');

  const categories: (PoseCategory | 'all')[] = ['all', 'standing', 'leaning', 'sitting', 'movement', 'lifestyle', 'artistic'];

  // Determine which body type options to show based on section
  const bodyTypeOptions = section === 'men' ? BODY_TYPE_OPTIONS_MEN :
                          section === 'women' ? BODY_TYPE_OPTIONS_WOMEN :
                          [];

  const showFitAndBodyOptions = section === 'men' || section === 'women';

  const galleryPoses = activePoseCategory === 'all'
    ? poseOptions
    : poseOptions.filter(p => p.category === activePoseCategory);

  const previewPoses = (() => {
    const basic = poseOptions.filter(p => p.category === 'standing').slice(0, 5);
    if (!basic.find(p => p.id === selectedPose.id)) {
      basic.push(selectedPose);
    }
    return basic;
  })();

  const getCategoryDescription = (cat: PoseCategory) => {
    switch (cat) {
      case 'standing': return "Classic full-body poses perfect for showcasing outfit details and drape.";
      case 'leaning': return "Relaxed leaning poses against chairs, walls, or tables for a casual look.";
      case 'sitting': return "Relaxed and formal seated positions. Great for casual wear or traditional aesthetics.";
      case 'movement': return "Dynamic poses that capture energy and show how fabrics flow in motion.";
      case 'lifestyle': return "Natural, everyday scenarios featuring props like phones, bags, or books.";
      case 'artistic': return "Creative angles, pensive moods, and editorial style compositions.";
      default: return "";
    }
  };

  const renderAspectRatioContent = (option: AspectRatioOption) => {
    const ratioStyle = {
      aspectRatio: option.id.replace(':', '/'),
      width: option.id === '1:1' ? '14px' : option.id === '9:16' || option.id === '3:4' ? 'auto' : '20px',
      height: option.id === '1:1' ? '14px' : option.id === '9:16' || option.id === '3:4' ? '18px' : 'auto',
    };
    return (
      <div className="flex items-center gap-2">
        <div className="border border-current bg-current opacity-40 rounded-sm" style={ratioStyle}></div>
        <span>{option.name}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Preview Options */}
      <div className="bg-gray-50 p-4 rounded-xl">
        <h4 className="text-xs font-black text-gray-400 mb-3 uppercase tracking-widest">Generation Preview Options</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ToggleOption
            label="Show Outfit Details Layer"
            checked={true}
            onChange={() => {}}
          />
          <ToggleOption
            label="Highlight Fabric Texture"
            checked={true}
            onChange={() => {}}
          />
        </div>
      </div>

      {/* Hair Style - Only show if hairStyleOptions are provided */}
      {hairStyleOptions && hairStyleOptions.length > 0 && selectedHairStyle && onHairStyleChange && (
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="text-xs font-black text-gray-400 mb-3 uppercase tracking-widest">Hair Style</h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-2">
            {hairStyleOptions.map((style) => (
              <button
                key={style.id}
                onClick={() => onHairStyleChange(style)}
                className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                  selectedHairStyle.id === style.id
                    ? 'bg-secondary text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
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
      )}

      {/* Fit Type - Only show for men and women */}
      {showFitAndBodyOptions && selectedFitType && onFitTypeChange && (
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="text-xs font-black text-gray-400 mb-3 uppercase tracking-widest">Dress Fit Type</h4>
          <div className="flex flex-wrap gap-2">
            {FIT_TYPE_OPTIONS.map((fit) => (
              <button
                key={fit.id}
                onClick={() => onFitTypeChange(fit)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  selectedFitType.id === fit.id
                    ? 'bg-secondary text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {fit.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Body Type - Only show for men and women */}
      {showFitAndBodyOptions && selectedBodyType && onBodyTypeChange && bodyTypeOptions.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-xl">
          <h4 className="text-xs font-black text-gray-400 mb-3 uppercase tracking-widest">Body Type</h4>
          <div className="flex flex-wrap gap-2">
            {bodyTypeOptions.map((body) => (
              <button
                key={body.id}
                onClick={() => onBodyTypeChange(body)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  selectedBodyType.id === body.id
                    ? 'bg-secondary text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {body.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Aspect Ratio */}
      <div className="bg-gray-50 p-4 rounded-xl">
        <h4 className="text-xs font-black text-gray-400 mb-3 uppercase tracking-widest">Aspect Ratio</h4>
        <div className="flex flex-wrap gap-2">
          {aspectRatioOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => onAspectRatioChange(option)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                selectedAspectRatio.id === option.id
                  ? 'bg-secondary text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {renderAspectRatioContent(option)}
            </button>
          ))}
        </div>
      </div>

      {/* Pose Selection */}
      <div className="bg-gray-50 p-4 rounded-xl">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Pose</h4>
          <button
            onClick={() => setShowPoseGallery(true)}
            className="text-xs text-primary font-bold hover:underline flex items-center bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            {React.createElement(CategoryIcons['all'], { className: "h-3 w-3 mr-1" })}
            Open Pose Gallery
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {previewPoses.map((option) => (
            <button
              key={option.id}
              onClick={() => onPoseChange(option)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                selectedPose.id === option.id
                  ? 'bg-secondary text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {option.image && (
                <img
                  src={option.image}
                  alt={option.name}
                  className="w-8 h-8 rounded object-cover"
                  loading="lazy"
                />
              )}
              {option.name}
            </button>
          ))}
          <button
            onClick={() => setShowPoseGallery(true)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white text-primary border border-primary border-dashed hover:bg-indigo-50 transition-colors"
          >
            + More
          </button>
        </div>
      </div>

      {/* Expression Selection */}
      <div className="bg-gray-50 p-4 rounded-xl">
        <h4 className="text-xs font-black text-gray-400 mb-3 uppercase tracking-widest">Expression</h4>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-2">
          {expressionOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => onExpressionChange(option)}
              className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                selectedExpression.id === option.id
                  ? 'bg-secondary text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {option.image ? (
                <img
                  src={option.image}
                  alt={option.name}
                  className={`w-32 h-32 rounded-lg object-cover mb-1 border-2 ${
                    selectedExpression.id === option.id ? 'border-white' : 'border-transparent'
                  }`}
                  loading="lazy"
                />
              ) : (
                <div className={`w-12 h-12 rounded-lg mb-1 flex items-center justify-center text-lg ${
                  selectedExpression.id === option.id ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  😊
                </div>
              )}
              <span className="text-xs font-medium text-center leading-tight">{option.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* View Selection */}
      <div className="bg-gray-50 p-4 rounded-xl">
        <h4 className="text-xs font-black text-gray-400 mb-3 uppercase tracking-widest">View</h4>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-2">
          {viewOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => onViewChange(option)}
              className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                selectedView.id === option.id
                  ? 'bg-secondary text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {option.image ? (
                <img
                  src={option.image}
                  alt={option.name}
                  className={`w-25 h-40 rounded-lg object-cover mb-1 border-2 ${
                    selectedView.id === option.id ? 'border-white' : 'border-transparent'
                  }`}
                  loading="lazy"
                />
              ) : (
                <div className={`w-25 h-40 rounded-lg mb-1 flex items-center justify-center ${
                  selectedView.id === option.id ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              )}
              <span className="text-xs font-medium text-center leading-tight">{option.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Pose Gallery Modal */}
      {showPoseGallery && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm"
          onClick={() => setShowPoseGallery(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-xl text-gray-800">Pose Gallery</h3>
                <p className="text-sm text-gray-500">Select a pose for your model</p>
              </div>
              <button
                onClick={() => setShowPoseGallery(false)}
                className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex border-b overflow-x-auto p-2 gap-2 bg-white sticky top-0 z-10">
              {categories.map(cat => {
                const Icon = CategoryIcons[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => setActivePoseCategory(cat)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${
                      activePoseCategory === cat
                        ? 'bg-primary text-white border-primary shadow-md transform scale-105'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {cat === 'all' ? 'All Poses' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                );
              })}
            </div>

            {activePoseCategory !== 'all' && (
              <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex items-start gap-4">
                <div className="bg-white p-3 rounded-full shadow-sm text-primary flex-shrink-0">
                  {React.createElement(CategoryIcons[activePoseCategory], { className: "h-6 w-6" })}
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-lg capitalize">{activePoseCategory} Poses</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {getCategoryDescription(activePoseCategory)}
                  </p>
                </div>
              </div>
            )}

            <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryPoses.map(pose => {
                  const PoseIcon = CategoryIcons[pose.category] || CategoryIcons.all;
                  return (
                    <button
                      key={pose.id}
                      onClick={() => {
                        onPoseChange(pose);
                        setShowPoseGallery(false);
                      }}
                      className={`group relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                        selectedPose.id === pose.id
                          ? 'border-primary bg-indigo-50 ring-2 ring-primary ring-offset-2'
                          : 'border-white bg-white hover:border-indigo-200 hover:shadow-lg'
                      }`}
                    >
                      {/* Show image if available, otherwise show icon */}
                      {pose.image ? (
                        <div className={`w-20 h-20 rounded-lg mb-3 overflow-hidden border-2 transition-all ${
                          selectedPose.id === pose.id
                            ? 'border-primary shadow-lg'
                            : 'border-gray-200 group-hover:border-indigo-300'
                        }`}>
                          <img
                            src={pose.image}
                            alt={pose.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className={`w-16 h-16 rounded-full mb-3 flex items-center justify-center transition-colors ${
                          selectedPose.id === pose.id
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-400 group-hover:bg-indigo-100 group-hover:text-primary'
                        }`}>
                          <PoseIcon className="h-8 w-8" />
                        </div>
                      )}
                      <span className={`text-sm font-bold mb-1 text-center ${
                        selectedPose.id === pose.id ? 'text-primary' : 'text-gray-800'
                      }`}>
                        {pose.name}
                      </span>
                      <span className="text-xs text-center text-gray-500 line-clamp-2 px-2 leading-tight">
                        {pose.prompt?.split(',')[0] || pose.prompt}
                      </span>

                      {selectedPose.id === pose.id && (
                        <div className="absolute top-2 right-2 text-primary">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelStep;
