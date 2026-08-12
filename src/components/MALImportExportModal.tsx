import React, { useState } from 'react';
import { Sparkles, Download, Upload, FileText, CheckCircle, X } from 'lucide-react';

interface MALImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccessImport: () => void;
}

export const MALImportExportModal: React.FC<MALImportExportModalProps> = ({
  isOpen,
  onClose,
  userId,
  onSuccessImport
}) => {
  const [importText, setImportText] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSimulatedImport = async () => {
    if (!importText.trim()) {
      setStatusMessage('Xahiş olunur XML və ya JSON məlumatını daxil edin.');
      return;
    }

    setLoading(true);
    try {
      // Create mock parse structure
      const sampleList = [
        { title: 'Solo Leveling', status: 'watching', progress: 2, score: 10 },
        { title: 'Demon Slayer', status: 'completed', progress: 8, score: 9 },
        { title: 'Jujutsu Kaisen', status: 'completed', progress: 23, score: 10 },
        { title: 'Attack on Titan', status: 'completed', progress: 28, score: 10 }
      ];

      const res = await fetch('/api/mal/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, listData: sampleList })
      });

      if (res.ok) {
        const data = await res.json();
        setStatusMessage(data.message);
        onSuccessImport();
      }
    } catch (e) {
      console.error(e);
      setStatusMessage('İdxal zamanı xəta baş verdi.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = async () => {
    try {
      const res = await fetch(`/api/trackers/${userId}`);
      if (res.ok) {
        const trackers = await res.json();
        const blob = new Blob([JSON.stringify(trackers, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aniglass_export_${userId}.json`;
        a.click();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-xl w-full glass-card rounded-3xl p-6 sm:p-8 border border-amber-500/40 text-slate-100 relative space-y-6">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 gold-glow">
            <Sparkles className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white">MAL / AniList İdxalı & İxracı</h2>
            <p className="text-xs text-slate-400">Köhnə platformalardakı siyahınızı tək tıkla AniGlass-a köçürün</p>
          </div>
        </div>

        {/* Import Section */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-amber-400">
            MyAnimeList XML və ya AniList JSON Mətnini Yapışdırın:
          </label>
          <textarea
            rows={5}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder={`<?xml version="1.0" encoding="UTF-8" ?>\n<myanimelist>\n  <anime>\n    <series_title>Solo Leveling</series_title>\n    <my_watched_episodes>2</my_watched_episodes>\n  </anime>\n</myanimelist>`}
            className="w-full p-3 rounded-2xl glass-input text-xs font-mono text-slate-200 border-amber-500/20"
          />

          {statusMessage && (
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-amber-400" />
              <span>{statusMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleExportJSON}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Siyahını JSON kimi İxrac Et</span>
            </button>

            <button
              type="button"
              onClick={handleSimulatedImport}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs gold-glow hover:brightness-110 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4 stroke-[3]" />
              <span>{loading ? 'Yüklənir...' : 'İdxal Et'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
