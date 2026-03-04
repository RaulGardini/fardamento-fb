import React, { useState } from "react";
import { C } from "../constants/theme";

export default function AdminLogin({ onEntrar }) {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(false);
  const [loading, setLoading] = useState(false);

  async function tentar() {
    setLoading(true);
    try {
      const res = await fetch("/.netlify/functions/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha }),
      });
      const data = await res.json();
      if (data.ok) {
        onEntrar(senha);
        return;
      }
    } catch {}
    setErro(true);
    setSenha("");
    setLoading(false);
  }

  return (
    <div className="card" style={{ maxWidth: 340, margin: "0 auto" }}>
      <div className="card-title">Área Admin</div>
      <label className="field-label">Senha</label>
      <input
        type="password"
        placeholder="••••••••"
        value={senha}
        autoFocus
        onChange={e => {
          setSenha(e.target.value);
          setErro(false);
        }}
        onKeyDown={e => {
          if (e.key === "Enter") tentar();
        }}
      />
      {erro && <div className="alert">Senha incorreta.</div>}
      <br /><br />
      <button className="btn-primary" onClick={tentar} disabled={loading}>
        {loading ? "Verificando..." : "Entrar"}
      </button>
    </div>
  );
}
