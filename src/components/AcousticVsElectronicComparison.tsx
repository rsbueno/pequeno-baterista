import React, { useState } from 'react';
import { DRUM_PIECES } from '../data/drumPieces';
import { PadId } from '../types/drums';
import { soundEngine } from '../audio/drumSoundEngine';
import { Volume2, Sparkles, Layers, ArrowLeftRight, CheckCircle2 } from 'lucide-react';

interface Props {
  selectedPadId: PadId;
  onSelectPad: (padId: PadId) => void;
}

// Hotspot coordinates on the acoustic drum kit image (percentages x, y)
const ACOUSTIC_HOTSPOTS: {
  padId: PadId;
  label: string;
  top: string;
  left: string;
}[] = [
  { padId: 'crash1', label: 'Crash 1', top: '15%', left: '33%' },
  { padId: 'hihat', label: 'Chimbal', top: '32%', left: '25%' },
  { padId: 'tom1', label: 'Tom 1', top: '36%', left: '44%' },
  { padId: 'tom2', label: 'Tom 2', top: '36%', left: '57%' },
  { padId: 'ride', label: 'Ride', top: '23%', left: '80%' },
  { padId: 'crash2', label: 'Crash 2', top: '15%', left: '64%' },
  { padId: 'snare', label: 'Caixa', top: '50%', left: '39%' },
  { padId: 'kick_pad', label: 'Bumbo', top: '65%', left: '51%' },
  { padId: 'floor_tom', label: 'Surdo', top: '60%', left: '69%' },
  { padId: 'pedal_hihat', label: 'Pedal Chimbal', top: '88%', left: '29%' },
  { padId: 'pedal_kick', label: 'Pedal Bumbo', top: '85%', left: '51%' },
];

