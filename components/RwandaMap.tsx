'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { DistrictData } from '@/lib/districts';

interface RwandaMapProps {
  districts: DistrictData[];
  selectedDistrict?: string;
  onDistrictClick?: (id: string) => void;
}

function getColor(level: 'Low' | 'Medium' | 'High') {
  if (level === 'High') return '#ef4444';
  if (level === 'Medium') return '#f59e0b';
  return '#22c55e';
}

function getRadius(score: number) {
  return 8 + (score / 100) * 16;
}

export default function RwandaMap({
  districts,
  selectedDistrict,
  onDistrictClick,
}: RwandaMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markersRef = useRef<{ id: string; circle: any }[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined' || leafletMap.current) return;
    if (!mapRef.current) return;

    import('leaflet').then((L) => {
      // Guard against double-init (React StrictMode / HMR)
      if (!mapRef.current || (mapRef.current as any)._leaflet_id) return;

      // Fix default icon paths broken by bundlers
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, {
        center: [-1.9403, 29.8739],
        zoom: 8,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      districts.forEach((d) => {
        const color = getColor(d.vulnerability_level);
        const radius = getRadius(d.vulnerability_score);

        const circle = L.circleMarker([d.lat, d.lng], {
          radius,
          fillColor: color,
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.85,
        }).addTo(map);

        circle.bindTooltip(
          `<div style="font-family:sans-serif;padding:4px 8px;">
            <strong>${d.name}</strong><br/>
            ${d.province}<br/>
            Score: <strong>${d.vulnerability_score}/100</strong><br/>
            Level: <span style="color:${color};font-weight:bold">${d.vulnerability_level}</span>
          </div>`,
          { sticky: true, className: 'rovi-tooltip' }
        );

        circle.on('click', () => {
          if (onDistrictClick) onDistrictClick(d.id);
          else router.push(`/district/${d.id}`);
        });

        if (selectedDistrict === d.id) {
          circle.setStyle({ weight: 4, color: '#1e40af' });
        }

        markersRef.current.push({ id: d.id, circle });
      });

      leafletMap.current = map;
    });

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
        markersRef.current = [];
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update selection highlight
  useEffect(() => {
    markersRef.current.forEach(({ id, circle }) => {
      const d = districts.find((d) => d.id === id);
      if (!d) return;
      if (id === selectedDistrict) {
        circle.setStyle({
          weight: 4,
          color: '#1e40af',
          radius: getRadius(d.vulnerability_score) + 4,
        });
        circle.bringToFront();
      } else {
        circle.setStyle({
          weight: 2,
          color: '#fff',
          radius: getRadius(d.vulnerability_score),
        });
      }
    });
  }, [selectedDistrict, districts]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-xl" />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur border border-gray-700 rounded-xl p-3 z-[1000] text-sm">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
          Vulnerability
        </p>
        <div className="flex flex-col gap-1.5">
          {[
            { color: '#ef4444', label: 'High (≥60)' },
            { color: '#f59e0b', label: 'Medium (40–59)' },
            { color: '#22c55e', label: 'Low (<40)' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-gray-300 text-xs">{label}</span>
            </div>
          ))}
        </div>
        <p className="text-gray-500 text-xs mt-2">Circle size = risk score</p>
      </div>

      {/* Source badge */}
      <div className="absolute top-3 right-3 bg-blue-900/80 border border-blue-700 rounded-lg px-2 py-1 z-[1000]">
        <p className="text-blue-300 text-xs font-medium">📊 NISR Data</p>
      </div>
    </div>
  );
}
