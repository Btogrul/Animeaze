import React, { useState, useEffect } from 'react';
import { Search, X, Star, Play, Sparkles, Filter, ChevronRight } from 'lucide-react';
import { Anime } from '../types';

interface LiveSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  animes: Anime[];
  onSelectAnime: (animeId: string) => void;
}

export const LiveSearchModal: React.FC<LiveSearchModalProps> = ({
  isOpen,
  onClose,
  animes,
  onSelectAnime
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open search modal (handled by parent or custom state)
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const allGenres = Array.from(new Set(animes.flatMap(a => a.genres)));

  const filtered = animes.filter(anime => {
    const matchesQuery = 
      anime.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      anime.japaneseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      anime.studio.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGenre = selectedGenre ? anime.genres.includes(selectedGenre) : true;

    return matchesQuery && matchesGenre;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-3xl glass-card rounded-3xl p-6 shadow-2xl border border-amber-500/40 relative max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Search Input Bar */}
        <div className="relative flex items-center mb-4">
          <Search className="absolute left-4 w-5 h-5 text-amber-400" />
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Anime adı, Yaponca adı və ya studiya axtarın..."
            className="w-full pl-12 pr-12 py-3.5 rounded-2xl glass-input text-sm text-slate-100 placeholder-slate-400 font-medium border-amber-500/30"
          />
          <button
            onClick={onClose}
            className="absolute right-3.5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Genre Chips */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-3 mb-4 scrollbar-none border-b border-amber-500/20">
          <button
            onClick={() => setSelectedGenre(null)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
              selectedGenre === null
                ? 'bg-amber-500 text-slate-950 font-bold gold-glow-sm'
                : 'bg-slate-900/80 text-slate-300 hover:text-amber-300 border border-amber-500/10'
            }`}
          >
            Bütün Janrlar
          </button>
          {allGenres.map(g => (
            <button
              key={g}
              onClick={() => setSelectedGenre(selectedGenre === g ? null : g)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                selectedGenre === g
                  ? 'bg-amber-500 text-slate-950 font-bold gold-glow-sm'
                  : 'bg-slate-900/80 text-slate-300 hover:text-amber-300 border border-amber-500/10'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-10 h-10 text-amber-500/40 mx-auto mb-2 animate-bounce" />
              <p className="text-sm font-semibold text-slate-300">Axtarışa uyğun anime tapılmadı.</p>
              <p className="text-xs text-slate-500 mt-1">Fərqli açar söz və ya janr filtrini yoxlayın.</p>
            </div>
          ) : (
            filtered.map(anime => (
              <div
                key={anime.id}
                onClick={() => {
                  onSelectAnime(anime.id);
                  onClose();
                }}
                className="group flex items-center justify-between p-3 rounded-2xl glass-panel hover:bg-slate-800/80 border border-amber-500/10 hover:border-amber-500/40 transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <div className="relative w-14 h-20 rounded-xl overflow-hidden shrink-0 border border-amber-500/20 shadow-md">
                    <img 
                      src={anime.posterImage} 
                      alt={anime.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/0 transition-all" />
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                      {anime.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 italic">
                      {anime.japaneseTitle}
                    </p>

                    <div className="flex items-center space-x-2 mt-2">
                      <span className="flex items-center space-x-1 text-xs font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-lg border border-amber-500/30">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{anime.score}</span>
                      </span>

                      <span className="text-xs text-slate-400">
                        {anime.airedYear} • {anime.studio}
                      </span>

                      <span className="text-[10px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded-md border border-slate-700 font-medium">
                        {anime.episodesCount} Seriya
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pr-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 group-hover:bg-amber-500 text-amber-300 group-hover:text-slate-950 flex items-center justify-center transition-all">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
