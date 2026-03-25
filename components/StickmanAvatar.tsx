
import React from 'react';

export type StickmanStatus = 'idle' | 'active' | 'win' | 'lose';

interface Props {
  color: string;
  size?: number;
  className?: string;
  animating?: boolean;
  status?: StickmanStatus;
  isVip?: boolean;
}

const StickmanAvatar: React.FC<Props> = ({ 
  color, 
  size = 40, 
  className = "", 
  animating = false,
  status,
  isVip = false
}) => {
  const activeStatus = status || (animating ? 'active' : 'idle');

  const renderStickman = (opacity: number = 1, filter?: string, offset: string = "0", isGhost: boolean = false) => (
    <svg 
      width={size} 
      height={size * 1.5} 
      viewBox="0 0 50 75" 
      className={`stickman-svg overflow-visible status-${activeStatus} absolute inset-0 transition-opacity duration-300 ${isGhost ? 'pointer-events-none' : ''}`}
      style={{ 
        opacity, 
        filter: filter ? `${filter} drop-shadow(0 0 2px ${color})` : `drop-shadow(0 0 2px ${color})`,
        transform: `translate(${offset})`,
        pointerEvents: 'none'
      }}
    >
      <circle 
        cx="25" cy="15" r="10" 
        stroke={color} strokeWidth="3" fill="none" 
        className="head-node"
      />
      <line x1="25" y1="25" x2="25" y2="50" stroke={color} strokeWidth="3" className="spine-node" />
      <line x1="25" y1="30" x2="10" y2="45" stroke={color} strokeWidth="3" className="arm-l" />
      <line x1="25" y1="30" x2="40" y2="45" stroke={color} strokeWidth="3" className="arm-r" />
      <line x1="25" y1="50" x2="10" y2="70" stroke={color} strokeWidth="3" className="leg-l" />
      <line x1="25" y1="50" x2="40" y2="70" stroke={color} strokeWidth="3" className="leg-r" />
    </svg>
  );

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size * 1.5 }}>
      {/* Motion Trail (Ghosts) */}
      {(activeStatus === 'active' || activeStatus === 'win') && (
        <>
          {renderStickman(isVip ? 0.2 : 0.1, "url(#blur-horizontal-lg)", "-25px, 0", true)}
          {renderStickman(isVip ? 0.3 : 0.2, "url(#blur-horizontal-md)", "-12px, 0", true)}
          {renderStickman(isVip ? 0.3 : 0.2, "url(#blur-horizontal-md)", "12px, 0", true)}
          {renderStickman(isVip ? 0.2 : 0.1, "url(#blur-horizontal-lg)", "25px, 0", true)}
        </>
      )}

      {/* WIN STATE: Confetti/Sparkles */}
      {activeStatus === 'win' && (
        <div className="absolute inset-[-20px] pointer-events-none overflow-visible">
          {[...Array(8)].map((_, i) => (
            <div 
              key={i} 
              className="absolute w-1 h-1 bg-yellow-400 animate-confetti-float"
              style={{ 
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                backgroundColor: i % 2 === 0 ? color : '#ffd700'
              }}
            />
          ))}
        </div>
      )}

      {/* Main Stickman */}
      <svg 
        width={size} 
        height={size * 1.5} 
        viewBox="0 0 50 75" 
        className={`stickman-svg overflow-visible status-${activeStatus} relative z-10 ${isVip ? 'vip-glow' : ''}`}
      >
        {activeStatus === 'win' && (
          <g className="sparkles">
            <circle cx="10" cy="10" r="2" fill={isVip ? "#ffd700" : "#fff"} className="sparkle s1" />
            <circle cx="40" cy="5" r="1.5" fill={isVip ? "#ffd700" : "#fff"} className="sparkle s2" />
            <circle cx="45" cy="25" r="2" fill={isVip ? "#ffd700" : "#fff"} className="sparkle s3" />
            <path d="M25,0 L27,5 L32,5 L28,8 L30,13 L25,10 L20,13 L22,8 L18,5 L23,5 Z" fill={isVip ? "#ffd700" : "#fff"} className="sparkle s1" transform="translate(0,-15) scale(0.5)" />
          </g>
        )}

        <circle 
          cx="25" cy="15" r="10" 
          stroke={color} strokeWidth="3" fill="none" 
          className="head-node"
        />
        <line x1="25" y1="25" x2="25" y2="50" stroke={color} strokeWidth="3" className="spine-node" />
        <line x1="25" y1="30" x2="10" y2="45" stroke={color} strokeWidth="3" className="arm-l" />
        <line x1="25" y1="30" x2="40" y2="45" stroke={color} strokeWidth="3" className="arm-r" />
        <line x1="25" y1="50" x2="10" y2="70" stroke={color} strokeWidth="3" className="leg-l" />
        <line x1="25" y1="50" x2="40" y2="70" stroke={color} strokeWidth="3" className="leg-r" />
      </svg>

      <style>{`
        .stickman-svg {
          filter: drop-shadow(0 0 2px ${color});
          transition: all 0.5s ease;
          will-change: transform, filter;
        }

        .vip-glow {
          filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 15px rgba(255, 255, 255, 0.4)) !important;
        }

        .head-node { transform-origin: 25px 25px; }
        .arm-l, .arm-r { transform-origin: 25px 30px; }
        .leg-l, .leg-r { transform-origin: 25px 50px; }

        /* WIN */
        .status-win { 
          animation: win-jump 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) infinite; 
          filter: drop-shadow(0 0 8px ${color}) drop-shadow(0 0 12px ${isVip ? '#ffd700' : 'white'});
        }
        .status-win .arm-l { animation: arms-victory 0.3s ease-in-out infinite alternate; }
        .status-win .arm-r { animation: arms-victory 0.3s ease-in-out infinite alternate-reverse; }
        
        /* LOSE */
        .status-lose { animation: lose-glitch 0.15s infinite; opacity: 0.8; }
        .status-lose .head-node { transform: translateY(8px) rotate(20deg); stroke: #444; }
        .status-lose .arm-l, .status-lose .arm-r, .status-lose .leg-l, .status-lose .leg-r { 
          stroke: #444; 
          stroke-dasharray: 2;
          animation: dissolve 1s linear forwards;
        }

        @keyframes win-jump { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-40px) rotate(10deg); } }
        @keyframes arms-victory { from { transform: rotate(-120deg); } to { transform: rotate(-160deg); } }
        
        @keyframes lose-glitch {
          0% { transform: translate(0); filter: hue-rotate(0deg) grayscale(0); }
          50% { transform: translate(-5px, 2px); filter: hue-rotate(90deg) grayscale(0.5); }
          100% { transform: translate(0); filter: hue-rotate(0deg) grayscale(1); }
        }

        @keyframes dissolve {
          0% { opacity: 1; stroke-dashoffset: 0; }
          100% { opacity: 0; stroke-dashoffset: 20; }
        }

        @keyframes confetti-float {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(-40px) rotate(360deg); opacity: 0; }
        }

        @keyframes sparkle-fade {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1.8); }
        }
        .sparkle { animation: sparkle-fade 0.8s ease-in-out infinite; transform-origin: center; }
      `}</style>
    </div>
  );
};

export default StickmanAvatar;
