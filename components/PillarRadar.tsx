'use client';

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface Props {
  economic: number;       // mapped → ICT Readiness
  social: number;         // mapped → Infrastructure
  agriculture: number;    // mapped → Learning Resources
  infrastructure: number; // mapped → Digital Equity
}

// Label map: old generic names → Education pillar names
const LABEL_MAP: Record<string, string> = {
  Economic:       'ICT Readiness',
  Social:         'Infrastructure',
  Agriculture:    'Resources',
  Infrastructure: 'Digital Equity',
};

export default function PillarRadar({ economic, social, agriculture, infrastructure }: Props) {
  const data = [
    { subject: 'ICT Readiness',  value: economic,       fullMark: 100 },
    { subject: 'Infrastructure', value: social,          fullMark: 100 },
    { subject: 'Resources',      value: agriculture,     fullMark: 100 },
    { subject: 'Digital Equity', value: infrastructure,  fullMark: 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data} margin={{ top: 14, right: 24, bottom: 14, left: 24 }}>
        <PolarGrid stroke="#374151" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: '#9ca3af', fontSize: 11 }}
        />
        <Radar
          name="Gap Score"
          dataKey="value"
          stroke="#ef4444"
          fill="#ef4444"
          fillOpacity={0.28}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#111827',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#f9fafb',
            fontSize: '12px',
          }}
          formatter={(v) => [`${v}/100`, 'Gap Score']}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
