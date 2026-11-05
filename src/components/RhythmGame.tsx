import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { GAME_SONGS } from '../data/rhythmGameSongs';
import { DRUM_PIECES } from '../data/drumPieces';
import { RhythmGameSong, PadId } from '../types/drums';
import { soundEngine } from '../audio/drumSoundEngine';
import { Play, RotateCcw, Trophy, Star, Flame, Zap, Gauge } from 'lucide-react';

interface Props {
  onSaveScore: (songId: string, score: number) => void;
  highScores: Record<string, number>;
  onPadHitFromParent?: PadId | null;
}

type LaneId = 'kick' | 'snare' | 'hihat' | 'cymbal_tom';

interface LaneConfig {
  id: LaneId;
  label: string;
  padIds: PadId[];
  keyHint: string;
  color: string;
  glowColor: string;
}

const LANES: LaneConfig[] = [
  {
    id: 'kick',
    label: 'BUMBO (Pé)',
    padIds: ['pedal_kick', 'kick_pad'],
    keyHint: 'Espaço / X',
    color: '#10b981', // emerald-500
    glowColor: 'rgba(16, 185, 129, 0.4)',
  },
  {
    id: 'snare',
    label: 'CAIXA (Mão E.)',
    padIds: ['snare'],
    keyHint: 'D',
    color: '#f43f5e', // rose-500
    glowColor: 'rgba(244, 63, 94, 0.4)',
  },
  {
    id: 'hihat',
    label: 'CHIMBAL (Mão D.)',
    padIds: ['hihat', 'pedal_hihat'],
    keyHint: 'W',
    color: '#f59e0b', // amber-500
    glowColor: 'rgba(245, 158, 11, 0.4)',
  },
  {
    id: 'cymbal_tom',
    label: 'PRATOS & TONS',
    padIds: ['crash1', 'crash2', 'ride', 'tom1', 'tom2', 'floor_tom'],
    keyHint: 'Q / R / E',
    color: '#6366f1', // indigo-500
    glowColor: 'rgba(99, 102, 241, 0.4)',
  },
];

interface HitParticle {
  x: number;
  y: number;
  color: string;
  text: string;
  createdAt: number;
}

