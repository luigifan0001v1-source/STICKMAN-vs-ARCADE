
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import ArcadeCabinet from './components/ArcadeCabinet';
import StickmanAvatar, { StickmanStatus } from './components/StickmanAvatar';
import MusicVisualizer from './components/MusicVisualizer';
import LoadingBar from './components/LoadingBar';
import IntroScreen from './components/IntroScreen';
import StickmanCursor from './components/StickmanCursor';
import MembershipModal from './components/MembershipModal';
import SignInModal from './components/SignInModal';
import SettingsModal from './components/SettingsModal';
import ArcadeAds from './components/ArcadeAds';
import { ARCADE_GAMES, STICKMEN } from './constants';
import { ArcadeGame, SimulationResult, CabinetTheme, AppSettings } from './types';
import { simulateInteraction, QuotaError, fetchGameResources, GameResource } from './services/geminiService';
import { soundService } from './services/soundService';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

const GAME_THEMED_MESSAGES: Record<string, string[]> = {
  'PONG': ['SYNCHRONIZING PADDLE VECTORS', 'BALL BOUNCE CALCULUS', 'RETRO PIXEL RENDERER'],
  'BREAKOUT': ['CALIBRATING PADDLE IMPACT', 'GENERATING BRICK GRID', 'RAINBOW COLOR BUFFER'],
  'SPACE INVADERS': ['SHIELD DEPLOYMENT', 'ALIEN SWARM FREQUENCY', 'LASER COOLING SYSTEM'],
  'PAC-MAN': ['PELLET RECONSTRUCTION', 'GHOST PATHFINDING', 'WAKA-WAKA OVERDRIVE'],
  'FROGGER': ['SIMULATING LOG TRAFFIC', 'CALCULATING HOP TRAJECTORY', 'WATER COLLISION TEST'],
  'DONKEY KONG': ['BARREL ROLL PHYSICS', 'HAMMER HITBOX DETECTION', 'LADDER STRENGTH TEST'],
  'TETRIS': ['GRAVITY COEFFICIENT ADJ', 'NEXT BLOCK RANDOMIZER', 'LINE CLEAR VIBRATION'],
  'Q*BERT': ['PYRAMID TILE MAPPING', 'COILED SNAKE TRAJECTORY', 'ISOMETRIC FOV ADJUST'],
  'MARIO BROS 1983': ['PIPE PRESSURE VENTING', 'CRAB AND TURTLE SPAWNER', 'POW BLOCK CALIBRATION'],
};

const DEFAULT_MESSAGES = ['VIRTUAL JOYSTICK CALIBRATION', 'GLITCH INJECTION STATUS', 'CORE MEMORY DUMP'];

const BinaryStream: React.FC<{ color: string }> = ({ color }) => (
  <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none select-none font-mono text-[8px] leading-none" style={{ color }}>
    {[...Array(20)].map((_, i) => (
      <div key={i} className="whitespace-nowrap animate-slide-down motion-blur-v" style={{ animationDelay: `${i * 0.2}s`, animationDuration: `${2 + Math.random() * 4}s` }}>
        {Array(100).fill(0).map(() => (Math.random() > 0.5 ? '1' : '0')).join(' ')}
      </div>
    ))}
    <style>{`
      @keyframes slide-down {
        from { transform: translateY(-100%); }
        to { transform: translateY(100vh); }
      }
    `}</style>
  </div>
);

