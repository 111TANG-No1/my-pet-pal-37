import { useEffect, useRef } from 'react';

interface MarkerData {
  lat: number;
  lng: number;
  iconHtml: string;
  popupHtml: string;
}

interface LeafletMapProps {
  markers: MarkerData[];
  className?: string;
}

export default function LeafletMap({ markers, className = '' }: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let map: any = null;

    import('leaflet').then(L => {
      if (!containerRef.current) return;

      // Ensure CSS loaded
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      map = L.map(containerRef.current!).setView([39.9042, 116.4074], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(map);

      markers.forEach(m => {
        const icon = L.divIcon({
          html: m.iconHtml,
          className: 'bg-transparent',
          iconSize: [32, 32],
        });
        L.marker([m.lat, m.lng], { icon }).addTo(map).bindPopup(m.popupHtml);
      });

      mapRef.current = map;
      setTimeout(() => map?.invalidateSize(), 100);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (map) {
        try { map.remove(); } catch {}
      }
    };
  }, []); // mount-only; key change = full remount

  return <div ref={containerRef} className={`w-full h-[55vh] rounded-xl overflow-hidden border ${className}`} />;
}
