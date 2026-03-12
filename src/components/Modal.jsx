import React from "react";

export default function Modal({ nome, onConfirm, onCancel, tipo }) {
  const isConfirm = tipo === "confirmar";

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-icon">{isConfirm ? "✅" : "🗑️"}</div>
        <div className="modal-title">
          {isConfirm ? "Confirmar pagamento?" : "Remover pedido?"}
        </div>
        <div className="modal-sub">
          {isConfirm ? (
            <>
              Confirmar que <strong>{nome}</strong> Realizou o pagamento?
              <br />O pedido será marcado como pago.
            </>
          ) : (
            <>
              Tem certeza que deseja remover o pedido de <strong>{nome}</strong>?
              <br />Esta ação não pode ser desfeita.
            </>
          )}
        </div>
        <div className="modal-btns">
          <button className="btn-cancel" onClick={onCancel}>
            Cancelar
          </button>
          {isConfirm ? (
            <button className="btn-confirm-modal" onClick={onConfirm}>
              Sim, confirmar
            </button>
          ) : (
            <button className="btn-danger" onClick={onConfirm}>
              Sim, remover
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
