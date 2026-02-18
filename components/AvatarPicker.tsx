import React, { useState } from 'react';
import { AVATARS, AvatarId, AvatarGender } from '../constants/avatars';
import { Check } from 'lucide-react';

interface AvatarPickerProps {
  selectedAvatar: string | undefined;
  onSelect: (avatarId: AvatarId) => void;
  loading?: boolean;
  onSkip?: () => void;
  onConfirm?: () => void;
}

const AvatarPicker: React.FC<AvatarPickerProps> = ({
  selectedAvatar,
  onSelect,
  loading,
  onSkip,
  onConfirm,
}) => {
  const [activeTab, setActiveTab] = useState<AvatarGender>('male');

  const filteredAvatars = AVATARS.filter((a) => a.gender === activeTab);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-content mb-1">Choose your avatar</h3>
        <p className="text-sm text-content-tertiary">Pick a profile picture that represents you</p>
      </div>

      {/* Gender tabs */}
      <div className="flex gap-1 bg-surface-secondary rounded-lg p-1">
        {(['male', 'female'] as AvatarGender[]).map((gender) => (
          <button
            key={gender}
            onClick={() => setActiveTab(gender)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === gender
                ? 'bg-surface text-content shadow-sm'
                : 'text-content-tertiary hover:text-content-secondary'
            }`}
          >
            {gender === 'male' ? 'Male' : 'Female'}
          </button>
        ))}
      </div>

      {/* Avatar grid */}
      <div className="grid grid-cols-3 gap-4">
        {filteredAvatars.map((avatar) => {
          const isSelected = selectedAvatar === avatar.id;
          return (
            <button
              key={avatar.id}
              onClick={() => onSelect(avatar.id)}
              className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                isSelected
                  ? 'border-primary ring-2 ring-primary/30 shadow-lg'
                  : 'border-border hover:border-content-tertiary'
              }`}
            >
              <img
                src={avatar.src}
                alt={`Avatar ${avatar.id}`}
                className="w-full h-full object-cover"
              />
              {isSelected && (
                <div className="absolute bottom-1 right-1 bg-primary rounded-full p-1">
                  <Check size={12} className="text-content-inverse" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      {(onSkip || onConfirm) && (
        <div className="flex items-center justify-between pt-2">
          {onSkip && (
            <button
              onClick={onSkip}
              disabled={loading}
              className="text-sm text-content-tertiary hover:text-content-secondary font-medium transition-colors"
            >
              Skip for now
            </button>
          )}
          {onConfirm && (
            <button
              onClick={onConfirm}
              disabled={loading || !selectedAvatar}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                selectedAvatar
                  ? 'bg-primary text-content-inverse hover:bg-secondary'
                  : 'bg-surface-tertiary text-content-tertiary cursor-not-allowed'
              }`}
            >
              {loading ? 'Saving...' : 'Continue'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AvatarPicker;
