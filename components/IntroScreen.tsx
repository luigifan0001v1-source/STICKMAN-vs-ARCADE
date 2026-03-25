
import React, { useState, useEffect } from 'react';
import StickmanAvatar from './StickmanAvatar';
import LoadingBar from './LoadingBar';
import { soundService } from '../services/soundService';

interface Props {
  onComplete: () => void;
}

const IntroScreen: React.FC<Props> = ({ onComplete }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [phase, setPhase] = useState<'interaction' | 'booting' | 'ready' | 'breaching'>('interaction');
  const [progress, setProgress] = useState(0);

  const diagnosticLines = [
    "ROM CHECK: OK",
    "VIDEO RAM: 64KB - OK",
    "GLITCH_ENGINE v2.5... ATTACHED",
    "SCANNING FOR ARCADE HARDWARE...",
    "DETECTED: VINTAGE_CABINET_01",
    "INITIALIZING NEURAL_STICKMAN_CORE...",
    "BYPASSING SECURITY LAYER 07...",
    "SYSTEM READY. WAITING FOR COMMAND."
  ];

  const startBootProcess = () => {
    setPhase('booting');
    soundService.startIntroHum();
    soundService.playTick();
    
    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < diagnosticLines.length) {
        setLogs(prev => [...prev, diagnosticLines[currentLine]]);
        setProgress(((currentLine + 1) / diagnosticLines.length) * 100);
        soundService.playIntroBeep();
        currentLine++;
      } else {
        clearInterval(interval);
        setPhase('ready');
        soundService.playSuccessChime();
      }
    }, 400);
  };

  useEffect(() => {
    if (phase === 'ready') {
      const alarmInterval = setInterval(() => {
        soundService.playBreachAlarm();
      }, 2000);
      return () => clearInterval(alarmInterval);
    }
  }, [phase]);

  const handleBreach = () => {
    setPhase('breaching');
    soundService.playPowerUp();
    soundService.playGlitch();
    soundService.stopIntroHum();
    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  return (
    <div className={`fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 font-mono overflow-hidden transition-all duration-1000 ${phase === 'breaching' ? 'scale-150 opacity-0 brightness-200' : 'scale-100 opacity-100'}`}>
      <div className="crt-effect absolute inset-0 pointer-events-none z-10 opacity-50"></div>
      <div className="scanline z-20" />

      {phase === 'interaction' ? (
        <div className="flex flex-col items-center gap-6 animate-pulse relative z-30">
          <div className="w-16 h-16 border-4 border-green-500 rounded-full flex items-center justify-center mb-4">
            <StickmanAvatar color="#00ff00" size={40} animating />
          </div>
          <button 
            onClick={startBootProcess}
            className="retro-font text-green-500 text-2xl hover:text-green-400 transition-colors uppercase tracking-[0.2em] border-2 border-green-900 px-8 py-4 bg-green-950/20"
          >
            [ Click to Boot ]
          </button>
          <p className="text-green-900 text-[10px] retro-font uppercase">Initialize Audio System</p>
        </div>
      ) : (
        <div className="max-w-2xl w-full space-y-8 relative z-30">
          <div className="border-2 border-green-900 bg-green-950/10 p-6 rounded shadow-[0_0_20px_rgba(0,50,0,0.5)]">
            <div className="flex items-center gap-4 mb-8">
              <div className="animate-pulse">
                <StickmanAvatar color="#00ff00" size={40} animating={phase === 'ready'} />
              </div>
              <div>
                <h1 className="retro-font text-green-500 text-lg md:text-xl tracking-tighter uppercase">Stickman_OS v1.0</h1>
                <p className="text-green-800 text-xs">COPYRIGHT (C) 1982-2025 STICKMAN INDUSTRIES</p>
              </div>
            </div>

            <div className="space-y-1 h-48 overflow-y-auto mb-6 custom-scrollbar">
              {logs.map((log, i) => (
                <div key={i} className="text-green-500 text-sm flex gap-2">
                  <span className="text-green-900">[{i.toString().padStart(2, '0')}]</span>
                  <span className="animate-in fade-in slide-in-from-left-2 duration-300">{log}</span>
                </div>
              ))}
              {phase === 'booting' && (
                <div className="w-2 h-4 bg-green-500 animate-pulse inline-block align-middle ml-1"></div>
              )}
            </div>

            <LoadingBar 
              label={phase === 'ready' ? "SYSTEM STABLE" : "PENETRATING HARDWARE"} 
              color="#00ff00" 
              isComplete={phase === 'ready'}
            />
          </div>

          {phase === 'ready' && (
            <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
              <button 
                onClick={handleBreach}
                className="group relative px-12 py-4 bg-transparent border-4 border-red-600 overflow-hidden transition-all active:scale-95"
              >
                <div className="absolute inset-0 bg-red-600/10 group-hover:bg-red-600/30 transition-colors"></div>
                <span className="retro-font text-red-500 group-hover:text-red-400 group-hover:glow-red text-lg relative z-10">
                  BREACH SYSTEM
                </span>
                <div className="absolute top-0 left-0 w-full h-1 bg-red-600 animate-ping opacity-20"></div>
              </button>
              <p className="text-red-900 text-[10px] retro-font animate-pulse uppercase">Warning: Unsanctioned Access Detected</p>
            </div>
          )}
        </div>
      )}

      <style>{`
        .glow-red {
          text-shadow: 0 0 10px #ff0000, 0 0 20px #ff0000;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 50, 0, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #004400;
        }
      `}</style>
    </div>
  );
};

export default IntroScreen;
