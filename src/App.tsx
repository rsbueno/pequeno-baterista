import React, { useState, useEffect, useCallback } from 'react';
import { DrumPadKit } from './components/DrumPadKit';
import { AcousticVsElectronicComparison } from './components/AcousticVsElectronicComparison';
import { LessonsRoadmap } from './components/LessonsRoadmap';
import { RhythmGame } from './components/RhythmGame';
import { FreePlayStudio } from './components/FreePlayStudio';
import { ParentsGuide } from './components/ParentsGuide';
import { CertificateModal } from './components/CertificateModal';
import {
  loadUserProgress,
  completeLesson,
  saveSongHighScore,
  saveRecordedBeat,
  deleteRecordedBeat,
  updateKidName,
} from './utils/storage';
import { UserProgress, PadId, RecordedBeat } from './types/drums';
import { soundEngine } from './audio/drumSoundEngine';
import {
  Award,
  BookOpen,
  ArrowLeftRight,
  Zap,
  Music2,
  HelpCircle,
  Star,
  Keyboard,
  User,
  Volume2,
  VolumeX,
} from 'lucide-react';

export default function App() {
  const [progress, setProgress] = useState<UserProgress>(loadUserProgress());
  const [activeTab, setActiveTab] = useState<'lessons' | 'comparison' | 'game' | 'studio' | 'parents'>('lessons');
  const [selectedPadId, setSelectedPadId] = useState<PadId>('snare');
  const [highlightPads, setHighlightPads] = useState<PadId[]>(['snare', 'hihat', 'kick_pad']);
  const [showKeysHint, setShowKeysHint] = useState<boolean>(true);
  const [showCertificate, setShowCertificate] = useState<boolean>(false);
  const [lastPadHit, setLastPadHit] = useState<PadId | null>(null);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>(progress.kidName);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Sync state with storage on mount
  useEffect(() => {
    const loaded = loadUserProgress();
    setProgress(loaded);
    setNameInput(loaded.kidName);
  }, []);

  const handlePadHit = useCallback((padId: PadId) => {
    setSelectedPadId(padId);
    setLastPadHit(padId);
    // Clear lastPadHit after a tick to allow re-triggers
    setTimeout(() => setLastPadHit(null), 50);
  }, []);

  const handleCompleteLesson = (lessonId: number) => {
    const updated = completeLesson(lessonId);
    setProgress(updated);
  };

  const handleSaveScore = (songId: string, score: number) => {
    const updated = saveSongHighScore(songId, score);
    setProgress(updated);
  };

  const handleSaveBeat = (beat: RecordedBeat) => {
    const updated = saveRecordedBeat(beat);
    setProgress(updated);
  };

  const handleDeleteBeat = (id: string) => {
    const updated = deleteRecordedBeat(id);
    setProgress(updated);
  };

  const handleSaveName = () => {
    const updated = updateKidName(nameInput);
    setProgress(updated);
    setIsEditingName(false);
  };

  const handleToggleMute = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Top Bar following Top Bar Contract: Zone 1 (Wordmark) - Zone 2 (4-5 Nav Links) - Zone 3 (1 Primary Action) */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20">
            🥁
          </div>
          <a
            href="/"
            className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-amber-400 transition-colors"
          >
            Pequeno Baterista
          </a>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <button
            onClick={() => setActiveTab('lessons')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-amber-400 ${
              activeTab === 'lessons' ? 'text-amber-400 border-b-2 border-amber-400 pb-0.5' : ''
            }`}
          >
            Aulas Passo a Passo
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-amber-400 ${
              activeTab === 'comparison' ? 'text-amber-400 border-b-2 border-amber-400 pb-0.5' : ''
            }`}
          >
            Bateria Real vs Silicone
          </button>
          <button
            onClick={() => setActiveTab('game')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-amber-400 ${
              activeTab === 'game' ? 'text-amber-400 border-b-2 border-amber-400 pb-0.5' : ''
            }`}
          >
            Jogo do Ritmo
          </button>
          <button
            onClick={() => setActiveTab('studio')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-amber-400 ${
              activeTab === 'studio' ? 'text-amber-400 border-b-2 border-amber-400 pb-0.5' : ''
            }`}
          >
            Estúdio & Gravação
          </button>
          <button
            onClick={() => setActiveTab('parents')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-amber-400 ${
              activeTab === 'parents' ? 'text-amber-400 border-b-2 border-amber-400 pb-0.5' : ''
            }`}
          >
            Guia dos Pais
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowCertificate(true)}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md shadow-amber-400/20 active:scale-95 flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Meu Certificado</span>
            <span className="ml-1 px-1.5 py-0.2 bg-slate-950/20 rounded-full text-[10px]">
              ★ {progress.starsCount}
            </span>
          </button>
        </div>
      </header>

      {/* Kid Profile Kicker & Stats Bar */}
      <section className="bg-slate-900 border-b border-slate-800/80 px-4 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">Baterista:</span>
            {isEditingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="bg-slate-800 text-white font-bold px-2 py-0.5 rounded text-xs border border-amber-400 focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded text-[11px]"
                >
                  OK
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingName(true)}
                className="font-bold text-white hover:text-amber-400 underline decoration-dotted decoration-amber-400 underline-offset-2"
                title="Clique para trocar o nome"
              >
                {progress.kidName} ✏️
              </button>
            )}
            <span className="text-slate-600 hidden sm:inline">·</span>
            <span className="text-slate-400 hidden sm:inline">Idade 7 Anos</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="font-bold text-white font-mono">{progress.starsCount}</span>
              <span className="text-[11px]">Estrelas</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-emerald-400">●</span>
              <span className="font-bold text-white font-mono">{progress.completedLessons.length}</span>
              <span className="text-[11px]">Aulas Feitas</span>
            </div>

            <button
              onClick={() => setShowKeysHint(!showKeysHint)}
              className={`hidden sm:flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-semibold transition-colors ${
                showKeysHint
                  ? 'bg-amber-400/10 text-amber-300 border-amber-400/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title="Mostrar ou ocultar letras do teclado nos pads"
            >
              <Keyboard className="w-3 h-3" />
              <span>Atalhos Teclado</span>
            </button>

            <button
              onClick={handleToggleMute}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors"
              title={isMuted ? 'Desmutar' : 'Silenciar'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-8">
        {/* Mobile Navigation Pills */}
        <div className="md:hidden flex overflow-x-auto gap-2 pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('lessons')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap ${
              activeTab === 'lessons' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Aulas Passo a Passo
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap ${
              activeTab === 'comparison' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Bateria Real vs Silicone
          </button>
          <button
            onClick={() => setActiveTab('game')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap ${
              activeTab === 'game' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Jogo do Ritmo
          </button>
          <button
            onClick={() => setActiveTab('studio')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap ${
              activeTab === 'studio' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Estúdio
          </button>
          <button
            onClick={() => setActiveTab('parents')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap ${
              activeTab === 'parents' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Guia dos Pais
          </button>
        </div>

        {/* Section 1: Interactive Drum Pad Kit (The center stage instrument) */}
        <section className="flex flex-col items-center">
          <div className="w-full text-center mb-3">
            <span className="text-xs font-bold tracking-wider uppercase text-amber-400">
              INSTRUMENTO EM TEMPO REAL
            </span>
            <h1 className="text-xl md:text-3xl font-extrabold text-white mt-0.5">
              Sua Bateria Eletrônica de Silicone (9 Pads &amp; 2 Pedais)
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl mx-auto">
              Clique nos pads, aperte as teclas do seu teclado ou use as baquetas na sua bateria física conectada!
            </p>
          </div>

          <DrumPadKit
            onPadHit={handlePadHit}
            activeHighlightPads={highlightPads}
            selectedPadId={selectedPadId}
            onSelectPad={(id) => setSelectedPadId(id)}
            showKeysHint={showKeysHint}
            className="w-full"
          />
        </section>

        {/* Section 2: Tabbed Area */}
        <section className="w-full">
          {activeTab === 'lessons' && (
            <LessonsRoadmap
              completedLessonIds={progress.completedLessons}
              onCompleteLesson={handleCompleteLesson}
              onSelectHighlightPads={(pads) => setHighlightPads(pads)}
            />
          )}

          {activeTab === 'comparison' && (
            <AcousticVsElectronicComparison
              selectedPadId={selectedPadId}
              onSelectPad={(id) => setSelectedPadId(id)}
            />
          )}

          {activeTab === 'game' && (
            <RhythmGame
              onSaveScore={handleSaveScore}
              highScores={progress.highScores}
              onPadHitFromParent={lastPadHit}
            />
          )}

          {activeTab === 'studio' && (
            <FreePlayStudio
              recordedBeats={progress.recordedBeats}
              onSaveBeat={handleSaveBeat}
              onDeleteBeat={handleDeleteBeat}
              lastHitPad={lastPadHit}
            />
          )}

          {activeTab === 'parents' && <ParentsGuide />}
        </section>
      </main>

      {/* Certificate Modal */}
      {showCertificate && (
        <CertificateModal
          kidName={progress.kidName}
          onUpdateKidName={(name) => {
            const updated = updateKidName(name);
            setProgress(updated);
          }}
          completedCount={progress.completedLessons.length}
          onClose={() => setShowCertificate(false)}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 px-4 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            Pequeno Baterista · Feito com carinho para ensinar crianças a tocarem bateria na prática!
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>9 Pads</span>
            <span>·</span>
            <span>2 Pedais</span>
            <span>·</span>
            <span>Sem backend (100% no seu navegador)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
