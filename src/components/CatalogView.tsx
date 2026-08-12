import React, { useState } from 'react';
import { Filter, Search, Grid, List, Star, Sparkles, RefreshCw } from 'lucide-react';
import { Anime } from '../types';
import { AnimeCard } from './AnimeCard';

interface CatalogViewProps {
  animes: Anime[];
  onSelectAnime: (animeId: string) => void;
  onToggleBookmark: (animeId: string) => void;
  bookmarkedIds: string[];
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  animes,
  onSelectAnime,
  onToggleBookmark,
  bookmarkedIds
}) => {
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedStudio, setSelectedStudio] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [sortBy, setSortBy] = useState<'score' | 'views' | 'year'>('score');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const genres = Array.from(new Set(animes.flatMap(a => a.genres)));
  const studios = Array.from(new Set(animes.map(a => a.studio)));
  const years = Array.from(new Set(animes.map(a => a.airedYear))).sort((a: number, b: number) => b - a);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <span>Anime Kataloqu</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Minlərlə epizod, janr və reytinq filtrinə görə anime kəşf edin
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-amber-500 text-slate-950 gold-glow-sm font-bold'
                : 'bg-slate-900/80 text-slate-400 hover:text-amber-300'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-amber-500 text-slate-950 gold-glow-sm font-bold'
                : 'bg-slate-900/80 text-slate-400 hover:text-amber-300'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Bar Panel */}
      <div className="glass-card rounded-3xl p-5 border border-amber-500/20 space-y-4">
        
        {/* Search & Sort Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-amber-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Kataloqda anime axtar..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Sırala:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 text-amber-300 border border-amber-500/30 text-xs font-bold"
            >
              <option value="score">Ən Yüksək Reytinq</option>
              <option value="views">Ən Çox İzlənilənlər</option>
              <option value="year">Ən Yenilər</option>
            </select>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-amber-500/10 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1">Janr</label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 text-slate-200 border border-amber-500/20"
            >
              <option value="">Bütün Janrlar</option>
              {genres.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 text-slate-200 border border-amber-500/20"
            >
              <option value="">Bütün Statuslar</option>
              <option value="Davam edir">Davam edir</option>
              <option value="Bitdi">Bitdi</option>
              <option value="Tezliklə">Tezliklə</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1">Studiya</label>
            <select
              value={selectedStudio}
              onChange={(e) => setSelectedStudio(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 text-slate-200 border border-amber-500/20"
            >
              <option value="">Bütün Studiyalar</option>
              {studios.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1">İl</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 text-slate-200 border border-amber-500/20"
            >
              <option value="">Bütün İllər</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset Button */}
        {(query || selectedGenre || selectedStatus || selectedStudio || selectedYear) && (
          <div className="flex justify-end pt-1">
            <button
              onClick={resetFilters}
              className="flex items-center space-x-1 px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Filtrləri Sıfırla</span>
            </button>
          </div>
        )}

      </div>

      {/* Anime Results Grid or Detailed List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-3xl p-8 border-amber-500/20">
          <p className="text-sm font-bold text-slate-300">Axtarışınıza uyğun heç bir anime tapılmadı.</p>
          <button
            onClick={resetFilters}
            className="mt-3 px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl gold-glow cursor-pointer"
          >
            Filtrləri Sıfırla
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
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

                  <div className="flex items-center space-x-3 mt-2 text-xs">
                    <span className="text-amber-400 font-bold flex items-center space-x-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{anime.score}</span>
                    </span>
                    <span className="text-slate-400">{anime.studio} • {anime.airedYear}</span>
                    <span className="text-amber-300 font-semibold">{anime.episodesCount} Seriya</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
