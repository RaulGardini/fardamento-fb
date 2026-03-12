import React, { useState } from "react";
import { C } from "../constants/theme";
import { PECAS_CONFIG, NOMES_PECAS, GRUPOS, TODAS_CHAVES } from "../constants/pecas";
import { fmt, initPecas, calcTotal } from "../utils/helpers";
import QtyControl from "../components/QtyControl";
import TelaPagamento from "../components/TelaPagamento";
import TelaRetorno from "../components/TelaRetorno";

export default function AlunaPage({ statusRetorno, onStepChange }) {
  const [step, setStepRaw] = useState(statusRetorno ? "retorno" : "nome");

  function setStep(s) {
    setStepRaw(s);
    onStepChange?.(s);
  }
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [pecas, setPecas] = useState(initPecas());

  const nomeCompleto = `${nome.trim()} ${sobrenome.trim()}`.trim();
  const nomeValido = nome.trim().length >= 2 && sobrenome.trim().length >= 2;

  const totalQtd = PECAS_CONFIG.reduce((a, { nome, conjunto }) => {
    if (conjunto) {
      return a + Object.values(pecas[nome].tamanhos_blusa).reduce((s, v) => s + v, 0);
    }
    return a + Object.values(pecas[nome].tamanhos).reduce((s, v) => s + v, 0);
  }, 0);
  const totalVal = calcTotal(pecas);

  function togglePeca(p) {
    setPecas(prev => {
      const abrindo = !prev[p].ativo;
      return Object.fromEntries(
        NOMES_PECAS.map(n => [n, { ...prev[n], ativo: n === p ? abrindo : false }])
      );
    });
  }

  function setQty(peca, chave, val, subTipo) {
    setPecas(prev => {
      if (subTipo) {
        const campo = subTipo === "blusa" ? "tamanhos_blusa" : "tamanhos_calca";
        return {
          ...prev,
          [peca]: {
            ...prev[peca],
            [campo]: { ...prev[peca][campo], [chave]: val },
          },
        };
      }
      return {
        ...prev,
        [peca]: {
          ...prev[peca],
          tamanhos: { ...prev[peca].tamanhos, [chave]: val },
        },
      };
    });
  }

  function reiniciar() {
    setNome("");
    setSobrenome("");
    setPecas(initPecas());
    setStep("nome");
    window.history.replaceState({}, "", "/");
  }

  /* ── Tela de retorno pós-pagamento ── */
  if (step === "retorno") {
    return <TelaRetorno status={statusRetorno} onVoltar={reiniciar} />;
  }

  /* ── Tela de pagamento ── */
  if (step === "pagamento") {
    return (
      <TelaPagamento
        nome={nomeCompleto}
        pecas={pecas}
        onVoltar={() => setStep("escolha")}
      />
    );
  }

  /* ── Tela de identificação (nome) ── */
  if (step === "nome") {
    return (
      <div className="card">
        <div className="card-title">Identificação</div>
        <label className="field-label">Nome</label>
        <input
          type="text"
          placeholder="Ex: Raul"
          value={nome}
          autoFocus
          onChange={e => setNome(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter")
              document.getElementById("input-sobrenome")?.focus();
          }}
        />
        <br /><br />
        <label className="field-label">Sobrenome</label>
        <input
          id="input-sobrenome"
          type="text"
          placeholder="Ex: Passos Gardini"
          value={sobrenome}
          onChange={e => setSobrenome(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && nomeValido) setStep("escolha");
          }}
        />
        <br /><br />
        <button
          className="btn-primary"
          disabled={!nomeValido}
          onClick={() => setStep("escolha")}
        >
          Continuar →
        </button>
      </div>
    );
  }

  /* ── Tela de seleção de peças ── */
  return (
    <>
      <div style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
        <button
          className="btn-ghost"
          style={{ fontSize: ".8rem" }}
          onClick={() => setStep("nome")}
        >
          ← Voltar
        </button>
        <span style={{ color: C.muted, fontSize: ".88rem" }}>
          Olá, <strong style={{ color: C.text }}>{nome.split(" ")[0]}</strong> 👋
        </span>
      </div>

      <div className="card">
        <div className="card-title">Escolha o fardamento</div>
        <div className="peca-grid">
          {PECAS_CONFIG.map(({ nome: pNome, preco, img, conjunto }) => (
            <div
              key={pNome}
              className={`peca-row ${pecas[pNome].ativo ? "ativa" : ""}`}
              onClick={() => togglePeca(pNome)}
            >
              <div className="peca-inner">
                <div className="peca-foto">
                  {img ? (
                    <img src={img} alt={pNome} />
                  ) : (
                    <span style={{ fontSize: "1.6rem" }}>👕</span>
                  )}
                </div>
                <div className="peca-info">
                  <div className="peca-nome-row">
                    <div>
                      <div className="peca-nome">{pNome}</div>
                      <div className="peca-preco">{fmt(preco)}</div>
                    </div>
                    {(() => {
                      if (conjunto) {
                        const blusaItens = TODAS_CHAVES.filter(
                          k => (pecas[pNome].tamanhos_blusa[k] || 0) > 0
                        );
                        const calcaItens = TODAS_CHAVES.filter(
                          k => (pecas[pNome].tamanhos_calca[k] || 0) > 0
                        );
                        if (blusaItens.length === 0 && calcaItens.length === 0) return null;
                        return (
                          <div className="peca-tags-resumo">
                            {blusaItens.map(k => (
                              <span key={"b-"+k} className="peca-tag-mini">
                                Bl {k.replace("Adulto ", "").replace("Infantil ", "Inf ")}
                                {pecas[pNome].tamanhos_blusa[k] > 1
                                  ? ` ×${pecas[pNome].tamanhos_blusa[k]}`
                                  : ""}
                              </span>
                            ))}
                            {calcaItens.map(k => (
                              <span key={"c-"+k} className="peca-tag-mini">
                                Ca {k.replace("Adulto ", "").replace("Infantil ", "Inf ")}
                                {pecas[pNome].tamanhos_calca[k] > 1
                                  ? ` ×${pecas[pNome].tamanhos_calca[k]}`
                                  : ""}
                              </span>
                            ))}
                          </div>
                        );
                      }
                      const itens = TODAS_CHAVES.filter(
                        k => (pecas[pNome].tamanhos[k] || 0) > 0
                      );
                      if (itens.length === 0) return null;
                      return (
                        <div className="peca-tags-resumo">
                          {itens.map(k => (
                            <span key={k} className="peca-tag-mini">
                              {k.replace("Adulto ", "").replace("Infantil ", "Inf ")}
                              {pecas[pNome].tamanhos[k] > 1
                                ? ` ×${pecas[pNome].tamanhos[k]}`
                                : ""}
                            </span>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  <div
                    className="grupos-wrap"
                    onClick={e => e.stopPropagation()}
                  >
                    {conjunto ? (
                      <>
                        {["blusa", "calca"].map(subTipo => (
                          <div key={subTipo} style={{ marginBottom: 12 }}>
                            <div style={{ color: C.muted, fontSize: ".75rem", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
                              Tamanho da {subTipo === "blusa" ? "Blusa" : "Calça"}
                            </div>
                            {GRUPOS.map(({ label, tamanhos }) => (
                              <div key={label} className="grupo-bloco">
                                <div className={`grupo-label ${label.toLowerCase()}`}>
                                  {label}
                                </div>
                                <div className="tam-grid">
                                  {tamanhos.map(t => {
                                    const chave = `${label} ${t}`;
                                    const campo = subTipo === "blusa" ? "tamanhos_blusa" : "tamanhos_calca";
                                    return (
                                      <div key={chave} className="tam-item">
                                        <span className="tam-label">{t}</span>
                                        <QtyControl
                                          value={pecas[pNome][campo][chave] || 0}
                                          onChange={v => setQty(pNome, chave, v, subTipo)}
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                        {(() => {
                          const totalBlusa = Object.values(pecas[pNome].tamanhos_blusa).reduce((s, v) => s + v, 0);
                          const totalCalca = Object.values(pecas[pNome].tamanhos_calca).reduce((s, v) => s + v, 0);
                          if (totalBlusa > 0 && totalCalca > 0 && totalBlusa !== totalCalca) {
                            return (
                              <div style={{ color: "#f59e0b", fontSize: ".75rem", marginTop: 4 }}>
                                A quantidade de blusas ({totalBlusa}) e calças ({totalCalca}) deve ser igual.
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </>
                    ) : (
                      GRUPOS.map(({ label, tamanhos }) => (
                        <div key={label} className="grupo-bloco">
                          <div className={`grupo-label ${label.toLowerCase()}`}>
                            {label}
                          </div>
                          <div className="tam-grid">
                            {tamanhos.map(t => {
                              const chave = `${label} ${t}`;
                              return (
                                <div key={chave} className="tam-item">
                                  <span className="tam-label">{t}</span>
                                  <QtyControl
                                    value={pecas[pNome].tamanhos[chave] || 0}
                                    onChange={v => setQty(pNome, chave, v)}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="total-bar">
          <div>
            <div className="total-label">
              {totalQtd} {totalQtd === 1 ? "peça" : "peças"}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="total-label">Total</div>
            <div className="total-val">{fmt(totalVal)}</div>
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={() => setStep("pagamento")}
          disabled={totalQtd === 0 || PECAS_CONFIG.some(({ nome, conjunto }) => {
            if (!conjunto) return false;
            const tb = Object.values(pecas[nome].tamanhos_blusa).reduce((s, v) => s + v, 0);
            const tc = Object.values(pecas[nome].tamanhos_calca).reduce((s, v) => s + v, 0);
            return (tb > 0 || tc > 0) && tb !== tc;
          })}
        >
          Continuar para pagamento →
        </button>
      </div>
    </>
  );
}