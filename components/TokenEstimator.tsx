
import React, { useMemo } from 'react';
import { ImageQualityOption, ConfigState } from '../types';

interface TokenEstimatorProps {
  imageFiles: (File | undefined | null)[];
  quality: ImageQualityOption;
  promptLength?: number;
}

const TokenEstimator: React.FC<TokenEstimatorProps> = ({ quality }) => {

  const creditCost = useMemo(() => {
    if (quality.id === 'ultra') return 10;
    if (quality.id === 'high') return 5;
    return 3;
  }, [quality]);

  const isUltra = quality.id === 'ultra';

  return (
    <div className="flex items-center space-x-2 text-[10px] text-gray-400 bg-white/50 px-3 py-1 rounded-full border border-gray-100 w-fit mx-auto mt-2">
      <div className={`w-1.5 h-1.5 rounded-full ${isUltra ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`}></div>
      <span className="font-semibold tracking-wider uppercase">Cost: {creditCost} Credits</span>
      <span className="opacity-30">|</span>
      <span className="font-bold">{quality.id.toUpperCase()} MODE</span>
    </div>
  );
};

export default TokenEstimator;
