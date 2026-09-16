import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { Camera, Image as ImageIcon, Check, X, Sparkles, Trash2, ArrowRight } from 'lucide-react';
import { sampleCivicImages } from '../../data/mockData';
import { ComplaintCategory } from '../../types';

interface PhotoCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: ComplaintCategory;
  onPhotoSelected: (photoUrl: string | null) => void;
}

export const PhotoCaptureModal: React.FC<PhotoCaptureModalProps> = ({
  isOpen,
  onClose,
  category,
  onPhotoSelected,
}) => {
  const { t, language } = useStore();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(() => {
    // Default matching sample for easy testing
    if (category === 'roads') return sampleCivicImages.potholeBefore;
    if (category === 'sanitation') return sampleCivicImages.garbageBefore;
    if (category === 'lighting') return sampleCivicImages.streetlightBefore;
    if (category === 'water') return sampleCivicImages.waterleakBefore;
    return sampleCivicImages.potholeBefore;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const sampleEvidence = [
    { label: 'Road Pothole', url: sampleCivicImages.potholeBefore },
    { label: 'Garbage Dump', url: sampleCivicImages.garbageBefore },
    { label: 'Street Light', url: sampleCivicImages.streetlightBefore },
    { label: 'Water Leakage', url: sampleCivicImages.waterleakBefore },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-gradient-to-b from-indigo-50/50 to-white">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
              <Camera className="w-4 h-4" />
            </span>
            <span className="text-sm font-semibold text-gray-800">Photo Evidence</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-center">
          <h3 className="text-xl font-bold text-gray-900">{t.photo.title}</h3>
          <p className="text-xs text-gray-500 max-w-xs mx-auto">{t.photo.subtitle}</p>

          {/* Photo Preview Box or Capture Box */}
          {selectedPhoto ? (
            <div className="relative rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-md bg-black">
              <img
                src={selectedPhoto}
                alt="Complaint Evidence"
                className="w-full h-56 object-cover"
              />
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs text-white p-1.5 rounded-full hover:bg-rose-600 transition-colors">
                <button
                  type="button"
                  onClick={() => setSelectedPhoto(null)}
                  title={t.photo.removePhoto}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-[11px] text-white px-2.5 py-1 rounded-md flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.photo.photoAttached}</span>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 bg-gray-50 flex flex-col items-center justify-center hover:border-indigo-400 transition-colors">
              <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
                <Camera className="w-8 h-8" />
              </div>
              <p className="text-xs font-semibold text-gray-700">Take a quick picture of the issue</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Supports camera or gallery upload</p>

              <div className="mt-4 flex gap-2 w-full max-w-xs justify-center">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2 px-3 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{t.photo.takePhoto}</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2 px-3 bg-white border border-gray-300 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-50 flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>{t.photo.uploadGallery}</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick 1-Click Civic Presets for Demo */}
          <div className="pt-2 text-left">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.photo.samplePresetsTitle}</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {sampleEvidence.map((sample, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedPhoto(sample.url)}
                  className={`rounded-xl overflow-hidden border-2 transition-all p-0.5 relative group ${
                    selectedPhoto === sample.url
                      ? 'border-indigo-600 ring-2 ring-indigo-200'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={sample.url}
                    alt={sample.label}
                    className="w-full h-14 object-cover rounded-lg"
                  />
                  <span className="text-[10px] font-medium text-gray-700 block text-center truncate mt-1">
                    {sample.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 space-y-2">
            <button
              type="button"
              onClick={() => onPhotoSelected(selectedPhoto)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all"
            >
              <span>Continue with {selectedPhoto ? 'Photo' : 'No Photo'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onPhotoSelected(null)}
              className="text-xs text-gray-400 hover:text-gray-600 font-medium py-1"
            >
              {t.photo.skip}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

