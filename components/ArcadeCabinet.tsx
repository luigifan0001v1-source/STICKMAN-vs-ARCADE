
import React from 'react';
import CoinSlot from './CoinSlot';
import { soundService } from '../services/soundService';
import { CabinetTheme } from '../types';

interface Props {
  children: React.ReactNode;
  title?: string;
  onInsertCoin?: () => void;
  onToggleFullscreen?: () => void;
  onStart?: () => void;
  credits?: number | string;
  isFullscreen?: boolean;
  canStart?: boolean;
  isVip?: boolean;
  isMuted?: boolean;
  theme?: CabinetTheme;
}

const ArcadeCabinet: React.FC<Props> = ({ 
  children, 
  title = "GENAI ARCADE", 
  onInsertCoin, 
  onToggleFullscreen,
  onStart,
  credits = 0,
  isFullscreen = false,
  canStart = false,
  isVip = false,
  isMuted = false,
  theme = 'standard'
}) => {
  const handleActionClick = () => {
    soundService.playActionClick();
  };

  const handleFullscreenClick = () => {
    soundService.playVanish();
    if (onToggleFullscreen) onToggleFullscreen();
  };

  const handleStartClick = () => {
    if (canStart && onStart) {
      soundService.playSelect();
      onStart();
    } else {
      soundService.playExplosion();
    }
  };

  // Theme-specific styles
  const getThemeStyles = () => {
    switch(theme) {
      case 'cyber':
        return {
          border: 'border-[#ff00ff]',
          shadow: 'shadow-[0_0_40px_rgba(255,0,255,0.3)]',
          marquee: 'border-[#00ffff] shadow-[0_0_15px_#00ffff]',
          trim: 'bg-gradient-to-b from-[#ff00ff] via-[#00ffff] to-[#ff00ff]',
          panel: 'bg-[#0a0510] border-[#ff00ff]',
          led: 'text-[#00ffff]'
        };
      case 'royal':
        return {
          border: 'border-yellow-400',
          shadow: 'shadow-[0_0_60px_rgba(255,215,0,0.4)]',
          marquee: 'border-yellow-500 shadow-[0_0_15px_#ffd700]',
          trim: 'bg-gradient-to-b from-yellow-400 via-yellow-600 to-yellow-400',
          panel: 'bg-[#0a0a05] border-yellow-600',
          led: 'text-yellow-400'
        };
      default:
        return {
          border: 'border-gray-800',
          shadow: 'shadow-2xl',
          marquee: 'border-gray-700 shadow-none',
          trim: 'bg-red-600/30',
          panel: 'bg-gray-800 border-gray-700',
          led: 'text-red-500'
        };
    }
  };

  const styles = getThemeStyles();

  return (
    <div className={`relative w-full max-w-4xl mx-auto border-8 bg-gray-900 rounded-t-3xl p-4 transition-all duration-700 ${isFullscreen ? 'max-w-none h-screen border-0 rounded-none' : 'mt-4'} ${styles.border} ${styles.shadow}`}>
      
      {/* Side trim */}
      {!isFullscreen && (
        <>
          <div className={`absolute left-0 top-0 w-2 h-full ${styles.trim}`}></div>
          <div className={`absolute right-0 top-0 w-2 h-full ${styles.trim}`}></div>
        </>
      )}

      {/* Marquee Header Section */}
      <div className={`relative mb-8 p-3 bg-black rounded-lg border-4 transition-all duration-700 ${styles.marquee}`}>
        
        {/* Chasing Light Tracks */}
        <div className={`absolute top-0 left-0 right-0 chase-border opacity-80 z-20 rounded-t-lg ${theme === 'royal' ? 'vip-chase' : theme === 'cyber' ? 'cyber-chase' : ''}`}></div>
        <div className={`absolute bottom-0 left-0 right-0 chase-border opacity-80 z-20 rounded-b-lg ${theme === 'royal' ? 'vip-chase' : theme === 'cyber' ? 'cyber-chase' : ''}`}></div>

        {/* The Marquee Proper */}
        <div className={`relative bg-black h-24 flex items-center justify-center overflow-hidden rounded-md border-2 ${theme === 'royal' ? 'border-yellow-400/50' : theme === 'cyber' ? 'border-cyan-400/50' : 'border-yellow-500/30'}`}>
          
          {/* Internal backlight glow */}
          <div className={`absolute inset-0 via-transparent animate-pulse ${theme === 'royal' ? 'bg-gradient-to-br from-yellow-500/30 to-yellow-600/30' : theme === 'cyber' ? 'bg-gradient-to-br from-pink-500/20 to-cyan-500/20' : 'bg-gradient-to-br from-yellow-500/10 to-yellow-500/10'}`}></div>
          
          <div className="absolute -inset-x-full inset-y-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[marquee-sweep_5s_linear_infinite] pointer-events-none"></div>

          <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(#000_1px,transparent_1px)] bg-[length:4px_4px] z-40"></div>

          <div className="absolute inset-0 flex items-center z-30 whitespace-nowrap overflow-hidden">
             <div className="animate-marquee-scroll flex gap-20 motion-blur-md">
                <h1 className={`retro-font text-3xl md:text-4xl neon-flicker uppercase tracking-tighter scale-y-125 drop-shadow-[0_0_15px_rgba(255,200,0,0.5)] ${theme === 'royal' ? 'text-yellow-200' : theme === 'cyber' ? 'text-cyan-300' : 'text-yellow-400'}`}>
                  {title}
                </h1>
                <h1 className={`retro-font text-3xl md:text-4xl neon-flicker uppercase tracking-tighter scale-y-125 drop-shadow-[0_0_15px_rgba(255,200,0,0.5)] ${theme === 'royal' ? 'text-yellow-200' : theme === 'cyber' ? 'text-cyan-300' : 'text-yellow-400'}`}>
                  {title}
                </h1>
             </div>
          </div>

          {isVip && theme === 'royal' && (
            <div className="absolute top-1 right-2 bg-gradient-to-r from-yellow-400 via-yellow-100 to-yellow-500 text-black px-3 py-1 retro-font text-[8px] font-bold skew-x-[-12deg] z-50 border-2 border-yellow-900 shadow-[0_0_15px_#ffd700] animate-pulse">
              VIP EDITION
            </div>
          )}
        </div>
      </div>

      {/* Main Screen Area */}
      <div className={`relative bg-[#050505] border-4 aspect-video rounded-lg overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,1)] ${isFullscreen ? 'flex-grow h-[calc(100vh-280px)]' : ''} ${theme === 'royal' ? 'border-yellow-700/50' : theme === 'cyber' ? 'border-pink-500/50' : 'border-gray-700'}`}>
        <div className="crt-effect absolute inset-0 pointer-events-none z-30 opacity-40"></div>
        <div className="scanline z-40" />
        <div className="relative z-20 h-full w-full p-4 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>

      {/* Control Panel Section */}
      <div className={`mt-4 p-6 rounded-b-xl border-t-4 flex flex-col sm:flex-row justify-between items-center gap-6 relative transition-all duration-700 ${styles.panel}`}>
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-1">
            <div 
              onClick={handleStartClick}
              className={`w-14 h-14 rounded-full border-2 transition-all flex items-center justify-center relative ${
                canStart 
                  ? 'bg-red-600 shadow-[0_6px_0_rgba(150,0,0,1)] border-red-400 active:translate-y-1 active:shadow-none cursor-pointer' 
                  : 'bg-gray-700 shadow-[0_6px_0_rgba(50,50,50,1)] border-gray-600 opacity-50 cursor-pointer active:translate-y-1 active:shadow-none'
              }`}
            >
              {canStart && <div className="absolute inset-0 rounded-full animate-ping bg-red-500/20 pointer-events-none"></div>}
            </div>
            <span className={`text-[8px] retro-font mt-1 transition-colors ${canStart ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>
              P1 START
            </span>
          </div>
          
          <div className="flex flex-col items-center gap-1">
            <div 
              onClick={handleActionClick}
              className={`w-14 h-14 rounded-full shadow-[0_6px_0_rgba(0,100,150,1)] border-2 border-blue-400 active:translate-y-1 active:shadow-none cursor-pointer ${theme === 'royal' ? 'bg-yellow-500' : theme === 'cyber' ? 'bg-[#ff00ff]' : 'bg-blue-600'}`}
            ></div>
            <span className="text-[8px] retro-font mt-1 text-gray-500">ACTION</span>
          </div>
        </div>

        {/* Digital Credit Readout */}
        <div className={`flex flex-col items-center bg-black/50 px-6 py-2 rounded-lg border-2 shadow-inner min-w-[120px] transition-all duration-700 ${theme === 'royal' ? 'border-yellow-700/50' : theme === 'cyber' ? 'border-cyan-500/50' : 'border-gray-700/50'}`}>
          <div className="text-[7px] retro-font text-gray-500 mb-2 tracking-widest uppercase">Credits</div>
          <div className="relative">
            <div className={`retro-font text-2xl tracking-widest text-center transition-all ${styles.led}`}>
              {String(credits) === '∞' ? 'INF' : String(credits).padStart(2, '0')}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <CoinSlot onInsert={onInsertCoin || (() => {})} />
        </div>

        {/* Artist Credit Text */}
        <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 text-[5px] retro-font uppercase tracking-[0.2em] transition-all duration-1000 select-none pointer-events-none ${!isMuted ? 'text-green-500/40 animate-subtle-glow' : 'text-gray-700/30'}`}>
          Sound FX by GenAI Digital
        </div>
      </div>
      
      <style>{`
        .vip-chase {
          background: 
            radial-gradient(circle, #ffd700 30%, transparent 40%) 0 0,
            radial-gradient(circle, #ffffff 30%, transparent 40%) 12px 0 !important;
          background-size: 24px 100% !important;
        }
        .cyber-chase {
          background: 
            radial-gradient(circle, #ff00ff 30%, transparent 40%) 0 0,
            radial-gradient(circle, #00ffff 30%, transparent 40%) 12px 0 !important;
          background-size: 24px 100% !important;
        }
        @keyframes marquee-scroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee-scroll {
          animation: marquee-scroll 10s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ArcadeCabinet;
