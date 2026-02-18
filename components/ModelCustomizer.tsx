import React, { useState } from 'react';
import {
    PoseOption, ExpressionOption, ViewOption, TimeOption,
    AspectRatioOption, CameraOption, ImageQualityOption,
    Preset, PoseCategory, PreviewOptionsState, User, PLAN_CONFIG
} from '../types';
import {
  LayoutGrid,
  Users,
  Armchair,
  ArrowLeftRight,
  Zap,
  ShoppingBag,
  Palette,
  Camera,
  Clock,
  Image as ImageIcon,
  Lock,
  Check,
  X,
  Plus
} from 'lucide-react';

interface Option {
  id: string;
  name: string;
}

interface OptionSelectorRowProps<T extends Option> {
  title: string;
  options: T[];
  selectedOption: T;
  onOptionChange: (option: T) => void;
  renderOptionContent?: (option: T) => React.ReactNode;
}

const OptionSelectorRow = <T extends Option>({ title, options, selectedOption, onOptionChange, renderOptionContent }: OptionSelectorRowProps<T>) => (
  <div>
    <h4 className="text-md font-semibold text-gray-700 mb-2">{title}</h4>
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <div key={option.id} className="relative group/opt flex-grow sm:flex-grow-0">
            <button
            onClick={() => onOptionChange(option)}
            className={`w-full px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 flex items-center justify-center ${
                selectedOption.id === option.id
                ? 'bg-secondary text-white shadow-sm'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            role="radio"
            aria-checked={selectedOption.id === option.id}
            >
            {renderOptionContent ? renderOptionContent(option) : option.name}
            </button>
        </div>
      ))}
    </div>
  </div>
);

const ToggleOption = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (val: boolean) => void }) => (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-200">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <button
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${checked ? 'bg-primary' : 'bg-gray-300'}`}
        >
            <span
                className={`${checked ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
        </button>
    </div>
);

const CategoryIcons: Record<PoseCategory | 'all', React.FC<{ className?: string }>> = {
  all: ({ className }) => <LayoutGrid className={className} />,
  standing: ({ className }) => <Users className={className} />,
  sitting: ({ className }) => <Armchair className={className} />,
  leaning: ({ className }) => <ArrowLeftRight className={className} />,
  movement: ({ className }) => <Zap className={className} />,
  lifestyle: ({ className }) => <ShoppingBag className={className} />,
  artistic: ({ className }) => <Palette className={className} />,
};


interface ModelCustomizerProps {
  poseOptions: PoseOption[];
  selectedPose: PoseOption;
  onPoseChange: (option: PoseOption) => void;
  expressionOptions: ExpressionOption[];
  selectedExpression: ExpressionOption;
  onExpressionChange: (option: ExpressionOption) => void;
  viewOptions: ViewOption[];
  selectedView: ViewOption;
  onViewChange: (option: ViewOption) => void;
  timeOptions: TimeOption[];
  selectedTime: TimeOption;
  onTimeChange: (option: TimeOption) => void;
  aspectRatioOptions: AspectRatioOption[];
  selectedAspectRatio: AspectRatioOption;
  onAspectRatioChange: (option: AspectRatioOption) => void;
  cameraOptions: CameraOption[];
  selectedCamera: CameraOption;
  onCameraChange: (option: CameraOption) => void;
  qualityOptions: ImageQualityOption[];
  selectedQuality: ImageQualityOption;
  onQualityChange: (option: ImageQualityOption) => void;
 
  previewOptions: PreviewOptionsState;
  onPreviewOptionsChange: (options: PreviewOptionsState) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  presets: Preset[];
  onSavePreset: (name: string) => void;
  onLoadPreset: (id: string) => void;
  onDeletePreset: (id: string) => void;
  onRenamePreset?: (id: string, newName: string) => void;
  onClearAllPresets?: () => void;
  user?: User;
}

const ModelCustomizer: React.FC<ModelCustomizerProps> = ({
  poseOptions, selectedPose, onPoseChange,
  expressionOptions, selectedExpression, onExpressionChange,
  viewOptions, selectedView, onViewChange,
  timeOptions, selectedTime, onTimeChange,
  aspectRatioOptions, selectedAspectRatio, onAspectRatioChange,
  cameraOptions, selectedCamera, onCameraChange,
  qualityOptions, selectedQuality, onQualityChange,
  previewOptions, onPreviewOptionsChange,
  onUndo, onRedo, canUndo, canRedo,
  presets, onSavePreset, onLoadPreset, onDeletePreset,
  onRenamePreset, onClearAllPresets,
  user
}) => {
 
  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [showPresetsModal, setShowPresetsModal] = useState(false);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
 
  const [showPoseGallery, setShowPoseGallery] = useState(false);
  const [activePoseCategory, setActivePoseCategory] = useState<PoseCategory | 'all'>('all');

  const handleSavePreset = () => {
      if (newPresetName.trim()) {
          onSavePreset(newPresetName.trim());
          setNewPresetName('');
          setIsSavingPreset(false);
      }
  };
 
  const handleLoadPreset = (id: string) => {
      onLoadPreset(id);
      setSelectedPresetId(id);
  };

  const handleStartRename = (preset: Preset) => {
      setEditingPresetId(preset.id);
      setEditingName(preset.name);
  };

  const handleFinishRename = (id: string) => {
      if (onRenamePreset && editingName.trim()) {
          onRenamePreset(id, editingName.trim());
      }
      setEditingPresetId(null);
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

  const categories: (PoseCategory | 'all')[] = ['all', 'standing', 'leaning', 'sitting', 'movement', 'lifestyle', 'artistic'];

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

  // Plan-restricted quality logic
  const isQualityAllowed = (qualityId: string): boolean => {
    if (!user) return true;
    const planConfig = PLAN_CONFIG[user.planType];
    if (!planConfig) return false;
    return planConfig.allowedQualities.includes(qualityId);
  };

  const getQualityUpgradeMessage = (qualityId: string): string => {
    if (qualityId === 'high' || qualityId === 'ultra') {
      return 'Upgrade to Pro or Ultimate plan';
    }
    return '';
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md space-y-6">
      
       <div className="flex flex-col xl:flex-row justify-between items-center gap-4 pb-4 border-b border-gray-100">
           <div className="flex items-center gap-2">
               <button
                onClick={onUndo}
                disabled={!canUndo}
                className="p-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                title="Undo Change (Ctrl+Z)"
               >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                     <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                   </svg>
               </button>
               <button
                onClick={onRedo}
                disabled={!canRedo}
                className="p-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                title="Redo Change (Ctrl+Shift+Z)"
               >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                     <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                   </svg>
               </button>
           </div>
          
           <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
               <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 p-1.5 rounded-lg">
                   <select
                    className="form-select block w-full sm:w-40 px-2 py-1 text-xs border-transparent rounded bg-transparent focus:ring-0 focus:border-transparent text-gray-600 font-medium"
                    onChange={(e) => handleLoadPreset(e.target.value)}
                    value={selectedPresetId}
                   >
                       <option value="" disabled>Quick Load...</option>
                       {presets.map(p => (
                           <option key={p.id} value={p.id}>{p.name}</option>
                       ))}
                   </select>
                   <button
                       onClick={() => setShowPresetsModal(true)}
                       className="p-1.5 text-gray-500 hover:text-primary hover:bg-white rounded transition-all"
                       title="Manage Presets"
                   >
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                       </svg>
                   </button>
               </div>
                {!isSavingPreset ? (
                     <button
                        onClick={() => setIsSavingPreset(true)}
                        className="px-3 py-2 text-sm bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md hover:bg-indigo-100 flex items-center gap-1 font-medium transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Save New Preset
                    </button>
                ) : (
                    <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-md border border-gray-200">
                        <input
                            type="text"
                            className="w-32 px-2 py-1 text-sm border border-gray-300 rounded focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                            placeholder="Preset Name"
                            value={newPresetName}
                            onChange={(e) => setNewPresetName(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSavePreset();
                              if (e.key === 'Escape') setIsSavingPreset(false);
                            }}
                        />
                        <button onClick={handleSavePreset} className="text-white bg-green-500 hover:bg-green-600 rounded p-1 transition-colors">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                             <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                           </svg>
                        </button>
                        <button onClick={() => setIsSavingPreset(false)} className="text-white bg-red-500 hover:bg-red-600 rounded p-1 transition-colors">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                             <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                           </svg>
                        </button>
                    </div>
                )}
           </div>
       </div>

       <div>
         <h4 className="text-md font-semibold text-gray-700 mb-2">Generation Preview Options</h4>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <OptionSelectorRow
            title="Aspect Ratio"
            options={aspectRatioOptions}
            selectedOption={selectedAspectRatio}
            onOptionChange={onAspectRatioChange}
            renderOptionContent={renderAspectRatioContent}
          />
           <OptionSelectorRow
            title="Time of Day"
            options={timeOptions}
            selectedOption={selectedTime}
            onOptionChange={onTimeChange}
          />
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <OptionSelectorRow
            title="Camera Type"
            options={cameraOptions}
            selectedOption={selectedCamera}
            onOptionChange={onCameraChange}
          />
          {/* Updated Image Quality Section with Plan Restrictions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-md font-semibold text-gray-700">Image Quality</h4>
              {user && user.planType === 'Basic' && (
                <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-full border border-orange-200">
                  Basic Plan: 1K Only
                </span>
              )}
            </div>
           
            <div className="flex flex-wrap gap-2">
              {qualityOptions.map((option) => {
                const isLocked = !isQualityAllowed(option.id);
                const isSelected = selectedQuality.id === option.id;
               
                return (
                  <div key={option.id} className="relative group/opt flex-grow sm:flex-grow-0">
                    <button
                      onClick={() => !isLocked && onQualityChange(option)}
                      disabled={isLocked}
                      className={`w-full px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 flex items-center justify-center relative ${
                        isSelected
                          ? 'bg-secondary text-white shadow-sm'
                          : isLocked
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-2 border-dashed border-gray-300'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      role="radio"
                      aria-checked={isSelected}
                      aria-disabled={isLocked}
                    >
                      <div className={`flex flex-col items-center leading-tight py-0.5 ${isLocked ? 'opacity-60' : ''}`}>
                          <div className="flex items-center gap-1">
                              <span>{option.name}</span>
                              {isLocked && (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                  </svg>
                              )}
                          </div>
                          <span className="text-[10px] opacity-75 font-normal">{option.description}</span>
                      </div>
                    </button>
                   
                    {/* Enhanced Tooltip */}
                    <div className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 bg-gray-900 text-white p-3 rounded-lg text-[11px] shadow-2xl opacity-0 invisible group-hover/opt:opacity-100 group-hover/opt:visible transition-all z-30 pointer-events-none border border-gray-700`}>
                      <p className="font-bold border-b border-gray-700 mb-1 pb-1">
                        {option.id === 'standard' ? 'Fast & Efficient' : option.id === 'high' ? 'High Detail' : 'Ultra-HD'}
                      </p>
                      <p className="leading-relaxed mb-2">
                        {option.id === 'standard'
                          ? 'Standard 1K resolution. ~15s generation.'
                          : option.id === 'high'
                          ? 'Enhanced 2K resolution. ~30s generation.'
                          : 'Studio-grade 4K resolution. ~45s generation.'}
                      </p>
                     
                      {/* Show upgrade message for locked qualities */}
                      {isLocked && (
                        <div className="mt-2 pt-2 border-t border-orange-700 bg-orange-900/30 -mx-3 -mb-3 px-3 py-2 rounded-b-lg">
                          <div className="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-orange-300 font-bold text-xs">
                              {getQualityUpgradeMessage(option.id)}
                            </span>
                          </div>
                        </div>
                      )}
                     
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 border-r border-b border-gray-700"></div>
                    </div>
                  </div>
                );
              })}
            </div>
           
          </div>
       </div>

      <div>
        <div className="flex justify-between items-end mb-2">
            <h4 className="text-md font-semibold text-gray-700">Pose</h4>
            <button
                onClick={() => setShowPoseGallery(true)}
                className="text-xs text-primary font-medium hover:underline flex items-center bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100 transition-colors"
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
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 flex items-center justify-center flex-grow sm:flex-grow-0 ${
                    selectedPose.id === option.id
                    ? 'bg-secondary text-white shadow-sm'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                role="radio"
                aria-checked={selectedPose.id === option.id}
                >
                {option.name}
                </button>
            ))}
            <button
                onClick={() => setShowPoseGallery(true)}
                className="px-3 py-1.5 text-sm font-medium rounded-md bg-gray-100 text-primary border border-primary border-dashed hover:bg-indigo-50 transition-colors"
            >
                + More
            </button>
        </div>
      </div>

      <OptionSelectorRow
        title="Expression"
        options={expressionOptions}
        selectedOption={selectedExpression}
        onOptionChange={onExpressionChange}
      />

      <OptionSelectorRow
        title="View"
        options={viewOptions}
        selectedOption={selectedView}
        onOptionChange={onViewChange}
      />

      {/* Preset Management Modal */}
      {showPresetsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm" onClick={() => setShowPresetsModal(false)}>
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                  <div className="p-5 border-b flex justify-between items-center bg-gray-50">
                      <div>
                          <h3 className="font-bold text-xl text-gray-800">Manage Saved Presets</h3>
                          <p className="text-sm text-gray-500">View, rename, load or delete your custom configurations</p>
                      </div>
                      <button onClick={() => setShowPresetsModal(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                      </button>
                  </div>
                 
                  <div className="p-6 overflow-y-auto bg-white flex-1 custom-scrollbar">
                      {presets.length === 0 ? (
                          <div className="text-center py-12 text-gray-400">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                              <p className="text-lg font-medium">No presets saved yet.</p>
                              <p className="text-sm">Save your current settings to quickly reuse them later.</p>
                          </div>
                      ) : (
                          <div className="space-y-3">
                              {presets.map(preset => (
                                  <div key={preset.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-200 transition-all group">
                                      <div className="flex-1 min-w-0 mr-4">
                                          {editingPresetId === preset.id ? (
                                              <input
                                                autoFocus
                                                type="text"
                                                className="w-full bg-white border border-primary rounded px-2 py-1 text-sm font-semibold outline-none focus:ring-1 focus:ring-primary"
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleFinishRename(preset.id);
                                                    if (e.key === 'Escape') setEditingPresetId(null);
                                                }}
                                                onBlur={() => handleFinishRename(preset.id)}
                                              />
                                          ) : (
                                              <h4 className="font-bold text-gray-800 truncate">{preset.name}</h4>
                                          )}
                                          <p className="text-[10px] text-gray-400 mt-0.5">
                                              {preset.config.background.name} • {preset.config.pose.name} • {preset.config.quality.description}
                                          </p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                          <button
                                            onClick={() => handleLoadPreset(preset.id)}
                                            className="px-3 py-1.5 text-xs font-bold bg-white text-secondary border border-gray-200 rounded-lg hover:bg-secondary hover:text-white hover:border-secondary transition-all shadow-sm"
                                          >
                                              Load
                                          </button>
                                          <button
                                            onClick={() => handleStartRename(preset)}
                                            className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-white rounded-lg transition-all"
                                            title="Rename"
                                          >
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                              </svg>
                                          </button>
                                          <button
                                            onClick={() => onDeletePreset(preset.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-all"
                                            title="Delete"
                                          >
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                              </svg>
                                          </button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
                 
                  {presets.length > 0 && onClearAllPresets && (
                      <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
                          <button
                            onClick={onClearAllPresets}
                            className="text-xs text-red-500 font-bold hover:underline flex items-center gap-1"
                          >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete All Presets
                          </button>
                          <span className="text-xs text-gray-400">{presets.length} Presets Saved</span>
                      </div>
                  )}
              </div>
          </div>
      )}

      {showPoseGallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm" onClick={() => setShowPoseGallery(false)}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="font-bold text-xl text-gray-800">Pose Gallery</h3>
                        <p className="text-sm text-gray-500">Select a pose for your model</p>
                    </div>
                    <button onClick={() => setShowPoseGallery(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
               
                <div className="flex border-b overflow-x-auto p-2 gap-2 bg-white sticky top-0 z-10 no-scrollbar">
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
                        )
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
                <div className="p-6 overflow-y-auto bg-gray-50 flex-1 custom-scrollbar">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {galleryPoses.map(pose => {
                            const PoseIcon = CategoryIcons[pose.category] || CategoryIcons.all;
                            return (
                                <button
                                    key={pose.id}
                                    onClick={() => { onPoseChange(pose); setShowPoseGallery(false); }}
                                    className={`group relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                                        selectedPose.id === pose.id
                                        ? 'border-primary bg-indigo-50 ring-2 ring-primary ring-offset-2'
                                        : 'border-white bg-white hover:border-indigo-200 hover:shadow-lg'
                                    }`}
                                >
                                    <div className={`w-16 h-16 rounded-full mb-3 flex items-center justify-center transition-colors ${selectedPose.id === pose.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-indigo-100 group-hover:text-primary'}`}>
                                       <PoseIcon className="h-8 w-8" />
                                    </div>
                                    <span className={`text-sm font-bold mb-1 ${selectedPose.id === pose.id ? 'text-primary' : 'text-gray-800'}`}>
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

export default ModelCustomizer;