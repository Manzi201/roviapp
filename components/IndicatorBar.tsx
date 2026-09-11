interface Props {
  label: string;
  value: number;
  max?: number;
  unit?: string;
  inverted?: boolean;
  description?: string;
}

export default function IndicatorBar({
  label, value, max = 100, unit = '%', inverted = false, description,
}: Props) {
  const pct = Math.min(100, (value / max) * 100);
  const riskPct = inverted ? 100 - pct : pct;
  const barColor =
    riskPct >= 66 ? 'bg-red-500' :
    riskPct >= 40 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-xs font-medium">{label}</span>
        <span className="text-white text-xs font-bold tabular-nums">
          {value}{unit}
        </span>
      </div>
      <div className="w-full bg-gray-800 rounded-sm h-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {description && (
        <p className="text-gray-700 text-xs font-mono">{description}</p>
      )}
    </div>
  );
}
