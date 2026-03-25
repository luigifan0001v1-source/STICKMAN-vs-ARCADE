
export type CabinetTheme = 'standard' | 'cyber' | 'royal';

export interface ArcadeGame {
  id: string;
  name: string;
  year: number;
  description: string;
  color: string;
  icon: string;
  isEliteOnly?: boolean;
}

export interface SimulationResult {
  scenario: string;
  winner: string;
  events: string[];
}

export interface AppSettings {
  masterVolume: number;
  showCrt: boolean;
  showScanlines: boolean;
  showHalftone: boolean;
  motionBlur: boolean;
  glitchIntensity: number;
}
