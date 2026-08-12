import React, { useState } from 'react';
import { 
  Filter, 
  Search, 
  Grid, 
  List, 
  Star, 
  Sparkles, 
  RefreshCw, 
  Zap, 
  Heart, 
  Skull, 
  Wand2, 
  SlidersHorizontal, 
  X, 
  Tag, 
  Flame, 
  Smile, 
  Film,
  Compass,
  Check
} from 'lucide-react';
import { Anime } from '../types';
import { AnimeCard } from './AnimeCard';
import { Language, translations } from '../lib/i18n';
import { AnimeGridSkeleton } from './SkeletonLoader';

interface CatalogViewProps {
  animes: Anime[];
  onSelectAnime: (animeId: string) => void;
  onToggleBookmark: (animeId: string) => void;
  bookmarkedIds: string[];
  currentLang?: Language;
  isLoading?: boolean;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  animes,
  onSelectAnime,
  onToggleBookmark,
  bookmarkedIds,
  currentLang = 'az',
  isLoading = false
}) => {
  const t = translations[currentLang];
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedStudio, setSelectedStudio] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [sortBy, setSortBy] = useState<'score' | 'views' | 'year'>('score');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Extract unique genres with counts
  const genreCounts: { [key: string]: number } = {};
  animes.forEach(a => {
    a.genres.forEach(g => {
      genreCounts[g] = (genreCounts[g] || 0) + 1;
    });
  });

  const allGenres = Object.keys(genreCounts).sort((a, b) => genreCounts[b] - genreCounts[a]);
  const studios = Array.from(new Set(animes.map(a => a.studio)));
  const years = Array.from(new Set(animes.map(a => a.airedYear))).sort((a: number, b: number) => b - a);

  // Helper for genre icon mapping
  const getGenreIcon = (genre: string) => {
    const lower = genre.toLowerCase();
    if (lower.includes('aksiya') || lower.includes('action')) return <Zap className="w-3.5 h-3.5 text-amber-400" />;
    if (lower.includes('romantik') || lower.includes('romance')) return <Heart className="w-3.5 h-3.5 text-rose-400" />;
    if (lower.includes('triller') || lower.includes('thriller') || lower.includes('qorxu') || lower.includes('horror')) return <Skull className="w-3.5 h-3.5 text-purple-400" />;
    if (lower.includes('fanta') || lower.includes('magic')) return <Wand2 className="w-3.5 h-3.5 text-cyan-400" />;
    if (lower.includes('komedi') || lower.includes('comedy')) return <Smile className="w-3.5 h-3.5 text-emerald-400" />;
    if (lower.includes('dram') || lower.includes('drama')) return <Film className="w-3.5 h-3.5 text-blue-400" />;
    return <Compass className="w-3.5 h-3.5 text-amber-300" />;
  };

  const filtered = animes.filter(anime => {
    const matchesQ = 
      anime.title.toLowerCase().includes(query.toLowerCase()) ||
      anime.japaneseTitle.toLowerCase().includes(query.toLowerCase());
    const matchesGenre = selectedGenre ? anime.genres.includes(selectedGenre) : true;
    const matchesStatus = selectedStatus ? anime.status === selectedStatus : true;
    const matchesStudio = selectedStudio ? anime.studio === selectedStudio : true;
    const matchesYear = selectedYear ? anime.airedYear === Number(selectedYear) : true;

    return matchesQ && matchesGenre && matchesStatus && matchesStudio && matchesYear;
  }).sort((a, b) => {
    if (sortBy === 'score') return b.score - a.score;
    if (sortBy === 'views') return b.views - a.views;
    if (sortBy === 'year') return b.airedYear - a.airedYear;
    return 0;
  });

  const resetFilters = () => {
    setQuery('');
    setSelectedGenre('');
    setSelectedStatus('');
    setSelectedStudio('');
    setSelectedYear('');
    setSortBy('score');
  };

  const activeFilterCount = (query ? 1 : 0) + (selectedGenre ? 1 : 0) + (selectedStatus ? 1 : 0) + (selectedStudio ? 1 : 0) + (selectedYear ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn space-y-6">
      
      {/* Page Title & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <span>Anime Kataloqu</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Janrlar (Aksiya, Romantika, Triller, Fantastika...), reyting və illərə görə filtrləyin ({filtered.length} anime tapıldı)
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="lg:hidden flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 font-bold text-xs hover:bg-slate-800 transition-all cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            <span>Kategoriyalar & Filtrlər</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Grid/List View Mode Toggle */}
          <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-xl border border-amber-500/20">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-amber-500 text-slate-950 gold-glow-sm font-bold'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
              title="Tor Görünüşü"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-amber-500 text-slate-950 gold-glow-sm font-bold'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
              title="Siyahı Görünüşü"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Category / Genre Quick Pill Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            <span>Janr Kateqoriyaları:</span>
          </span>
          {selectedGenre && (
            <button 
              onClick={() => setSelectedGenre('')}
              className="text-[11px] font-bold text-amber-400 hover:underline flex items-center space-x-1 cursor-pointer"
            >
              <span>Bütün Janrlar ({animes.length})</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-amber-500/30">
          <button
            onClick={() => setSelectedGenre('')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1.5 border ${
              !selectedGenre
                ? 'bg-amber-500 text-slate-950 border-amber-400 gold-glow-sm'
                : 'bg-slate-900/90 text-slate-300 border-amber-500/20 hover:border-amber-500/50 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Hamısı</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${!selectedGenre ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
              {animes.length}
            </span>
          </button>

          {allGenres.map(genre => {
            const isSelected = selectedGenre === genre;
            return (
              <button
                key={genre}
                onClick={() => setSelectedGenre(isSelected ? '' : genre)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1.5 border ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 gold-glow-sm'
                    : 'bg-slate-900/90 text-slate-300 border-amber-500/20 hover:border-amber-500/50 hover:text-white'
                }`}
              >
                {getGenreIcon(genre)}
                <span>{genre}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-800 text-amber-400/80'}`}>
                  {genreCounts[genre]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Sidebar + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Sidebar Filters (Desktop & Mobile Drawer) */}
        <aside className={`
          lg:block lg:col-span-1 space-y-5 glass-card rounded-3xl p-5 border border-amber-500/20 shadow-xl
          ${isMobileFilterOpen ? 'block' : 'hidden'}
        `}>
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <h3 className="text-sm font-extrabold text-amber-300 uppercase tracking-wider flex items-center space-x-2">
              <Filter className="w-4 h-4 text-amber-400" />
              <span>Axtarış və Filtrlər</span>
            </h3>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Sıfırla</span>
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-300">{t.search}</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-amber-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.searchAnime}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-amber-500/30 text-white text-xs outline-none focus:border-amber-400 transition-all"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Sort Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-300">{t.actions}</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 text-amber-300 border border-amber-500/30 text-xs font-bold outline-none cursor-pointer"
            >
              <option value="score">⭐ {t.highestScore}</option>
              <option value="views">🔥 {t.mostViews}</option>
              <option value="year">📅 {t.newReleases}</option>
            </select>
          </div>

          {/* Dropdown Genre Select */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-300">{t.filterByGenre}</label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 text-slate-200 border border-amber-500/20 text-xs outline-none cursor-pointer"
            >
              <option value="">{t.allGenres} ({animes.length})</option>
              {allGenres.map(g => (
                <option key={g} value={g}>
                  {g} ({genreCounts[g]})
                </option>
              ))}
            </select>
          </div>

          {/* Sidebar Genre Quick List Menu */}
          <div className="space-y-2 pt-2 border-t border-amber-500/10">
            <label className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider block">
              Kateqoriya Siyahısı
            </label>
            <div className="space-y-1 max-h-56 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-amber-500/20">
              <button
                onClick={() => setSelectedGenre('')}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  !selectedGenre
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Bütün Janrlar</span>
                </div>
                {!selectedGenre && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </button>

              {allGenres.map(genre => {
                const isSelected = selectedGenre === genre;
                return (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(isSelected ? '' : genre)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {getGenreIcon(genre)}
                      <span>{genre}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {genreCounts[genre]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-1.5 pt-2 border-t border-amber-500/10">
            <label className="text-[11px] font-extrabold text-slate-300">Yayım Statusu</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 text-slate-200 border border-amber-500/20 text-xs outline-none cursor-pointer"
            >
              <option value="">Bütün Statuslar</option>
              <option value="Davam edir">Davam edir</option>
              <option value="Bitdi">Bitdi</option>
              <option value="Tezliklə">Tezliklə</option>
            </select>
          </div>

          {/* Studio Filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-300">Studiya</label>
            <select
              value={selectedStudio}
              onChange={(e) => setSelectedStudio(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 text-slate-200 border border-amber-500/20 text-xs outline-none cursor-pointer"
            >
              <option value="">Bütün Studiyalar</option>
              {studios.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-300">İl</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 text-slate-200 border border-amber-500/20 text-xs outline-none cursor-pointer"
            >
              <option value="">Bütün İllər</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Mobile Apply Button */}
          <button
            onClick={() => setIsMobileFilterOpen(false)}
            className="lg:hidden w-full py-2.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl gold-glow cursor-pointer mt-4"
          >
            Filtrləri Tətbiq Et
          </button>
        </aside>

        {/* Anime Results Column */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Active Filter Chips Bar */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-slate-900/80 border border-amber-500/20 text-xs">
              <span className="text-slate-400 font-bold text-[11px]">Aktiv Filtrlər:</span>

              {selectedGenre && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  <span>Janr: {selectedGenre}</span>
                  <button onClick={() => setSelectedGenre('')} className="hover:text-white cursor-pointer ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedStatus && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  <span>Status: {selectedStatus}</span>
                  <button onClick={() => setSelectedStatus('')} className="hover:text-white cursor-pointer ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedStudio && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  <span>Studiya: {selectedStudio}</span>
                  <button onClick={() => setSelectedStudio('')} className="hover:text-white cursor-pointer ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedYear && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  <span>İl: {selectedYear}</span>
                  <button onClick={() => setSelectedYear('')} className="hover:text-white cursor-pointer ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {query && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                  <span>Sorğu: "{query}"</span>
                  <button onClick={() => setQuery('')} className="hover:text-white cursor-pointer ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={resetFilters}
                className="ml-auto text-[11px] font-bold text-amber-400 hover:underline cursor-pointer"
              >
                Hamısını Təmizlə
              </button>
            </div>
          )}

          {/* Results Render */}
          {isLoading ? (
            <AnimeGridSkeleton count={8} />
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 glass-card rounded-3xl p-8 border-amber-500/20 space-y-3">
              <p className="text-sm font-bold text-slate-300">Axtarışınıza və ya seçilmiş janra uyğun heç bir anime tapılmadı.</p>
              <p className="text-xs text-slate-400">Filtrləri dəyişərək və ya sıfırlayaraq yenidən cəhd edin.</p>
              <button
                onClick={resetFilters}
                className="mt-2 px-5 py-2.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl gold-glow cursor-pointer"
              >
                Filtrləri Sıfırla
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filtered.map(anime => (
                <AnimeCard
                  key={anime.id}
                  anime={anime}
                  onSelect={onSelectAnime}
                  onToggleBookmark={onToggleBookmark}
                  isBookmarked={bookmarkedIds.includes(anime.id)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(anime => (
                <div
                  key={anime.id}
                  onClick={() => onSelectAnime(anime.id)}
                  className="group glass-card rounded-2xl p-4 flex items-center justify-between border-amber-500/20 hover:border-amber-500/50 transition-all cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <img src={anime.posterImage} alt="" className="w-16 h-22 rounded-xl object-cover shrink-0 border border-amber-500/20" />
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">{anime.title}</h3>
                      <p className="text-xs text-amber-200/80 italic">{anime.japaneseTitle}</p>
                      <p className="text-xs text-slate-300 line-clamp-2 mt-1">{anime.synopsis}</p>

                      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                        <span className="text-amber-400 font-bold flex items-center space-x-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{anime.score}</span>
                        </span>
                        <span className="text-slate-400">{anime.studio} • {anime.airedYear}</span>
                        <span className="text-amber-300 font-semibold">{anime.episodesCount} Seriya</span>

                        {anime.genres.map(g => (
                          <span key={g} className="px-2 py-0.5 rounded-md bg-slate-800 text-amber-300/90 text-[10px] font-bold">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

