import React, { useState, useEffect } from 'react';
import { Sparkles, Download, Upload, FileText, CheckCircle, X, Globe, Search, BookOpen, Film, Flame, Loader2, BookmarkPlus, Check, ExternalLink } from 'lucide-react';

interface MALImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccessImport: () => void;
  onTriggerAchievementAction?: (actionType: any, value?: number) => void;
}

interface MALGenre {
  id: number;
  title: string;
  amount: number;
}

interface MALItem {
  myanimelist_id?: number;
  id?: number;
  title: string;
  description: string;
  picture_url: string;
  myanimelist_url: string;
}

export const MALImportExportModal: React.FC<MALImportExportModalProps> = ({
  isOpen,
  onClose,
  userId,
  onSuccessImport,
  onTriggerAchievementAction
}) => {
  const [activeTab, setActiveTab] = useState<'live_api' | 'file_import'>('live_api');

  // Live API States
  const [contentType, setContentType] = useState<'manga' | 'anime'>('manga');
  const [searchQuery, setSearchQuery] = useState('');
  const [genres, setGenres] = useState<MALGenre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [results, setResults] = useState<MALItem[]>([]);
  const [isLoadingGenres, setIsLoadingGenres] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [importingId, setImportingId] = useState<number | null>(null);
  const [importedIds, setImportedIds] = useState<number[]>([]);
  const [liveMessage, setLiveMessage] = useState<string | null>(null);

  // File Import States
  const [importText, setImportText] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch MAL Genres when live tab or content type changes
  useEffect(() => {
    if (!isOpen || activeTab !== 'live_api') return;

    const fetchGenres = async () => {
      setIsLoadingGenres(true);
      try {
        const res = await fetch(`/api/mal/genres?type=${contentType}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setGenres(data);
          }
        }
      } catch (err) {
        console.error('Error fetching MAL genres:', err);
      } finally {
        setIsLoadingGenres(false);
      }
    };

    fetchGenres();
    handleSearch(contentType === 'manga' ? 'Berserk' : 'Naruto');
  }, [isOpen, activeTab, contentType]);

  if (!isOpen) return null;

  const handleSearch = async (term?: string) => {
    const queryToUse = term !== undefined ? term : searchQuery;
    if (!queryToUse.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/mal/search?q=${encodeURIComponent(queryToUse)}&type=${contentType}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setResults(data);
        }
      }
    } catch (err) {
      console.error('Error searching MAL:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleImportItemToViewlist = async (item: MALItem) => {
    const itemId = item.myanimelist_id || item.id || Date.now();
    setImportingId(itemId);

    try {
      const res = await fetch('/api/mal/import-to-viewlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          item: { ...item, type: contentType },
          listType: 'plan_to_watch'
        })
      });

      if (res.ok) {
        setImportedIds(prev => [...prev, itemId]);
        setLiveMessage(`"${item.title}" şəxsi izləmə siyahınıza əlavə edildi! ✨`);
        onSuccessImport();

        if (onTriggerAchievementAction) {
          onTriggerAchievementAction('bookmark', 1);
        }

        setTimeout(() => setLiveMessage(null), 3500);
      }
    } catch (err) {
      console.error('Import error:', err);
    } finally {
      setImportingId(null);
    }
  };

  const handleSimulatedImport = async () => {
    if (!importText.trim()) {
      setStatusMessage('Xahiş olunur XML və ya JSON məlumatını daxil edin.');
      return;
    }

    setLoading(true);
    try {
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
        a.download = `animeaze_export_${userId}.json`;
        a.click();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative max-w-4xl w-full glass-card rounded-3xl p-5 sm:p-8 border border-amber-500/40 text-slate-100 my-auto shadow-2xl gold-glow overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-800 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/30 to-yellow-500/10 text-amber-400 flex items-center justify-center border border-amber-500/40 gold-glow shrink-0">
            <Globe className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase">
                RapidAPI Official MAL Connector
              </span>
            </div>
            <h2 className="text-xl font-black text-white">MyAnimeList Məlumat Baza Mərkəzi</h2>
            <p className="text-xs text-slate-400">MyAnimeList-dən canlı manqa/anime çəkin və ya siyahınızı idxal edin</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 my-4 p-1 rounded-2xl bg-slate-900 border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('live_api')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'live_api'
                ? 'bg-amber-500 text-slate-950 gold-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>MyAnimeList Canlı Axtarış və Janrlar</span>
          </button>
          <button
            onClick={() => setActiveTab('file_import')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'file_import'
                ? 'bg-amber-500 text-slate-950 gold-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Fayl / Mətn İdxalı və İxracı</span>
          </button>
        </div>

        {/* TAB 1: LIVE API EXPLORER */}
        {activeTab === 'live_api' && (
          <div className="flex-1 flex flex-col min-h-0 space-y-4">
            
            {/* Live Message Alert */}
            {liveMessage && (
              <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black flex items-center gap-2 animate-fadeIn">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{liveMessage}</span>
              </div>
            )}

            {/* Type Switcher & Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
              <div className="p-1 rounded-xl bg-slate-900 border border-slate-800 flex shrink-0">
                <button
                  onClick={() => { setContentType('manga'); setSearchQuery(''); }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    contentType === 'manga' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Manqa</span>
                </button>
                <button
                  onClick={() => { setContentType('anime'); setSearchQuery(''); }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    contentType === 'anime' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Anime</span>
                </button>
              </div>

              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={contentType === 'manga' ? "MAL-da Manqa axtar (Berserk, One Piece)..." : "MAL-da Anime axtar (Naruto, Bleach)..."}
                  className="w-full pl-9 pr-20 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500/60"
                />
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <button
                  onClick={() => handleSearch()}
                  disabled={isSearching}
                  className="absolute right-1 top-1 px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] cursor-pointer flex items-center gap-1"
                >
                  {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                  <span>Axtar</span>
                </button>
              </div>
            </div>

            {/* Live MAL Genres Chips */}
            <div className="shrink-0 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-extrabold text-amber-400 uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" /> MyAnimeList {contentType === 'manga' ? 'Manqa' : 'Anime'} Janrları ({genres.length})
                </span>
                {isLoadingGenres && <span className="text-[10px] text-slate-400 animate-pulse">Yüklənir...</span>}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {genres.slice(0, 20).map(g => (
                  <button
                    key={g.id}
                    onClick={() => {
                      setSelectedGenre(g.title);
                      setSearchQuery(g.title);
                      handleSearch(g.title);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap border cursor-pointer ${
                      selectedGenre === g.title
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span>{g.title}</span>
                    <span className="ml-1 text-[9px] opacity-70">({g.amount})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Results List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-0">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-2">
                  <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                  <p className="text-xs font-bold text-slate-400">MyAnimeList məlumatları yüklənir...</p>
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/40 rounded-xl border border-slate-800">
                  <p className="text-xs text-slate-400">Nəticə tapılmadı. Yuxarıdakı axtarışa söz yazın.</p>
                </div>
              ) : (
                results.map(item => {
                  const itemId = item.myanimelist_id || item.id || 0;
                  const isImported = importedIds.includes(itemId);
                  const isImporting = importingId === itemId;

                  return (
                    <div
                      key={itemId}
                      className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/30 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.picture_url}
                          alt={item.title}
                          className="w-12 h-16 rounded-lg object-cover border border-slate-800 shrink-0 bg-slate-800"
                        />
                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[9px] font-extrabold rounded">
                              MAL ID: {itemId}
                            </span>
                            <a
                              href={item.myanimelist_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-slate-400 hover:text-amber-300 flex items-center gap-0.5"
                            >
                              <span>MAL Səhifəsi</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                          <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                          <p className="text-[11px] text-slate-400 line-clamp-1">{item.description}</p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isImported ? (
                          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Əlavə olundu</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleImportItemToViewlist(item)}
                            disabled={isImporting}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs gold-glow transition-all cursor-pointer flex items-center gap-1"
                          >
                            {isImporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                            <span>+ Siyahıma Əlavə Et</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: FILE IMPORT / EXPORT */}
        {activeTab === 'file_import' && (
          <div className="space-y-4 my-2">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-amber-400">
                MyAnimeList XML və ya AniList JSON Mətnini Yapışdırın:
              </label>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="MAL-dan eksport olunmuş XML fayl mətnini və ya izləmə siyahısı strukturlarını bura kopyalayın..."
                rows={5}
                className="w-full p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500/60 font-mono"
              />
            </div>

            {statusMessage && (
              <div className="p-3 rounded-2xl bg-slate-900 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{statusMessage}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={handleSimulatedImport}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs gold-glow cursor-pointer transition-all flex items-center justify-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>{loading ? 'İdxal Olunur...' : 'Mətndən İdxal Et'}</span>
              </button>

              <button
                onClick={handleExportJSON}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-bold text-xs cursor-pointer transition-all flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Siyahımı JSON Kimi İxrac Et</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
