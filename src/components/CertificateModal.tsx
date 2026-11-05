import React, { useRef } from 'react';
import { Award, Star, Printer, X, Sparkles } from 'lucide-react';

interface Props {
  kidName: string;
  onUpdateKidName: (name: string) => void;
  onClose: () => void;
  completedCount: number;
}

export const CertificateModal: React.FC<Props> = ({
  kidName,
  onUpdateKidName,
  onClose,
  completedCount,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 sm:p-10 shadow-2xl text-slate-100 flex flex-col items-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 transition-colors"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Printable Certificate Frame */}
        <div
          ref={printRef}
          className="w-full bg-gradient-to-b from-amber-50 via-white to-amber-50 text-slate-900 rounded-2xl p-6 sm:p-8 border-8 border-double border-amber-600 shadow-inner flex flex-col items-center text-center relative"
        >
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-2 left-2 text-amber-600 text-lg">★</div>
          <div className="absolute top-2 right-2 text-amber-600 text-lg">★</div>
          <div className="absolute bottom-2 left-2 text-amber-600 text-lg">★</div>
          <div className="absolute bottom-2 right-2 text-amber-600 text-lg">★</div>

          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-white flex items-center justify-center shadow-md mb-2">
            <Award className="w-10 h-10" />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
            Escola dos Pequenos Bateristas
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1 mb-2 font-serif">
            Certificado de Baterista Júnior
          </h1>

          <div className="w-24 h-0.5 bg-amber-500 mb-4" />

          <p className="text-xs sm:text-sm text-slate-700 max-w-md mb-2">
            Certificamos com muito orgulho que o jovem músico:
          </p>

          {/* Kid Name Input/Display */}
          <div className="w-full max-w-sm mb-3">
            <input
              type="text"
              value={kidName}
              onChange={(e) => onUpdateKidName(e.target.value)}
              placeholder="Digite o nome do baterista"
              className="w-full text-center font-bold text-xl sm:text-2xl text-amber-900 border-b-2 border-amber-500 bg-transparent py-1 px-2 focus:outline-none focus:border-amber-700 font-serif"
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              (Clique acima para editar o nome da criança)
            </span>
          </div>

          <p className="text-xs text-slate-700 max-w-lg mb-4 leading-relaxed">
            concluiu com dedicação e alegria os módulos práticos da{' '}
            <strong>Bateria Eletrônica de Silicone 9-Pads</strong>, dominando o ritmo dos pés e das mãos, a batida clássica de Rock, o chimbal e as viradas pelos tambores!
          </p>

          {/* Stars & Seal */}
          <div className="flex items-center gap-1 text-amber-500 mb-4">
            <Star className="w-5 h-5 fill-current" />
            <Star className="w-5 h-5 fill-current" />
            <Star className="w-5 h-5 fill-current" />
            <Star className="w-5 h-5 fill-current" />
            <Star className="w-5 h-5 fill-current" />
          </div>

          {/* Date & Signature */}
          <div className="w-full flex justify-between items-end pt-4 border-t border-amber-300 text-xs text-slate-600">
            <div className="text-left">
              <span>Data de Conquista:</span>
              <div className="font-semibold text-slate-800">{todayStr}</div>
            </div>
            <div className="text-right">
              <div className="font-serif font-bold text-amber-900 italic text-sm">
                Professor Ritmo
              </div>
              <span className="text-[10px] text-slate-500">Mestre Baterista</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-5 flex flex-wrap gap-3 justify-center">
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Certificado</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
          >
            Voltar para a Bateria
          </button>
        </div>
      </div>
    </div>
  );
};
