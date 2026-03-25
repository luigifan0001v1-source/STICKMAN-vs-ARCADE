
import React from 'react';
import { ArcadeGame } from './types';

export const ARCADE_GAMES: ArcadeGame[] = [
  { id: 'pong', name: 'PONG', year: 1972, description: 'Table tennis simulation', color: '#ffffff', icon: '🏓' },
  { id: 'breakout', name: 'BREAKOUT', year: 1976, description: 'Brick-breaking mayhem', color: '#ff00ff', icon: '🎾', isEliteOnly: true },
  { id: 'space-invaders', name: 'SPACE INVADERS', year: 1978, description: 'Fixed shooter vs aliens', color: '#00ff00', icon: '👾' },
  { id: 'pac-man', name: 'PAC-MAN', year: 1980, description: 'Maze chase game', color: '#ffff00', icon: '🟡' },
  { id: 'frogger', name: 'FROGGER', year: 1981, description: 'Leap of faith navigation', color: '#33ff33', icon: '🐸', isEliteOnly: true },
  { id: 'donkey-kong', name: 'DONKEY KONG', year: 1981, description: 'Platforming rescue mission', color: '#ff4400', icon: '🦍' },
  { id: 'qbert', name: 'Q*BERT', year: 1982, description: 'Isometric pyramid hopper', color: '#ffa500', icon: '🐘' },
  { id: 'mario-bros', name: 'MARIO BROS 1983', year: 1983, description: 'Underground pipe clearing', color: '#ff0000', icon: '👨‍🔧', isEliteOnly: true },
  { id: 'tetris', name: 'TETRIS', year: 1984, description: 'Tile-matching puzzle', color: '#00ffff', icon: '🧱' },
];

export const STICKMEN = [
  { name: 'Orange', color: '#ff7700', trait: 'The Leader' },
  { name: 'Red', color: '#ff0000', trait: 'The Fighter' },
  { name: 'Green', color: '#00ff00', trait: 'The Gamer' },
  { name: 'Blue', color: '#0077ff', trait: 'The Fast' },
  { name: 'Yellow', color: '#ffff00', trait: 'The Brain' },
];

export const ARCADE_ADS = [
  {
    title: "STICK-COLA",
    tagline: "CARBONATED PIXEL JUICE",
    color: "#ff0000",
    icon: "🥤",
    action: "REFRESH NOW"
  },
  {
    title: "GEMINI AI CORE",
    tagline: "NEXT-GEN NEURAL SYNC",
    color: "#00ffff",
    icon: "🧠",
    action: "UPGRADE"
  },
  {
    title: "NEO-SHADES",
    tagline: "SEE THE GLITCH BETTER",
    color: "#ff00ff",
    icon: "🕶️",
    action: "BUY NOW"
  },
  {
    title: "VIP LOUNGE",
    tagline: "ELITE MEMBERS ONLY",
    color: "#ffd700",
    icon: "👑",
    action: "JOIN US"
  }
];
