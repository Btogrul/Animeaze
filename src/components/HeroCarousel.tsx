import React, { useState, useEffect } from 'react';
import { Play, Plus, Star, Users, Flame, Info, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { Anime } from '../types';

interface HeroCarouselProps {
  featuredAnimes: Anime[];
  onSelectAnime: (animeId: string) => void;
  onCreateWatchParty: (animeId: string) => void;
  onToggleBookmark: (animeId: string) => void;
  bookmarkedIds: string[];
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  featuredAnimes,
  onSelectAnime,
  onCreateWatchParty,
  onToggleBookmark,
  bookmarkedIds
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (featuredAnimes.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredAnimes.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [featuredAnimes.length]);

  if (featuredAnimes.length === 0) return null;

  const currentAnime = featuredAnimes[currentIndex];
  const isBookmarked = bookmarkedIds.includes(currentAnime.id);

  return (
    <div className="relative w-full h-[500px] sm:h-[580px] rounded-3xl overflow-hidden glass-card border border-amber-500/30 shadow-2xl my-6">
      
      {/* Background Banner Image with Glass Blur Overlay */}
      <div className="absolute inset-0">
        <img 
          src={currentAnime.bannerImage || currentAnime.posterImage} 
          alt={currentAnime.title}
          className="w-full h-full object-cover object-center filter brightness-90 scale-105 transition-all duration-1000 ease-out"
        />
        {/* Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
      </div>

      {/* Floating Glass Content Overlay */}
      <div className="relative z-10 max-w-4xl h-full flex flex-col justify-end p-6 sm:p-12">
        
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="flex items-center space-x-1.5 px-3 py-1 bg-amber-500 text-slate-950 text-xs font-black rounded-xl gold-glow shadow-lg uppercase tracking-wider">
            <Flame className="w-3.5 h-3.5 fill-slate-950" />
            <span>Mövsümün Hiti</span>
          </span>

          <span className="flex items-center space-x-1 px-3 py-1 bg-slate-900/80 text-amber-300 text-xs font-bold rounded-xl border border-amber-500/30">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{currentAnime.score} / 10</span>
          </span>

          <span className="px-2.5 py-1 bg-slate-900/80 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700">
            {currentAnime.type} • {currentAnime.episodesCount} Seriya
          </span>

          <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 text-xs font-semibold rounded-xl border border-amber-500/30">
            {currentAnime.ageRating}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-2 drop-shadow-md">
          {currentAnime.title}
        </h1>

        <p className="text-xs sm:text-sm text-amber-200/80 italic font-medium mb-3">
          {currentAnime.japaneseTitle} • {currentAnime.studio}
        </p>

        {/* Synopsis */}
        <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 sm:line-clamp-3 max-w-2xl mb-6 leading-relaxed">
          {currentAnime.synopsis}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onSelectAnime(currentAnime.id)}
            className="flex items-center space-x-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-sm gold-glow shadow-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>İndi İzlə</span>
          </button>

          <button
            onClick={() => onCreateWatchParty(currentAnime.id)}
            className="flex items-center space-x-2 px-5 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-amber-300 border border-amber-500/40 text-sm font-bold backdrop-blur-md transition-all cursor-pointer"
          >
            <Users className="w-4 h-4 text-amber-400" />
            <span>Watch Party Yarat</span>
          </button>

          <button
            onClick={() => onToggleBookmark(currentAnime.id)}
            className={`flex items-center space-x-2 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
              isBookmarked
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:border-amber-500/30'
            }`}
          >
            <Plus className={`w-4 h-4 ${isBookmarked ? 'rotate-45' : ''} transition-transform`} />
            <span>{isBookmarked ? 'Siyahıdadır' : 'Siyahıma Əlavə Et'}</span>
          </button>
        </div>

      </div>

      {/* Slider Nav Arrows */}
      <div className="absolute right-6 bottom-6 z-20 flex items-center space-x-2">
        <button
          onClick={() => setCurrentIndex((prev) => (prev === 0 ? featuredAnimes.length - 1 : prev - 1))}
          className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-amber-500 text-slate-300 hover:text-slate-950 border border-amber-500/20 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-bold text-amber-400 px-2">
          0{currentIndex + 1} / 0{featuredAnimes.length}
        </span>
        <button
          onClick={() => setCurrentIndex((prev) => (prev + 1) % featuredAnimes.length)}
          className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-amber-500 text-slate-300 hover:text-slate-950 border border-amber-500/20 transition-all cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
};
