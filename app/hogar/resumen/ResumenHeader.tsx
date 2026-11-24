"use client";

type Props = {
  etiquetaMes: string;
  onPrev: () => void;
  onNext: () => void;
  onAddGasto: () => void;
};

export default function ResumenHeader({ etiquetaMes, onPrev, onNext, onAddGasto }: Props) {
  return (
    <div className="j-phd">
      <div>
        <div className="j-pey">
          <button className="j-btn-nav" onClick={onPrev} aria-label="Mes anterior">←</button>
          <span style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>{etiquetaMes}</span>
          <button className="j-btn-nav" onClick={onNext} aria-label="Mes siguiente">→</button>
        </div>
        <h1 className="j-pt">Resumen del hogar</h1>
        <p className="j-ps">Estado de los gastos compartidos.</p>
      </div>
      <button className="j-btn-p" onClick={onAddGasto}>
        <svg width="13" height="13" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path d="M9 3.75v10.5M3.75 9h10.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Añadir gasto
      </button>
    </div>
  );
}
