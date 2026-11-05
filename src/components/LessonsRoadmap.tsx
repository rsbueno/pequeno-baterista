import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { LESSONS } from '../data/lessonsData';
import { DRUM_PIECES } from '../data/drumPieces';
import { LessonStep, PadId } from '../types/drums';
import { soundEngine } from '../audio/drumSoundEngine';
import {
  Play,
  Pause,
  Award,
  Sparkles,
  Lock,
  CheckCircle2,
  Volume2,
  ChevronRight,
  RotateCcw,
  Star,
} from 'lucide-react';

interface Props {
  completedLessonIds: number[];
  onCompleteLesson: (lessonId: number) => void;
  onSelectHighlightPads: (pads: PadId[]) => void;
}

export const LessonsRoadmap: React.FC<Props> = ({
  completedLessonIds,
  onCompleteLesson,
  onSelectHighlightPads,
}) => {
  const [selectedLessonId, setSelectedLessonId] = useState<number>(1);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [isPracticing, setIsPracticing] = useState(false);
  const [currentBeatStep, setCurrentBeatStep] = useState<number>(0); // 0 to 3
  const [practiceSuccessRounds, setPracticeSuccessRounds] = useState<number>(0);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'miss' | 'info' } | null>(null);

  const activeLesson = LESSONS.find((l) => l.id === selectedLessonId) || LESSONS[0];
  const demoIntervalRef = useRef<number | null>(null);

  // Sync highlighted pads on the silicone drum when changing lessons
  useEffect(() => {
    onSelectHighlightPads(activeLesson.focusPads);
  }, [activeLesson, onSelectHighlightPads]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (demoIntervalRef.current) clearInterval(demoIntervalRef.current);
    };
  }, []);

  const stopPlayback = useCallback(() => {
    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current);
      demoIntervalRef.current = null;
    }
    setIsPlayingDemo(false);
    setIsPracticing(false);
    setCurrentBeatStep(0);
  }, []);

  // Play audio demo loop
  const handleToggleDemo = () => {
    if (isPlayingDemo) {
      stopPlayback();
      return;
    }
    stopPlayback();
    setIsPlayingDemo(true);
    setFeedbackMsg({ text: 'Ouvindo a demonstração... Preste atenção no ritmo!', type: 'info' });

    const bpm = activeLesson.bpm;
    const intervalMs = (60 / bpm) * 1000;
    let beat = 1;

    // Trigger immediate first beat
    triggerDemoBeat(1, activeLesson);
    setCurrentBeatStep(0);

    demoIntervalRef.current = window.setInterval(() => {
      beat = beat >= 4 ? 1 : beat + 1;
      setCurrentBeatStep(beat - 1);
      triggerDemoBeat(beat, activeLesson);
    }, intervalMs);
  };

  const triggerDemoBeat = (beatNum: number, lesson: LessonStep) => {
    soundEngine.playMetronomeClick(beatNum === 1);
    const notesForBeat = lesson.rhythmGrid.filter((n) => n.beat === beatNum);
    notesForBeat.forEach((note) => {
      soundEngine.triggerPad(note.padId);
    });
  };

  // Start guided practice mode
  const handleTogglePractice = () => {
    if (isPracticing) {
      stopPlayback();
      return;
    }
    stopPlayback();
    setIsPracticing(true);
    setPracticeSuccessRounds(0);
    setFeedbackMsg({ text: 'Sua vez! Toque as peças indicadas quando o marcador passar.', type: 'info' });

    const bpm = activeLesson.bpm;
    const intervalMs = (60 / bpm) * 1000;
    let beat = 1;
    let roundCount = 0;

    soundEngine.playMetronomeClick(true);
    setCurrentBeatStep(0);

    demoIntervalRef.current = window.setInterval(() => {
      beat = beat >= 4 ? 1 : beat + 1;
      setCurrentBeatStep(beat - 1);
      soundEngine.playMetronomeClick(beat === 1);

      if (beat === 1) {
        roundCount++;
        setPracticeSuccessRounds((prev) => {
          const next = prev + 1;
          if (next >= lesson.challengeRounds) {
            handleCompleteChallenge();
          }
          return next;
        });
      }
    }, intervalMs);
  };

  const handleCompleteChallenge = () => {
    stopPlayback();
    onCompleteLesson(activeLesson.id);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore if confetti fails
    }

    setFeedbackMsg({
      text: 'PARABÉNS! Você completou este desafio com sucesso! +3 Estrelas ganhas! ⭐⭐⭐',
      type: 'success',
    });
  };

  const lesson = activeLesson;
  const isCompleted = completedLessonIds.includes(lesson.id);

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-4 md:p-8 shadow-xl">
      {/* Top Title & Stepper Roadmap */}
      <div className="pb-6 border-b border-slate-800">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold tracking-wider uppercase mb-1">
          <Award className="w-4 h-4" />
          <span>Aulas Passo a Passo</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Trilha da Aventura do Baterista Mirim
            </h2>
            <p className="text-sm text-slate-400">
              8 missões divertidas criadas especialmente para quem está começando do zero aos 7 anos!
            </p>
          </div>
          <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs font-semibold bg-amber-400/10 text-amber-300 px-3 py-1.5 rounded-xl border border-amber-400/20">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>
              {completedLessonIds.length} de {LESSONS.length} Concluídas
            </span>
          </div>
        </div>

        {/* 8-Stage Step Indicator */}
        <div className="mt-5 grid grid-cols-4 sm:grid-cols-8 gap-2">
          {LESSONS.map((l) => {
            const isUnlocked = completedLessonIds.includes(l.id) || completedLessonIds.includes(l.id - 1) || l.id === 1;
            const isDone = completedLessonIds.includes(l.id);
            const isCurrent = l.id === selectedLessonId;

            return (
              <button
                key={l.id}
                onClick={() => {
                  stopPlayback();
                  setSelectedLessonId(l.id);
                }}
                className={`relative flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-lg shadow-amber-500/20'
                    : isDone
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/40'
                    : isUnlocked
                    ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    : 'bg-slate-900/60 text-slate-600 border-slate-800 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-[11px] font-bold">Nível {l.id}</span>
                  {isDone ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ) : !isUnlocked ? (
                    <Lock className="w-2.5 h-2.5 text-slate-500" />
                  ) : null}
                </div>
                <span className="text-[10px] truncate max-w-full">
                  {l.id === 1
                    ? 'Início'
                    : l.id === 2
                    ? 'Chimbal'
                    : l.id === 3
                    ? 'Bumbo'
                    : l.id === 4
                    ? 'Caixa'
                    : l.id === 5
                    ? 'Rock 1'
                    : l.id === 6
                    ? 'Viradas'
                    : l.id === 7
                    ? 'Ride'
                    : 'Show!'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Lesson Content Container */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Lesson Details, Story, and Step Instructions */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                {lesson.badge}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Dificuldade: {lesson.level} · {lesson.bpm} BPM
              </span>
              {isCompleted && (
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2.5 py-0.5 rounded-full border border-emerald-400/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Missão Conquistada!
                </span>
              )}
            </div>

            <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
              {lesson.title}
            </h3>
            <p className="text-sm text-amber-300/90 font-medium mb-4">
              {lesson.subtitle}
            </p>

            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 mb-4 text-xs md:text-sm text-slate-300 leading-relaxed">
              <p>{lesson.story}</p>
            </div>

            {/* Step-by-step tips list */}
            <div className="space-y-2 mb-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Dicas Práticas do Professor:
              </span>
              <div className="space-y-1.5">
                {lesson.tips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300"
                  >
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[11px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Bar: Action buttons and navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2">
              {lesson.id > 1 && (
                <button
                  onClick={() => {
                    stopPlayback();
                    setSelectedLessonId(lesson.id - 1);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                >
                  ← Lição Anterior
                </button>
              )}
              {lesson.id < LESSONS.length && (
                <button
                  onClick={() => {
                    stopPlayback();
                    setSelectedLessonId(lesson.id + 1);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors flex items-center gap-1"
                >
                  <span>Próxima Lição</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {!isCompleted && (
              <button
                onClick={handleCompleteChallenge}
                className="px-3.5 py-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-700/60 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Marcar como Concluída</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Visual Rhythm Grid & Interactive Trainer */}
        <div className="lg:col-span-5 bg-slate-800/60 rounded-2xl p-5 border border-slate-700 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Pauta Rítmica Visual (Compasso 4/4)
              </span>
              <span className="text-xs font-mono text-amber-400 bg-black/40 px-2 py-0.5 rounded border border-slate-700">
                {lesson.bpm} BPM
              </span>
            </div>

            {/* 4-Beat Bar Display */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[1, 2, 3, 4].map((beat) => {
                const isCurrent = (isPlayingDemo || isPracticing) && currentBeatStep === beat - 1;
                const notes = lesson.rhythmGrid.filter((n) => n.beat === beat);

                return (
                  <div
                    key={beat}
                    className={`flex flex-col items-center rounded-xl p-2.5 transition-all duration-100 border ${
                      isCurrent
                        ? 'bg-amber-400 text-slate-950 border-amber-300 scale-105 shadow-lg shadow-amber-400/30'
                        : 'bg-slate-900/80 text-white border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-mono font-bold mb-1">
                      Tempo {beat}
                    </span>

                    <div className="w-full flex flex-col gap-1 min-h-[50px] justify-center items-center">
                      {notes.length > 0 ? (
                        notes.map((n, i) => {
                          const piece = DRUM_PIECES[n.padId];
                          return (
                            <span
                              key={i}
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-center w-full truncate ${
                                isCurrent
                                  ? 'bg-slate-900 text-amber-300'
                                  : 'bg-slate-800 text-amber-400 border border-slate-700'
                              }`}
                            >
                              {piece?.shortName || n.padId}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">
                          pausa
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Focus Pads for this lesson */}
            <div className="mb-4 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                Peças ativadas nesta aula:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {lesson.focusPads.map((padId) => {
                  const piece = DRUM_PIECES[padId];
                  return (
                    <button
                      key={padId}
                      onClick={() => soundEngine.triggerPad(padId)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-1 active:scale-95"
                    >
                      <Volume2 className="w-3 h-3 text-amber-400" />
                      <span>{piece?.shortName}</span>
                      <span className="text-[9px] text-amber-400/90 font-mono">
                        [{piece?.keyboardDisplay}]
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback Message */}
            {feedbackMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-medium mb-4 flex items-center gap-2 ${
                  feedbackMsg.type === 'success'
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700'
                    : 'bg-amber-950/40 text-amber-300 border border-amber-800'
                }`}
              >
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                <span>{feedbackMsg.text}</span>
              </div>
            )}
          </div>

          {/* Player Controls for Lesson */}
          <div className="space-y-2 pt-2 border-t border-slate-700">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleToggleDemo}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                  isPlayingDemo
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg'
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
              >
                {isPlayingDemo ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlayingDemo ? 'Pausar Áudio' : 'Ouvir Como Fica'}</span>
              </button>

              <button
                onClick={handleTogglePractice}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                  isPracticing
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-lg'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                {isPracticing ? <RotateCcw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                <span>{isPracticing ? 'Parar Treino' : 'Sua Vez de Tocar!'}</span>
              </button>
            </div>

            {isPracticing && (
              <div className="flex items-center justify-between text-xs px-2 py-1 bg-slate-900 rounded-lg text-slate-300">
                <span>Rodadas completas:</span>
                <span className="font-mono font-bold text-amber-400">
                  {practiceSuccessRounds} / {lesson.challengeRounds}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
