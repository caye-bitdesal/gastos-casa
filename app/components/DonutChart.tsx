const CIRCUMFERENCE = 2 * Math.PI * 46; // r=46 → ≈289.03
const COLORS = ["#4B68D8", "#E8956D", "#C8CFDC", "#E8EAF0"];

type Segment = {
  label: string;
  importe: number;
  porcentaje: number;
};

type Props = {
  segments: Segment[];
  totalLabel: string;
};

export default function DonutChart({ segments, totalLabel }: Props) {
  let offset = 0;

  return (
    <div className="j-chart-a">
      <div className="j-donut-w" role="img" aria-label={`Gráfico de categorías. Total: ${totalLabel}`}>
        <svg
          className="j-donut-svg"
          width="120"
          height="120"
          viewBox="0 0 120 120"
          aria-hidden="true"
        >
          <circle cx="60" cy="60" r="46" fill="none" stroke="var(--bd)" strokeWidth="13" />
          {segments.map((seg, i) => {
            const dash = (seg.porcentaje / 100) * CIRCUMFERENCE;
            const color = COLORS[i] ?? COLORS[COLORS.length - 1];
            const thisOffset = offset;
            offset += dash;
            return (
              <circle
                key={seg.label}
                cx="60"
                cy="60"
                r="46"
                fill="none"
                stroke={color}
                strokeWidth="13"
                strokeDasharray={`${dash} ${CIRCUMFERENCE}`}
                strokeDashoffset={-thisOffset}
                strokeLinecap="butt"
              />
            );
          })}
        </svg>
        <div className="j-donut-ctr" aria-hidden="true">
          <div className="j-donut-v">{totalLabel}</div>
          <div className="j-donut-l">Total</div>
        </div>
      </div>

      <div className="j-leg" role="list">
        {segments.map((seg, i) => {
          const color = COLORS[i] ?? COLORS[COLORS.length - 1];
          return (
            <div key={seg.label} className="j-li" role="listitem">
              <div className="j-ldot" style={{ background: color }} aria-hidden="true" />
              <div className="j-lin">
                <div className="j-lname">{seg.label}</div>
                <div className="j-lpct">{seg.porcentaje}% del total</div>
              </div>
              <div className="j-lamt">{seg.importe.toFixed(2)} €</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
