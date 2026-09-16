import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import L from 'leaflet';
import { Complaint, ComplaintCategory } from '../../types';
import { Filter, Layers, MapPin, Eye, Clock, ShieldAlert } from 'lucide-react';

interface CityGISMapProps {
  onSelectComplaint: (complaint: Complaint) => void;
}

export const CityGISMap: React.FC<CityGISMapProps> = ({ onSelectComplaint }) => {
  const { complaints } = useStore();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedWard, setSelectedWard] = useState<string>('all');
  const [activeMarkerComplaint, setActiveMarkerComplaint] = useState<Complaint | null>(null);

  // Category filter items
  const categories: { key: string; label: string; icon: string }[] = [
    { key: 'all', label: 'All Issues', icon: '🏙️' },
    { key: 'roads', label: 'Roads', icon: '🛣️' },
    { key: 'sanitation', label: 'Sanitation', icon: '🗑️' },
    { key: 'water', label: 'Water', icon: '🚰' },
    { key: 'lighting', label: 'Lighting', icon: '💡' },
  ];

  // Colors for pins
  const getCategoryColor = (cat: ComplaintCategory) => {
    switch (cat) {
      case 'roads':
        return '#EF4444'; // Red
      case 'sanitation':
        return '#F59E0B'; // Amber
      case 'water':
        return '#06B6D4'; // Cyan
      case 'lighting':
        return '#8B5CF6'; // Purple
      default:
        return '#4F46E5'; // Indigo
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [21.1458, 79.0882],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
      markersLayerRef.current = markersGroup;
    }

    return () => {
      // Keep instance or cleanup on unmount
    };
  }, []);

  // Update map markers when filters or complaints change
  useEffect(() => {
    if (!markersLayerRef.current || !mapInstanceRef.current) return;

    markersLayerRef.current.clearLayers();

    const filtered = complaints.filter((c) => {
      if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
      if (selectedWard !== 'all' && !c.location.ward.includes(selectedWard)) return false;
      return true;
    });

    filtered.forEach((comp) => {
      const color = getCategoryColor(comp.category);
      const isUrgent = comp.priority === 'critical' || comp.priority === 'high';

      const customMarker = L.divIcon({
        className: 'city-gis-marker',
        html: `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 10px rgba(0,0,0,0.3); border: 2px solid white; cursor: pointer;">
                <div style="transform: rotate(45deg); font-size: 13px;">${
                  comp.category === 'roads'
                    ? '🛣️'
                    : comp.category === 'sanitation'
                    ? '🗑️'
                    : comp.category === 'lighting'
                    ? '💡'
                    : '🚰'
                }</div>
               </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });

      const marker = L.marker([comp.location.lat, comp.location.lng], {
        icon: customMarker,
      });

      marker.on('click', () => {
        setActiveMarkerComplaint(comp);
      });

      marker.addTo(markersLayerRef.current!);
    });
  }, [complaints, selectedCategory, selectedWard]);

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-xs overflow-hidden flex flex-col space-y-3 p-4 sm:p-5">
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Geographic Intelligence & City Hotspots</span>
          </h3>
          <p className="text-xs text-gray-500">
            Real-time GIS mapping of reported civic issues across Nagpur wards
          </p>
        </div>

        {/* Ward Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">Ward:</span>
          <select
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-gray-800 focus:outline-none"
          >
            <option value="all">All Wards (Citywide)</option>
            <option value="Ward 12">Ward 12 (Dharampeth)</option>
            <option value="Ward 8">Ward 8 (Sitabuldi)</option>
            <option value="Ward 15">Ward 15 (Dhantoli)</option>
          </select>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              selectedCategory === cat.key
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Map Element */}
      <div className="relative h-80 sm:h-96 w-full rounded-2xl overflow-hidden border border-gray-200 shadow-inner">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Ward summary overlay tag */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm p-3 rounded-2xl border border-gray-200 shadow-md z-[400] text-xs max-w-xs space-y-1">
          <span className="font-bold text-gray-900 block">
            {selectedWard === 'all' ? 'Nagpur Municipal Area' : selectedWard}
          </span>
          <div className="flex items-center gap-3 text-[11px] text-gray-600">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Roads</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Waste</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              <span>Water</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span>Lighting</span>
            </span>
          </div>
        </div>

        {/* Active Marker Preview Card Popup */}
        {activeMarkerComplaint && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-sm bg-white p-3.5 rounded-2xl border border-gray-200 shadow-xl z-[400] animate-slide-up flex flex-col space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                  #{activeMarkerComplaint.id}
                </span>
                <h4 className="text-xs font-bold text-gray-900 mt-1 line-clamp-1">
                  {activeMarkerComplaint.subCategory}
                </h4>
              </div>
              <button
                onClick={() => setActiveMarkerComplaint(null)}
                className="text-gray-400 hover:text-gray-600 text-xs p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-gray-600 line-clamp-2">
              "{activeMarkerComplaint.translatedDescription}"
            </p>

            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-100">
              <span className="text-gray-500 font-medium">
                {activeMarkerComplaint.location.address}
              </span>
              <button
                onClick={() => {
                  onSelectComplaint(activeMarkerComplaint);
                  setActiveMarkerComplaint(null);
                }}
                className="text-indigo-600 font-bold hover:text-indigo-800 flex items-center gap-1"
              >
                <span>Inspect</span>
                <Eye className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

