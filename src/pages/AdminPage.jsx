import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabase";
import { C, FORMA_LABEL } from "../constants/theme";
import { PECAS_CONFIG, NOMES_PECAS, GRUPOS, TODAS_CHAVES } from "../constants/pecas";
import { fmt, calcTotal, gerarTags } from "../utils/helpers";
import Modal from "../components/Modal";

export default function AdminPage({ onSair, adminSenha }) {
  const [aba, setAba] = useState("resumo");
  const [pedidos, setPedidos] = useState(null);
  const [pedidosLojinha, setPedidosLojinha] = useState(null);
  const [filtro, setFiltro] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [modalId, setModalId] = useState(null);
  const [modalTipo, setModalTipo] = useState("remover");
  const [erroAdmin, setErroAdmin] = useState("");
  const [busca, setBusca] = useState("");

  async function carregar() {
    setLoading(true);
    setErroAdmin("");
    try {
      const { data: pagos, error: e1 } = await supabase
        .from("pedidos")
        .select("*")
        .eq("pagamento_status", "pago")
        .order("hora", { ascending: false });
      if (e1) throw e1;

      const { data: lojinha, error: e2 } = await supabase
        .from("pedidos")
        .select("*")
        .eq("pagamento_status", "pendente_credito_lojinha")
        .order("hora", { ascending: false });
      if (e2) throw e2;

      setPedidos(pagos || []);
      setPedidosLojinha(lojinha || []);
    } catch (e) {
      console.error(e);
      setErroAdmin("Erro ao carregar pedidos.");
      setPedidos([]);
      setPedidosLojinha([]);
    }
    setLoading(false);
  }

  async function confirmarDelete() {
    if (!modalId) return;
    try {
      const res = await fetch("/.netlify/functions/deletar-pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pedidoId: modalId, senha: adminSenha }),
      });
      if (!res.ok) throw new Error("Erro ao deletar");
      setModalId(null);
      setModalTipo("remover");
      carregar();
    } catch (e) {
      console.error(e);
      setErroAdmin("Erro ao remover pedido.");
      setModalId(null);
    }
  }

  async function confirmarPagamentoLojinha() {
    if (!modalId) return;
    try {
      const res = await fetch("/.netlify/functions/confirmar-pedido-lojinha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pedidoId: modalId, senha: adminSenha }),
      });
      if (!res.ok) throw new Error("Erro ao confirmar");
      setModalId(null);
      setModalTipo("remover");
      carregar();
    } catch (e) {
      console.error(e);
      setErroAdmin("Erro ao confirmar pedido.");
      setModalId(null);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  /* ── Cálculos ── */
  const todosPedidos = [...(pedidos || []), ...(pedidosLojinha || [])];

  const totais = Object.fromEntries(
    NOMES_PECAS.map(p => [
      p,
      Object.fromEntries(TODAS_CHAVES.map(k => [k, 0])),
    ])
  );
  let receitaTotal = 0;
  (pedidos || []).forEach(p => {
    PECAS_CONFIG.forEach(({ nome, preco }) => {
      TODAS_CHAVES.forEach(chave => {
        const q = p.pecas?.[nome]?.tamanhos?.[chave] || 0;
        totais[nome][chave] += q;
        receitaTotal += q * preco;
      });
    });
  });

  const nomeModal = todosPedidos?.find(p => p.id === modalId)?.nome || "";
  const pecasFiltradas = filtro === "Todos" ? NOMES_PECAS : [filtro];

  let pedidosFiltrados = pedidos || [];
  if (filtro !== "Todos") {
    pedidosFiltrados = pedidosFiltrados.filter(p =>
      TODAS_CHAVES.some(k => (p.pecas?.[filtro]?.tamanhos?.[k] || 0) > 0)
    );
  }
  if (busca) {
    pedidosFiltrados = pedidosFiltrados.filter(p =>
      p.nome?.toLowerCase().includes(busca.toLowerCase())
    );
  }

  let lojinhaFiltrados = pedidosLojinha || [];
  if (busca) {
    lojinhaFiltrados = lojinhaFiltrados.filter(p =>
      p.nome?.toLowerCase().includes(busca.toLowerCase())
    );
  }

  return (
    <>
      {modalId && (
        <Modal
          nome={nomeModal}
          tipo={modalTipo}
          onConfirm={
            modalTipo === "confirmar"
              ? confirmarPagamentoLojinha
              : confirmarDelete
          }
          onCancel={() => {
            setModalId(null);
            setModalTipo("remover");
          }}
        />
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div className="admin-header-title">Painel Administrativo</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn-ghost"
            style={{ fontSize: ".78rem" }}
            onClick={carregar}
          >
            ↻ Atualizar
          </button>
          <button
            className="btn-ghost"
            style={{ fontSize: ".78rem" }}
            onClick={onSair}
          >
            Sair
          </button>
        </div>
      </div>

      {erroAdmin && (
        <div className="alert" style={{ marginBottom: 16 }}>
          {erroAdmin}
        </div>
      )}

      <div className="ptab-row">
        {[
          ["resumo", "📊 Resumo"],
          ["pedidos", "📋 Pedidos"],
          ["lojinha", "🏪 Lojinha"],
        ].map(([a, lbl]) => (
          <button
            key={a}
            className={`ptab ${aba === a ? "active" : ""}`}
            onClick={() => setAba(a)}
          >
            {lbl}
            {a === "lojinha" && (pedidosLojinha?.length || 0) > 0 && (
              <span className="lojinha-badge">{pedidosLojinha.length}</span>
            )}
          </button>
        ))}
      </div>

      {loading && (
        <div className="empty-state">
          <span className="em">⏳</span>Carregando...
        </div>
      )}

      {/* ═══ ABA RESUMO ═══ */}
      {!loading && aba === "resumo" && (
        <div className="card">
          <div className="card-title">Resumo geral</div>
          <div className="stat-grid">
            <div className="stat-card hl">
              <div className="stat-num">{pedidos?.length}</div>
              <div className="stat-lbl">Pedidos confirmados</div>
            </div>
            {PECAS_CONFIG.map(({ nome, preco }) => {
              const qtd = Object.values(totais[nome]).reduce(
                (s, v) => s + v,
                0
              );
              return (
                <div key={nome} className="stat-card">
                  <div className="stat-num">{qtd}</div>
                  <div className="stat-lbl">{nome}</div>
                  <div className="stat-sub-val">{fmt(qtd * preco)}</div>
                </div>
              );
            })}
            <div className="stat-card hl">
              <div className="stat-num" style={{ fontSize: "1.2rem" }}>
                {fmt(receitaTotal)}
              </div>
              <div className="stat-lbl">Receita total</div>
            </div>
            {(pedidosLojinha?.length || 0) > 0 && (
              <div className="stat-card" style={{ borderColor: C.lojinha }}>
                <div className="stat-num" style={{ color: C.lojinha }}>
                  {pedidosLojinha.length}
                </div>
                <div className="stat-lbl">Pendentes lojinha</div>
              </div>
            )}
          </div>

          <div style={{ marginTop: 24 }}>
            <div className="sec-label">Quantidade por tamanho</div>
            <div className="ptab-row">
              {["Todos", ...NOMES_PECAS].map(p => (
                <button
                  key={p}
                  className={`ptab ${filtro === p ? "active" : ""}`}
                  onClick={() => setFiltro(p)}
                >
                  {p}
                </button>
              ))}
            </div>
            {pecasFiltradas.map(peca => (
              <div key={peca} style={{ marginBottom: 20 }}>
                <div className="sec-label">{peca}</div>
                <table className="tam-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", width: 80 }}>Grupo</th>
                      {["PP", "P", "M", "G"].map(t => (
                        <th key={t}>{t}</th>
                      ))}
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {GRUPOS.map(({ label, tamanhos }) => {
                      const sub = tamanhos.reduce(
                        (s, t) => s + (totais[peca][`${label} ${t}`] || 0),
                        0
                      );
                      return (
                        <tr key={label}>
                          <td
                            style={{
                              textAlign: "left",
                              color:
                                label === "Adulto" ? "#34d399" : "#6ee7b7",
                              fontWeight: 600,
                              fontSize: ".78rem",
                            }}
                          >
                            {label}
                          </td>
                          {["PP", "P", "M", "G"].map(t => {
                            if (!tamanhos.includes(t))
                              return (
                                <td key={t}>
                                  <span className="tam-zero">–</span>
                                </td>
                              );
                            const v = totais[peca][`${label} ${t}`] || 0;
                            return (
                              <td key={t}>
                                <span
                                  className={v > 0 ? "tam-val" : "tam-zero"}
                                >
                                  {v > 0 ? v : "–"}
                                </span>
                              </td>
                            );
                          })}
                          <td>
                            <span
                              style={{ color: C.gold, fontWeight: 600 }}
                            >
                              {sub || "–"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ ABA PEDIDOS ═══ */}
      {!loading && aba === "pedidos" && (
        <div className="card">
          <div className="card-title">
            Pedidos confirmados ({pedidosFiltrados?.length || 0})
          </div>
          <input
            type="text"
            placeholder="Pesquisar por nome..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="search-input"
          />
          {pedidosFiltrados?.length === 0 ? (
            <div className="empty-state">
              <span className="em">📋</span>Nenhum pedido confirmado.
            </div>
          ) : (
            pedidosFiltrados.map(p => (
              <div key={p.id} className="pedido-item">
                <div className="pedido-header">
                  <div className="pedido-nome">{p.nome}</div>
                  <span className="badge-confirmado">Confirmado ✓</span>
                </div>
                <div className="pedido-tags">
                  {gerarTags(p.pecas).map((tag, i) => (
                    <span key={i} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="pedido-footer">
                  <div>
                    <div className="pedido-hora">
                      {new Date(p.hora).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="pedido-total-lbl">
                      {fmt(p.valor_pago || calcTotal(p.pecas))}
                      {p.forma_pagamento && (
                        <span className="pedido-forma">
                          via{" "}
                          {FORMA_LABEL[p.forma_pagamento] ||
                            p.forma_pagamento}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    className="del-btn"
                    onClick={() => {
                      setModalId(p.id);
                      setModalTipo("remover");
                    }}
                  >
                    🗑 Remover
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ═══ ABA LOJINHA ═══ */}
      {!loading && aba === "lojinha" && (
        <div className="card">
          <div className="card-title">
            Pagamentos pendentes na lojinha ({lojinhaFiltrados?.length || 0})
          </div>
          <input
            type="text"
            placeholder="Pesquisar por nome..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="search-input"
          />
          {lojinhaFiltrados?.length === 0 ? (
            <div className="empty-state">
              <span className="em">🏪</span>Nenhum pedido pendente na lojinha.
            </div>
          ) : (
            lojinhaFiltrados.map(p => (
              <div key={p.id} className="pedido-item pendente-lojinha">
                <div className="pedido-header">
                  <div className="pedido-nome">{p.nome}</div>
                  <span className="badge-pendente">Pendente 🏪</span>
                </div>
                <div className="pedido-tags">
                  {gerarTags(p.pecas).map((tag, i) => (
                    <span key={i} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="pedido-footer">
                  <div>
                    <div className="pedido-hora">
                      {new Date(p.hora).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="pedido-total-lbl">
                      {fmt(calcTotal(p.pecas) * 1.05)}
                      <span className="pedido-forma">
                        via Cartão na lojinha
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      className="confirm-btn"
                      onClick={() => {
                        setModalId(p.id);
                        setModalTipo("confirmar");
                      }}
                    >
                      ✅ Confirmar
                    </button>
                    <button
                      className="del-btn"
                      onClick={() => {
                        setModalId(p.id);
                        setModalTipo("remover");
                      }}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
}
