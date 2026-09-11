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
  economic: number;
  social: number;
  agriculture: number;
  infrastructure: number;
}

export default function PillarRadar({ economic, social, agriculture, infrastructure }: Props) {
  const data = [
    { subject: 'Economic', value: economic, fullMark: 100 },
    { subject: 'Social', value: social, fullMark: 100 },
    { subject: 'Agriculture', value: agriculture, fullMark: 100 },
    { subject: 'Infrastructure', value: infrastructure, fullMark: 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <PolarGrid stroke="#374151" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: '#9ca3af', fontSize: 12 }}
        />
        <Radar
          name="Risk Score"
          dataKey="value"
          stroke="#ef4444"
          fill="#ef4444"
          fillOpacity={0.25}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#111827',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#f9fafb',
          }}
          formatter={(v) => [`${v}/100`, 'Risk Score']}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
