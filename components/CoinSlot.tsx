
import React, { useState } from 'react';

interface Props {
  onInsert: () => void;
}

const CoinSlot: React.FC<Props> = ({ onInsert }) => {
  const [animating, setAnimating] = useState(false);

  const handleClick = () => {
    setAnimating(true);
    onInsert();
    setTimeout(() => setAnimating(false), 500);
  };

  return (
    <div className="flex flex-col items-center gap-1 group">
      <div 
        onClick={handleClick}
        className={`relative w-8 h-12 bg-gray-700 border-2 border-gray-600 rounded-sm cursor-pointer hover:border-yellow-500 transition-all flex flex-col items-center justify-center hover:shadow-[0_0_10px_rgba(255,255,0,0.3)] hover:scale-105 active:scale-90 coin-slot-pulse ${animating ? 'scale-95' : ''}`}
      >
        <div className="w-1 h-6 bg-black rounded-full shadow-inner mb-1"></div>
        <div className="text-[6px] text-gray-500 font-bold uppercase leading-none text-center select-none">COIN</div>
        
        {animating && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className="w-4 h-4 bg-yellow-400 rounded-full border border-yellow-600 shadow-lg flex items-center justify-center text-[8px] text-yellow-800 font-bold">$</div>
          </div>
        )}
      </div>
      <style>{`
        .coin-slot-pulse:hover {
          animation: subtle-pulse 2s infinite ease-in-out;
        }
        @keyframes subtle-pulse {
          0%, 100% { transform: scale(1.05); }
          50% { transform: scale(1.0); }
        }
      `}</style>
    </div>
  );
};

export default CoinSlot;
