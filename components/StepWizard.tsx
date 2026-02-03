import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Save, FolderOpen, Trash2, Edit3, X, Loader2, Star } from 'lucide-react';
import { PresetData } from '../services/presetService';
import { RecommendedPreset } from '../services/recommendedPresetService';

export interface WizardStep {
  id: string;
  title: string;
  shortTitle: string;
  description?: string;
}

interface StepWizardProps {
  steps: WizardStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  children: React.ReactNode;
  canProceed: boolean;
  onNext?: () => void;
  onBack?: () => void;
  isLastStep?: boolean;
  isGenerating?: boolean;
  title: string;
  subtitle?: string;
  // Preset props
  presets?: PresetData[];
  recommendedPresets?: RecommendedPreset[];
  presetsLoading?: boolean;
  currentPresetName?: string;
  onSavePreset?: (name: string) => Promise<PresetData>;
  onLoadPreset?: (preset: PresetData) => void;
  onDeletePreset?: (presetId: string) => Promise<void>;
  onRenamePreset?: (presetId: string) => Promise<void>;
}

const StepWizard: React.FC<StepWizardProps> = ({
  steps,
  currentStep,
  onStepChange,
  children,
  canProceed,
  onNext,
  onBack,
  isLastStep = false,
  isGenerating = false,
  title,
  subtitle,
  // Preset props
  presets = [],
  recommendedPresets = [],
  presetsLoading = false,
  currentPresetName,
  onSavePreset,
  onLoadPreset,
  onDeletePreset,
  onRenamePreset
}) => {
  // Preset modal state
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [presetModalMode, setPresetModalMode] = useState<'save' | 'load'>('load');
  const [newPresetName, setNewPresetName] = useState('');
  const [savingPreset, setSavingPreset] = useState(false);
  const [presetError, setPresetError] = useState<string | null>(null);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editingPresetName, setEditingPresetName] = useState('');
  const [deletingPresetId, setDeletingPresetId] = useState<string | null>(null);

  const handleNext = () => {
    if (canProceed && currentStep < steps.length - 1) {
      onNext?.();
      onStepChange(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      onBack?.();
      onStepChange(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    // Only allow going back to completed steps
    if (stepIndex < currentStep) {
      onStepChange(stepIndex);
    }
  };

  // Preset handlers
  const handleOpenSaveModal = () => {
    setPresetModalMode('save');
    setNewPresetName('');
    setPresetError(null);
    setShowPresetModal(true);
  };

  const handleOpenLoadModal = () => {
    setPresetModalMode('load');
    setPresetError(null);
    setShowPresetModal(true);
  };

  const handleSavePreset = async () => {
    if (!newPresetName.trim()) {
      setPresetError('Please enter a preset name');
      return;
    }
    if (!onSavePreset) return;

    setSavingPreset(true);
    setPresetError(null);

    try {
      await onSavePreset(newPresetName.trim());
      setShowPresetModal(false);
      setNewPresetName('');
    } catch (err: any) {
      setPresetError(err.message || 'Failed to save preset');
    } finally {
      setSavingPreset(false);
    }
  };

  const handleLoadPreset = (preset: PresetData) => {
    if (onLoadPreset) {
      onLoadPreset(preset);
      setShowPresetModal(false);
    }
  };

  const handleDeletePreset = async (presetId: string) => {
    if (!onDeletePreset) return;

    setDeletingPresetId(presetId);
    try {
      await onDeletePreset(presetId);
    } catch (err: any) {
      setPresetError(err.message || 'Failed to delete preset');
    } finally {
      setDeletingPresetId(null);
    }
  };

  const handleStartRename = (preset: PresetData) => {
    setEditingPresetId(preset.id!);
    setEditingPresetName(preset.name);
  };

  const handleCancelRename = () => {
    setEditingPresetId(null);
    setEditingPresetName('');
  };

  const handleConfirmRename = async () => {
    if (!editingPresetId || !editingPresetName.trim() || !onRenamePreset) return;

    try {
      await onRenamePreset(editingPresetId, editingPresetName.trim());
      setEditingPresetId(null);
      setEditingPresetName('');
    } catch (err: any) {
      setPresetError(err.message || 'Failed to rename preset');
    }
  };

  const hasPresetFeature = onSavePreset || onLoadPreset;

  return (
    <div className="container mx-auto">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold text-primary">{title}</h2>
        {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
      </div>

      {/* Preset Bar - Always visible if preset feature is enabled */}
      {hasPresetFeature && (
        <div className="max-w-3xl mx-auto mb-6">
          <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 p-3 rounded-xl border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FolderOpen className="w-5 h-5 text-indigo-600" />
              <div>
                <span className="text-sm font-semibold text-gray-700">Preset: </span>
                {currentPresetName ? (
                  <span className="text-sm font-bold text-indigo-700">{currentPresetName}</span>
                ) : (
                  <span className="text-sm text-gray-500 italic">None selected</span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleOpenLoadModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-700 font-semibold text-sm rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                <FolderOpen className="w-4 h-4" />
                Load
                {presets.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full">
                    {presets.length}
                  </span>
                )}
              </button>
              <button
                onClick={handleOpenSaveModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white font-semibold text-sm rounded-lg hover:bg-indigo-700 transition-all shadow-sm"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="flex items-center justify-between relative">
          {/* Progress Line Background */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0" />

          {/* Progress Line Active */}
          <div
            className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500 z-0"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isClickable = index < currentStep;

            return (
              <div
                key={step.id}
                className={`flex flex-col items-center relative z-10 ${isClickable ? 'cursor-pointer' : ''}`}
                onClick={() => isClickable && handleStepClick(index)}
              >
                {/* Step Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${
                    isCompleted
                      ? 'bg-primary border-primary text-white'
                      : isCurrent
                        ? 'bg-white border-primary text-primary shadow-lg scale-110'
                        : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Step Label */}
                <div className="mt-2 text-center">
                  <p className={`text-xs font-bold ${
                    isCurrent ? 'text-primary' : isCompleted ? 'text-gray-700' : 'text-gray-400'
                  }`}>
                    {step.shortTitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Step Description */}
        <div className="mt-6 text-center">
          <h3 className="text-lg font-bold text-gray-800">{steps[currentStep].title}</h3>
          {steps[currentStep].description && (
            <p className="text-sm text-gray-500 mt-1">{steps[currentStep].description}</p>
          )}
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8">
            {children}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      {!isLastStep && (
        <div className="max-w-5xl mx-auto mt-6">
          <div className="flex justify-between items-center">
            {/* Back Button */}
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                currentStep === 0
                  ? 'opacity-0 pointer-events-none'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>

            {/* Step Counter */}
            <div className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={!canProceed || isGenerating}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                canProceed && !isGenerating
                  ? 'bg-primary text-white hover:bg-primary/90 shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Preset Modal */}
      {showPresetModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm"
          onClick={() => setShowPresetModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-800">
                {presetModalMode === 'save' ? 'Save Preset' : 'Load Preset'}
              </h3>
              <button
                onClick={() => setShowPresetModal(false)}
                className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4">
              {presetError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-medium">
                  {presetError}
                </div>
              )}

              {presetModalMode === 'save' ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Save your current settings as a preset for quick access later.
                  </p>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Preset Name
                    </label>
                    <input
                      type="text"
                      value={newPresetName}
                      onChange={(e) => setNewPresetName(e.target.value)}
                      placeholder="e.g., My Studio Setup"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
                    />
                  </div>
                  <button
                    onClick={handleSavePreset}
                    disabled={savingPreset || !newPresetName.trim()}
                    className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {savingPreset ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Preset
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {presetsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                    </div>
                  ) : (
                    <div className="max-h-[32rem] overflow-y-auto space-y-4">
                      {/* Recommended Presets Section */}
                      {recommendedPresets.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-3 sticky top-0 bg-white z-10 py-2">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <h4 className="font-bold text-sm text-gray-700 uppercase tracking-wider">
                              Quick Start (Recommended)
                            </h4>
                          </div>
                          <div className="space-y-2">
                            {recommendedPresets.map((recPreset) => (
                              <div
                                key={recPreset.id}
                                className="group p-3 bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 rounded-xl border-2 border-yellow-200 hover:border-yellow-300 transition-all cursor-pointer"
                                onClick={() => {
                                  if (onLoadPreset) {
                                    onLoadPreset(recPreset.preset_data);
                                    setCurrentPresetName(recPreset.name);
                                    setShowPresetModal(false);
                                  }
                                }}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <Star className="w-4 h-4 text-yellow-600 fill-yellow-600 flex-shrink-0" />
                                      <p className="font-bold text-gray-900 group-hover:text-yellow-900">
                                        {recPreset.name}
                                      </p>
                                    </div>
                                    {recPreset.description && (
                                      <p className="text-xs text-gray-600 mt-1 ml-6">
                                        {recPreset.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-xs bg-yellow-600 text-white px-2 py-1 rounded-full font-black uppercase tracking-wider">
                                    Preset
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* User Presets Section */}
                      {presets.length === 0 && recommendedPresets.length === 0 ? (
                        <div className="text-center py-8">
                          <FolderOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                          <p className="text-gray-500 text-sm">No presets available</p>
                          <p className="text-gray-400 text-xs mt-1">Save your first preset to get started</p>
                        </div>
                      ) : presets.length > 0 ? (
                        <div>
                          <div className="flex items-center gap-2 mb-3 sticky top-0 bg-white z-10 py-2">
                            <Save className="w-4 h-4 text-indigo-600" />
                            <h4 className="font-bold text-sm text-gray-700 uppercase tracking-wider">
                              My Saved Presets
                            </h4>
                          </div>
                          <div className="space-y-2">
                            {presets.map((preset) => (
                        <div
                          key={preset.id}
                          className="group p-3 bg-gray-50 hover:bg-indigo-50 rounded-xl border border-gray-200 hover:border-indigo-200 transition-all"
                        >
                          {editingPresetId === preset.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={editingPresetName}
                                onChange={(e) => setEditingPresetName(e.target.value)}
                                className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleConfirmRename();
                                  if (e.key === 'Escape') handleCancelRename();
                                }}
                              />
                              <button
                                onClick={handleConfirmRename}
                                className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleCancelRename}
                                className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <button
                                onClick={() => handleLoadPreset(preset)}
                                className="flex-1 text-left"
                              >
                                <p className="font-semibold text-gray-800 group-hover:text-indigo-700">
                                  {preset.name}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {preset.createdAt
                                    ? new Date(preset.createdAt).toLocaleDateString()
                                    : 'Unknown date'}
                                </p>
                              </button>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartRename(preset);
                                  }}
                                  className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                                  title="Rename"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePreset(preset.id!);
                                  }}
                                  disabled={deletingPresetId === preset.id}
                                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                                  title="Delete"
                                >
                                  {deletingPresetId === preset.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepWizard;