export const RhythmGame: React.FC<Props> = ({
  onSaveScore,
  highScores,
  onPadHitFromParent,
}) => {
  const [selectedSongId, setSelectedSongId] = useState<string>(GAME_SONGS[0].id);
  const [gameState, setGameState] = useState<'idle' | 'countdown' | 'playing' | 'gameover'>('idle');
  const [countdownNum, setCountdownNum] = useState<number | string>(3);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [speedMode, setSpeedMode] = useState<'slow' | 'normal' | 'fast'>('slow');
  const [lastFeedback, setLastFeedback] = useState<{ text: string; color: string; id: number } | null>(null);

  const activeSong: RhythmGameSong =
    GAME_SONGS.find((s) => s.id === selectedSongId) || GAME_SONGS[0];

  // Travel time in milliseconds (how long the note takes from the top to the hit line)
  const travelTimeMs = speedMode === 'slow' ? 2400 : speedMode === 'normal' ? 1800 : 1300;

  // Refs for high performance 60fps canvas loop
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const processedNotesRef = useRef<Set<number>>(new Set());
  const missedNotesRef = useRef<Set<number>>(new Set());
  const particlesRef = useRef<HitParticle[]>([]);
  const lanePressEffectRef = useRef<Record<LaneId, number>>({
    kick: 0,
    snare: 0,
    hihat: 0,
    cymbal_tom: 0,
  });

  // Current state ref for hit checking inside listeners
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;
  const activeSongRef = useRef(activeSong);
  activeSongRef.current = activeSong;
  const comboRef = useRef(combo);
  comboRef.current = combo;
  const travelTimeRef = useRef(travelTimeMs);
  travelTimeRef.current = travelTimeMs;

  // Clean stop
  const stopGame = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    soundEngine.stopBackingTrack();
    setGameState('idle');
  }, []);

  useEffect(() => {
    return () => {
      stopGame();
    };
  }, [stopGame]);

  // Start with Countdown: "3... 2... 1... VAI!"
  const handleStartCountdown = () => {
    stopGame();
    setGameState('countdown');
    setCountdownNum(3);
    soundEngine.playMetronomeClick(true);

    let count = 3;
    const interval = window.setInterval(() => {
      count--;
      if (count > 0) {
        setCountdownNum(count);
        soundEngine.playMetronomeClick(false);
      } else if (count === 0) {
        setCountdownNum('VAI! 🚀');
        soundEngine.playMetronomeClick(true);
      } else {
        clearInterval(interval);
        startActualGame();
      }
    }, 800);
  };

  const startActualGame = () => {
    setGameState('playing');
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    processedNotesRef.current.clear();
    missedNotesRef.current.clear();
    particlesRef.current = [];

    startTimeRef.current = performance.now();
    soundEngine.startBackingTrack(activeSong.backingStyle, activeSong.bpm);

    runCanvasLoop();
  };

  const finishGame = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    soundEngine.stopBackingTrack();
    setGameState('gameover');
    onSaveScore(activeSong.id, score);

    try {
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch {
      // ignore
    }
  }, [activeSong.id, onSaveScore, score]);

  // Hit register logic
  const registerLaneHit = useCallback((laneId: LaneId) => {
    if (gameStateRef.current !== 'playing') return;

    const now = performance.now();
    const elapsed = now - startTimeRef.current;
    lanePressEffectRef.current[laneId] = now;

    const song = activeSongRef.current;
    const lane = LANES.find((l) => l.id === laneId);
    if (!lane) return;

    // Hit tolerance window (for 7yo kids: generous +/- 240ms)
    const HIT_WINDOW_MS = 240;
    let closestIdx = -1;
    let minDiff = Infinity;

    song.notes.forEach((note, idx) => {
      if (processedNotesRef.current.has(idx) || missedNotesRef.current.has(idx)) return;
      if (!lane.padIds.includes(note.padId)) return;

      const diff = Math.abs(note.timeMs - elapsed);
      if (diff <= HIT_WINDOW_MS && diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    if (closestIdx !== -1) {
      processedNotesRef.current.add(closestIdx);
      const note = song.notes[closestIdx];
      const targetPad = note.padId;
      soundEngine.triggerPad(targetPad);

      let text = 'MUITO BOM! 👍';
      let pts = 60;
      let textColor = '#34d399';

      if (minDiff < 100) {
        text = 'PERFEITO! ⭐';
        pts = 100;
        textColor = '#fbbf24';
      }

      // Combo bonus
      const currentCombo = comboRef.current + 1;
      const finalPts = Math.round(pts * (1 + Math.floor(currentCombo / 5) * 0.25));

      setScore((s) => s + finalPts);
      setCombo(currentCombo);
      setMaxCombo((m) => Math.max(m, currentCombo));
      setLastFeedback({ text, color: textColor, id: Date.now() });

      // Add hit explosion particle on canvas
      const laneIndex = LANES.findIndex((l) => l.id === laneId);
      particlesRef.current.push({
        x: laneIndex,
        y: 1.0,
        color: textColor,
        text,
        createdAt: now,
      });
    } else {
      // Free hit without target
      const fallbackPad = lane.padIds[0];
      soundEngine.triggerPad(fallbackPad);
    }
  }, []);

  // Listen to hits from virtual/external drum pad
  useEffect(() => {
    if (onPadHitFromParent && gameState === 'playing') {
      const lane = LANES.find((l) => l.padIds.includes(onPadHitFromParent));
      if (lane) {
        registerLaneHit(lane.id);
      }
    }
  }, [onPadHitFromParent, gameState, registerLaneHit]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (gameStateRef.current !== 'playing') return;

      const key = e.key.toLowerCase();
      if (key === ' ' || key === 'x') {
        e.preventDefault();
        registerLaneHit('kick');
      } else if (key === 'd') {
        e.preventDefault();
        registerLaneHit('snare');
      } else if (key === 'w') {
        e.preventDefault();
        registerLaneHit('hihat');
      } else if (['q', 'r', 'e', 'a', 's', 'g'].includes(key)) {
        e.preventDefault();
        registerLaneHit('cymbal_tom');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [registerLaneHit]);

  // Main 60fps Canvas Loop (Smooth, Linear, GPU Accelerated)
  const runCanvasLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const now = performance.now();
      const elapsed = now - startTimeRef.current;
      const song = activeSongRef.current;
      const travelTime = travelTimeRef.current;

      // Check if song finished
      if (elapsed >= (song.durationSec + 1) * 1000) {
        finishGame();
        return;
      }

      // Resize canvas for sharp rendering
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = rect.width;
      const height = rect.height;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // 1. Draw highway background & perspective lanes
      const laneCount = LANES.length;
      const laneWidth = width / laneCount;
      const hitLineY = height - 52; // Where the notes must be struck

      // Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#090d16');
      bgGrad.addColorStop(1, '#05070c');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Lane separator lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1.5;
      for (let i = 1; i < laneCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * laneWidth, 0);
        ctx.lineTo(i * laneWidth, height);
        ctx.stroke();
      }

      // Subtle horizontal rhythm grid lines
      const bpm = song.bpm;
      const beatMs = (60 / bpm) * 1000;
      const currentBeat = Math.floor(elapsed / beatMs);
      for (let b = -2; b <= 6; b++) {
        const beatTime = (currentBeat + b) * beatMs;
        const timeToHit = beatTime - elapsed;
        if (timeToHit >= 0 && timeToHit <= travelTime) {
          const progress = 1 - timeToHit / travelTime;
          const y = progress * hitLineY;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      }

      // 2. Draw Hit Target Line & Target Pads
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, hitLineY);
      ctx.lineTo(width, hitLineY);
      ctx.stroke();

      // Draw target circles on hit line for each lane
      LANES.forEach((lane, idx) => {
        const cx = idx * laneWidth + laneWidth / 2;
        const cy = hitLineY;
        const pressTime = lanePressEffectRef.current[lane.id];
        const isPressed = now - pressTime < 140;

        // Target Pad Outline
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, 24, 0, Math.PI * 2);
        ctx.fillStyle = isPressed ? lane.color : '#18181b';
        ctx.fill();
        ctx.strokeStyle = isPressed ? '#ffffff' : lane.color;
        ctx.lineWidth = isPressed ? 4 : 2.5;
        ctx.stroke();

        // Target Inner Ring
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Keyboard hotkey inside target pad
        ctx.fillStyle = isPressed ? '#000000' : '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(lane.keyHint.split(' ')[0], cx, cy);

        // Flash ripple if pressed
        if (isPressed) {
          const factor = (now - pressTime) / 140;
          ctx.beginPath();
          ctx.arc(cx, cy, 24 + factor * 22, 0, Math.PI * 2);
          ctx.strokeStyle = lane.color;
          ctx.lineWidth = 2 * (1 - factor);
          ctx.stroke();
        }
        ctx.restore();
      });

      // 3. Draw Falling Notes (Smooth linear interpolation: Y = (1 - (timeToHit / travelTime)) * hitLineY)
      song.notes.forEach((note, idx) => {
        if (processedNotesRef.current.has(idx)) return;

        const timeToHit = note.timeMs - elapsed;

        // Check if note was missed (passed hit line by more than 240ms)
        if (timeToHit < -240) {
          if (!missedNotesRef.current.has(idx)) {
            missedNotesRef.current.add(idx);
            setCombo(0);
            setLastFeedback({ text: 'QUASE! 💨', color: '#94a3b8', id: Date.now() });
          }
          return;
        }

        // Only draw notes currently within the highway travel window
        if (timeToHit > travelTime || timeToHit < -240) return;

        // Mathematical linear progression: exactly 0 at top, exactly 1.0 at hit line!
        const progress = 1 - timeToHit / travelTime;
        const noteY = progress * hitLineY;

        // Determine lane index
        const laneIndex = LANES.findIndex((l) => l.padIds.includes(note.padId));
        if (laneIndex === -1) return;
        const lane = LANES[laneIndex];
        const noteX = laneIndex * laneWidth + laneWidth / 2;

        const piece = DRUM_PIECES[note.padId];
        const radius = 22;

        // Draw note pad body
        ctx.save();
        ctx.shadowColor = lane.glowColor;
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.arc(noteX, noteY, radius, 0, Math.PI * 2);
        ctx.fillStyle = lane.color;
        ctx.fill();

        // White outer ring (just like the physical silicone drum pads!)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Inner white ring
        ctx.beginPath();
        ctx.arc(noteX, noteY, radius * 0.6, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Note Name Label
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 0;
        ctx.fillText(piece?.shortName?.toUpperCase() || 'PAD', noteX, noteY);

        ctx.restore();
      });

      // 4. Draw Floating Hit Particles
      const activeParticles: HitParticle[] = [];
      particlesRef.current.forEach((p) => {
        const age = now - p.createdAt;
        if (age < 600) {
          const fade = 1 - age / 600;
          const px = p.x * laneWidth + laneWidth / 2;
          const py = hitLineY - 30 - (age / 600) * 35;

          ctx.save();
          ctx.fillStyle = p.color;
          ctx.globalAlpha = fade;
          ctx.font = 'bold 14px Outfit, sans-serif';
          ctx.textAlign = 'center';
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.fillText(p.text, px, py);
          ctx.restore();

          activeParticles.push(p);
        }
      });
      particlesRef.current = activeParticles;

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);
  }, [finishGame]);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-4 md:p-8 shadow-xl">
      {/* Top Header & Song Select */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold tracking-wider uppercase mb-1">
            <Zap className="w-4 h-4" />
            <span>Jogo do Ritmo (Rhythm Arcade)</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white">
            Desafio das Notas Musicais
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Acerte os pads quando as notas tocarem na linha dourada! Ganhe pontos e combos!
          </p>
        </div>

        {/* Song Select buttons */}
        <div className="flex flex-wrap gap-1.5 self-start sm:self-auto">
          {GAME_SONGS.map((song) => {
            const isSelected = song.id === selectedSongId;
            const songBest = highScores[song.id] || 0;

            return (
              <button
                key={song.id}
                onClick={() => {
                  stopGame();
                  setSelectedSongId(song.id);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <span>{song.title}</span>
                {songBest > 0 && (
                  <span className="ml-1 text-[10px] text-amber-950 font-mono">
                    ★{songBest}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Game Stage */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Vertical Highway Rhythm Game Track */}
        <div className="lg:col-span-8 bg-zinc-950 rounded-2xl p-4 border-2 border-slate-700 flex flex-col justify-between overflow-hidden relative min-h-[440px] shadow-2xl">
          {/* Top Scoreboard HUD */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800 z-10">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-[10px] uppercase text-zinc-400 block">Pontuação</span>
                <span className="text-xl md:text-2xl font-mono font-bold text-amber-400">
                  {score.toLocaleString()}
                </span>
              </div>
              <div className="pl-4 border-l border-zinc-800">
                <span className="text-[10px] uppercase text-zinc-400 block">Combo</span>
                <div className="flex items-center gap-1">
                  <Flame className={`w-4 h-4 ${combo > 4 ? 'text-amber-400 animate-pulse' : 'text-zinc-600'}`} />
                  <span className="text-lg font-mono font-bold text-white">{combo}x</span>
                </div>
              </div>
            </div>

            {/* Hit Feedback Flash */}
            {lastFeedback && (
              <div
                key={lastFeedback.id}
                className="text-sm md:text-base font-bold tracking-wider animate-bounce"
                style={{ color: lastFeedback.color }}
              >
                {lastFeedback.text}
              </div>
            )}

            <div className="text-right">
              <span className="text-[10px] uppercase text-zinc-400 block">Melhor Recorde</span>
              <span className="text-sm font-mono font-bold text-zinc-300">
                {(highScores[activeSong.id] || 0).toLocaleString()} pts
              </span>
            </div>
          </div>

          {/* 60FPS Dedicated HTML5 Canvas Highway */}
          <div className="relative flex-1 my-2 w-full min-h-[290px] rounded-xl overflow-hidden border border-zinc-800/80 bg-zinc-950">
            <canvas
              ref={canvasRef}
              className="w-full h-full block cursor-pointer select-none"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const laneIdx = Math.floor((clickX / rect.width) * LANES.length);
                if (LANES[laneIdx]) {
                  registerLaneHit(LANES[laneIdx].id);
                }
              }}
            />

            {/* Countdown Overlay */}
            {gameState === 'countdown' && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center pointer-events-none z-20">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2">
                  Prepare as Baquetas!
                </span>
                <div className="text-6xl sm:text-7xl font-extrabold text-amber-400 font-mono animate-ping">
                  {countdownNum}
                </div>
              </div>
            )}

            {/* Idle Start Overlay */}
            {gameState === 'idle' && (
              <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 mb-3">
                  <Play className="w-8 h-8 fill-current translate-x-0.5" />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {activeSong.title}
                </h3>
                <p className="text-xs text-slate-300 max-w-sm mb-4">
                  {activeSong.description}
                </p>

                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs text-slate-400">Velocidade da descida:</span>
                  <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button
                      onClick={() => setSpeedMode('slow')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                        speedMode === 'slow' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Suave (7 Anos)
                    </button>
                    <button
                      onClick={() => setSpeedMode('normal')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                        speedMode === 'normal' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Normal
                    </button>
                    <button
                      onClick={() => setSpeedMode('fast')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                        speedMode === 'fast' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Rápido
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleStartCountdown}
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
                >
                  Começar o Jogo! 🚀
                </button>
              </div>
            )}

            {/* Game Over Modal */}
            {gameState === 'gameover' && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
                <Trophy className="w-14 h-14 text-amber-400 mb-2 animate-bounce" />
                <h3 className="text-2xl font-bold text-white mb-1">Show Concluído!</h3>
                <p className="text-xs text-slate-300 mb-4">
                  Você tocou como um verdadeiro baterista de banda!
                </p>

                <div className="flex items-center gap-6 mb-5 bg-zinc-900 px-6 py-3 rounded-2xl border border-zinc-800">
                  <div>
                    <span className="text-[10px] uppercase text-zinc-400 block">Pontuação Final</span>
                    <span className="text-2xl font-mono font-bold text-amber-400">
                      {score.toLocaleString()}
                    </span>
                  </div>
                  <div className="pl-6 border-l border-zinc-800">
                    <span className="text-[10px] uppercase text-zinc-400 block">Maior Combo</span>
                    <span className="text-2xl font-mono font-bold text-white">
                      {maxCombo}x
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleStartCountdown}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Jogar Novamente</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Tap/Click Buttons for Each Lane */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {LANES.map((lane) => (
              <button
                key={lane.id}
                onClick={() => registerLaneHit(lane.id)}
                className="py-2 px-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 border border-zinc-800 transition-colors flex flex-col items-center justify-center cursor-pointer select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: lane.color }}
                  />
                  <span className="text-[10px] sm:text-xs font-bold text-zinc-200 truncate">
                    {lane.label}
                  </span>
                </div>
                <span className="text-[9px] text-amber-400 font-mono mt-0.5">
                  [{lane.keyHint}]
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Song Instructions & Settings */}
        <div className="lg:col-span-4 bg-slate-800/80 rounded-2xl p-5 border border-slate-700 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                {activeSong.difficulty}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {activeSong.bpm} BPM · {activeSong.durationSec}s
              </span>
            </div>

            <h3 className="text-lg font-bold text-white mb-2">
              {activeSong.title}
            </h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              {activeSong.description}
            </p>

            <div className="space-y-2.5 mb-5 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700">
                <span className="font-bold text-amber-400 block mb-1">
                  💡 Como Funciona:
                </span>
                <p>
                  As notas descem suavemente pelo caminho. Quando o círculo colorido tocar na <strong>linha amarela</strong>, bata no pad correspondente!
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700">
                <span className="font-bold text-cyan-400 block mb-1">
                  🎯 Como Tocar:
                </span>
                <ul className="space-y-1 text-slate-300">
                  <li>• <strong>Espaço ou X:</strong> Bumbo (Pé direito)</li>
                  <li>• <strong>D:</strong> Caixa (Mão esquerda)</li>
                  <li>• <strong>W:</strong> Chimbal (Mão direita)</li>
                  <li>• <strong>Q ou R:</strong> Prato Crash / Tons</li>
                  <li>• <strong>Ou toque na tela / bateria de silicone!</strong></li>
                </ul>
              </div>

              {/* Speed Mode Selector */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700">
                <div className="flex items-center gap-1.5 font-bold text-slate-200 mb-2">
                  <Gauge className="w-3.5 h-3.5 text-amber-400" />
                  <span>Velocidade de Treino:</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setSpeedMode('slow')}
                    className={`py-1.5 px-1 rounded-lg text-xs font-bold text-center transition-colors ${
                      speedMode === 'slow'
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Suave
                  </button>
                  <button
                    onClick={() => setSpeedMode('normal')}
                    className={`py-1.5 px-1 rounded-lg text-xs font-bold text-center transition-colors ${
                      speedMode === 'normal'
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => setSpeedMode('fast')}
                    className={`py-1.5 px-1 rounded-lg text-xs font-bold text-center transition-colors ${
                      speedMode === 'fast'
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Rápido
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="pt-4 border-t border-slate-700">
            {gameState === 'playing' ? (
              <button
                onClick={stopGame}
                className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Parar Jogo</span>
              </button>
            ) : (
              <button
                onClick={handleStartCountdown}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Iniciar Música!</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