export const AcousticVsElectronicComparison: React.FC<Props> = ({
  selectedPadId,
  onSelectPad,
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'differences'>('visual');
  const currentPiece = DRUM_PIECES[selectedPadId] || DRUM_PIECES.snare;

  const handleSelect = (id: PadId) => {
    onSelectPad(id);
    soundEngine.triggerPad(id);
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-4 md:p-8 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold tracking-wider uppercase mb-1">
            <ArrowLeftRight className="w-4 h-4" />
            <span>Comparador Interativo</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white">
            Sua Bateria de Silicone vs. Bateria Acústica Real
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Clique nas peças abaixo para descobrir como cada pad se transforma em um instrumento de verdade no palco!
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('visual')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'visual'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Explorador Visual
          </button>
          <button
            onClick={() => setActiveTab('differences')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'differences'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Super Vantagens
          </button>
        </div>
      </div>

      {activeTab === 'visual' ? (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Acoustic Drum Real Photo with Interactive Hotspots */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="relative rounded-2xl overflow-hidden border-2 border-slate-700 bg-black aspect-[16/9] shadow-2xl">
              <img
                src="/assets/images/acoustic_drum_kit.jpg"
                alt="Bateria Acústica de Palco Real"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />

              {/* Contrast Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

              <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Bateria Acústica Real de Palco</span>
              </div>

              {/* Hotspots */}
              {ACOUSTIC_HOTSPOTS.map((hotspot) => {
                const isCurrent = hotspot.padId === selectedPadId;
                return (
                  <button
                    key={hotspot.padId}
                    type="button"
                    onClick={() => handleSelect(hotspot.padId)}
                    style={{ top: hotspot.top, left: hotspot.left }}
                    aria-label={`Ver ${hotspot.label}`}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-150 group z-10 ${
                      isCurrent ? 'scale-125 z-20' : 'hover:scale-110'
                    }`}
                  >
                    <span
                      className={`relative flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full font-bold text-xs shadow-lg transition-all ${
                        isCurrent
                          ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-300 ring-offset-2 ring-offset-black animate-bounce'
                          : 'bg-black/80 text-white border-2 border-amber-400/80 hover:bg-amber-400 hover:text-black'
                      }`}
                    >
                      {isCurrent ? '★' : '●'}
                    </span>
                    <span
                      className={`absolute top-full mt-1 left-1/2 -translate-x-1/2 text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap shadow-md pointer-events-none transition-opacity ${
                        isCurrent
                          ? 'bg-amber-400 text-slate-950 opacity-100'
                          : 'bg-black/90 text-white opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {hotspot.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selector Pills below photo */}
            <div className="flex flex-wrap gap-1.5">
              {Object.values(DRUM_PIECES).map((piece) => {
                const isSelected = piece.id === selectedPadId;
                return (
                  <button
                    key={piece.id}
                    onClick={() => handleSelect(piece.id)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-md'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {piece.shortName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Comparative Explanation Card for Kids */}
          <div className="lg:col-span-5 bg-slate-800/80 rounded-2xl p-5 border border-slate-700 flex flex-col justify-between">
            <div>
              {/* Badge & Title */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  {currentPiece.kidFriendlyNickname}
                </span>
                <button
                  onClick={() => soundEngine.triggerPad(currentPiece.id)}
                  className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-md active:scale-95"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Ouvir Som</span>
                </button>
              </div>

              <h3 className="text-xl font-bold text-white mb-1">
                {currentPiece.name}
              </h3>
              <p className="text-xs text-amber-300/90 font-medium mb-4">
                Na Bateria Acústica: {currentPiece.realDrumEquivalent}
              </p>

              {/* Explanatory blocks */}
              <div className="space-y-3.5 text-xs leading-relaxed text-slate-300">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60">
                  <div className="flex items-center gap-1.5 text-slate-200 font-bold mb-1">
                    <span className="text-amber-400">🥁</span>
                    <span>Como é na Bateria Real de Palco:</span>
                  </div>
                  <p className="text-slate-300">{currentPiece.realDrumDescription}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60">
                  <div className="flex items-center gap-1.5 text-slate-200 font-bold mb-1">
                    <span className="text-cyan-400">⚡</span>
                    <span>Na Sua Bateria de Silicone:</span>
                  </div>
                  <p className="text-slate-300">
                    {currentPiece.category === 'pedal'
                      ? 'É o pedal preto conectado pelo cabo no chão. Pise com o pé indicado!'
                      : currentPiece.shape === 'fan'
                      ? 'É um dos pads superiores com desenho em forma de leque e ondas sonoras brancas!'
                      : 'É um dos pads redondos com anel branco no centro do tapete de silicone.'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/20">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Dica de Ouro para Você:</span>
                  </div>
                  <p className="text-amber-100/90">{currentPiece.howToPlayTip}</p>
                </div>
              </div>
            </div>

            {/* Footer with Hand/Foot guide */}
            <div className="mt-5 pt-4 border-t border-slate-700 flex items-center justify-between text-xs">
              <span className="text-slate-400">Qual membro usar:</span>
              <span className="font-bold text-white bg-slate-700 px-2.5 py-1 rounded-md">
                {currentPiece.handOrFoot}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Differences & Advantages tab */
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl flex flex-col gap-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg mb-2">
              🎧
            </div>
            <h3 className="font-bold text-white text-base">Treino Silencioso com Fones</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Uma bateria acústica real faz um som tão alto quanto um trovão e não dá para tocar de noite. Na sua bateria de silicone, você pode plugar um fone de ouvido de celular e tocar a qualquer hora sem incomodar ninguém na casa!
            </p>
            <div className="mt-auto pt-3 border-t border-slate-700/60 flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Super poder do pequeno baterista</span>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl flex flex-col gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg mb-2">
              🎒
            </div>
            <h3 className="font-bold text-white text-base">Enrola e Cabe na Mochila</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Uma bateria tradicional de madeira pesa mais de 40 kg e ocupa metade de um quarto! A sua bateria de silicone é flexível, à prova de respingos, enrola em formato de rocambole e você pode levar para a casa dos avós ou amigos.
            </p>
            <div className="mt-auto pt-3 border-t border-slate-700/60 flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>100% Portátil e Leve</span>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl flex flex-col gap-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-lg mb-2">
              🎯
            </div>
            <h3 className="font-bold text-white text-base">Mesma Posição da Bateria Real</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tudo o que você aprender nesta bateria de silicone vai funcionar exatamente igual quando você sentar numa bateria de verdade em uma aula ou show! O pé direito chuta o bumbo, a mão esquerda estala a caixa e a direita conduz o chimbal.
            </p>
            <div className="mt-auto pt-3 border-t border-slate-700/60 flex items-center gap-1.5 text-cyan-400 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Técnica 100% profissional</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
