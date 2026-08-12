import React, { useState, useEffect } from 'react';
import { User, Anime } from '../types';
import { Search, Globe, BookmarkPlus, Check, Sparkles, X, ExternalLink, BookOpen, Film, Flame, Loader2, Plus, Zap } from 'lucide-react';
import { Language, translations } from '../lib/i18n';

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

interface MyAnimeListExplorerModalProps {
  currentUser: User | null;
  onClose: () => void;
  onSelectAnime?: (animeId: string) => void;
  onTriggerAchievementAction?: (actionType: any, value?: number) => void;
  onAnimeImported?: (newAnime: Anime) => void;
  currentLang?: Language;
}

export const MyAnimeListExplorerModal: React.FC<MyAnimeListExplorerModalProps> = ({
  currentUser,
  onClose,
  onSelectAnime,
  onTriggerAchievementAction,
  onAnimeImported,
  currentLang = 'az'
}) => {
  const [contentType, setContentType] = useState<'manga' | 'anime'>('manga');
  const [searchQuery, setSearchQuery] = useState('');
  const [genres, setGenres] = useState<MALGenre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [results, setResults] = useState<MALItem[]>([]);
  const [isLoadingGenres, setIsLoadingGenres] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [importingId, setImportingId] = useState<number | null>(null);
  const [importedIds, setImportedIds] = useState<number[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // Fetch Genres on mount or content type change
  useEffect(() => {
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
        console.error('Error loading MAL genres:', err);
      } finally {
        setIsLoadingGenres(false);
      }
    };

    fetchGenres();
    // Default initial search
    handleSearch(contentType === 'manga' ? 'Berserk' : 'Naruto');
  }, [contentType]);

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

  const handleImportToViewlist = async (item: MALItem, targetStatus: 'watching' | 'plan_to_watch' | 'completed' = 'plan_to_watch') => {
    const itemId = item.myanimelist_id || item.id || Date.now();
    setImportingId(itemId);

    try {
      const res = await fetch('/api/mal/import-to-viewlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id || 'user-1',
          item: { ...item, type: contentType },
          listType: targetStatus
        })
      });

      if (res.ok) {
        const data = await res.json();
        setImportedIds(prev => [...prev, itemId]);
        setNotification(`"${item.title}" şəxsi izləmə siyahınıza əlavə olundu! ✨`);

        if (onAnimeImported && data.importedAnime) {
          onAnimeImported(data.importedAnime);
        }

        if (onTriggerAchievementAction) {
          onTriggerAchievementAction('bookmark', 1);
        }

        setTimeout(() => setNotification(null), 3500);
      }
    } catch (err) {
      console.error('Import error:', err);
    } finally {
      setImportingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl glass-card border border-amber-500/40 p-5 sm:p-8 shadow-2xl overflow-hidden text-slate-100 gold-glow my-auto max-h-[90vh] flex flex-col">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/30 to-yellow-500/10 border border-amber-500/50 flex items-center justify-center text-amber-400 font-black shadow-lg">
              <Globe className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider">
                  Live API Integration • MyAnimeList (MAL)
                </span>
              </div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                MyAnimeList Verilənlər Bazasından İdxal
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Notification Alert */}
        {notification && (
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-black flex items-center gap-2 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{notification}</span>
          </div>
        )}

        {/* Type Switcher & Search Bar */}
        <div className="my-5 flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Manga / Anime Toggle */}
          <div className="p-1 rounded-2xl bg-slate-900 border border-slate-800 flex shrink-0">
            <button
              onClick={() => {
                setContentType('manga');
                setSearchQuery('');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                contentType === 'manga'
                  ? 'bg-amber-500 text-slate-950 gold-glow shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>MAL Manga Janrları</span>
            </button>
            <button
              onClick={() => {
                setContentType('anime');
                setSearchQuery('');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                contentType === 'anime'
                  ? 'bg-amber-500 text-slate-950 gold-glow shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>MAL Anime Janrları</span>
            </button>
          </div>

          {/* Live Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={contentType === 'manga' ? "MyAnimeList-də Manqa axtarın (məs: Berserk, One Piece)..." : "MyAnimeList-də Anime axtarın (məs: Naruto, Jujutsu Kaisen)..."}
              className="w-full pl-11 pr-24 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500/60"
            />
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <button
              onClick={() => handleSearch()}
              disabled={isSearching}
              className="absolute right-2 top-2 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Axtar</span>
            </button>
          </div>
        </div>

        {/* Live MAL Genres Chips */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> MyAnimeList {contentType === 'manga' ? 'Manqa' : 'Anime'} Janrları ({genres.length})
            </span>
            {isLoadingGenres && <span className="text-[10px] text-slate-400 animate-pulse">Janrlar yüklənir...</span>}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {genres.slice(0, 25).map(genre => {
              const active = selectedGenre === genre.title;
              return (
                <button
                  key={genre.id}
                  onClick={() => {
                    setSelectedGenre(genre.title);
                    setSearchQuery(genre.title);
                    handleSearch(genre.title);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                    active
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                >
                  <span>{genre.title}</span>
                  <span className="ml-1.5 text-[10px] opacity-70">({genre.amount})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-3 custom-scrollbar">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
              <p className="text-xs font-bold text-slate-400">MyAnimeList verilənlər bazasından məlumat çəkilir...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800/80">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-300">Nəticə tapılmadı</p>
              <p className="text-xs text-slate-500">Yuxarıdakı axtarış xanasına fərqli bir söz yazın və ya janrlara klikləyin.</p>
            </div>
          ) : (
            results.map(item => {
              const itemId = item.myanimelist_id || item.id || 0;
              const isAlreadyImported = importedIds.includes(itemId);
              const isImportingThis = importingId === itemId;

              return (
                <div
                  key={itemId}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <img
                      src={item.picture_url}
                      alt={item.title}
                      className="w-16 h-22 rounded-xl object-cover border border-slate-700 shrink-0 bg-slate-800"
                    />
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase">
                          MAL ID: {itemId}
                        </span>
                        <a
                          href={item.myanimelist_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-bold text-slate-400 hover:text-amber-300 flex items-center gap-1 hover:underline"
                        >
                          <span>Rəsmi Səhifə</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <h3 className="text-base font-black text-white truncate">{item.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto shrink-0 flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    {isAlreadyImported ? (
                      <div className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black text-xs flex items-center justify-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Siyahıda Var</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 w-full sm:w-auto">
                        <button
                          onClick={() => handleImportToViewlist(item, 'plan_to_watch')}
                          disabled={isImportingThis}
                          className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs gold-glow hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          {isImportingThis ? (
                            <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                          ) : (
                            <BookmarkPlus className="w-4 h-4" />
                          )}
                          <span>+ İzləmə Siyahıma Əlavə Et</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
