import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { fmt, fmt2, calcTotal, gerarTags } from "../utils/helpers";
import TelaRetorno from "./TelaRetorno";

export default function TelaPagamento({ nome, pecas, onVoltar }) {
  const [formaSelecionada, setFormaSelecionada] = useState(null);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");
  const [mostrarPendente, setMostrarPendente] = useState(false);
  const [mostrarLojinha, setMostrarLojinha] = useState(false);
  const timerRef = useRef(null);
  const pedidoIdRef = useRef(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  if (mostrarPendente)
    return <TelaRetorno status="pendente" onVoltar={onVoltar} />;
  if (mostrarLojinha)
    return <TelaRetorno status="lojinha" onVoltar={onVoltar} />;

  const totalBase = calcTotal(pecas);

  const opcoes = [
    {
      id: "pix",
      icone: "❖",
      nome: "Pix",
      desc: "Aprovação imediata · Sem acréscimo",
      valor: totalBase,
      cls: "pix",
      valCls: "pix-val",
    },
    {
      id: "credito_lojinha",
      icone: "🏪",
      nome: "Cartão de crédito na lojinha",
      desc: "Pague presencialmente na loja TP · +5% de acréscimo",
      valor: fmt2(totalBase * 1.05),
      cls: "lojinha",
      valCls: "lojinha-val",
      acrescimo: true,
    },
  ];

  async function irParaPagamento() {
    if (!formaSelecionada || processando) return;
    setErro("");
    setProcessando(true);

    try {
      let pedidoId = pedidoIdRef.current;

      if (!pedidoId) {
        const { data: pedidoSalvo, error: errSalvar } = await supabase
          .from("pedidos")
          .insert([
            {
              nome,
              pecas,
              pagamento_status:
                formaSelecionada === "credito_lojinha"
                  ? "pendente_credito_lojinha"
                  : "pendente",
              forma_pagamento: formaSelecionada,
            },
          ])
          .select()
          .single();

        if (errSalvar) throw errSalvar;
        pedidoId = pedidoSalvo.id;
        pedidoIdRef.current = pedidoId;
      } else {
        await supabase
          .from("pedidos")
          .update({
            forma_pagamento: formaSelecionada,
            pagamento_status:
              formaSelecionada === "credito_lojinha"
                ? "pendente_credito_lojinha"
                : "pendente",
          })
          .eq("id", pedidoId);
      }

      if (formaSelecionada === "credito_lojinha") {
        setMostrarLojinha(true);
        return;
      }

      const response = await fetch("/.netlify/functions/criar-pagamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pedidoId,
          forma: formaSelecionada,
          nomeAluna: nome,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.checkout_url) {
        throw new Error(data.error || "Erro ao gerar link de pagamento.");
      }

      sessionStorage.setItem("pagamento_pendente", "true");
      timerRef.current = setTimeout(() => setMostrarPendente(true), 10000);
      window.location.href = data.checkout_url;
    } catch (e) {
      console.error(e);
      setErro("Erro ao processar. Tente novamente em instantes.");
      setProcessando(false);
    }
  }

  const opcaoAtual = opcoes.find(o => o.id === formaSelecionada);

  return (
    <div className="card">
      <div className="card-title">Forma de pagamento</div>

      <div className="pgto-resumo">
        <div className="pgto-resumo-title">Resumo do pedido</div>
        <div className="pgto-resumo-tags">
          {gerarTags(pecas).map((tag, i) => (
            <span key={i} className="tag">
              {tag}
            </span>
          ))}
        </div>
        <div className="pgto-total-row">
          <span className="pgto-total-label">Subtotal</span>
          <span className="pgto-total-val">{fmt(totalBase)}</span>
        </div>
      </div>

      <div className="pgto-opcoes">
        {opcoes.map(op => (
          <div
            key={op.id}
            className={`pgto-opcao ${formaSelecionada === op.id ? `selecionada ${op.cls}` : ""}`}
            onClick={() => setFormaSelecionada(op.id)}
          >
            <div className="pgto-icone">{op.icone}</div>
            <div className="pgto-info">
              <div className="pgto-nome">{op.nome}</div>
              <div className="pgto-desc">{op.desc}</div>
            </div>
            <div>
              <div className={`pgto-valor ${op.valCls}`}>{fmt(op.valor)}</div>
              {op.acrescimo && (
                <div className="pgto-acrescimo">
                  +{fmt(op.valor - totalBase)} de acréscimo
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {erro && <div className="alert">{erro}</div>}

      <div style={{ display: "flex", gap: 10 }}>
        <button
          className="btn-ghost"
          onClick={onVoltar}
          style={{ flex: "0 0 auto" }}
        >
          ← Voltar
        </button>
        <button
          className={`btn-primary ${formaSelecionada === "pix" ? "btn-pix" : formaSelecionada === "credito_lojinha" ? "btn-lojinha" : ""}`}
          style={{ flex: 1, marginTop: 0 }}
          disabled={!formaSelecionada || processando}
          onClick={irParaPagamento}
        >
          {processando
            ? "Processando…"
            : formaSelecionada === "credito_lojinha"
              ? "Reservar pedido →"
              : formaSelecionada
                ? `Pagar ${fmt(opcaoAtual.valor)} →`
                : "Selecione uma forma de pagamento"}
        </button>
      </div>
    </div>
  );
}
