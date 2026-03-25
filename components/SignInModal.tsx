
import React, { useState } from 'react';
import { soundService } from '../services/soundService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (name: string) => void;
}

const SignInModal: React.FC<Props> = ({ isOpen, onClose, onSignIn }) => {
  const [name, setName] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError('NAME TOO SHORT');
      soundService.playCriticalError();
      return;
    }

    setError('');
    setIsAuthenticating(true);
    soundService.playSelect();
    
    // Simulate terminal authentication delay
    setTimeout(() => {
      setIsAuthenticating(false);
      onSignIn(name.trim());
      soundService.playSuccessChime();
      onClose();
    }, 1500);
  };

  const handleClose = () => {
    soundService.playSelect();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-black border-4 border-green-900 rounded-sm shadow-[0_0_30px_rgba(0,255,0,0.2)] overflow-hidden">
        <div className="scanline z-50 pointer-events-none opacity-20" />
        <div className="crt-effect absolute inset-0 pointer-events-none z-40 opacity-30"></div>
        
        <div className="bg-green-950/20 p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-green-900 pb-2">
            <h2 className="retro-font text-green-500 text-xs tracking-widest uppercase">
              > SYSTEM_AUTH_ACCESS
            </h2>
            <button 
              onClick={handleClose} 
              className="text-green-900 hover:text-green-500 retro-font text-lg transition-colors"
            >
              ×
            </button>
          </div>

          {isAuthenticating ? (
            <div className="py-12 flex flex-col items-center space-y-4">
              <div className="w-12 h-1 bg-green-500 animate-[loading-bar_1.5s_infinite]" />
              <p className="retro-font text-[10px] text-green-500 animate-pulse">
                VALIDATING_IDENTITY...
              </p>
              <p className="text-[8px] text-green-900 font-mono italic">
                ESTABLISHING SECURE HANDSHAKE
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-green-700 retro-font text-[8px] uppercase">
                  Enter Player Alias:
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 retro-font text-xs">></span>
                  <input
                    autoFocus
                    type="text"
                    maxLength={12}
                    value={name}
                    onChange={(e) => setName(e.target.value.toUpperCase())}
                    onKeyPress={() => soundService.playTick()}
                    className="w-full bg-black border-2 border-green-900 p-4 pl-10 text-green-500 retro-font text-xs focus:border-green-500 outline-none placeholder:text-green-950 uppercase tracking-widest"
                    placeholder="PLAYER_NAME"
                  />
                </div>
                {error && <p className="text-red-600 text-[8px] retro-font animate-bounce mt-2">{error}</p>}
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  onMouseEnter={() => soundService.playTick()}
                  className="w-full py-4 bg-green-900 hover:bg-green-700 text-black retro-font text-[10px] font-bold transition-all active:scale-95"
                >
                  INITIALIZE_LOGIN
                </button>
                <p className="text-[8px] text-green-900 font-mono text-center uppercase tracking-tighter">
                  Authorized Personnel Only - Unsanctioned access is punishable by glitch-injection
                </p>
              </div>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes loading-bar {
          0% { width: 0%; transform: translateX(0); }
          50% { width: 100%; transform: translateX(0); }
          100% { width: 0%; transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default SignInModal;
