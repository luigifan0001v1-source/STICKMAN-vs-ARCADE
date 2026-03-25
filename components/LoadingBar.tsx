
import React, { useState, useEffect, useMemo } from 'react';

interface Props {
  label: string;
  duration?: number;
  color?: string;
  isComplete?: boolean;
  icon?: string;
}

const LoadingBar: React.FC<Props> = ({ label, duration = 2000, color = "#00ff00", isComplete = false, icon }) => {
  const [progress, setProgress] = useState(0);
  const [isGlitching, setIsGlitching] = useState(false);

  // Randomly trigger "glitch" moments for visual variety
  useEffect(() => {
    if (isComplete) return;
    const triggerGlitch = () => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 150 + Math.random() * 200);
      setTimeout(triggerGlitch, 800 + Math.random() * 2000);
    };
    const timer = setTimeout(triggerGlitch, 500);
    return () => clearTimeout(timer);
  }, [isComplete]);

  useEffect(() => {
    if (isComplete) {
      setProgress(100);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return prev;
        const inc = Math.random() * (isGlitching ? 15 : 5);
        return Math.min(98, prev + inc);
      });
    }, duration / 25);

    return () => clearInterval(interval);
  }, [isComplete, duration, isGlitching]);

  const segments = 15;
  const filledSegments = Math.floor((progress / 100) * segments);

  const diagText = useMemo(() => {
    const hex = Math.floor(Math.random() * 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
    return `ADDR: 0x${hex} | VOLT: ${(4.8 + Math.random() * 1.2).toFixed(1)}V`;
  }, [filledSegments]);

  return (
    <div className={`w-full max-w-sm mb-6 transition-transform duration-75 ${isGlitching ? 'translate-x-1 skew-x-1' : ''}`}>
      <div className="flex justify-between items-center mb-1">
        <span className="retro-font text-[8px] uppercase tracking-tighter flex items-center gap-2" style={{ color }}>
          {isGlitching && <span className="animate-ping">!</span>}
          {label}
        </span>
        <span className="retro-font text-[8px]" style={{ color }}>
          {Math.floor(progress)}%
        </span>
      </div>
      
      <div 
        className="h-6 border-2 p-[3px] relative overflow-hidden bg-black/40" 
        style={{ borderColor: `${color}66`, boxShadow: isGlitching ? `0 0 15px ${color}44` : 'none' }}
      >
        <div className="flex items-center justify-between h-full w-full relative">
          {[...Array(segments)].map((_, i) => (
            <div
              key={i}
              className={`h-full flex-1 flex items-center justify-center transition-all duration-300 ${i < filledSegments ? 'scale-100 opacity-100' : 'scale-75 opacity-20'}`}
              style={{
                color: i < filledSegments ? color : `${color}22`,
                filter: i < filledSegments ? `drop-shadow(0 0 4px ${color})` : 'none',
              }}
            >
              {icon ? (
                <span className="text-xs leading-none select-none">{icon}</span>
              ) : (
                <div 
                  className="w-full h-full mx-[1px]" 
                  style={{ backgroundColor: i < filledSegments ? color : 'transparent' }} 
                />
              )}
            </div>
          ))}
          
          {/* Active scanning sweep */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-white/40 shadow-[0_0_10px_white] z-10"
            style={{ 
              left: `${progress}%`,
              display: isComplete ? 'none' : 'block'
            }}
          />
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-1 opacity-40">
        <span className="text-[7px] retro-font tracking-widest" style={{ color }}>{diagText}</span>
        <span className="text-[7px] retro-font animate-pulse" style={{ color }}>{isGlitching ? 'CORRUPTION DETECTED' : 'STABLE'}</span>
      </div>

      <style>{`
        @keyframes sweep {
          0% { left: -10%; }
          100% { left: 110%; }
        }
      `}</style>
    </div>
  );
};

export default LoadingBar;