const App: React.FC = () => {
  const [isBooting, setIsBooting] = useState(true);
  const [selectedGame, setSelectedGame] = useState<ArcadeGame | null>(null);
  const [selectedStickman, setSelectedStickman] = useState(STICKMEN[0]);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [credits, setCredits] = useState(0);
  const [isVip, setIsVip] = useState(false);
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<{ name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isQuotaHit, setIsQuotaHit] = useState(false);
  const [hasNoKey, setHasNoKey] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gameStatus, setGameStatus] = useState<StickmanStatus>('idle');
  const [currentTrack, setCurrentTrack] = useState('NEON_PULSE');
  const [cabinetTheme, setCabinetTheme] = useState<CabinetTheme>('standard');
  const [startSequence, setStartSequence] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState<'win' | 'lose' | null>(null);
  
  const [settings, setSettings] = useState<AppSettings>({
    masterVolume: 0.5,
    showCrt: true,
    showScanlines: true,
    showHalftone: true,
    motionBlur: true,
    glitchIntensity: 1
  });

  const [gameResources, setGameResources] = useState<GameResource[]>([]);
  const [isScanningResources, setIsScanningResources] = useState(false);

  const cabinetRef = useRef<HTMLDivElement>(null);
  const loadingInterval = useRef<number | null>(null);

  const toggleMute = () => {
    soundService.playTick();
    const newVal = !isMuted;
    setIsMuted(newVal);
    soundService.setMuted(newVal);
  };

  const handleNextTrack = () => {
    const trackName = soundService.nextTrack();
    setCurrentTrack(trackName);
    soundService.playSelect();
  };

  const toggleFullscreen = () => {
    soundService.playSelect();
    if (!document.fullscreenElement && cabinetRef.current) {
      cabinetRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  const handleInsertCoin = () => {
    if (isVip) {
      soundService.playSuccessChime();
      return;
    }
    soundService.playCoin();
    setCredits(prev => Math.min(prev + 1, 99));
    if (error) setError(null);
  };

  const handleSelectApiKey = () => {
    soundService.playSelect();
    if (window.aistudio) {
      window.aistudio.openSelectKey().then(() => {
        setIsQuotaHit(false);
        setHasNoKey(false);
        setError(null);
        soundService.playPowerUp();
      }).catch((e) => {
        console.error("Key selection cancelled", e);
      });
    }
  };

  const handleGameSelect = (game: ArcadeGame) => {
    if (game.isEliteOnly && !isVip) {
      soundService.playCriticalError();
      setIsMembershipModalOpen(true);
      return;
    }
    soundService.playCabinetBoot();
    setSelectedGame(game);
    setGameStatus('idle');
    setGameResources([]);
    soundService.startMusic();
  };

  const handleStickmanSelect = (s: typeof STICKMEN[0]) => {
    soundService.playBlip();
    setSelectedStickman(s);
    setGameStatus('idle');
  };

  const handleReset = () => {
    soundService.playVanish();
    setSelectedGame(null);
    setSimulation(null);
    setError(null);
    setGameStatus('idle');
    setLoading(false);
    setGameResources([]);
    setStartSequence(null);
    setShowSplash(null);
    if (loadingInterval.current) clearInterval(loadingInterval.current);
  };

  const handleJoinVip = () => {
    setIsVip(true);
    setCabinetTheme('royal');
    setIsMembershipModalOpen(false);
  };

  const handleThemeChange = (theme: CabinetTheme) => {
    if (!isVip && theme !== 'standard') {
      soundService.playCriticalError();
      setIsMembershipModalOpen(true);
      return;
    }
    soundService.playSelect();
    setCabinetTheme(theme);
  };

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleScanYouTube = async () => {
    if (!selectedGame || isScanningResources) return;
    setIsScanningResources(true);
    soundService.playDataBurst();
    try {
      const resources = await fetchGameResources(selectedGame.name);
      setGameResources(resources);
      if (resources.length > 0) soundService.playSuccessChime();
      else soundService.playCriticalError();
    } catch (err) {
      soundService.playCriticalError();
    } finally {
      setIsScanningResources(false);
    }
  };

  const handleSimulate = async () => {
    if (!selectedGame || (!isVip && credits <= 0) || loading) {
      if (!isVip && credits <= 0) soundService.playExplosion();
      return;
    }
    setShowSplash(null);
    soundService.playStartSequence();
    setStartSequence("READY?");
    setTimeout(() => setStartSequence("FIGHT!"), 800);
    setTimeout(() => {
      setStartSequence(null);
      executeSimulation();
    }, 1500);
  };

  const executeSimulation = async () => {
    if (!selectedGame) return;
    if (!isVip) setCredits(prev => prev - 1);
    setLoading(true);
    setGameStatus('active');
    setSimulation(null);
    setError(null);
    soundService.playPowerUp();
    loadingInterval.current = window.setInterval(() => {
      soundService.playGlitch();
    }, 1500);
    try {
      const result = await simulateInteraction(selectedGame.name, selectedStickman.name, isVip);
      if (loadingInterval.current) clearInterval(loadingInterval.current);
      
      const stickmanWins = result.winner.toLowerCase().includes(selectedStickman.name.toLowerCase()) || 
                          result.winner.toLowerCase().includes("stickman") ||
                          result.winner.toLowerCase().includes("win");

      // Dramatic pause before result splash
      setTimeout(() => {
        setShowSplash(stickmanWins ? 'win' : 'lose');
        setGameStatus(stickmanWins ? 'win' : 'lose');
        
        if (stickmanWins) {
          soundService.playVictory();
        } else {
          soundService.playGameOver();
        }

        // Final transition to results screen
        setTimeout(() => {
          setSimulation(result);
          setLoading(false);
        }, 2200);
      }, 500);

    } catch (err: any) {
      setGameStatus('idle');
      setLoading(false);
      if (loadingInterval.current) clearInterval(loadingInterval.current);
      soundService.playCriticalError();
      if (err?.message?.includes("Requested entity was not found")) {
        setIsQuotaHit(true);
        setError("API KEY INVALID OR EXPIRED. PLEASE RESELECT.");
        return;
      }
      if (err instanceof QuotaError || err?.message?.includes("429")) {
        setIsQuotaHit(true);
        setError("AI ENGINE OVERLOAD: QUOTA EXCEEDED (429)");
      } else {
        setError("SYSTEM FAILURE: CONNECTION INTERRUPTED");
      }
    }
  };

  const handleAdAction = (adTitle: string) => {
    if (adTitle === 'VIP LOUNGE') {
      setIsMembershipModalOpen(true);
    } else {
      soundService.playSuccessChime();
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    const checkApiKey = async () => {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) setHasNoKey(true);
      }
    };
    checkApiKey();
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      if (loadingInterval.current) clearInterval(loadingInterval.current);
      soundService.stopMusic();
    };
  }, []);

  const canStart = !!selectedGame && (isVip || credits > 0) && !loading && !simulation && !error && !startSequence && !hasNoKey;
  
  const loadingStages = useMemo(() => {
    if (!selectedGame) return DEFAULT_MESSAGES;
    const base = GAME_THEMED_MESSAGES[selectedGame.name] || DEFAULT_MESSAGES;
    return [
      ...base,
      'GENERATING CHAOS MATRIX',
      'SIMULATING HITBOX COLLISIONS',
      'STICKMAN NEURAL SYNC'
    ].slice(0, 4);
  }, [selectedGame]);

  const avatarColor = isVip ? '#ffd700' : selectedStickman.color;

  return (
    <div className="min-h-screen relative z-10">
      <StickmanCursor />
      {settings.showHalftone && <div className="halftone-overlay z-[999]"></div>}
      <MembershipModal isOpen={isMembershipModalOpen} onClose={() => { soundService.playSelect(); setIsMembershipModalOpen(false); }} onJoin={handleJoinVip} isMember={isVip} />
      <SignInModal isOpen={isSignInModalOpen} onClose={() => { soundService.playSelect(); setIsSignInModalOpen(false); }} onSignIn={(name) => { setUserProfile({ name }); if (!isVip) setCredits(prev => prev + 1); }} />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => { soundService.playSelect(); setIsSettingsModalOpen(false); }} settings={settings} onUpdateSettings={handleUpdateSettings} />
      {isBooting && <IntroScreen onComplete={() => setIsBooting(false)} />}
      {hasNoKey && !isBooting && (
        <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-500">
           <div className="w-full max-w-lg border-4 border-yellow-600 p-8 bg-black shadow-[0_0_50px_rgba(234,179,8,0.2)] text-center space-y-8 relative overflow-hidden">
              <div className="scanline z-50 pointer-events-none opacity-20" /><div className="absolute top-0 left-0 w-full h-1 bg-yellow-600 animate-pulse"></div>
              <h3 className="retro-font text-yellow-500 text-xl tracking-widest uppercase">Service Access Required</h3>
              <div className="space-y-4 text-gray-400 font-vt323 text-lg leading-snug">
                <p>To power this arcade experience using Gemini AI, you must select an active API Key from your project.</p>
                <p className="text-yellow-700/60 text-sm italic">Note: High-quality simulations require a paid GCP project key.</p>
              </div>
              <div className="flex flex-col gap-4">
                <button onClick={handleSelectApiKey} className="w-full py-4 bg-yellow-600 text-black retro-font text-[10px] font-bold hover:bg-yellow-500 transition-all active:scale-95 shadow-[4px_4px_0_#ca8a04]">INITIALIZE KEY SELECTION</button>
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors underline text-xs font-vt323">View Billing Documentation</a>
              </div>
              <div className="pt-6 border-t border-yellow-900/30"><p className="text-[10px] text-yellow-900 retro-font uppercase animate-pulse">Waiting for secure handshake...</p></div>
           </div>
        </div>
      )}
      <div className={`min-h-screen p-4 md:p-8 flex flex-col items-center overflow-x-hidden transition-all duration-1000 ${isBooting ? 'blur-xl opacity-0 scale-95' : 'blur-0 opacity-100 scale-100'}`}>
        <header className="mb-8 text-center relative w-full max-w-4xl">
          <div className="absolute right-0 top-0 flex flex-col items-end gap-1">
            <div className="flex gap-2">
              <button onClick={() => { soundService.playSelect(); setIsSignInModalOpen(true); }} className={`p-1 px-3 mb-2 retro-font text-[8px] flex items-center gap-2 border-2 transition-all active:scale-95 ${userProfile ? 'bg-green-600 text-black border-black shadow-[4px_4px_0px_#000]' : 'bg-transparent text-black border-black/20 hover:border-black shadow-[4px_4px_0px_rgba(0,0,0,0.1)] hover:shadow-[4px_4px_0px_#000]'}`}>{userProfile ? `ID: ${userProfile.name}` : '👤 IDENTIFY'}</button>
              <button onClick={() => { soundService.playSelect(); setIsMembershipModalOpen(true); }} className={`p-1 px-3 mb-2 retro-font text-[8px] flex items-center gap-2 border-2 transition-all active:scale-95 ${isVip ? 'bg-black text-yellow-400 border-black shadow-[4px_4px_0px_#eab308]' : 'bg-transparent text-yellow-700 border-yellow-700/20 hover:border-yellow-700 shadow-[4px_4px_0px_rgba(0,0,0,0.05)] hover:shadow-[4px_4px_0px_#ca8a04]'}`}>{isVip ? '👑 ELITE' : '✨ VIP'}</button>
            </div>
            <div className="flex items-center gap-3">
               {!isMuted && <button onClick={handleNextTrack} className="text-[8px] retro-font text-black/60 hover:text-black transition-colors uppercase animate-pulse">[{currentTrack}] ⏭</button>}
               <button onClick={toggleMute} className="p-1 text-black/40 hover:text-black retro-font text-[8px] flex items-center gap-2 transition-colors active:scale-95">{isMuted ? '🔇 MUTED' : '🔊 AUDIO'}</button>
               <button onClick={() => { soundService.playSelect(); setIsSettingsModalOpen(true); }} className="p-1 text-black/40 hover:text-black retro-font text-[8px] flex items-center gap-2 transition-colors active:scale-95">[⚙ SETTINGS]</button>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={toggleFullscreen} className="p-1 text-black/40 hover:text-black retro-font text-[8px] flex items-center gap-2 transition-colors active:scale-95">{isFullscreen ? '[🗗 EXIT]' : '[⛶ FULL]'}</button>
              <button onClick={handleSelectApiKey} className={`text-[8px] retro-font active:scale-95 underline transition-colors ${isQuotaHit ? 'text-red-500 animate-pulse' : 'text-blue-800 hover:text-blue-600'}`}>[KEY]</button>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className={`inline-block px-4 py-1 bg-black retro-font text-[10px] mb-4 transform -rotate-1 skew-x-12 transition-colors ${isQuotaHit ? 'text-red-500 shadow-[6px_6px_0px_0px_#991b1b]' : 'text-yellow-400 shadow-[6px_6px_0px_0px_#ca8a04]'}`}>{isQuotaHit ? 'SYSTEM OVERLOAD' : isVip ? 'ELITE VIP ACCESS' : 'FREE PLAY FOR AI'}</div>
            <h2 className="text-5xl md:text-7xl font-bold italic tracking-tighter mb-2 transform hover:scale-105 transition-transform duration-500 text-black drop-shadow-[8px_8px_0_rgba(0,0,0,0.1)]">STICKMAN vs ARCADE</h2>
            <p className="text-xl text-black/60 uppercase tracking-widest font-vt323 font-bold">Hacking retro history frame by frame</p>
          </div>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-7xl">
          <div className={`lg:col-span-1 space-y-6 transition-all duration-500 ${isFullscreen ? 'opacity-0 pointer-events-none -translate-x-full' : 'opacity-100'}`}>
            <section className="bg-white/40 p-6 border-4 border-black rounded-lg relative overflow-hidden transition-colors shadow-[12px_12px_0px_#000]">
              <h3 className="retro-font text-lg mb-6 flex items-center justify-between text-black"><span>PLAYER_SELECT</span></h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-4">
                {STICKMEN.map(s => {
                  const isSelected = selectedStickman.name === s.name;
                  return (
                    <button key={s.name} onClick={() => handleStickmanSelect(s)} className={`flex flex-col items-center p-4 rounded-lg border-4 transition-all relative group overflow-hidden ${isSelected ? `border-black bg-white scale-105 z-10 shadow-[6px_6px_0px_#000]` : 'border-black/10 hover:border-black/30'}`}>
                      <div className={`transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}><StickmanAvatar color={isSelected ? (isVip ? '#ffd700' : s.color) : '#000'} status={isSelected ? 'active' : 'idle'} isVip={isVip && isSelected} /></div>
                      <span className={`mt-2 text-sm uppercase tracking-widest font-vt323 font-bold transition-all ${isSelected ? 'text-black' : 'text-black/40'}`}>{s.name}</span>
                    </button>
                  );
                })}
              </div>
            </section>
            
            {/* Sidebar Ad Unit */}
            <ArcadeAds onAction={handleAdAction} className="shadow-[12px_12px_0px_#000]" />

            <section className="bg-white/20 p-6 border-4 border-black rounded-lg transition-colors shadow-[12px_12px_0px_#000]">
              <h3 className="retro-font text-lg mb-6 uppercase text-black">Themes</h3>
              <div className="grid grid-cols-3 gap-2">
                 {['standard', 'cyber', 'royal'].map((t) => (
                   <button key={t} onClick={() => handleThemeChange(t as CabinetTheme)} className={`p-2 border-2 retro-font text-[6px] transition-all uppercase ${cabinetTheme === t ? 'bg-black text-white border-black' : 'border-black/20 hover:border-black'}`}>{t} {(!isVip && t !== 'standard') ? '🔒' : ''}</button>
                 ))}
              </div>
            </section>
          </div>
          <div className={`lg:col-span-2 space-y-8 transition-all duration-500 ${isFullscreen ? 'lg:col-span-3' : ''} ${showSplash ? 'cabinet-shake' : ''}`} ref={cabinetRef}>
            <ArcadeCabinet title={selectedGame ? `${selectedGame.name}` : "CHOOSE YOUR FATE"} onInsertCoin={handleInsertCoin} onToggleFullscreen={toggleFullscreen} onStart={handleSimulate} credits={isVip ? '∞' : credits} isFullscreen={isFullscreen} canStart={canStart} isVip={isVip} isMuted={isMuted} theme={cabinetTheme}>
              {!selectedGame ? (
                <div className="h-full w-full flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-700 bg-yellow-400 backdrop-blur-sm rounded-lg border-4 border-black p-8 relative overflow-hidden group/menu shadow-[inset_0_0_40px_rgba(0,0,0,0.1)]">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 relative z-10">
                    {ARCADE_GAMES.map(game => (
                      <button key={game.id} onClick={() => handleGameSelect(game)} className={`group flex flex-col items-center p-4 bg-white border-4 border-black rounded-xl transition-all hover:-translate-y-2 relative overflow-hidden active:scale-95 shadow-[8px_8px_0px_#000] ${game.isEliteOnly && !isVip ? 'grayscale opacity-60' : ''}`}>
                        <span className="text-4xl mb-2 transition-transform group-hover:scale-110">{game.icon}</span>
                        <span className="retro-font text-[8px] z-10 transition-colors text-black font-bold">{game.name}</span>
                      </button>
                    ))}
                  </div>
                  
                  {/* Internal Ad Unit when idle */}
                  <ArcadeAds onAction={handleAdAction} className="w-full max-w-sm mt-4 border-black bg-white shadow-[8px_8px_0px_#000]" />
                </div>
              ) : (
                <div className={`h-full flex flex-col space-y-4 ${loading && !showSplash ? 'motion-blur-v' : ''}`}>
                  <div className="flex justify-between items-start bg-black/80 p-2 rounded border border-white/10">
                     <div className="flex items-center gap-3"><button onClick={handleReset} className="retro-font text-[8px] bg-red-600/20 text-red-400 px-3 py-1 hover:bg-red-600 hover:text-white transition-all border border-red-900">&lt; MENU</button></div>
                     <div className="text-right flex items-center gap-2">
                        <div className="flex flex-col items-end">{userProfile && <span className={`text-[8px] retro-font animate-pulse ${isVip ? 'text-yellow-400' : 'text-green-500'}`}>USER: {userProfile.name}</span>}<span className={`text-xs font-bold uppercase ${isVip ? 'text-yellow-500' : ''}`} style={{ color: isVip ? '#ffd700' : selectedStickman.color }}>{selectedStickman.name}</span></div>
                        <StickmanAvatar color={avatarColor} size={16} status={gameStatus} isVip={isVip} />
                     </div>
                  </div>
                  <div className={`flex-grow flex flex-col items-center justify-center bg-black/90 rounded-lg p-6 border border-white/5 relative overflow-hidden ${settings.showCrt ? 'crt-effect' : ''}`}>
                     {settings.showScanlines && <div className="scanline z-40 pointer-events-none" />}
                     
                     {/* Dynamic Result Splash Overlay */}
                     {showSplash && !simulation && (
                       <div className="absolute inset-0 z-[200] flex flex-col items-center justify-center pointer-events-none bg-black/40 backdrop-blur-[2px]">
                          <div className={`absolute inset-0 animate-flash-short ${showSplash === 'win' ? 'bg-yellow-400/20' : 'bg-red-600/20'}`}></div>
                          
                          <div className={`relative mb-8 p-8 rounded-full transition-all duration-1000 ${showSplash === 'win' ? 'animate-victory-aura' : 'animate-defeat-void'}`}>
                             <StickmanAvatar color={avatarColor} size={120} status={showSplash} isVip={isVip} />
                          </div>

                          <div className={`retro-font text-8xl italic drop-shadow-[10px_10px_0_#000] animate-splash-scale ${showSplash === 'win' ? 'text-yellow-400' : 'text-red-600'}`}>
                            {showSplash === 'win' ? 'K.O.!' : 'DEFEAT'}
                          </div>
                          
                          {showSplash === 'win' && (
                             <div className="absolute inset-0 overflow-hidden">
                               {[...Array(24)].map((_, i) => (
                                 <div key={i} className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-particle-explode" style={{ left: '50%', top: '50%', '--angle': `${i * 15}deg` } as any} />
                               ))}
                             </div>
                          )}
                       </div>
                     )}

                     {startSequence && <div className="absolute inset-0 z-[100] flex items-center justify-center bg-white/20 backdrop-blur-sm animate-in fade-in zoom-in duration-300"><div className="retro-font text-5xl md:text-8xl text-yellow-400 italic drop-shadowArrow-[0_0_20px_#000] animate-bounce">{startSequence}</div><div className="absolute inset-0 bg-white animate-flash opacity-0 pointer-events-none"></div></div>}
                     
                     {loading && !showSplash ? (
                       <div className="w-full h-full flex flex-col items-center justify-center animate-in fade-in duration-300 z-50 overflow-hidden relative">
                          <BinaryStream color={avatarColor} />
                          <div className="flex items-center gap-8 mb-8">
                             <StickmanAvatar color={avatarColor} size={64} status="active" isVip={isVip} />
                             <div className="text-4xl animate-pulse retro-font mx-2 text-white">VS</div>
                             <div className="text-8xl">{selectedGame.icon}</div>
                          </div>
                          <div className="w-full max-w-sm space-y-4">
                             {loadingStages.map((stage, idx) => (
                               <LoadingBar 
                                 key={idx} 
                                 label={stage} 
                                 duration={3000 + idx * 1000} 
                                 color={avatarColor} 
                                 icon={idx === 0 ? "⚡" : idx === 1 ? "🧩" : idx === 2 ? "☣️" : "🧠"}
                               />
                             ))}
                          </div>
                       </div>
                     ) : error ? (
                       <div className="text-center space-y-6 w-full max-w-md animate-in fade-in zoom-in-95"><div className="text-red-600 retro-font text-2xl animate-pulse glow-red">[ ERROR ]</div><div className="bg-red-900/10 border border-red-900/50 p-6 space-y-4 rounded"><p className="text-red-400 font-vt323 text-xl leading-tight">{error}</p>{isQuotaHit && <div className="space-y-4 pt-4 border-t border-red-900/30"><p className="text-gray-500 text-xs font-vt323 leading-tight">Free tier quota reached. Use a paid project key to bypass the block.</p><div className="flex flex-col gap-2"><button onClick={handleSelectApiKey} className="w-full py-3 bg-blue-600 text-white retro-font text-[8px] hover:bg-blue-500 active:scale-95 transition-all shadow-[4px_4px_0_#1e3a8a]">RESELECT API KEY</button><a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors underline text-[10px] font-vt323">Billing Documentation</a></div></div>}</div><button onClick={handleReset} className="px-6 py-3 bg-gray-700 text-white retro-font text-[10px] active:scale-95">BACK TO MENU</button></div>
                     ) : simulation ? (
                       <div className="w-full h-full flex flex-col items-center animate-in zoom-in-95 duration-500">
                          <div className={`w-full py-4 mb-4 border-y-4 text-center transform -skew-x-12 shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-colors ${gameStatus === 'win' ? 'bg-green-600 border-green-400' : 'bg-red-700 border-red-500'}`}>
                             <h3 className="retro-font text-2xl text-white italic drop-shadow-[2px_2px_0_#000] animate-pulse">
                               {gameStatus === 'win' ? '★ VICTORY ★' : '✖ GAME OVER ✖'}
                             </h3>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl items-center mb-4">
                             <div className="flex flex-col items-center justify-center space-y-4 p-4 border-2 border-white/10 bg-white/5 rounded-xl">
                                <div className="flex items-center gap-6 relative">
                                   <div className={`absolute -inset-8 rounded-full blur-2xl opacity-40 animate-pulse ${gameStatus === 'win' ? 'bg-green-400 shadow-[0_0_30px_#22c55e]' : 'bg-red-600 shadow-[0_0_30px_#ef4444]'}`}></div>
                                   <StickmanAvatar color={avatarColor} size={64} status={gameStatus} isVip={isVip} />
                                   <div className="text-3xl font-bold text-white">VS</div>
                                   <div className="text-7xl drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{selectedGame.icon}</div>
                                </div>
                                <div className="text-center pt-2">
                                   <div className="text-[10px] retro-font text-gray-500 uppercase mb-1">Combat Result:</div>
                                   <div className={`retro-font text-sm uppercase ${gameStatus === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                                      {simulation.winner}
                                   </div>
                                </div>
                             </div>

                             <div className="space-y-4">
                                <div className="bg-black/40 p-4 border-l-4 border-white/20 rounded-r">
                                   <p className="font-vt323 text-lg italic text-gray-300 leading-tight">
                                      "{simulation.scenario}"
                                   </p>
                                </div>
                                <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                                   {simulation.events.map((e, i) => (
                                     <div key={i} className="flex items-start gap-2 animate-in slide-in-from-left-4" style={{ animationDelay: `${i * 0.2}s` }}>
                                        <span className="text-yellow-500 retro-font text-[8px] mt-1">▶</span>
                                        <p className="font-vt323 text-sm text-gray-400">{e}</p>
                                     </div>
                                   ))}
                                </div>
                             </div>
                          </div>

                          {/* Result Banner Ad */}
                          <ArcadeAds variant="banner" onAction={handleAdAction} className="w-full mb-4" />

                          <div className="mt-auto w-full pt-4 flex justify-between items-end">
                             <div className="flex flex-col">
                                <span className="text-[7px] retro-font text-gray-600 uppercase">Chaos Score:</span>
                                <span className="text-xl font-bold text-white font-mono">{gameStatus === 'win' ? '9,999' : '1,240'} PTS</span>
                             </div>
                             <div className="flex gap-4">
                                <button onClick={handleSimulate} className="px-6 py-2 bg-white text-black retro-font text-[8px] hover:scale-105 transition-all">RETRY</button>
                                <button onClick={handleReset} className="px-6 py-2 border border-white/20 text-white/60 hover:text-white retro-font text-[8px] transition-all">MENU</button>
                             </div>
                          </div>
                       </div>
                     ) : (
                       <div className="text-center space-y-8 py-10 w-full max-w-xl"><p className="text-gray-300 text-lg mx-auto font-vt323">Inject {selectedStickman.name} into {selectedGame.name}?</p><div className="mt-4 p-4 border border-white/5 bg-black/40 rounded-lg"><div className="flex items-center justify-between mb-2"><span className="retro-font text-[7px] text-red-500 animate-pulse">HISTORICAL ARCHIVES</span><button onClick={handleScanYouTube} className="text-[7px] retro-font px-2 py-1 bg-red-900/40 text-red-400 border border-red-900">SCAN</button></div>{gameResources.map((res, i) => (<a key={i} href={res.uri} target="_blank" className="block text-[10px] font-vt323 text-gray-500 hover:text-white truncate uppercase">> {res.title}</a>))}</div><div className="flex flex-col items-center gap-4 pt-4"><button onClick={handleSimulate} className={`px-10 py-5 retro-font text-sm transition-all ${isVip || credits > 0 ? 'bg-green-500 text-black shadow-[4px_4px_0_#065f46]' : 'bg-gray-700 text-gray-500'}`}>{isVip ? 'START BATTLE' : 'START (1 CREDIT)'}</button></div></div>
                     )}
                  </div>
                </div>
              )}
            </ArcadeCabinet>
          </div>
        </div>
        <footer className="mt-16 py-8 border-t border-black/10 w-full text-center text-black/40 text-sm font-vt323 uppercase"><p className="font-bold">&copy; 1982-2025 STICKMAN INDUSTRIES // GEMINI CORE AI</p></footer>
      </div>
      <style>{`
        @keyframes flash-short {
          0% { opacity: 0; }
          10% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-flash-short {
          animation: flash-short 0.4s ease-out forwards;
        }

        @keyframes splash-scale {
          0% { transform: scale(0.5); opacity: 0; filter: blur(10px); }
          15% { transform: scale(1.3); opacity: 1; filter: blur(0); }
          25% { transform: scale(1); }
          85% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(2); opacity: 0; filter: blur(20px); }
        }
        .animate-splash-scale {
          animation: splash-scale 2.0s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        @keyframes victory-aura {
          0% { transform: scale(0.8) rotate(0); box-shadow: 0 0 0 #facc15; }
          50% { transform: scale(1.1) rotate(180deg); box-shadow: 0 0 50px #facc15; }
          100% { transform: scale(1) rotate(360deg); box-shadow: 0 0 20px #facc15; }
        }
        .animate-victory-aura {
          animation: victory-aura 2s ease-in-out infinite;
          background: radial-gradient(circle, rgba(250, 204, 21, 0.2) 0%, transparent 70%);
        }

        @keyframes defeat-void {
          0% { filter: grayscale(1) brightness(1); transform: scale(1); }
          20% { filter: grayscale(1) brightness(3); transform: scale(1.1) skewX(10deg); }
          40% { filter: grayscale(1) brightness(0.5); transform: scale(0.9) skewX(-10deg); }
          100% { filter: grayscale(1) brightness(0); transform: scale(0.5); }
        }
        .animate-defeat-void {
          animation: defeat-void 2s ease-in forwards;
          background: radial-gradient(circle, rgba(255, 0, 0, 0.1) 0%, transparent 70%);
        }

        @keyframes cabinet-shake {
          0%, 100% { transform: translate(0, 0); }
          10%, 30%, 50%, 70%, 90% { transform: translate(-4px, -2px); }
          20%, 40%, 60%, 80% { transform: translate(4px, 2px); }
        }
        .cabinet-shake {
          animation: cabinet-shake 0.4s linear infinite;
        }

        @keyframes particle-explode {
          0% { transform: translate(0,0) scale(1); opacity: 1; }
          100% { 
            transform: translate(calc(cos(var(--angle)) * 250px), calc(sin(var(--angle)) * 250px)) scale(0); 
            opacity: 0; 
          }
        }
        .animate-particle-explode {
          animation: particle-explode 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
