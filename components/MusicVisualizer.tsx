
import React from 'react';

interface Props {
  active: boolean;
  color?: string;
}

const MusicVisualizer: React.FC<Props> = ({ active, color = "#00ff00" }) => {
  return (
    <div className="flex items-end gap-[2px] h-4">
      {[...Array(6)].map((_, i) => (
        <div 
          key={i}
          className="w-1 bg-current transition-all duration-150"
          style={{ 
            color,
            height: active ? `${Math.random() * 100}%` : '20%',
            animation: active ? `vibe ${0.4 + Math.random() * 0.5}s infinite alternate` : 'none',
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
      <style>{`
        @keyframes vibe {
          0% { height: 20%; }
          100% { height: 100%; }
        }
      `}</style>
    </div>
  );
};

export default MusicVisualizer;
