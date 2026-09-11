import type { ReactNode } from 'react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  accent?: 'blue' | 'red' | 'amber' | 'green' | 'purple';
}

const accents = {
  blue:   { card: 'border-gray-800 bg-gray-900', bar: 'bg-blue-600',    icon: 'bg-blue-600/10 border-blue-600/20'   },
  red:    { card: 'border-gray-800 bg-gray-900', bar: 'bg-red-600',     icon: 'bg-red-600/10 border-red-600/20'     },
  amber:  { card: 'border-gray-800 bg-gray-900', bar: 'bg-amber-500',   icon: 'bg-amber-500/10 border-amber-500/20' },
  green:  { card: 'border-gray-800 bg-gray-900', bar: 'bg-emerald-600', icon: 'bg-emerald-600/10 border-emerald-600/20' },
  purple: { card: 'border-gray-800 bg-gray-900', bar: 'bg-violet-600',  icon: 'bg-violet-600/10 border-violet-600/20'  },
};

export default function StatCard({
  label, value, sub, icon, trend, trendLabel, accent = 'blue',
}: Props) {
  const a = accents[accent];

  const TrendIcon =
    trend === 'up' ? TrendingUp :
    trend === 'down' ? TrendingDown : Minus;

  const trendColor =
    trend === 'up' ? 'text-red-400' :
    trend === 'down' ? 'text-emerald-400' : 'text-gray-600';

  return (
    <div className={`${a.card} border rounded-xl p-4 flex flex-col gap-3`}>
      {/* Top row */}
      <div className="flex items-start justify-between">
        <p className="text-gray-500 text-xs font-medium uppercase tracking-wide leading-tight">{label}</p>
        {icon && (
          <div className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 ${a.icon}`}>
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div>
        <p className="text-white text-2xl font-bold tracking-tight tabular-nums">{value}</p>
        {sub && (
          <p className="text-gray-600 text-xs mt-0.5 font-mono">{sub}</p>
        )}
      </div>

      {/* Trend */}
      {trend && trendLabel && (
        <div className={`flex items-center gap-1 text-xs ${trendColor}`}>
          <TrendIcon size={11} strokeWidth={2.5} />
          <span>{trendLabel}</span>
        </div>
      )}
    </div>
  );
}
