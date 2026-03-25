
import React, { useState, useEffect } from 'react';
import { ARCADE_ADS } from '../constants';
import { soundService } from '../services/soundService';

interface Props {
  onAction?: (action: string) => void;
  className?: string;
  variant?: 'full' | 'banner';
}

const ArcadeAds: React.FC<Props> = ({ onAction, className = "", variant = 'full' }) => {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ARCADE_ADS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const ad = ARCADE_ADS[currentAdIndex];

  const handleAction = () => {
    soundService.playSelect();
    if (onAction) onAction(ad.title);
  };

  if (variant === 'banner') {
    return (
      <div className={`flex items-center gap-4 bg-black/80 border-y border-white/10 px-4 py-1 overflow-hidden h-8 ${className}`}>
        <div className="retro-font text-[6px] text-yellow-500 animate-pulse shrink-0">SPONSORED_CONTENT:</div>
        <div className="flex-grow flex items-center justify-center gap-2 animate-in slide-in-from-right duration-500" key={currentAdIndex}>
          <span className="text-xs">{ad.icon}</span>
          <span className="retro-font text-[7px] text-white/80">{ad.title}</span>
          <span className="text-[7px] text-white/40 font-vt323 italic">— {ad.tagline}</span>
        </div>
        <button onClick={handleAction} className="retro-font text-[5px] border border-white/20 px-2 py-0.5 hover:bg-white hover:text-black transition-all">
          {ad.action}
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center p-4 border-2 border-white/5 bg-black/40 rounded-lg relative overflow-hidden group ${className}`}>
      <div className="absolute top-0 right-0 p-1">
        <div className="bg-white/10 text-[6px] retro-font text-white/40 px-1 py-0.5">AD_UNIT_0{currentAdIndex + 1}</div>
      </div>
      
      <div className="flex flex-col items-center text-center space-y-2 animate-in fade-in zoom-in-95 duration-700" key={currentAdIndex}>
        <div className="text-4xl mb-1 transform group-hover:scale-110 transition-transform">{ad.icon}</div>
        <div className="retro-font text-[10px] font-bold tracking-widest" style={{ color: ad.color, textShadow: `0 0 10px ${ad.color}66` }}>
          {ad.title}
        </div>
        <div className="text-[8px] retro-font text-white/60">{ad.tagline}</div>
        <button 
          onClick={handleAction}
          className="mt-2 px-3 py-1 bg-white text-black retro-font text-[6px] hover:bg-yellow-400 transition-colors"
        >
          {ad.action}
        </button>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/10 overflow-hidden">
        <div className="h-full bg-white/40 animate-marquee-progress" />
      </div>

      <style>{`
        @keyframes marquee-progress {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
        .animate-marquee-progress {
          animation: marquee-progress 5s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ArcadeAds;
