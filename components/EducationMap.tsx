'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { DistrictEducationData } from '@/lib/districtEducation';
import type { EducationPriorityResult } from '@/lib/educationScore';

interface Props {
  districts: (DistrictEducationData & { result: EducationPriorityResult })[];
  selectedDistrict?: string;
  onDistrictClick?: (id: string) => void;
}

const LEVEL_COLOR = {
  Critical: '#ef4444',
  High:     '#f59e0b',
  Moderate: '#3b82f6',
  Low:      '#22c55e',
};

function radius(score: number) { return 8 + (score / 100) * 18; }

export default function EducationMap({ districts, selectedDistrict, onDistrictClick }: Props) {
  const mapRef     = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markers    = useRef<{ id: string; circle: any }[]>([]);
  const router     = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined' || leafletMap.current || !mapRef.current) return;

    import('leaflet').then(L => {
      if (!mapRef.current || (mapRef.current as any)._leaflet_id) return;
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, { center: [-1.94, 29.87], zoom: 8, zoomControl: true });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>', maxZoom: 18,
      }).addTo(map);

      districts.forEach(d => {
        const color = LEVEL_COLOR[d.result.priorityLevel];
        const r = radius(d.result.priorityScore);
        const circle = L.circleMarker([d.lat, d.lng], {
          radius: r, fillColor: color, color: '#fff', weight: 2, fillOpacity: 0.85,
        }).addTo(map);

        circle.bindTooltip(
          `<div style="font-family:sans-serif;padding:4px 8px;min-width:160px">
            <strong>${d.name}</strong><br/>
            ${d.province}<br/>
            Gap Score: <strong>${d.result.priorityScore}/100</strong><br/>
            Priority: <span style="color:${color};font-weight:bold">${d.result.priorityLevel}</span><br/>
            ICT: ${d.ictAdoptionPct}% · Smart: ${d.smartClassroomPct}%
          </div>`,
          { sticky: true }
        );

        circle.on('click', () => {
          if (onDistrictClick) onDistrictClick(d.id);
          else router.push(`/district/${d.id}`);
        });

        if (selectedDistrict === d.id) circle.setStyle({ weight: 4, color: '#1e40af' });
        markers.current.push({ id: d.id, circle });
      });

      leafletMap.current = map;
    });

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
        markers.current = [];
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update selection
  useEffect(() => {
    markers.current.forEach(({ id, circle }) => {
      const d = districts.find(d => d.id === id);
      if (!d) return;
      if (id === selectedDistrict) {
        circle.setStyle({ weight: 4, color: '#1e40af', radius: radius(d.result.priorityScore) + 4 });
        circle.bringToFront();
      } else {
        circle.setStyle({ weight: 2, color: '#fff', radius: radius(d.result.priorityScore) });
      }
    });
  }, [selectedDistrict, districts]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg" />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-gray-900/90 border border-gray-700 rounded-xl p-3 z-[1000] text-xs">
        <p className="text-gray-500 font-semibold uppercase tracking-wider mb-2">Education Gap</p>
        {Object.entries(LEVEL_COLOR).map(([level, color]) => (
          <div key={level} className="flex items-center gap-2 mb-1.5">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-gray-300">{level}</span>
          </div>
        ))}
        <p className="text-gray-600 mt-1">Circle size = gap score</p>
      </div>

      {/* NISR badge */}
      <div className="absolute top-3 right-3 bg-blue-900/80 border border-blue-700 rounded-lg px-2 py-1 z-[1000]">
        <p className="text-blue-300 text-xs font-mono">NISR-informed</p>
      </div>
    </div>
  );
}
