# 🥁 Pequeno Baterista

> **Guia interativo e passo a passo para crianças aprenderem a tocar bateria utilizando a bateria eletrônica de silicone de 9 pads e 2 pedais, com comparador para bateria acústica real.**

---

## 🌟 Sobre o Projeto

O **Pequeno Baterista** é uma aplicação web educativa desenvolvida especialmente para crianças a partir de 7 anos que acabaram de ganhar ou estão aprendendo a tocar em uma **bateria eletrônica portátil de silicone (9 pads + 2 pedais e baquetas)**.

O projeto ensina os fundamentos reais da bateria relacionando cada pad emborrachado com as peças de uma **bateria acústica de palco profissional**, com síntese sonora de alta fidelidade e zero latência (Web Audio API), sem necessidade de backend e com persistência local no navegador.

---

## 🚀 Principais Funcionalidades

* 🥁 **Simulador Interativo da Bateria de Silicone (9 Pads & 2 Pedais):**
  * Réplica dos 4 pratos em leque com ondas acústicas brancas (*Crash 1, Chimbal, Ride, Crash 2*).
  * Réplica dos 5 tambores circulares com anéis brancos (*Tom 1, Tom 2, Caixa, Bumbo e Surdo*).
  * 2 pedais de chão interativos com cabos simulados (*Pedal de Chimbal e Pedal de Bumbo*).
  * Controle via mouse, touch no celular/tablet, teclado ou tocando na bateria física conectada.
* 🎓 **Trilha de Aulas Passo a Passo (8 Níveis):**
  * Do zero à primeira música completa: empunhadura com rebote, contagem 1-2-3-4 no chimbal, chute do bumbo, estalo da caixa, coordenação do rock e viradas épicas pelos tambores.
  * Pauta rítmica animada em 4/4, demonstração com áudio automático e modo treino com recompensas.
* 🔍 **Comparador Interativo: Silicone vs. Bateria Acústica Real:**
  * Foto em alta definição de bateria acústica de palco com *hotspots* clicáveis.
  * Mostra onde cada peça fica, qual o apelido infantil, qual membro usar (mão D, mão E, pé D, pé E) e curiosidades sobre cascos de madeira, esteira de aço e pratos de bronze.
* ⚡ **Jogo do Ritmo (Rhythm Arcade em 60 FPS):**
  * Pista vertical acelerada por hardware (HTML5 Canvas) com notas caindo suavemente até a linha alvo.
  * Contagem regressiva *"3... 2... 1... VAI!"*, seletor de velocidades (*Suave / Normal / Rápido*), combos e pontuação com recordes salvos.
* 🎙️ **Estúdio Livre & Gravador:**
  * Metrônomo visual e sonoro ajustável de 40 a 160 BPM.
  * Bandas de acompanhamento instrumental (*Rock, Pop e Funk*).
  * Gravador (*REC / PLAY*) para a criança gravar e salvar seus solos no navegador.
* 🏆 **Certificado de Baterista Júnior:**
  * Certificado oficial ilustrado com selo dourado, personalizável com o nome da criança e pronto para impressão ou PDF.
* 👨‍👩‍👧 **Guia Prático dos Pais:**
  * Como plugar os cabos e pedais na entrada correta (*PEDAL P2*), uso de fones de ouvido para treino silencioso e postura ergonômica para 7 anos.

---

## 🛠️ Tecnologias Utilizadas

* **React 19**
* **TypeScript**
* **Vite**
* **Tailwind CSS v4**
* **Web Audio API** (Síntese de áudio nativa, sem arquivos de áudio pesados e com zero latência)
* **HTML5 Canvas** (Animação gráfica fluida a 60 FPS no Jogo do Ritmo)
* **Canvas-Confetti**
* **Lucide React** (Ícones acessíveis)
* **LocalStorage** (Persistência 100% no cliente)

---

## 📦 Como Rodar Localmente

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/SEU_USUARIO/pequeno-baterista.git
   cd pequeno-baterista
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Acesse no navegador:**
   ```
   http://localhost:3000
   ```

---

## ☁️ Deploy Gratuito na Vercel

O projeto está 100% pronto para o plano Hobby (Gratuito) da Vercel:

1. Suba este repositório no seu GitHub.
2. Acesse [vercel.com](https://vercel.com) e conecte seu repositório.
3. O Vite será detectado automaticamente (`npm run build` $\to$ pasta `dist`).
4. Clique em **Deploy** e pronto!

---

## 📄 Licença

Distribuído sob a licença MIT. Sinta-se livre para utilizar, modificar e incentivar mais crianças a entrarem no mundo da música! 🎶
