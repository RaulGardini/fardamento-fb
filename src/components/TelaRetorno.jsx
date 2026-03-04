import React from "react";

export default function TelaRetorno({ status, onVoltar }) {
  const isFail = status === "falhou";
  const isLojinha = status === "lojinha";

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
              : "Se você realizou o pix, irá aparecer uma confirmação no seu Email em instantes!"}
        </div>
        <div className="suc-sub">
          {isFail
            ? "O pagamento não foi processado. Você pode tentar novamente."
            : isLojinha
              ? "Seu pedido foi salvo. Compareça à lojinha TP para efetuar o pagamento com cartão, fique atento ao WhatsApp para saber a data de retirada dos uniformes!"
              : "Assim que a confirmação do pagamento aparecer no seu Email, fique atento no WhatsApp, informaremos em breve a data para você retirar o seu fardamento na loja TP. Obrigado!"}
        </div>
        <br />
        <button className="btn-ghost" onClick={onVoltar}>
          ← Voltar ao início
        </button>
      </div>
    </div>
  );
}
