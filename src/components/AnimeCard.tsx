import React from 'react';
import { Star, Play, Plus, Check, Eye } from 'lucide-react';
import { Anime } from '../types';

interface AnimeCardProps {
  anime: Anime;
  onSelect: (animeId: string) => void;
  onToggleBookmark?: (animeId: string) => void;
  isBookmarked?: boolean;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({
  anime,
  onSelect,
  onToggleBookmark,
  isBookmarked = false
}) => {
  return (
    <div 
      onClick={() => onSelect(anime.id)}
      className="group relative rounded-2xl glass-card glass-card-hover overflow-hidden flex flex-col cursor-pointer select-none"
    >
      {/* Poster Image Frame */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-900">
        <img 
          src={anime.posterImage} 
          alt={anime.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Hover Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Score Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center space-x-1 px-2 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-amber-500/30 text-amber-400 font-bold text-xs gold-glow-sm">
          <Star className="w-3 h-3 fill-amber-400" />
          <span>{anime.score}</span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-2.5 right-2.5">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase backdrop-blur-md border ${
            anime.status === 'Davam edir'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
          }`}>
            {anime.status}
          </span>
        </div>

        {/* Play Icon Hover Trigger */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center gold-glow transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-6 h-6 fill-slate-950 ml-0.5" />
          </div>
        </div>

        {/* Quick Add Bookmark Button */}
        {onToggleBookmark && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(anime.id);
            }}
            className={`absolute bottom-2.5 right-2.5 p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer border ${
              isBookmarked
                ? 'bg-amber-500 text-slate-950 border-amber-400 gold-glow-sm'
                : 'bg-slate-950/70 text-slate-300 hover:text-amber-400 border-amber-500/20 hover:border-amber-500/50'
            }`}
            title={isBookmarked ? 'Siyahıdan çıxart' : 'Siyahıya əlavə et'}
          >
            {isBookmarked ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Card Content Footer */}
      <div className="p-3.5 flex flex-col justify-between flex-1">
        <div>
          <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-1">
            {anime.title}
          </h3>
          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
            {anime.studio} • {anime.airedYear}
          </p>
        </div>

        <div className="flex items-center justify-between mt-3 text-[10px] text-slate-400 font-medium pt-2 border-t border-amber-500/10">
          <span>{anime.episodesCount} Seriya</span>
          <span className="flex items-center space-x-1">
            <Eye className="w-3 h-3 text-amber-500/70" />
            <span>{(anime.views / 1000).toFixed(1)}k</span>
          </span>
        </div>
      </div>

    </div>
  );
};
