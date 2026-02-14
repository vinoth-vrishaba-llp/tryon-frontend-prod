import React from 'react';
import { Page, User } from '../types';
import mensImage from '../Image/Men_clothing.png';
import womensImage from '../Image/women_clothing.png';
import jewelleryImage from '../Image/Jwellery.png';
import kidsImage from '../Image/Kids_clothing.jpeg';

interface HomePageProps {
  user: User;
  onNavigate: (page: Page) => void;
}

export enum GenerationStage {
  INITIALIZING = 0,
  ANALYZING = 1,
  CRAFTING = 2,
  UPSCALING = 3,
  FINALIZING = 4
}

const STAGE_LABELS = [
  "Initializing Studio Engine",
  "Analyzing Anatomical Likeness",
  "Crafting Fabric Physics",
  "Optimizing High-Res Output",
  "Applying Final Textures"
];

interface GenerationProgressProps {
  stage?: GenerationStage;
}

export const GenerationProgress: React.FC<GenerationProgressProps> = ({ stage = GenerationStage.INITIALIZING }) => {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const target = (stage + 1) * 20;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev < target) return prev + 1;
        if (prev < 99) return prev + 0.1;
        return 99.9;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [stage]);

  return (
    <div className="w-full max-w-lg mx-auto p-10 bg-surface rounded-2xl shadow-2xl border border-border relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-surface-secondary">
        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary opacity-10 rounded-full animate-ping scale-150"></div>
          <div className="relative z-10 bg-primary p-5 rounded-full shadow-xl">
            <svg className="h-12 w-12 text-content-inverse animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
        <h3 className="text-2xl font-black text-content tracking-tight text-center">{STAGE_LABELS[stage]}</h3>
        <p className="text-sm text-content-secondary font-medium mt-2 animate-pulse">~{Math.round(progress)}% Processed</p>
      </div>

      <div className="relative w-full bg-surface-tertiary rounded-full h-4 overflow-hidden mb-2">
        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }}></div>
      </div>
      <p className="text-center text-[10px] text-content-tertiary font-bold uppercase tracking-widest">Digital Loom in operation...</p>
    </div>
  );
};

const HomePage: React.FC<HomePageProps> = ({ user, onNavigate }) => {
  return (
    <div className="container mx-auto">
  <div className="text-center py-12 px-4">
     <h3 className="text-xl md:text-5xl lg:text-6xl font-extrabold
                      leading-snug md:leading-normal lg:leading-relaxed">
          <span className="text-content">Virtual </span>
          <span className="text-primary">TryOn</span>
          <span className="text-content"> Experience</span>
        </h3>
     <p className="mt-6 text-xl text-content-secondary max-w-3xl mx-auto">
          Studio-quality precision. Visualize your style in seconds.
        </p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 max-w-7xl mx-auto px-4">
    <CategoryCard 
      title="Men's Wear" 
      description="Formal shirts to street-ready denim." 
      imageUrl={mensImage}
      onClick={() => onNavigate('mens')} 
    />
    <CategoryCard 
      title="Women's Boutique" 
      description="Exquisite sarees and silhouettes." 
      imageUrl={womensImage}
      onClick={() => onNavigate('womens')} 
    />
    <CategoryCard 
      title="Jewellery Studio" 
      description="Necklaces, rings, and fine ornaments." 
      imageUrl={jewelleryImage}
      onClick={() => onNavigate('jewellery')} 
    />
    <CategoryCard 
      title="Kids' Collection" 
      description="Adorable styles for trendsetters." 
      imageUrl={kidsImage}
      onClick={() => onNavigate('kids')} 
    />
  </div>
</div>
  );
};

const CategoryCard: React.FC<{ title: string; description: string; imageUrl: string; onClick: () => void }> = ({
  title,
  description,
  imageUrl,
  onClick
}) => (
  <div
    onClick={onClick}
    className="group relative rounded-2xl overflow-hidden shadow-xl cursor-pointer transform transition-all duration-500 hover:-translate-y-2"
  >
    <img
      src={imageUrl}
      alt={title}
      className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-surface-inverse/95 via-surface-inverse/20 to-transparent flex flex-col items-center justify-end p-6 text-center">
      <h3 className="text-2xl font-black text-content-inverse mb-2">{title}</h3>
      <p className="text-xs text-content-disabled font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500">{description}</p>
    </div>
  </div>
);

export default HomePage;