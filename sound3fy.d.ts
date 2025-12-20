/**
 * sound3fy - Make D3.js visualizations accessible through sound
 */

export type ScaleType = 'pentatonic' | 'major' | 'minor' | 'blues' | 'chromatic' | 'continuous';
export type PlaybackMode = 'discrete' | 'continuous';
export type ChartType = 'bar' | 'line' | 'scatter';

export interface PitchConfig {
  field?: string | ((datum: any, index: number) => number) | null;
  range?: [number, number];
  scale?: ScaleType;
}

export interface VolumeConfig {
  field?: string | ((datum: any, index: number) => number) | null;
  range?: [number, number];
}

export interface PanConfig {
  range?: [number, number];
}

export interface EnvelopeConfig {
  attack?: number;
  decay?: number;
  sustain?: number;
  release?: number;
}

export interface AccessibilityConfig {
  keyboard?: boolean;
  announce?: boolean;
  announceSummary?: boolean;
  focus?: boolean;
  hover?: boolean;
}

export interface SonifyOptions {
  pitch?: PitchConfig | string | ((datum: any, index: number) => number);
  volume?: VolumeConfig | string | ((datum: any, index: number) => number);
  pan?: PanConfig;
  duration?: number;
  gap?: number;
  mode?: PlaybackMode;
  chartType?: ChartType;
  x?: string | ((datum: any, index: number) => number);
  envelope?: EnvelopeConfig;
  markers?: { start?: boolean; end?: boolean };
  accessibility?: AccessibilityConfig;
  autoPlay?: boolean;
}

export class AudioEngine {
  constructor();
  init(): this;
  resume(): Promise<void>;
  playTone(options?: { frequency?: number; duration?: number; volume?: number; pan?: number; envelope?: EnvelopeConfig }): this;
  valueToFrequency(value: number, options?: { minFreq?: number; maxFreq?: number; scale?: ScaleType }): number;
  playMarker(type: 'start' | 'end'): this;
  getContext(): AudioContext;
  getMasterGain(): GainNode;
  destroy(): void;
}

export class DataMapper {
  constructor(options?: SonifyOptions);
  analyze(data: Array<{ datum: any; index: number; element: Element }>): void;
  getValue(datum: any, index: number): number | null;
  getXValue(datum: any, index: number): number | null;
  map(item: { datum: any; index: number; element: Element }, index: number, total: number): { frequency: number; volume: number; pan: number; duration: number };
  describe(item: { datum: any; index: number; element: Element }, index: number, total: number): string;
  summarize(data: Array<{ datum: any; index: number; element: Element }>): string;
}

export class SonificationEngine {
  constructor(options?: SonifyOptions);
  bind(selection: any, data: Array<{ datum: any; index: number; element: Element }>): this;
  play(): Promise<this>;
  pause(): this;
  stop(): this;
  toggle(): this | Promise<this>;
  next(): this;
  previous(): this;
  first(): this;
  last(): this;
  setSpeed(speed: number): this;
  setMode(mode: PlaybackMode): this;
  isPlaying(): boolean;
  isPaused(): boolean;
  currentIndex(): number;
  length(): number;
  getMode(): PlaybackMode;
  destroy(): void;
}

export const DEFAULTS: Required<SonifyOptions>;
export function sonify(this: any, options?: SonifyOptions): SonificationEngine;
export default sonify;

declare module 'd3-selection' {
  interface Selection<GElement, Datum, PElement, PDatum> {
    sonify(options?: SonifyOptions): SonificationEngine;
  }
}

