
import React from 'react';
import { soundService } from '../services/soundService';
import { AppSettings } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
}

const SettingsModal: React.FC<Props> = ({ isOpen, onClose, settings, onUpdateSettings }) => {
  if (!isOpen) return null;

  const handleToggle = (key: keyof AppSettings) => {
    soundService.playTick();
    onUpdateSettings({ [key]: !settings[key as keyof AppSettings] });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onUpdateSettings({ masterVolume: val });
    soundService.setVolume(val);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0000AA] border-4 border-gray-400 shadow-[10px_10px_0_rgba(0,0,0,0.5)] overflow-hidden font-mono">
        {/* BIOS Header */}
        <div className="bg-gray-400 text-black px-4 py-1 flex justify-between items-center">
          <span className="retro-font text-[8px] font-bold">GEMINI ARCADE - CMOS SETUP UTILITY</span>
          <button onClick={onClose} className="hover:bg-red-500 hover:text-white px-2">X</button>
        </div>

        <div className="p-6 space-y-8 text-white">
          <div className="border-b border-white/20 pb-2">
            <h2 className="text-xl font-bold uppercase tracking-widest text-yellow-400 italic underline">Service Menu v2.0</h2>
          </div>

          <div className="space-y-6">
            {/* Audio Settings */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span>MASTER_VOLUME</span>
                <span className="text-yellow-400">{Math.round(settings.masterVolume * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="1" step="0.01" 
                value={settings.masterVolume} 
                onChange={handleVolumeChange}
                className="w-full accent-yellow-400 h-2 bg-black/40 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Visual Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => handleToggle('showCrt')}
                className={`p-3 border-2 flex justify-between items-center text-xs uppercase transition-colors ${settings.showCrt ? 'border-yellow-400 bg-yellow-400/20' : 'border-white/20 hover:border-white/40'}`}
              >
                <span>CRT_FILTER</span>
                <span>{settings.showCrt ? '[ON]' : '[OFF]'}</span>
              </button>

              <button 
                onClick={() => handleToggle('showScanlines')}
                className={`p-3 border-2 flex justify-between items-center text-xs uppercase transition-colors ${settings.showScanlines ? 'border-yellow-400 bg-yellow-400/20' : 'border-white/20 hover:border-white/40'}`}
              >
                <span>SCANLINES</span>
                <span>{settings.showScanlines ? '[ON]' : '[OFF]'}</span>
              </button>

              <button 
                onClick={() => handleToggle('showHalftone')}
                className={`p-3 border-2 flex justify-between items-center text-xs uppercase transition-colors ${settings.showHalftone ? 'border-yellow-400 bg-yellow-400/20' : 'border-white/20 hover:border-white/40'}`}
              >
                <span>HALFTONE</span>
                <span>{settings.showHalftone ? '[ON]' : '[OFF]'}</span>
              </button>

              <button 
                onClick={() => handleToggle('motionBlur')}
                className={`p-3 border-2 flex justify-between items-center text-xs uppercase transition-colors ${settings.motionBlur ? 'border-yellow-400 bg-yellow-400/20' : 'border-white/20 hover:border-white/40'}`}
              >
                <span>MOTION_BLUR</span>
                <span>{settings.motionBlur ? '[ON]' : '[OFF]'}</span>
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span>GLITCH_INTENSITY</span>
                <span className="text-yellow-400">{settings.glitchIntensity}x</span>
              </div>
              <input 
                type="range" 
                min="0" max="5" step="1" 
                value={settings.glitchIntensity} 
                onChange={(e) => onUpdateSettings({ glitchIntensity: parseInt(e.target.value) })}
                className="w-full accent-yellow-400 h-2 bg-black/40 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* BIOS Footer navigation style */}
          <div className="pt-6 border-t border-white/20 flex flex-wrap gap-4 text-[10px] text-gray-300">
            <span className="bg-white text-black px-1">F10</span> SAVE & EXIT
            <span className="bg-white text-black px-1">ESC</span> ABANDON CHANGES
            <span className="bg-white text-black px-1">DEL</span> FACTORY RESET
          </div>
        </div>

        <div className="bg-gray-400 text-black px-4 py-1 text-[8px] font-bold text-center">
          (C) 1982-2025 GEMINI ARCHITECTURES INC.
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
