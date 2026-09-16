import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { MapPin, Navigation, AlertCircle, Check, Users, X, Move } from 'lucide-react';
import L from 'leaflet';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationConfirmed: (locationData: {
    lat: number;
    lng: number;
    address: string;
    ward: string;
    landmark?: string;
  }) => void;
  onJoinExisting: (existingId: string) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  onLocationConfirmed,
  onJoinExisting,
}) => {
  const { t, language } = useStore();
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 21.1458,
    lng: 79.0882,
  });
  const [address, setAddress] = useState<string>('Near Laxmi Nagar Square, Wardha Road');
  const [ward, setWard] = useState<string>('Ward 12, Nagpur');
  const [hasNearbyDuplicate, setHasNearbyDuplicate] = useState<boolean>(true);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      // Prevent duplicate init
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 15,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      // Custom marker icon
      const customIcon = L.divIcon({
        className: 'custom-pin',
        html: `<div style="background-color: #4F46E5; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 2px solid white;">
                <div style="transform: rotate(45deg); font-size: 16px;">📍</div>
               </div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
      });

      const marker = L.marker([coords.lat, coords.lng], {
        draggable: true,
        icon: customIcon,
      }).addTo(map);

      marker.on('dragend', () => {
        const position = marker.getLatLng();
        setCoords({ lat: position.lat, lng: position.lng });
        // Update human readable address
        setAddress('Near Shivaji Nagar Junction, West High Court Rd');
        setWard('Ward 12, Nagpur');
      });

      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
        setAddress('Near Shankar Nagar Square');
        setWard('Ward 12, Nagpur');
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-gradient-to-b from-indigo-50/50 to-white">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
              <MapPin className="w-4 h-4" />
            </span>
            <span className="text-sm font-semibold text-gray-800">Pin Location</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3.5">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{t.location.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{t.location.mapSubtext}</p>
          </div>

          {/* Interactive Map Container */}
          <div className="relative h-56 w-full rounded-2xl overflow-hidden border border-gray-200 shadow-inner">
            <div ref={mapContainerRef} className="w-full h-full" />

            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-xs text-[11px] font-medium text-gray-700 px-2.5 py-1 rounded-lg border border-gray-200 flex items-center gap-1 z-[400] shadow-xs">
              <Move className="w-3 h-3 text-indigo-600" />
              <span>{t.location.movePinHint}</span>
            </div>

            <button
              onClick={() => {
                if (mapInstanceRef.current && markerRef.current) {
                  mapInstanceRef.current.setView([21.1458, 79.0882], 16);
                  markerRef.current.setLatLng([21.1458, 79.0882]);
                  setCoords({ lat: 21.1458, lng: 79.0882 });
                  setAddress('Near Laxmi Nagar Square, Wardha Road');
                }
              }}
              title="Reset to current GPS"
              className="absolute bottom-2 right-2 bg-white text-indigo-600 p-2 rounded-xl shadow-md border border-gray-200 z-[400] hover:bg-indigo-50 transition-colors"
            >
              <Navigation className="w-4 h-4" />
            </button>
          </div>

          {/* Human Readable Location (Strictly avoiding raw lat/lng per design.md) */}
          <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-start gap-3">
            <span className="p-2 bg-indigo-600 text-white rounded-xl text-xs mt-0.5">
              <MapPin className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                {language === 'mr' ? 'समस्येचे ठिकाण' : language === 'hi' ? 'समस्या का स्थान' : 'Detected Location'}
              </span>
              <p className="text-sm font-bold text-gray-900 leading-snug">{address}</p>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{ward}</p>
            </div>
          </div>

          {/* PRD Section 29: Duplicate Complaint Alert Card */}
          {hasNearbyDuplicate && (
            <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-2xl">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-amber-900">
                    {t.location.duplicateAlertTitle}
                  </h4>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    {t.location.duplicateAlertBody}
                  </p>

                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onJoinExisting('PRG-10187')}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{t.location.joinComplaintBtn}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setHasNearbyDuplicate(false)}
                      className="px-2.5 py-1.5 bg-white border border-amber-300 text-amber-800 rounded-lg text-xs font-medium hover:bg-amber-100/50 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Button */}
          <button
            type="button"
            onClick={() =>
              onLocationConfirmed({
                lat: coords.lat,
                lng: coords.lng,
                address,
                ward,
                landmark: 'Near bus station',
              })
            }
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Check className="w-4 h-4" />
            <span>{t.location.confirmBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

