import React, { useState, useEffect, useRef } from 'react';
import { soundEngine } from '../audio/drumSoundEngine';
import { DRUM_PIECES } from '../data/drumPieces';
import { RecordedBeat, PadId } from '../types/drums';
import {
  Mic,
  Square,
  Play,
  Trash2,
  Sliders,
  Music2,
  Clock,
  Sparkles,
  Volume2,
} from 'lucide-react';

interface Props {
  recordedBeats: RecordedBeat[];
  onSaveBeat: (beat: RecordedBeat) => void;
  onDeleteBeat: (id: string) => void;
  lastHitPad?: PadId | null;
}

export const FreePlayStudio: React.FC<Props> = ({
  recordedBeats,
  onSaveBeat,
  onDeleteBeat,
  lastHitPad,
}) => {
  // Metronome State
  const [metronomeRunning, setMetronomeRunning] = useState(false);
  const [bpm, setBpm] = useState(85);
  const [metronomeBeat, setMetronomeBeat] = useState(1);

  // Backing Track State
  const [activeBacking, setActiveBacking] = useState<'rock' | 'pop' | 'funk' | null>(null);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);
  const [recordedEvents, setRecordedEvents] = useState<{ padId: PadId; timeMs: number }[]>([]);
  const [playbackBeatId, setPlaybackBeatId] = useState<string | null>(null);
  const [customTitle, setCustomTitle] = useState('');

  const metronomeTimerRef = useRef<number | null>(null);
  const playbackTimeoutsRef = useRef<number[]>([]);

  // Metronome loop
  useEffect(() => {
    if (metronomeRunning) {
      const intervalMs = (60 / bpm) * 1000;
      let count = 1;

      soundEngine.playMetronomeClick(true);
      setMetronomeBeat(1);

      metronomeTimerRef.current = window.setInterval(() => {
        count = count >= 4 ? 1 : count + 1;
        setMetronomeBeat(count);
        soundEngine.playMetronomeClick(count === 1);
      }, intervalMs);
    } else {
      if (metronomeTimerRef.current) {
        clearInterval(metronomeTimerRef.current);
        metronomeTimerRef.current = null;
      }
    }

    return () => {
      if (metronomeTimerRef.current) clearInterval(metronomeTimerRef.current);
    };
  }, [metronomeRunning, bpm]);

  // Clean up backing on unmount
  useEffect(() => {
    return () => {
      soundEngine.stopBackingTrack();
      playbackTimeoutsRef.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  // Listen to pad hits when recording
  useEffect(() => {
    if (isRecording && lastHitPad) {
      const elapsed = performance.now() - recordingStartTime;
      setRecordedEvents((prev) => [...prev, { padId: lastHitPad, timeMs: elapsed }]);
    }
  }, [lastHitPad, isRecording, recordingStartTime]);

  const handleStartRecording = () => {
    setRecordedEvents([]);
    setRecordingStartTime(performance.now());
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    const duration = performance.now() - recordingStartTime;

    if (recordedEvents.length === 0) return;

    const newBeat: RecordedBeat = {
      id: 'beat-' + Date.now(),
      title: customTitle.trim() || `Batida de Rock #${recordedBeats.length + 1}`,
      createdAt: new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      durationMs: Math.round(duration),
      events: recordedEvents,
    };

    onSaveBeat(newBeat);
    setCustomTitle('');
  };

  const handlePlayRecordedBeat = (beat: RecordedBeat) => {
    playbackTimeoutsRef.current.forEach((t) => clearTimeout(t));
    playbackTimeoutsRef.current = [];
    setPlaybackBeatId(beat.id);

    beat.events.forEach((ev) => {
      const t = window.setTimeout(() => {
        soundEngine.triggerPad(ev.padId);
      }, ev.timeMs);
      playbackTimeoutsRef.current.push(t);
    });

    const finishTimeout = window.setTimeout(() => {
      setPlaybackBeatId(null);
    }, beat.durationMs + 200);
    playbackTimeoutsRef.current.push(finishTimeout);
  };

  const handleStopPlayback = () => {
    playbackTimeoutsRef.current.forEach((t) => clearTimeout(t));
    playbackTimeoutsRef.current = [];
    setPlaybackBeatId(null);
  };

  const handleToggleBacking = (style: 'rock' | 'pop' | 'funk') => {
    if (activeBacking === style) {
      soundEngine.stopBackingTrack();
      setActiveBacking(null);
    } else {
      soundEngine.startBackingTrack(style, bpm);
      setActiveBacking(style);
    }
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-4 md:p-8 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold tracking-wider uppercase mb-1">
            <Music2 className="w-4 h-4" />
            <span>Estúdio & Gravação</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white">
            Som Livre e Acompanhamento
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Toque à vontade com metrônomo, bandas de fundo e grave seus solos como no estúdio profissional!
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Metronome & Backing Tracks Column */}
        <div className="lg:col-span-6 bg-slate-800/80 rounded-2xl p-5 border border-slate-700 flex flex-col justify-between">
          <div>
            {/* Metronome section */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-bold text-white">Metrônomo do Baterista</h3>
              </div>
              <button
                onClick={() => setMetronomeRunning(!metronomeRunning)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 ${
                  metronomeRunning
                    ? 'bg-rose-500 hover:bg-rose-600 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                {metronomeRunning ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{metronomeRunning ? 'Parar' : 'Ligar Metrônomo'}</span>
              </button>
            </div>

            {/* Tempo Slider */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span>Velocidade do Ritmo:</span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {bpm} BPM
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="160"
                step="5"
                value={bpm}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setBpm(val);
                  if (activeBacking) {
                    soundEngine.startBackingTrack(activeBacking, val);
                  }
                }}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>Lento (40)</span>
                <span>Normal (85)</span>
                <span>Rápido (160)</span>
              </div>
            </div>

            {/* Visual Beat Indicator (1, 2, 3, 4) */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {[1, 2, 3, 4].map((beat) => {
                const isActive = metronomeRunning && metronomeBeat === beat;
                return (
                  <div
                    key={beat}
                    className={`py-2 rounded-xl text-center text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 scale-105 shadow-md shadow-amber-400/30'
                        : 'bg-slate-900/60 text-slate-500 border border-slate-800'
                    }`}
                  >
                    Tempo {beat}
                  </div>
                );
              })}
            </div>

            {/* Backing Tracks Section */}
            <div className="pt-4 border-t border-slate-700">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                Bandas de Acompanhamento (Toque Junto!):
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleToggleBacking('rock')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1 ${
                    activeBacking === 'rock'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <span>🎸 Rock Básico</span>
                  <span className="text-[10px] font-normal opacity-80">
                    {activeBacking === 'rock' ? 'Tocando...' : 'Iniciar'}
                  </span>
                </button>

                <button
                  onClick={() => handleToggleBacking('pop')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1 ${
                    activeBacking === 'pop'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <span>🎹 Pop Feliz</span>
                  <span className="text-[10px] font-normal opacity-80">
                    {activeBacking === 'pop' ? 'Tocando...' : 'Iniciar'}
                  </span>
                </button>

                <button
                  onClick={() => handleToggleBacking('funk')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1 ${
                    activeBacking === 'funk'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <span>🎷 Funk Groove</span>
                  <span className="text-[10px] font-normal opacity-80">
                    {activeBacking === 'funk' ? 'Tocando...' : 'Iniciar'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recorder Column */}
        <div className="lg:col-span-6 bg-slate-800/80 rounded-2xl p-5 border border-slate-700 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-rose-400" />
                <h3 className="text-base font-bold text-white">Gravador de Ritmos</h3>
              </div>
              <span className="text-xs text-slate-400">
                {recordedBeats.length} {recordedBeats.length === 1 ? 'música salva' : 'músicas salvas'}
              </span>
            </div>

            {/* Record Trigger Controls */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Nome do seu ritmo (ex: Meu Primeiro Rock)"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />

                {isRecording ? (
                  <button
                    onClick={handleStopRecording}
                    className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-rose-500/20 active:scale-95 transition-all"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Salvar Gravação</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStartRecording}
                    className="px-4 py-2 bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white border border-rose-500/40 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Gravar (REC)</span>
                  </button>
                )}
              </div>

              {isRecording && (
                <div className="flex items-center justify-between text-xs text-rose-300 animate-pulse">
                  <span>Gravando notas tocadas na bateria...</span>
                  <span className="font-mono font-bold">{recordedEvents.length} batidas</span>
                </div>
              )}
            </div>

            {/* Saved Recordings List */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Meus Ritmos Salvos no Navegador:
              </span>

              {recordedBeats.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400">
                  Nenhum ritmo gravado ainda. Aperte o botão &quot;Gravar&quot; acima e comece a tocar na bateria!
                </div>
              ) : (
                recordedBeats.map((beat) => {
                  const isCurrentPlaying = playbackBeatId === beat.id;

                  return (
                    <div
                      key={beat.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300"
                    >
                      <div className="flex flex-col truncate pr-2">
                        <span className="font-bold text-white truncate">{beat.title}</span>
                        <span className="text-[10px] text-slate-400">
                          {beat.createdAt} · {Math.round(beat.durationMs / 1000)}s ({beat.events.length} batidas)
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {isCurrentPlaying ? (
                          <button
                            onClick={handleStopPlayback}
                            className="p-1.5 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400"
                            title="Parar reprodução"
                          >
                            <Square className="w-3.5 h-3.5 fill-current" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handlePlayRecordedBeat(beat)}
                            className="p-1.5 rounded-lg bg-slate-800 text-amber-400 hover:bg-slate-700"
                            title="Ouvir gravação"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                        )}

                        <button
                          onClick={() => onDeleteBeat(beat.id)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700"
                          title="Excluir gravação"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
