import React from 'react';
import {
  HelpCircle,
  Headphones,
  Sliders,
  HeartHandshake,
  CheckCircle2,
  Plug,
  ShieldCheck,
} from 'lucide-react';

export const ParentsGuide: React.FC = () => {
  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-4 md:p-8 shadow-xl">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold tracking-wider uppercase mb-1">
          <HelpCircle className="w-4 h-4" />
          <span>Manual Prático para os Pais</span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-white">
          Guia de Apoio para Pais: Bateria de Silicone 9-Pads
        </h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Tudo o que você precisa saber para configurar o instrumento do seu filho de 7 anos e garantir um aprendizado leve, divertido e seguro!
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Setup físico e conexões */}
        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Plug className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">
                1. Conexões e Cabos da Bateria
              </h3>
            </div>

            <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Pedais de Chão:</strong> O cabo duplo dos dois pedais pretos termina em um plugue P2 (3.5mm). Conecte-o com firmeza na entrada rotulada como <strong>&quot;PEDAL&quot;</strong> na parte traseira da caixinha de controle.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Energia e Bateria:</strong> Conecte o cabo USB incluso em qualquer carregador de celular comum (5V 1A/2A) ou porta USB. A maioria dos modelos possui bateria de lítio interna que dura várias horas de toque contínuo.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Fones de Ouvido:</strong> Conecte fones comuns na entrada <strong>&quot;PHONE&quot;</strong>. Os alto-falantes embutidos desligam automaticamente, permitindo que a criança treine a qualquer hora sem barulho para os vizinhos!
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Card 2: Postura e Ergonomia para 7 anos */}
        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">
                2. Postura e Altura Ideal (7 Anos)
              </h3>
            </div>

            <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Apoio dos Pés:</strong> Para uma criança de 7 anos, se a cadeira for alta e os pezinhos ficarem no ar, coloque um apoio firme (livros empilhados ou banquinho baixo) no chão onde os pedais ficam apoiados.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Altura dos Braços:</strong> A bateria de silicone deve ficar sobre uma mesa em que os antebraços fiquem quase horizontais ao tocar a Caixa e o Bumbo (ângulo de cerca de 90° nos cotovelos).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Segurando as Baquetas:</strong> Lembre a criança de não segurar com muita força. A baqueta precisa de liberdade para &quot;quicar&quot; na borracha macia de silicone.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Card 3: Significado dos Botões da Bateria */}
        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">
                3. O Que Cada Botão Físico Faz
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                <strong className="text-amber-400 block mb-0.5">VOL+ / VOL-</strong>
                <span>Aumenta ou reduz o volume do som nos alto-falantes ou fones.</span>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                <strong className="text-amber-400 block mb-0.5">STYLE</strong>
                <span>Troca o kit sonoro (Rock acústico, Pop, Eletrônico ou Latino).</span>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                <strong className="text-amber-400 block mb-0.5">DEMO</strong>
                <span>Toca músicas prontas gravadas de fábrica para demonstração.</span>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                <strong className="text-amber-400 block mb-0.5">REC & PLAY</strong>
                <span>Grava o que seu filho tocar na memória física do aparelho e reproduz!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Rotina de Aprendizado Positivo */}
        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">
                4. Dicas de Ouro para Incentivar
              </h3>
            </div>

            <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>10 a 15 Minutos por Dia:</strong> Para 7 anos de idade, treinos curtos e frequentes são muito mais eficientes e prazerosos do que 1 hora inteira de uma só vez.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Use o Jogo do Ritmo:</strong> Quando ele quiser se divertir, deixe ele jogar a aba &quot;Jogo do Ritmo&quot; no site. Isso desenvolve coordenação motora e precisão rítmica brincando!
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Elogie o Esforço:</strong> Bateria exige sincronizar mãos e pés independentes. Cada novo compasso aprendido é uma vitória gigante para o desenvolvimento cerebral infantil!
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
