
import React, { useState, useEffect } from 'react';
import { soundService } from '../services/soundService';
import StickmanAvatar from './StickmanAvatar';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onJoin: () => void;
  isMember: boolean;
}

const MembershipModal: React.FC<Props> = ({ isOpen, onClose, onJoin, isMember }) => {
  const [loading, setLoading] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  if (!isOpen) return null;

  const handleMouseMove = (e: React.MouseEvent) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    setTilt({ x: x * 30, y: y * -30 });
  };

  const handleJoin = () => {
    soundService.playSelect();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onJoin();
      soundService.playSuccessChime();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="relative w-full max-w-2xl bg-[#0a0a0a] border-2 border-yellow-500/30 rounded-3xl shadow-[0_0_100px_rgba(255,215,0,0.15)] overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: 3D Card Preview */}
        <div className="w-full md:w-1/2 p-10 flex flex-col items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#000] relative">
          <div 
            className="w-full aspect-[1.58/1] relative group transition-transform duration-200 preserve-3d"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setTilt({ x: 0, y: 0 })}
            style={{ 
              transform: `perspective(1000px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
            }}
          >
            {/* Card Body */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 via-yellow-600 to-yellow-900 rounded-2xl shadow-2xl p-6 flex flex-col justify-between overflow-hidden border border-yellow-200/50">
               {/* Holographic Overlay */}
               <div className="absolute inset-0 opacity-30 bg-[linear-gradient(135deg,transparent_25%,rgba(255,255,255,0.4)_50%,transparent_75%)] bg-[length:200%_200%] animate-[marquee-sweep_8s_linear_infinite] pointer-events-none"></div>
               
               <div className="flex justify-between items-start">
                  <div className="retro-font text-black text-[10px] opacity-80 uppercase">Elite_Access</div>
                  <div className="text-2xl">👑</div>
               </div>
               
               <div className="space-y-1">
                  <div className="retro-font text-black text-lg drop-shadow-md">STICKMAN ULTRA</div>
                  <div className="text-[8px] font-mono text-black/60 uppercase tracking-widest">UID: 0x88-VIP-GENAI</div>
               </div>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="text-yellow-500/50 text-[10px] retro-font uppercase animate-pulse">Holographic ID Unlocked</p>
          </div>
        </div>

        {/* Right Side: Benefits & CTA */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-between border-l border-white/5">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
               <h2 className="text-3xl font-bold text-white italic tracking-tighter">THE ELITE</h2>
               <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">×</button>
            </div>

            <div className="space-y-4">
              {[
                { title: 'Infinite Play', desc: 'No more coins required. Ever.', icon: '⚡' },
                { title: 'Custom Themes', desc: 'Unlock Cyber-Neon & Royal Gold skins.', icon: '🎨' },
                { title: 'Golden Ghost', desc: 'Elite trail effect on all stickmen.', icon: '👻' },
                { title: 'Priority Compute', desc: 'Faster AI simulations with Pro engine.', icon: '💎' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-yellow-500/30 transition-all">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <div className="text-xs font-bold text-yellow-500 uppercase retro-font">{item.title}</div>
                    <div className="text-xs text-white/40 font-vt323">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10">
            {isMember ? (
              <button onClick={onClose} className="w-full py-4 bg-white text-black font-bold retro-font text-[10px] rounded-xl hover:scale-[1.02] active:scale-95 transition-all">
                ACCESS GRANTED
              </button>
            ) : (
              <button 
                onClick={handleJoin}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold retro-font text-[10px] rounded-xl shadow-[0_10px_30px_rgba(255,215,0,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? 'INITIALIZING...' : 'UPGRADE TO ELITE'}
              </button>
            )}
            <p className="text-[8px] text-white/20 text-center mt-4 retro-font uppercase">Secure handshake via Gemini Core</p>
          </div>
        </div>
      </div>
      
      <style>{`
        .preserve-3d { transform-style: preserve-3d; }
      `}</style>
    </div>
  );
};

export default MembershipModal;
