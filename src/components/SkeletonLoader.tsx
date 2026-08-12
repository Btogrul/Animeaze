import React from 'react';

// Single Anime Card Skeleton
export const AnimeCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl glass-card border border-slate-800/80 overflow-hidden flex flex-col animate-pulse">
      {/* Poster Aspect Ratio */}
      <div className="relative aspect-[3/4] w-full bg-slate-800/60 overflow-hidden">
        {/* Shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/20 to-transparent -translate-x-full animate-[shimmer_1.8s_infinite]" />
        
        {/* Top Badges Skeleton */}
        <div className="absolute top-2.5 left-2.5 w-12 h-5 rounded-lg bg-slate-700/50" />
        <div className="absolute top-2.5 right-2.5 w-16 h-5 rounded-md bg-slate-700/50" />
      </div>

      {/* Footer Text Lines Skeleton */}
      <div className="p-3.5 flex flex-col justify-between flex-1 space-y-2">
        <div className="space-y-1.5">
          <div className="h-4 bg-slate-700/60 rounded-md w-3/4" />
          <div className="h-3 bg-slate-800/80 rounded-md w-1/2" />
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
          <div className="h-3 bg-slate-800/80 rounded w-12" />
          <div className="h-3 bg-slate-800/80 rounded w-8" />
        </div>
      </div>
    </div>
  );
};

// Grid of Anime Card Skeletons
export const AnimeGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <AnimeCardSkeleton key={idx} />
      ))}
    </div>
  );
};

// Hero Banner Carousel Skeleton
export const HeroCarouselSkeleton: React.FC = () => {
  return (
    <div className="relative w-full h-[500px] sm:h-[580px] rounded-3xl overflow-hidden glass-card border border-slate-800 shadow-2xl my-6 animate-pulse bg-slate-900/80">
      <div className="absolute inset-0 bg-slate-800/40" />
      
      {/* Floating Content Skeleton */}
      <div className="relative z-10 max-w-4xl h-full flex flex-col justify-end p-6 sm:p-12 space-y-4">
        {/* Badges Skeleton */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-28 h-6 bg-slate-700/60 rounded-xl" />
          <div className="w-20 h-6 bg-slate-700/60 rounded-xl" />
          <div className="w-24 h-6 bg-slate-700/60 rounded-xl" />
        </div>

        {/* Title Skeleton */}
        <div className="h-10 sm:h-12 bg-slate-700/70 rounded-2xl w-3/4 sm:w-2/3" />

        {/* Subtitle Skeleton */}
        <div className="h-4 bg-slate-800/80 rounded-lg w-1/3" />

        {/* Synopsis Skeleton */}
        <div className="space-y-2 max-w-2xl py-2">
          <div className="h-3.5 bg-slate-800/80 rounded w-full" />
          <div className="h-3.5 bg-slate-800/80 rounded w-5/6" />
          <div className="h-3.5 bg-slate-800/80 rounded w-2/3" />
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <div className="w-32 h-12 bg-slate-700/80 rounded-2xl" />
          <div className="w-40 h-12 bg-slate-800/80 rounded-2xl" />
          <div className="w-36 h-12 bg-slate-800/80 rounded-2xl" />
        </div>
      </div>
    </div>
  );
};

// Anime Detail / Video Player Skeleton
export const AnimeDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
      {/* Top Banner & Player Skeleton */}
      <div className="w-full aspect-video max-h-[520px] rounded-3xl bg-slate-900 border border-slate-800 relative overflow-hidden flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center" />
      </div>

      {/* Info Header Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-8 bg-slate-800 rounded-xl w-3/4" />
          <div className="flex gap-2">
            <div className="w-20 h-6 bg-slate-800 rounded-lg" />
            <div className="w-24 h-6 bg-slate-800 rounded-lg" />
            <div className="w-16 h-6 bg-slate-800 rounded-lg" />
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-4 bg-slate-800/60 rounded w-full" />
            <div className="h-4 bg-slate-800/60 rounded w-full" />
            <div className="h-4 bg-slate-800/60 rounded w-4/5" />
          </div>
        </div>

        {/* Sidebar Episodes List Skeleton */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-3">
          <div className="h-6 bg-slate-800 rounded-lg w-1/2 mb-4" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 bg-slate-800/60 rounded-xl w-full" />
          ))}
        </div>
      </div>
    </div>
  );
};

// Calendar Schedule Skeleton
export const CalendarSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="w-24 h-10 rounded-2xl bg-slate-800/70 shrink-0" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-slate-900 border border-slate-800 p-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-slate-800 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-800/60 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
