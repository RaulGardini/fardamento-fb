import React from "react";

export default function QtyControl({ value, onChange }) {
  return (
    <div className="qty-control">
      <button
        className="qty-btn"
        onClick={() => onChange(Math.max(0, value - 1))}
      >
        −
      </button>
      <span className={`qty-num ${value > 0 ? "has-val" : ""}`}>{value}</span>
      <button className="qty-btn" onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  );
}
