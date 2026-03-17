/* ══════════════════════════════════════════
   CONFIGURAÇÃO DAS PEÇAS / TAMANHOS
   ══════════════════════════════════════════ */

import imgBlusa from "../img/Blusa.jpeg";
import imgConjunto from "../img/Conjunto.jpeg";

export const PECAS_CONFIG = [
  { img: imgConjunto,    nome: "Blusa",    preco: 65.00 },
  { img: imgBlusa, nome: "Conjunto", preco: 168.00, conjunto: true },
];

export const NOMES_PECAS = PECAS_CONFIG.map(p => p.nome);

export const GRUPOS = [
  { label: "Adulto",   tamanhos: ["PP", "P", "M", "G", "GG"] },
  { label: "Infantil", tamanhos: ["M", "G"] },
];

export const TODAS_CHAVES = GRUPOS.flatMap(g =>
  g.tamanhos.map(t => `${g.label} ${t}`)
);
