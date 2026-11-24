type StatCardVariant = "primary" | "secondary" | "neutral";

type BadgeVariant = "green" | "coral" | "neutral";

type Props = {
  label: string;
  value: string;
  note?: string;
  variant?: StatCardVariant;
  badgeText?: string;
  badgeVariant?: BadgeVariant;
  icon: React.ReactNode;
};

const ICON_CLASS: Record<StatCardVariant, string> = {
  primary: "j-si b",
  secondary: "j-si c",
  neutral: "j-si n",
};

const BADGE_CLASS: Record<BadgeVariant, string> = {
  green: "j-sbd g",
  coral: "j-sbd c",
  neutral: "j-sbd n",
};

export default function StatCard({
  label,
  value,
  note,
  variant = "neutral",
  badgeText,
  badgeVariant = "neutral",
  icon,
}: Props) {
  return (
    <div className={`j-sc${variant === "primary" ? " feat" : ""}`}>
      <div className="j-sc-top">
        <div className={ICON_CLASS[variant]} aria-hidden="true">
          {icon}
        </div>
        {badgeText && (
          <span className={BADGE_CLASS[badgeVariant]}>{badgeText}</span>
        )}
      </div>
      <div className="j-sl">{label}</div>
      <div className="j-sv">{value}</div>
      {note && <div className="j-sn">{note}</div>}
    </div>
  );
}
