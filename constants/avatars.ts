import avatarMale1 from '../Image/avatar-male-1.webp';
import avatarMale2 from '../Image/avatar-male-2.webp';
import avatarMale3 from '../Image/avatar-male-3.webp';
import avatarFemale1 from '../Image/avatar-female-1.webp';
import avatarFemale2 from '../Image/avatar-female-2.webp';
import avatarFemale3 from '../Image/avatar-female-3.webp';

export type AvatarId = 'male-1' | 'male-2' | 'male-3' | 'female-1' | 'female-2' | 'female-3';
export type AvatarGender = 'male' | 'female';

export interface AvatarOption {
  id: AvatarId;
  gender: AvatarGender;
  src: string;
}

export const AVATARS: AvatarOption[] = [
  { id: 'male-1', gender: 'male', src: avatarMale1 },
  { id: 'male-2', gender: 'male', src: avatarMale2 },
  { id: 'male-3', gender: 'male', src: avatarMale3 },
  { id: 'female-1', gender: 'female', src: avatarFemale1 },
  { id: 'female-2', gender: 'female', src: avatarFemale2 },
  { id: 'female-3', gender: 'female', src: avatarFemale3 },
];

export const getAvatarById = (id: string | undefined): AvatarOption | undefined =>
  AVATARS.find((a) => a.id === id);
