type Props = {
  nombre: string;
  importe: number;
  porcentaje: number;
  index: number;
};

const BAR_COLORS = ["var(--tx)", "var(--cor)", "var(--pri)", "var(--grn)"];

export default function MemberBar({ nombre, importe, porcentaje, index }: Props) {
  const initials = nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const barColor = BAR_COLORS[index % BAR_COLORS.length] ?? "var(--tx)";
  const avatarClass = index === 0 ? "j-mav" : "j-mav alt";

  return (
    <div className="j-mrow">
      <div className="j-mtop">
        <div className={avatarClass} aria-hidden="true">{initials}</div>
        <div className="j-mnm">{nombre}</div>
        <div className="j-mamt">{importe.toFixed(2)} €</div>
      </div>
      <div
        className="j-mtrack"
        role="progressbar"
        aria-valuenow={porcentaje}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${nombre}: ${porcentaje}%`}
      >
        <div
          className="j-mfill"
          style={{ width: `${Math.min(100, porcentaje)}%`, background: barColor }}
        />
      </div>
      <div className="j-mpct">{porcentaje}% del total</div>
    </div>
  );
}
