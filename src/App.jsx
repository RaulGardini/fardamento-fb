import React, { useState, useEffect } from "react";
import { detectarStatusRetorno } from "./utils/helpers";
import AlunaPage from "./pages/AlunaPage";
import AdminLogin from "./pages/AdminLogin";
import AdminPage from "./pages/AdminPage";
import "./styles/global.css";

export default function App() {
  const [tela, setTela] = useState("aluna");
  const [adminAuth, setAdminAuth] = useState(false);
  const [adminSenha, setAdminSenha] = useState("");
  const [alunaStep, setAlunaStep] = useState("nome");
  const [statusRetorno, setStatusRetorno] = useState(() =>
    detectarStatusRetorno()
  );

  const mostrarTabs = tela !== "aluna" || alunaStep === "nome";

  useEffect(() => {
    const handlePageShow = (e) => {
      if (e.persisted) {
        const status = detectarStatusRetorno();
        if (status) setStatusRetorno(status);
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  return (
    <>
      <div className="grain" />
      <div className="wrap">
        {/* ── Header ── */}
        <div className="logo">
          <div className="logo-title">Fardamento TP 2026</div>
          <div className="logo-sub">
            {tela === "aluna"
              ? "Escolha seu uniforme"
              : "Painel da administração"}
          </div>
          {mostrarTabs && (
            <div className="tabs">
              <button
                className={`tab ${tela === "aluna" ? "active" : ""}`}
                onClick={() => setTela("aluna")}
              >
                Aluna
              </button>
              <button
                className={`tab ${tela !== "aluna" ? "active" : ""}`}
                onClick={() =>
                  setTela(adminAuth ? "admin" : "admin-login")
                }
              >
                Administração
              </button>
            </div>
          )}
        </div>

        {/* ── Pages ── */}
        {tela === "aluna" && (
          <AlunaPage statusRetorno={statusRetorno} onStepChange={setAlunaStep} />
        )}
        {tela === "admin-login" && (
          <AdminLogin
            onEntrar={(s) => {
              setAdminAuth(true);
              setAdminSenha(s);
              setTela("admin");
            }}
          />
        )}
        {tela === "admin" && (
          <AdminPage
            onSair={() => {
              setAdminAuth(false);
              setAdminSenha("");
              setTela("aluna");
            }}
            adminSenha={adminSenha}
          />
        )}
      </div>
    </>
  );
}