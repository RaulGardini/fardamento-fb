/* ══════════════════════════════════════════
   FUNÇÕES UTILITÁRIAS
   ══════════════════════════════════════════ */

import { PECAS_CONFIG, NOMES_PECAS, TODAS_CHAVES } from "../constants/pecas";

/** Formata valor em BRL */
export const fmt = (v) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Arredonda para 2 casas decimais */
export const fmt2 = (v) => parseFloat(v.toFixed(2));

/** Inicializa o estado das peças com tudo zerado */
export function initPecas() {
  return Object.fromEntries(
    NOMES_PECAS.map(p => [
      p,
      {
        ativo: false,
        tamanhos: Object.fromEntries(TODAS_CHAVES.map(k => [k, 0])),
      },
    ])
  );
}

/** Calcula o valor total com base nas peças selecionadas */
export function calcTotal(pecas) {
  return PECAS_CONFIG.reduce((acc, { nome, preco }) => {
    const qtd = Object.values(pecas[nome]?.tamanhos || {}).reduce(
      (s, v) => s + v,
      0
    );
    return acc + qtd * preco;
  }, 0);
}

/** Gera tags resumo (ex: "Blusa · Adulto M ×2") */
export function gerarTags(pecas) {
  return PECAS_CONFIG.flatMap(({ nome }) =>
    TODAS_CHAVES.flatMap(chave => {
      const q = pecas?.[nome]?.tamanhos?.[chave] || 0;
      return q > 0
        ? [`${nome} · ${chave}${q > 1 ? ` ×${q}` : ""}`]
        : [];
    })
  );
}

/** Detecta status de retorno do Mercado Pago via URL params */
export function detectarStatusRetorno() {
  const params = new URLSearchParams(window.location.search);
  const collectionStatus = params.get("collection_status");
  const status = params.get("status");
  const paymentId = params.get("payment_id") || params.get("collection_id");

  if (!collectionStatus && !status && !paymentId) {
    if (sessionStorage.getItem("pagamento_pendente")) {
      sessionStorage.removeItem("pagamento_pendente");
      return "pendente";
    }
    return null;
  }

  sessionStorage.removeItem("pagamento_pendente");
  const mpStatus = collectionStatus || status;

  if (mpStatus === "approved") return "aprovado";
  if (mpStatus === "pending" || mpStatus === "in_process") return "pendente";
  return "falhou";
}
