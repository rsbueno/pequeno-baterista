import React, { useState, useEffect, useCallback } from 'react';
import { DRUM_PIECES } from '../data/drumPieces';
import { PadId } from '../types/drums';
import { soundEngine } from '../audio/drumSoundEngine';
import { Volume2, VolumeX, Disc3, Radio, Play, Square, Sparkles } from 'lucide-react';

interface DrumPadKitProps {
  onPadHit?: (padId: PadId) => void;
  activeHighlightPads?: PadId[];
  selectedPadId?: PadId | null;
  onSelectPad?: (padId: PadId) => void;
  showKeysHint?: boolean;
  className?: string;
}

export const DrumPadKit: React.FC<DrumPadKitProps> = ({
  onPadHit,
  activeHighlightPads = [],
  selectedPadId,
  onSelectPad,
  showKeysHint = true,
  className = '',
}) => {
  const [activeHits, setActiveHits] = useState<Record<string, boolean>>({});
  const [isMuted, setIsMuted] = useState(false);
  const [currentStyle, setCurrentStyle] = useState<'Standard' | 'Rock' | 'Electro'>('Standard');
  const [demoPlaying, setDemoPlaying] = useState(false);
  const [demoTimeoutId, setDemoTimeoutId] = useState<number | null>(null);

  const triggerHit = useCallback(
    (padId: PadId) => {
      soundEngine.triggerPad(padId);
      setActiveHits((prev) => ({ ...prev, [padId]: true }));
      setTimeout(() => {
        setActiveHits((prev) => ({ ...prev, [padId]: false }));
      }, 140);

      if (onPadHit) {
        onPadHit(padId);
      }
      if (onSelectPad) {
        onSelectPad(padId);
      }
    },
    [onPadHit, onSelectPad]
  );

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === ' ' || key === 'x') {
        e.preventDefault();
        triggerHit('pedal_kick');
        return;
      }
      if (key === 'z') {
        e.preventDefault();
        triggerHit('pedal_hihat');
        return;
      }

      const matched = Object.values(DRUM_PIECES).find((p) => p.hotkey === key);
      if (matched) {
        e.preventDefault();
        triggerHit(matched.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerHit]);

  // Demo play feature like on the real drum unit
  const handleToggleDemo = () => {
    if (demoPlaying) {
      if (demoTimeoutId) clearTimeout(demoTimeoutId);
      setDemoPlaying(false);
      setDemoTimeoutId(null);
      return;
    }

    setDemoPlaying(true);
    const demoSequence: { pad: PadId; delay: number }[] = [
      { pad: 'hihat', delay: 0 },
      { pad: 'pedal_kick', delay: 0 },
      { pad: 'hihat', delay: 400 },
      { pad: 'snare', delay: 800 },
      { pad: 'hihat', delay: 800 },
      { pad: 'hihat', delay: 1200 },
      { pad: 'pedal_kick', delay: 1200 },
      { pad: 'hihat', delay: 1600 },
      { pad: 'snare', delay: 2000 },
      { pad: 'hihat', delay: 2000 },
      { pad: 'tom1', delay: 2400 },
      { pad: 'tom2', delay: 2600 },
      { pad: 'floor_tom', delay: 2800 },
      { pad: 'crash1', delay: 3100 },
      { pad: 'pedal_kick', delay: 3100 },
    ];

    demoSequence.forEach(({ pad, delay }) => {
      setTimeout(() => {
        triggerHit(pad);
      }, delay);
    });

    const timeout = window.setTimeout(() => {
      setDemoPlaying(false);
      setDemoTimeoutId(null);
    }, 3400);

    setDemoTimeoutId(timeout);
  };

  const handleMuteToggle = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Electronic Drum Body Container */}
      <div className="relative w-full max-w-4xl bg-slate-900 rounded-3xl p-4 md:p-6 shadow-2xl border border-slate-800 transition-all">
        {/* Top Control Module (Sound Module / Painel de Controle) */}
        <div className="mx-auto w-full max-w-xl bg-gradient-to-b from-zinc-800 to-zinc-950 rounded-xl p-3 mb-6 border border-zinc-700 shadow-md">
          <div className="flex items-center justify-between gap-2 px-2 pb-2 border-b border-zinc-700">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500" />
              <span className="text-xs font-bold tracking-wider text-zinc-200">ELECTRONIC DRUM</span>
              <span className="text-[10px] text-zinc-400 hidden sm:inline">· 9 PADS & 2 PEDAIS</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-emerald-400 bg-black/60 px-2 py-0.5 rounded border border-emerald-900/40">
                {demoPlaying ? 'DEMO' : currentStyle}
              </span>
            </div>
          </div>

          {/* Console Control Buttons */}
          <div className="grid grid-cols-5 gap-1.5 mt-2.5 text-[10px]">
            <button
              onClick={handleToggleDemo}
              className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded font-medium transition-colors ${
                demoPlaying
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
              }`}
              title="Tocar demonstração automática"
            >
              {demoPlaying ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3" />}
              <span>DEMO</span>
            </button>

            <button
              onClick={() => {
                const styles: ('Standard' | 'Rock' | 'Electro')[] = ['Standard', 'Rock', 'Electro'];
                const next = styles[(styles.indexOf(currentStyle) + 1) % styles.length];
                setCurrentStyle(next);
              }}
              className="flex items-center justify-center gap-1 py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded font-medium transition-colors"
              title="Trocar estilo de som"
            >
              <Disc3 className="w-3 h-3 text-cyan-400" />
              <span>STYLE</span>
            </button>

            <button
              onClick={() => soundEngine.triggerPad('crash1')}
              className="flex items-center justify-center gap-1 py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded font-medium transition-colors"
              title="Acento rápido"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>CRASH</span>
            </button>

            <button
              onClick={() => soundEngine.triggerPad('snare')}
              className="flex items-center justify-center gap-1 py-1.5 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded font-medium transition-colors"
              title="Teste Caixa"
            >
              <Radio className="w-3 h-3 text-rose-400" />
              <span>CAIXA</span>
            </button>

            <button
              onClick={handleMuteToggle}
              className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded font-medium transition-colors ${
                isMuted
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
              }`}
              title="Silenciar / Ativar Som"
            >
              {isMuted ? <VolumeX className="w-3 h-3 text-rose-400" /> : <Volume2 className="w-3 h-3 text-emerald-400" />}
              <span>{isMuted ? 'MUDO' : 'SOM'}</span>
            </button>
          </div>
        </div>

        {/* The Black Silicone Mat with Curvature matching real product */}
        <div className="relative bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 rounded-[40px] p-4 md:p-8 border-4 border-zinc-800/80 shadow-inner">
          {/* Top Center Logo on Silicone */}
          <div className="text-center mb-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Electronic Drum · Silicone 9-Pads
            </span>
          </div>

          {/* Row 1: The 4 Fan-Shaped Cymbal Pads (Pratos com ondas acústicas) */}
          <div className="grid grid-cols-4 gap-2 md:gap-5 mb-5">
            {/* Crash 1 (Top Left) */}
            <FanCymbalPad
              piece={DRUM_PIECES.crash1}
              isHit={!!activeHits.crash1}
              isHighlighted={activeHighlightPads.includes('crash1')}
              isSelected={selectedPadId === 'crash1'}
              showKeyHint={showKeysHint}
              onHit={() => triggerHit('crash1')}
            />

            {/* Hi-Hat (Upper Mid-Left) */}
            <FanCymbalPad
              piece={DRUM_PIECES.hihat}
              isHit={!!activeHits.hihat}
              isHighlighted={activeHighlightPads.includes('hihat')}
              isSelected={selectedPadId === 'hihat'}
              showKeyHint={showKeysHint}
              onHit={() => triggerHit('hihat')}
            />

            {/* Ride Cymbal (Upper Mid-Right) */}
            <FanCymbalPad
              piece={DRUM_PIECES.ride}
              isHit={!!activeHits.ride}
              isHighlighted={activeHighlightPads.includes('ride')}
              isSelected={selectedPadId === 'ride'}
              showKeyHint={showKeysHint}
              onHit={() => triggerHit('ride')}
            />

            {/* Crash 2 (Top Right) */}
            <FanCymbalPad
              piece={DRUM_PIECES.crash2}
              isHit={!!activeHits.crash2}
              isHighlighted={activeHighlightPads.includes('crash2')}
              isSelected={selectedPadId === 'crash2'}
              showKeyHint={showKeysHint}
              onHit={() => triggerHit('crash2')}
            />
          </div>

          {/* Row 2: Toms in the middle (Tom 1 e Tom 2) */}
          <div className="flex justify-center gap-6 md:gap-14 mb-5">
            {/* Tom 1 */}
            <CircleDrumPad
              piece={DRUM_PIECES.tom1}
              isHit={!!activeHits.tom1}
              isHighlighted={activeHighlightPads.includes('tom1')}
              isSelected={selectedPadId === 'tom1'}
              showKeyHint={showKeysHint}
              onHit={() => triggerHit('tom1')}
              size="md"
            />

            {/* Tom 2 */}
            <CircleDrumPad
              piece={DRUM_PIECES.tom2}
              isHit={!!activeHits.tom2}
              isHighlighted={activeHighlightPads.includes('tom2')}
              isSelected={selectedPadId === 'tom2'}
              showKeyHint={showKeysHint}
              onHit={() => triggerHit('tom2')}
              size="md"
            />
          </div>

          {/* Row 3: Bottom 3 circular pads (Caixa, Bumbo Central, Surdo) */}
          <div className="grid grid-cols-3 gap-3 md:gap-8 max-w-2xl mx-auto">
            {/* Snare (Caixa) - Bottom Left */}
            <CircleDrumPad
              piece={DRUM_PIECES.snare}
              isHit={!!activeHits.snare}
              isHighlighted={activeHighlightPads.includes('snare')}
              isSelected={selectedPadId === 'snare'}
              showKeyHint={showKeysHint}
              onHit={() => triggerHit('snare')}
              size="lg"
            />

            {/* Bass Drum Center Pad - Bottom Center */}
            <CircleDrumPad
              piece={DRUM_PIECES.kick_pad}
              isHit={!!activeHits.kick_pad}
              isHighlighted={activeHighlightPads.includes('kick_pad')}
              isSelected={selectedPadId === 'kick_pad'}
              showKeyHint={showKeysHint}
              onHit={() => triggerHit('kick_pad')}
              size="lg"
            />

            {/* Floor Tom (Surdo) - Bottom Right */}
            <CircleDrumPad
              piece={DRUM_PIECES.floor_tom}
              isHit={!!activeHits.floor_tom}
              isHighlighted={activeHighlightPads.includes('floor_tom')}
              isSelected={selectedPadId === 'floor_tom'}
              showKeyHint={showKeysHint}
              onHit={() => triggerHit('floor_tom')}
              size="lg"
            />
          </div>
        </div>

        {/* The 2 Foot Pedals (Pedal de Chimbal e Pedal de Bumbo) with cables */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <div className="text-center mb-3">
            <span className="text-xs font-semibold text-zinc-400">
              PEDAIS DE CHÃO (Conectados por cabo P2 na entrada &quot;Pedal&quot;)
            </span>
          </div>

          <div className="flex justify-center gap-6 sm:gap-16">
            {/* Left Pedal: Hi-Hat */}
            <PedalButton
              piece={DRUM_PIECES.pedal_hihat}
              isHit={!!activeHits.pedal_hihat}
              isHighlighted={activeHighlightPads.includes('pedal_hihat')}
              isSelected={selectedPadId === 'pedal_hihat'}
              showKeyHint={showKeysHint}
              footLabel="Pé Esquerdo"
              onHit={() => triggerHit('pedal_hihat')}
            />

            {/* Right Pedal: Bass Drum */}
            <PedalButton
              piece={DRUM_PIECES.pedal_kick}
              isHit={!!activeHits.pedal_kick}
              isHighlighted={activeHighlightPads.includes('pedal_kick')}
              isSelected={selectedPadId === 'pedal_kick'}
              showKeyHint={showKeysHint}
              footLabel="Pé Direito"
              onHit={() => triggerHit('pedal_kick')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Fan-shaped Cymbal Component with acoustic waves matching the real product photo
interface FanCymbalProps {
  piece: (typeof DRUM_PIECES)[keyof typeof DRUM_PIECES];
  isHit: boolean;
  isHighlighted: boolean;
  isSelected: boolean;
  showKeyHint: boolean;
  onHit: () => void;
}

const FanCymbalPad: React.FC<FanCymbalProps> = ({
  piece,
  isHit,
  isHighlighted,
  isSelected,
  showKeyHint,
  onHit,
}) => {
  return (
    <button
      type="button"
      onClick={onHit}
      aria-label={`Tocar ${piece.name}`}
      className={`group relative flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-100 cursor-pointer active:scale-95 focus:outline-none ${
        isHit
          ? 'scale-95 brightness-150 filter'
          : isHighlighted
          ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-zinc-950 scale-105 shadow-lg shadow-amber-500/20'
          : isSelected
          ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-zinc-950'
          : 'hover:brightness-110'
      }`}
    >
      {/* Fan SVG Graphic with concentric white waves matching the product photo */}
      <div className="relative w-full aspect-[4/3] max-w-[150px] flex items-center justify-center">
        <svg
          viewBox="0 0 100 80"
          className={`w-full h-full drop-shadow-md transition-transform duration-75 ${
            isHit ? 'translate-y-0.5' : ''
          }`}
        >
          {/* Fan background silhouette */}
          <path
            d="M 50 10 L 88 55 A 50 50 0 0 1 12 55 Z"
            fill={isHit ? '#fef08a' : '#18181b'}
            stroke={isHit ? '#fde047' : '#ffffff'}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Center mount circle */}
          <circle cx="50" cy="18" r="4.5" fill={isHit ? '#f59e0b' : '#3f3f46'} stroke="#ffffff" strokeWidth="2" />

          {/* Acoustic concentric wave rings */}
          <path d="M 32 38 A 22 22 0 0 0 68 38" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 24 48 A 34 34 0 0 0 76 48" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 18 58 A 45 45 0 0 0 82 58" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        </svg>

        {/* Keyboard shortcut badge */}
        {showKeyHint && (
          <span className="absolute top-1 right-1 bg-black/80 text-amber-300 font-mono text-[10px] md:text-xs font-bold px-1.5 py-0.5 rounded border border-amber-500/40">
            {piece.keyboardDisplay}
          </span>
        )}
      </div>

      {/* Label under pad */}
      <span className="mt-1 text-[11px] md:text-xs font-semibold text-zinc-300 group-hover:text-white truncate max-w-full">
        {piece.shortName}
      </span>
      <span className="text-[9px] text-zinc-400 hidden sm:block truncate max-w-full">
        {piece.handOrFoot}
      </span>
    </button>
  );
};

// Circular Drum Pad Component with white ring matching product photo
interface CircleDrumPadProps {
  piece: (typeof DRUM_PIECES)[keyof typeof DRUM_PIECES];
  isHit: boolean;
  isHighlighted: boolean;
  isSelected: boolean;
  showKeyHint: boolean;
  onHit: () => void;
  size: 'md' | 'lg';
}

const CircleDrumPad: React.FC<CircleDrumPadProps> = ({
  piece,
  isHit,
  isHighlighted,
  isSelected,
  showKeyHint,
  onHit,
  size,
}) => {
  const sizeClasses =
    size === 'lg'
      ? 'w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32'
      : 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28';

  return (
    <button
      type="button"
      onClick={onHit}
      aria-label={`Tocar ${piece.name}`}
      className={`group relative flex flex-col items-center justify-center transition-all duration-100 cursor-pointer active:scale-95 focus:outline-none ${
        isHit ? 'scale-95' : isHighlighted ? 'scale-105' : 'hover:scale-[1.02]'
      }`}
    >
      <div
        className={`relative ${sizeClasses} rounded-full bg-zinc-950 flex items-center justify-center transition-all duration-75 ${
          isHit
            ? 'border-4 border-amber-300 bg-zinc-800 shadow-lg shadow-amber-400/40'
            : isHighlighted
            ? 'border-4 border-amber-400 shadow-xl shadow-amber-500/30'
            : isSelected
            ? 'border-4 border-cyan-400'
            : 'border-4 border-white'
        }`}
      >
        {/* Inner concentric ring matching the white rings in user image */}
        <div
          className={`w-[78%] h-[78%] rounded-full flex flex-col items-center justify-center transition-colors ${
            isHit ? 'bg-amber-100/20' : 'bg-zinc-900'
          }`}
        >
          <span className="text-[11px] sm:text-xs font-bold text-zinc-200 text-center px-1 leading-tight">
            {piece.shortName}
          </span>
          <span className="text-[9px] text-zinc-400 hidden sm:block">
            {piece.handOrFoot === 'Mão Esquerda' ? 'Mão E.' : piece.handOrFoot === 'Mão Direita' ? 'Mão D.' : 'Mãos'}
          </span>
        </div>

        {/* Keyboard shortcut hint */}
        {showKeyHint && (
          <span className="absolute top-1 right-1 bg-black/80 text-amber-300 font-mono text-[10px] font-bold px-1 py-0.5 rounded border border-amber-500/40">
            {piece.keyboardDisplay}
          </span>
        )}
      </div>

      <span className="mt-1 text-[11px] font-medium text-zinc-300 group-hover:text-white truncate">
        {piece.portugueseName}
      </span>
    </button>
  );
};

// Pedal Component with cable connector
interface PedalButtonProps {
  piece: (typeof DRUM_PIECES)[keyof typeof DRUM_PIECES];
  isHit: boolean;
  isHighlighted: boolean;
  isSelected: boolean;
  showKeyHint: boolean;
  footLabel: string;
  onHit: () => void;
}

const PedalButton: React.FC<PedalButtonProps> = ({
  piece,
  isHit,
  isHighlighted,
  isSelected,
  showKeyHint,
  footLabel,
  onHit,
}) => {
  return (
    <div className="flex flex-col items-center">
      {/* Cable graphic coming from the pad to the pedal */}
      <div className="w-1 h-6 bg-zinc-700 rounded-full mb-1" />

      <button
        type="button"
        onClick={onHit}
        aria-label={`Pressionar ${piece.name}`}
        className={`group relative w-24 sm:w-32 h-36 sm:h-44 bg-gradient-to-b from-zinc-800 to-zinc-950 rounded-2xl p-2.5 flex flex-col justify-between items-center border-2 shadow-xl transition-all duration-100 active:translate-y-1 active:scale-95 cursor-pointer focus:outline-none ${
          isHit
            ? 'border-amber-400 bg-zinc-700 shadow-amber-400/40 translate-y-1'
            : isHighlighted
            ? 'border-amber-400 ring-2 ring-amber-400 shadow-amber-500/30'
            : isSelected
            ? 'border-cyan-400'
            : 'border-zinc-700 hover:border-zinc-500'
        }`}
      >
        {/* Foot rest grip lines on pedal */}
        <div className="w-full flex justify-between items-center px-1">
          <span className="text-[10px] font-bold text-zinc-400">{footLabel}</span>
          {showKeyHint && (
            <span className="bg-black/70 text-amber-300 font-mono text-[9px] px-1 py-0.5 rounded border border-amber-500/30">
              {piece.keyboardDisplay}
            </span>
          )}
        </div>

        {/* Tread pattern */}
        <div className="w-full py-2 flex flex-col gap-1.5 items-center">
          <div className="w-4/5 h-1 bg-zinc-700 rounded" />
          <div className="w-4/5 h-1 bg-zinc-700 rounded" />
          <div className="w-4/5 h-1 bg-zinc-700 rounded" />
          <div className="w-4/5 h-1 bg-zinc-700 rounded" />
        </div>

        <div className="w-full text-center bg-black/40 rounded py-1 border border-zinc-800">
          <span className="text-xs font-bold text-zinc-200">{piece.shortName}</span>
        </div>
      </button>
    </div>
  );
};
