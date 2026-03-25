
import React, { useState, useEffect, useRef } from 'react';

const StickmanCursor: React.FC = () => {
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const blurFilterRef = useRef<SVGFEGaussianBlurElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const lastPos = useRef({ x: 0, y: 0 });
  const requestRef = useRef<number | null>(null);

  const animate = () => {
    // Calculate velocity for leaning effect
    const dx = pos.current.x - lastPos.current.x;
    const dy = pos.current.y - lastPos.current.y;
    
    // Smooth the velocity
    velocity.current.x = velocity.current.x * 0.8 + dx * 0.2;
    velocity.current.y = velocity.current.y * 0.8 + dy * 0.2;
    
    if (cursorRef.current) {
      // Lean amount based on horizontal velocity
      const tilt = Math.min(Math.max(velocity.current.x * 0.8, -45), 45);
      // Speed determines if it looks like it's "running"
      const speed = Math.sqrt(velocity.current.x ** 2 + velocity.current.y ** 2);
      const isMovingFast = speed > 5;

      cursorRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      
      const inner = cursorRef.current.querySelector('.cursor-inner') as HTMLElement;
      if (inner) {
        inner.style.transform = `rotate(${tilt}deg) scale(${1 + speed * 0.005})`;
        inner.dataset.moving = isMovingFast ? 'true' : 'false';
        
        // Dynamic motion blur based on speed
        const blurAmount = Math.min(speed * 0.4, 8);
        const blurX = Math.abs(velocity.current.x) * 0.3;
        const blurY = Math.abs(velocity.current.y) * 0.1;
        
        // We use a local inline filter if possible or just update the global one
        // For simplicity in this env, we update the inline style filter for the SVG part
        const svg = inner.querySelector('svg');
        if (svg) {
          svg.style.filter = `blur(${blurAmount * 0.2}px) drop-shadow(0 0 12px rgba(0,255,0,1))`;
        }
      }
    }

    lastPos.current = { ...pos.current };
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isVisible]);

  return (
    <div 
      ref={cursorRef}
      className={`fixed top-0 left-0 pointer-events-none z-[9999] opacity-0 transition-opacity duration-300 ${isVisible ? 'opacity-100' : ''}`}
      style={{ willChange: 'transform' }}
    >
      <div className={`cursor-inner relative -left-[12px] -top-[18px] transition-all duration-75 ${isClicked ? 'scale-[1.3]' : ''}`}>
        <svg 
          width="32" 
          height="48" 
          viewBox="0 0 50 75"
          className="transition-all duration-75"
        >
          {/* Head with blinking eye */}
          <g className="cursor-head">
            <circle cx="25" cy="15" r="10" stroke="#00ff00" strokeWidth="5" fill="black" />
            <rect x="22" y="12" width="2" height="4" fill="#00ff00" className="cursor-eye" />
            <rect x="28" y="12" width="2" height="4" fill="#00ff00" className="cursor-eye" />
          </g>
          
          {/* Spine */}
          <line x1="25" y1="25" x2="25" y2="50" stroke="#00ff00" strokeWidth="5" strokeLinecap="round" />
          
          {/* Limbs that animate when moving */}
          <line x1="25" y1="30" x2="10" y2="45" stroke="#00ff00" strokeWidth="5" strokeLinecap="round" className="cursor-arm-l" />
          <line x1="25" y1="30" x2="40" y2="45" stroke="#00ff00" strokeWidth="5" strokeLinecap="round" className="cursor-arm-r" />
          <line x1="25" y1="50" x2="10" y2="70" stroke="#00ff00" strokeWidth="5" strokeLinecap="round" className="cursor-leg-l" />
          <line x1="25" y1="50" x2="40" y2="70" stroke="#00ff00" strokeWidth="5" strokeLinecap="round" className="cursor-leg-r" />
        </svg>
      </div>
      
      {/* Dynamic Click Glitch Effect */}
      {isClicked && (
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
          <div className="absolute w-12 h-12 border-2 border-green-500 rounded-full animate-ping opacity-70"></div>
          <div className="absolute w-8 h-8 border border-green-400 rotate-45 animate-pulse opacity-50"></div>
          <div className="absolute w-1 h-1 bg-white animate-ping opacity-90 rounded-full"></div>
          {/* Floating digital particles */}
          {[...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className="absolute w-1 h-1 bg-green-500 animate-bounce"
              style={{ 
                transform: `rotate(${i * 90}deg) translateY(-20px)`,
                animationDelay: `${i * 0.1}s`
              }}
            ></div>
          ))}
        </div>
      )}

      <style>{`
        /* Floating while idle */
        .cursor-inner[data-moving="false"] { animation: cursor-float 2s ease-in-out infinite; }
        
        @keyframes cursor-float {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50% { transform: translateY(-4px) rotate(1deg); }
        }

        /* Running limbs animation when moving fast */
        .cursor-inner[data-moving="true"] .cursor-leg-l { animation: leg-run 0.2s linear infinite; }
        .cursor-inner[data-moving="true"] .cursor-leg-r { animation: leg-run 0.2s linear infinite reverse; }
        .cursor-inner[data-moving="true"] .cursor-arm-l { animation: arm-run 0.2s linear infinite reverse; }
        .cursor-inner[data-moving="true"] .cursor-arm-r { animation: arm-run 0.2s linear infinite; }
        
        @keyframes leg-run {
          0% { transform: rotate(40deg); transform-origin: 25px 50px; }
          50% { transform: rotate(-40deg); transform-origin: 25px 50px; }
          100% { transform: rotate(40deg); transform-origin: 25px 50px; }
        }

        @keyframes arm-run {
          0% { transform: rotate(-30deg); transform-origin: 25px 30px; }
          50% { transform: rotate(30deg); transform-origin: 25px 30px; }
          100% { transform: rotate(-30deg); transform-origin: 25px 30px; }
        }

        /* Random eye blinking */
        .cursor-eye { animation: cursor-blink 4s infinite step-end; }
        @keyframes cursor-blink {
          0%, 95% { transform: scaleY(1); }
          97%, 100% { transform: scaleY(0.1); }
        }
        
        /* Global cursor override */
        html, body, *, button, a, [role="button"] { 
          cursor: none !important; 
        }
      `}</style>
    </div>
  );
};

export default StickmanCursor;
