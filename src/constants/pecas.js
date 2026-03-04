/* ══════════════════════════════════════════
   CONFIGURAÇÃO DAS PEÇAS / TAMANHOS
   ══════════════════════════════════════════ */

// Importe suas imagens reais aqui:
// import imgBlusa from "../assets/blusa.png";
// import imgRegata from "../assets/regata.png";
// import imgShort from "../assets/short.png";
// import imgCalcaMoleton from "../assets/calcamoleton.png";

// Placeholder enquanto não tem imagens:
const imgBlusa = null;
const imgRegata = null;
const imgShort = null;
const imgCalcaMoleton = null;

export const PECAS_CONFIG = [
  { img: imgBlusa,         nome: "Blusa",         preco: 60.00 },
  { img: imgRegata,        nome: "Regata",        preco: 30.00 },
  { img: imgShort,         nome: "Short",         preco: 60.00 },
  { img: imgCalcaMoleton,  nome: "Calça Moletom", preco: 90.00 },
  { img: imgCalcaMoleton,  nome: "Blusa Moletom", preco: 90.00 },
];

export const NOMES_PECAS = PECAS_CONFIG.map(p => p.nome);

export const GRUPOS = [
  { label: "Adulto",   tamanhos: ["PP", "P", "M", "G"] },
  { label: "Infantil", tamanhos: ["P", "M", "G"] },
];

export const TODAS_CHAVES = GRUPOS.flatMap(g =>
  g.tamanhos.map(t => `${g.label} ${t}`)
);
