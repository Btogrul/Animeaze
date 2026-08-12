import React, { useState } from 'react';
import { Achievement, ANIME_ACHIEVEMENTS, calculateAnimeRankAndLevel } from '../lib/achievements';
import { User } from '../types';
import { Trophy, Star, Play, MessageSquare, Clock, ShieldCheck, Zap, Lock, CheckCircle2, X, Filter, Award, Flame } from 'lucide-react';
import { Language, translations } from '../lib/i18n';

interface AchievementsViewModalProps {
  user: User | null;
  onClose: () => void;
  currentLang?: Language;
}

export const AchievementsViewModal: React.FC<AchievementsViewModalProps> = ({
  user,
  onClose,
  currentLang = 'az'
}) => {
  const t = translations[currentLang];
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const userExp = user?.exp || 0;
  const unlockedIds = user?.unlockedAchievements || [];
  const rankInfo = calculateAnimeRankAndLevel(userExp);

  // Helper to calculate progress for locked achievements
  const getProgress = (ach: Achievement): { current: number; target: number; percent: number } => {
    let current = 0;
    const target = ach.targetValue;

    if (user?.stats) {
      if (ach.category === 'watch') {
        current = user.stats.watchedEpisodes || 0;
      } else if (ach.category === 'comment') {
        current = user.stats.commentsCount || 0;
      } else if (ach.category === 'time') {
        current = user.stats.minutesSpent || 0;
      } else if (ach.category === 'rating') {
        current = user.stats.ratingsCount || 0;
      } else if (ach.category === 'social') {
        current = user.stats.watchPartyCount || 0;
      } else if (ach.id === 'ach_bookmark_5') {
        current = user.stats.bookmarksCount || 0;
      } else if (ach.id === 'ach_level_5') {
        current = rankInfo.level;
      } else if (ach.id === 'ach_level_10') {
        current = rankInfo.level;
      }
    }

    const isUnlocked = unlockedIds.includes(ach.id);
    if (isUnlocked) {
      current = target;
    }

    const percent = Math.min(100, Math.floor((current / target) * 100));
    return { current, target, percent };
  };

  const filtered = ANIME_ACHIEVEMENTS.filter(ach => {
    if (selectedCategory === 'all') return true;
    return ach.category === selectedCategory;
  });

  const unlockedCount = unlockedIds.length;
  const totalCount = ANIME_ACHIEVEMENTS.length;
  const overallPercent = Math.floor((unlockedCount / totalCount) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl glass-card border border-amber-500/40 my-auto p-5 sm:p-8 shadow-2xl overflow-hidden text-slate-100 gold-glow max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/30 to-yellow-500/10 border border-amber-500/50 flex items-center justify-center text-amber-400 font-black shadow-lg">
              <Trophy className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase">
                  Anime Hall of Fame
                </span>
              </div>
              <h2 className="text-2xl font-black text-white">Anime Nailiyyətləri & Dərəcələr</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Level & Rank Overview Banner */}
        <div className="my-6 p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 relative overflow-hidden space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`px-4 py-3 rounded-2xl border ${rankInfo.rankColor} flex items-center gap-3 font-black text-lg shadow-inner`}>
                <span className="text-3xl">{rankInfo.rankBadge}</span>
                <div>
                  <p className="text-[10px] text-amber-400 uppercase tracking-wider font-extrabold">Cari Rank Titulu</p>
                  <p className="text-sm sm:text-base">{rankInfo.rankTitle}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-400 font-bold">Ümumi Səviyyə (Level)</p>
                <p className="text-2xl font-black text-amber-400">Level {rankInfo.level}</p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs text-slate-400 font-bold">Kolleksiya Tamamlanması</p>
              <p className="text-xl font-black text-emerald-400">{unlockedCount} / {totalCount} ({overallPercent}%)</p>
            </div>
          </div>

          {/* EXP Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-amber-300 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> EXP Tərəqqisi: {rankInfo.currentLevelExp} / {rankInfo.nextLevelExp} EXP
              </span>
              <span className="text-slate-400">Növbəti Səviyyəyə: {rankInfo.nextLevelExp - rankInfo.currentLevelExp} EXP</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 transition-all duration-500"
                style={{ width: `${rankInfo.progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 no-scrollbar">
          {[
            { id: 'all', label: 'Bütün Nailiyyətlər', icon: Trophy },
            { id: 'watch', label: 'İzləmə', icon: Play },
            { id: 'comment', label: 'Şərhlər', icon: MessageSquare },
            { id: 'rating', label: 'Reytinq', icon: Star },
            { id: 'time', label: 'Aktivlik/Vaxt', icon: Clock },
            { id: 'social', label: 'Watch Party & Sosial', icon: Flame },
            { id: 'special', label: 'Xüsusi & Gizli', icon: Award }
          ].map(cat => {
            const IconComp = cat.icon;
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer border ${
                  active
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md gold-glow'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Achievements Grid */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-3 custom-scrollbar">
          {filtered.map(ach => {
            const isUnlocked = unlockedIds.includes(ach.id);
            const { current, target, percent } = getProgress(ach);

            return (
              <div
                key={ach.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  isUnlocked
                    ? 'bg-gradient-to-r from-slate-900/90 via-amber-950/20 to-slate-900/90 border-amber-500/40 shadow-lg'
                    : 'bg-slate-900/50 border-slate-800/80 opacity-80'
                }`}
              >
                {/* Left side: Icon Badge & Details */}
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${ach.badgeColor} flex items-center justify-center text-2xl shadow-md shrink-0 relative ${!isUnlocked && 'grayscale'}`}>
                    {ach.badgeEmoji}
                    {isUnlocked ? (
                      <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-amber-400 text-slate-950">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-700">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                        {ach.animeTitleRef}
                      </span>
                      {isUnlocked && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase">
                          Kazanıldı ✓
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-black text-white">{ach.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{ach.description}</p>
                  </div>
                </div>

                {/* Right side: EXP Reward & Progress */}
                <div className="w-full sm:w-48 shrink-0 flex flex-col items-start sm:items-end space-y-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-400">
                    <Zap className="w-3.5 h-3.5 fill-amber-400" />
                    +{ach.expReward} EXP
                  </div>

                  {!isUnlocked && (
                    <div className="w-full space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                        <span>Tərəqqi:</span>
                        <span>{current} / {target}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-500 transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
