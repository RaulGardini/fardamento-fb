// components/TelaRetorno.jsx
import React from "react";

export default function TelaRetorno({ status, forma, onVoltar }) {
  const isFail = status === "falhou";
  const isLojinha = status === "lojinha";
  const isPix = forma === "pix_lojinha";

  return (
    <div className="card">
      <div className="success-box">
        <div className="suc-icon">
          {isFail ? "😕" : isLojinha ? "🏪" : "🎉"}
        </div>
        <div
          className={`suc-title ${isFail ? "falhou" : isLojinha ? "lojinha" : ""}`}
        >
          {isFail
            ? "Pagamento não confirmado!"
            : isLojinha
              ? "Pedido reservado com sucesso!"
              : "Pedido recebido!"}
        </div>
        <div className="suc-sub">
          {isFail
            ? "O pagamento não foi processado. Você pode tentar novamente."
            : isLojinha
              ? `Seu pedido foi salvo. Entre em contato com a Academia de dança FB para efetuar o pagamento${isPix ? " via PIX" : " com cartão"}, fique atento ao WhatsApp para saber a data de retirada dos uniformes!`
              : "Fique atento no WhatsApp, informaremos em breve a data para você retirar o seu fardamento na loja TP. Obrigado!"}
        </div>
        <br />
        <button className="btn-ghost" onClick={onVoltar}>
          ← Voltar ao início
        </button>
      </div>
    </div>
  );
}