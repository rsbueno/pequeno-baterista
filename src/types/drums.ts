export type PadId =
  | 'crash1'
  | 'hihat'
  | 'ride'
  | 'crash2'
  | 'tom1'
  | 'tom2'
  | 'snare'
  | 'kick_pad'
  | 'floor_tom'
  | 'pedal_hihat'
  | 'pedal_kick';

export interface DrumPieceInfo {
  id: PadId;
  name: string;
  shortName: string;
  portugueseName: string;
  category: 'cymbal' | 'drum' | 'pedal';
  shape: 'fan' | 'circle' | 'pedal';
  hotkey: string;
  keyboardDisplay: string;
  color: string;
  accentColor: string;
  realDrumEquivalent: string;
  realDrumDescription: string;
  kidFriendlyNickname: string;
  howToPlayTip: string;
  handOrFoot: 'Mão Direita' | 'Mão Esquerda' | 'Pé Direito' | 'Pé Esquerdo' | 'Ambas as Mãos';
  soundDescription: string;
}

export interface LessonStep {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  story: string;
  tips: string[];
  focusPads: PadId[];
  bpm: number;
  rhythmGrid: {
    beat: number; // 1 to 4 or 1 to 8
    subBeat: number; // 1 to 4
    padId: PadId;
    hand: 'D' | 'E' | 'Pé';
  }[];
  challengeRounds: number; // number of bars to succeed
  songPreviewTitle?: string;
}

export interface SongTrackNote {
  timeMs: number;
  padId: PadId;
  durationMs?: number;
}

export interface RhythmGameSong {
  id: string;
  title: string;
  difficulty: 'Fácil' | 'Médio' | 'Desafio Baterista';
  bpm: number;
  durationSec: number;
  description: string;
  notes: SongTrackNote[];
  backingStyle: 'rock' | 'pop' | 'funk';
}

export interface RecordedBeat {
  id: string;
  title: string;
  createdAt: string;
  durationMs: number;
  events: { padId: PadId; timeMs: number }[];
}

export interface UserProgress {
  kidName: string;
  completedLessons: number[];
  highScores: Record<string, number>;
  starsCount: number;
  recordedBeats: RecordedBeat[];
  currentPadVolume: number;
  metronomeBpm: number;
}
