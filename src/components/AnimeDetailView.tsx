import React, { useState, useEffect } from 'react';
import { 
  Star, Play, Plus, Users, Heart, MessageSquare, ThumbsUp, ThumbsDown, 
  Eye, Check, ShieldAlert, Sparkles, Send, Share2, CornerDownRight, Tv
} from 'lucide-react';
import { Anime, Episode, Character, Studio, Comment, AnimeTrackItem, User } from '../types';
import { CustomVideoPlayer } from './CustomVideoPlayer';
import { Language, translations } from '../lib/i18n';
import { AnimeDetailSkeleton } from './SkeletonLoader';

interface AnimeDetailViewProps {
  animeId: string;
  currentUser: User | null;
  onBack: () => void;
  onCreateWatchParty: (animeId: string, episodeId?: string) => void;
  onOpenAuth?: (reason?: string) => void;
  currentLang?: Language;
  onTriggerAchievementAction?: (actionType: 'watch_episode' | 'post_comment' | 'rate_anime' | 'watch_party' | 'bookmark' | 'add_time' | 'wiki', value?: number) => void;
}

interface RatingStats {
  animeId: string;
  userRating: number;
  averageStarRating: number;
  totalRatings: number;
  distribution: Record<number, number>;
}

const STAR_LABELS: Record<number, { text: string; emoji: string }> = {
  1: { text: "Çox pis", emoji: "😠" },
  2: { text: "Zəif", emoji: "😐" },
  3: { text: "Yaxşı", emoji: "🙂" },
  4: { text: "Əla", emoji: "😄" },
  5: { text: "Mükəmməl / Şahəsər!", emoji: "🔥" }
};

export const AnimeDetailView: React.FC<AnimeDetailViewProps> = ({
  animeId,
  currentUser,
  onBack,
  onCreateWatchParty,
  onOpenAuth,
  currentLang = 'az',
  onTriggerAchievementAction
}) => {
  const t = translations[currentLang];
  const [animeData, setAnimeData] = useState<{
    anime: Anime;
    episodes: Episode[];
    characters: Character[];
    studioInfo?: Studio;
    recommendations: Anime[];
  } | null>(null);

  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [userTracker, setUserTracker] = useState<AnimeTrackItem | null>(null);

  // 1-to-5 Star Interactive Rating States
  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);
  const [hoverStar, setHoverStar] = useState<number>(0);
  const [ratingMessage, setRatingMessage] = useState<string | null>(null);
  const [isRatingSubmitting, setIsRatingSubmitting] = useState<boolean>(false);

  const [newCommentText, setNewCommentText] = useState('');
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [ratingInput, setRatingInput] = useState<number>(10);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnimeDetails();
    fetchComments();
    fetchUserTracker();
  }, [animeId]);

  const fetchAnimeDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/anime/${animeId}?userId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setAnimeData(data);
        if (data.ratingStats) {
          setRatingStats(data.ratingStats);
        }
        if (data.episodes && data.episodes.length > 0) {
          setSelectedEpisode(data.episodes[0]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRateAnime = async (star: number) => {
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth('Animeni qiymətləndirmək üçün hesabınıza daxil olun!');
      return;
    }

    setIsRatingSubmitting(true);
    try {
      const res = await fetch(`/api/anime/${animeId}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          rating: star
        })
      });
      if (res.ok) {
        const data = await res.json();
        setRatingStats(data.stats);
        setRatingMessage(data.message || `Animəyə ${star} ulduz reytinq verdiniz! ★`);
        setTimeout(() => setRatingMessage(null), 3500);

        if (userTracker) {
          setUserTracker({ ...userTracker, score: star * 2 });
        }
        if (onTriggerAchievementAction) {
          onTriggerAchievementAction('rate_anime', 1);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRatingSubmitting(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments/${animeId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUserTracker = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/trackers/${currentUser.id}`);
      if (res.ok) {
        const list: AnimeTrackItem[] = await res.json();
        const found = list.find(t => t.animeId === animeId);
        if (found) setUserTracker(found);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateTracker = async (status: AnimeTrackItem['status'], progress: number, score: number) => {
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth('İzləmə siyahısını yeniləmək üçün daxil olun!');
      return;
    }

    try {
      const res = await fetch('/api/trackers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          animeId,
          status,
          progress,
          score
        })
      });
      if (res.ok) {
        const data = await res.json();
        setUserTracker(data.tracker);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth('Rəy yazmaq üçün hesabınıza daxil olun!');
      return;
    }

    if (!newCommentText.trim()) return;

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          animeId,
          episodeId: selectedEpisode?.id,
          userId: currentUser.id,
          userUsername: currentUser.username,
          userAvatar: currentUser.avatar,
          content: newCommentText,
          isSpoiler,
          rating: ratingInput
        })
      });
      if (res.ok) {
        const posted = await res.json();
        setComments([posted, ...comments]);
        setNewCommentText('');
        setIsSpoiler(false);
        if (onTriggerAchievementAction) {
          onTriggerAchievementAction('post_comment', 1);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleVoteComment = async (commentId: string, vote: 'up' | 'down') => {
    try {
      const res = await fetch(`/api/comments/${commentId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote })
      });
      if (res.ok) {
        const updated = await res.json();
        setComments(comments.map(c => c.id === commentId ? updated : c));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !animeData) {
    return <AnimeDetailSkeleton />;
  }

  const { anime, episodes, characters, studioInfo, recommendations } = animeData;

  const currentEpisodeIndex = episodes.findIndex(e => e.id === selectedEpisode?.id);
  const hasNextEpisode = currentEpisodeIndex >= 0 && currentEpisodeIndex < episodes.length - 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn space-y-8">
      
      {/* Back Button & Top Action */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-amber-300 border border-amber-500/20 text-xs font-bold transition-all cursor-pointer"
        >
          <span>← Ana Səhifəyə Qayıt</span>
        </button>

        <button
          onClick={() => onCreateWatchParty(anime.id, selectedEpisode?.id)}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs gold-glow hover:brightness-110 transition-all cursor-pointer"
        >
          <Users className="w-4 h-4 stroke-[2.5]" />
          <span>Bu Epizodu Birlikdə İzlə (Watch Party)</span>
        </button>
      </div>

      {/* Video Player Section if Episode is selected */}
      {selectedEpisode && (
        <div className="space-y-4">
          <CustomVideoPlayer
            episode={selectedEpisode}
            animeTitle={anime.title}
            hasNextEpisode={hasNextEpisode}
            onNextEpisode={() => {
              if (hasNextEpisode) setSelectedEpisode(episodes[currentEpisodeIndex + 1]);
            }}
          />

          {/* Episode Info Bar */}
          <div className="p-4 rounded-2xl glass-card flex flex-wrap items-center justify-between gap-4 border-amber-500/20">
            <div>
              <h2 className="text-lg font-extrabold text-amber-300">
                Epizod {selectedEpisode.episodeNumber}: {selectedEpisode.title}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Müddət: {selectedEpisode.duration} • Subtitr: Azərbaycan, Türk, İngilis
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-300">Epizod Seçimi:</span>
              <div className="flex flex-wrap gap-1.5 max-w-md overflow-x-auto">
                {episodes.map((ep) => (
                  <button
                    key={ep.id}
                    onClick={() => setSelectedEpisode(ep)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedEpisode.id === ep.id
                        ? 'bg-amber-500 text-slate-950 gold-glow-sm'
                        : 'bg-slate-900/80 text-slate-300 hover:text-amber-300 border border-amber-500/10'
                    }`}
                  >
                    EP {ep.episodeNumber}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Anime Header Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-amber-500/30 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Left Poster */}
        <div className="md:col-span-1">
          <div className="rounded-2xl overflow-hidden border border-amber-500/30 shadow-2xl relative aspect-[3/4]">
            <img src={anime.posterImage} alt={anime.title} className="w-full h-full object-cover" />
            <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-xl gold-glow flex items-center space-x-1">
              <Star className="w-3.5 h-3.5 fill-slate-950" />
              <span>{anime.score}</span>
            </div>
          </div>

          {/* Tracker Controller Box */}
          <div className="mt-4 p-4 rounded-2xl glass-panel border border-amber-500/20 space-y-3">
            <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
              İzləmə Statusun
            </h4>

            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'watching', label: 'İzlənir' },
                { id: 'completed', label: 'Tamamlandı' },
                { id: 'plan_to_watch', label: 'Baxılacaq' },
                { id: 'dropped', label: 'Tərk Edildi' }
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => handleUpdateTracker(st.id as any, userTracker?.progress || 1, userTracker?.score || 9)}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                    userTracker?.status === st.id
                      ? 'bg-amber-500 text-slate-950 gold-glow-sm'
                      : 'bg-slate-900/80 text-slate-300 hover:text-amber-300 border border-amber-500/10'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Progress Slider */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-300 font-bold mb-1">
                <span>Epizod Tərəqqisi:</span>
                <span className="text-amber-400">{userTracker?.progress || 0} / {anime.episodesCount}</span>
              </div>
              <input
                type="range"
                min={0}
                max={anime.episodesCount}
                value={userTracker?.progress || 0}
                onChange={(e) => handleUpdateTracker(userTracker?.status || 'watching', Number(e.target.value), userTracker?.score || 9)}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Quick 1-to-5 Star Rating Box */}
          <div className="mt-4 p-4 rounded-2xl glass-panel border border-amber-500/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center space-x-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>Ulduz Reytinqi Ver (1-5)</span>
              </h4>
              {ratingStats?.userRating ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {ratingStats.userRating} / 5 ★
                </span>
              ) : null}
            </div>

            {/* 5 Interactive Clickable Stars */}
            <div className="flex items-center justify-between py-1 px-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const activeStar = hoverStar || ratingStats?.userRating || 0;
                const isFilled = star <= activeStar;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverStar(star)}
                    onMouseLeave={() => setHoverStar(0)}
                    onClick={() => handleRateAnime(star)}
                    disabled={isRatingSubmitting}
                    className="p-1 rounded-lg transition-transform hover:scale-125 focus:outline-none cursor-pointer group"
                    title={`${star} Ulduz - ${STAR_LABELS[star]?.text}`}
                  >
                    <Star
                      className={`w-6 h-6 transition-all duration-150 ${
                        isFilled
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] scale-105'
                          : 'text-slate-600 fill-slate-800/80 hover:text-amber-300/60'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Hover / Selection Label */}
            <div className="text-[11px] font-semibold text-center text-amber-200/90 h-5 flex items-center justify-center">
              {hoverStar > 0 ? (
                <span className="animate-fadeIn font-extrabold text-amber-300">
                  {hoverStar} / 5 ★ - {STAR_LABELS[hoverStar]?.text} {STAR_LABELS[hoverStar]?.emoji}
                </span>
              ) : ratingStats?.userRating ? (
                <span className="text-emerald-300 font-bold">
                  Sizin qiymətiniz: {ratingStats.userRating} / 5 ★ ({STAR_LABELS[ratingStats.userRating]?.text})
                </span>
              ) : (
                <span className="text-slate-400 text-[10px]">Ulduzlara klikləyərək reytinq verin</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Info Details */}
        <div className="md:col-span-3 space-y-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-xl border border-amber-500/30">
                {anime.type}
              </span>
              <span className="px-3 py-1 bg-slate-900 text-slate-300 text-xs font-bold rounded-xl border border-slate-700">
                {anime.airedYear} • {anime.season}
              </span>
              <span className="px-3 py-1 bg-slate-900 text-emerald-400 text-xs font-bold rounded-xl border border-emerald-500/30">
                {anime.status}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{anime.title}</h1>
            <p className="text-xs text-amber-200/80 italic mt-0.5">{anime.japaneseTitle}</p>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-2">
            {anime.genres.map(g => (
              <span key={g} className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-900/80 text-amber-300 border border-amber-500/20">
                {g}
              </span>
            ))}
          </div>

          {/* Synopsis */}
          <div>
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Xülasə</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{anime.synopsis}</p>
          </div>

          {/* Key Facts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-900/60 border border-amber-500/10 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Studiya</span>
              <span className="font-bold text-slate-100">{anime.studio}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Baxış Sayı</span>
              <span className="font-bold text-slate-100">{(anime.views / 1000).toFixed(1)}k</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Siyahıda</span>
              <span className="font-bold text-slate-100">{(anime.bookmarksCount / 1000).toFixed(1)}k istifadəçi</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Yaş Məhdudiyyəti</span>
              <span className="font-bold text-amber-400">{anime.ageRating}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 1-to-5 Star Interactive Rating & Community Breakdown Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-amber-500/30 space-y-6 relative overflow-hidden">
        
        {/* Notification Toast Banner */}
        {ratingMessage && (
          <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-400 text-amber-200 font-extrabold text-xs flex items-center space-x-2 animate-bounce">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{ratingMessage}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
          <div>
            <h3 className="text-lg font-extrabold text-amber-400 flex items-center space-x-2">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span>İnteraktiv Ulduz Reytinqi və Statistika</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              İzləyicilərin bu animeyə verdiyi 1-dən 5-ə qədər ulduz reytinqləri və səs paylanması
            </p>
          </div>

          {ratingStats?.userRating ? (
            <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black flex items-center space-x-1.5 self-start sm:self-auto">
              <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
              <span>Sizin reytinqiniz: {ratingStats.userRating} / 5 ★</span>
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold animate-pulse self-start sm:self-auto">
              ★ Sizin də fikriniz vacibdir - Reytinq verin!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Left: Overall Score Summary */}
          <div className="md:col-span-4 p-6 rounded-2xl bg-slate-900/80 border border-amber-500/20 text-center space-y-3">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Ümumi Orta Reytinq
            </span>
            <div className="text-5xl font-black text-amber-300 font-mono tracking-tight flex items-center justify-center space-x-2">
              <span>{ratingStats?.averageStarRating.toFixed(1) || '4.5'}</span>
              <span className="text-2xl text-amber-500">/ 5</span>
            </div>

            {/* 5 Stars Display */}
            <div className="flex justify-center items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const avg = ratingStats?.averageStarRating || 4.5;
                const isFilled = star <= Math.round(avg);
                return (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      isFilled
                        ? 'fill-amber-400 text-amber-400 drop-shadow'
                        : 'text-slate-700 fill-slate-800'
                    }`}
                  />
                );
              })}
            </div>

            <p className="text-xs text-slate-400 font-medium">
              Cəmi <strong className="text-amber-300 font-bold">{ratingStats?.totalRatings || 0}</strong> istifadəçi səs verib
            </p>
          </div>

          {/* Center: Interactive 1-to-5 Star Selector */}
          <div className="md:col-span-4 p-6 rounded-2xl glass-panel border border-amber-500/20 text-center space-y-4">
            <h4 className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">
              Bu Animeyə Neçə Ulduz Verirsiniz?
            </h4>

            {/* 5 Big Clickable Star Buttons */}
            <div className="flex items-center justify-center space-x-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const activeStar = hoverStar || ratingStats?.userRating || 0;
                const isFilled = star <= activeStar;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverStar(star)}
                    onMouseLeave={() => setHoverStar(0)}
                    onClick={() => handleRateAnime(star)}
                    disabled={isRatingSubmitting}
                    className="p-1.5 rounded-xl hover:scale-125 transition-transform duration-150 focus:outline-none cursor-pointer"
                    title={`${star} Ulduz - ${STAR_LABELS[star]?.text}`}
                  >
                    <Star
                      className={`w-8 h-8 transition-all duration-200 ${
                        isFilled
                          ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)] scale-105'
                          : 'text-slate-700 fill-slate-800 hover:text-amber-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Hover / Active Badge Text */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/20 min-h-[42px] flex items-center justify-center">
              {hoverStar > 0 ? (
                <span className="text-xs font-black text-amber-300 flex items-center space-x-1.5 animate-fadeIn">
                  <span>{hoverStar} / 5 Ulduz:</span>
                  <span className="text-amber-400">{STAR_LABELS[hoverStar]?.text}</span>
                  <span>{STAR_LABELS[hoverStar]?.emoji}</span>
                </span>
              ) : ratingStats?.userRating ? (
                <span className="text-xs font-bold text-emerald-300 flex items-center space-x-1.5">
                  <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                  <span>Sizin qiymətiniz: {ratingStats.userRating} / 5 Ulduz ({STAR_LABELS[ratingStats.userRating]?.text})</span>
                </span>
              ) : (
                <span className="text-xs font-semibold text-slate-400">
                  Reytinq vermək üçün ulduzlara klikləyin
                </span>
              )}
            </div>
          </div>

          {/* Right: Distribution Progress Bars */}
          <div className="md:col-span-4 space-y-2 text-xs font-bold">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">
              Reytinq Paylanması:
            </span>

            {[5, 4, 3, 2, 1].map((starNum) => {
              const count = ratingStats?.distribution[starNum] || 0;
              const total = ratingStats?.totalRatings || 1;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;

              return (
                <div key={starNum} className="flex items-center space-x-2">
                  <span className="w-9 text-amber-300 flex items-center font-mono">
                    {starNum} <Star className="w-3 h-3 fill-amber-400 text-amber-400 ml-0.5 inline" />
                  </span>

                  <div className="flex-1 h-3 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <span className="w-10 text-right text-slate-400 font-mono text-[10px]">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Characters & Voice Actors Section */}
      {characters.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-extrabold text-amber-400 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Əsas Personajlar və Səs Aktyorları (Seiyuu)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {characters.map(char => (
              <div key={char.id} className="glass-card rounded-2xl p-3 flex items-center space-x-3 border-amber-500/20">
                <img src={char.image} alt={char.name} className="w-14 h-16 rounded-xl object-cover border border-amber-400/40 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">{char.name}</h4>
                  <p className="text-[10px] text-amber-300/80 italic">{char.japaneseName}</p>
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center space-x-1 pt-1 border-t border-slate-800">
                    <span>Səs:</span>
                    <span className="font-bold text-slate-200">{char.seiyuu.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Threaded Reviews & Comments Section */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-amber-500/30 space-y-6">
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
          <h3 className="text-lg font-extrabold text-amber-400 flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>İstifadəçi Rəyləri və Müzakirələr ({comments.length})</span>
          </h3>
          <span className="text-xs text-slate-400">Rəylərdə spoylerlər tərəfimizdən gizlədilir</span>
        </div>

        {/* Post Comment Form */}
        <form onSubmit={handlePostComment} className="space-y-3 p-4 rounded-2xl bg-slate-900/80 border border-amber-500/20">
          <div className="flex items-center space-x-3">
            <img src={currentUser.avatar} alt="" className="w-9 h-9 rounded-xl object-cover border border-amber-400" />
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Fikirlərinizi bölüşün (Spoyler xəbərdarlığı seçə bilərsiniz)..."
              className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <div className="flex items-center space-x-4 text-xs text-slate-300">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSpoiler}
                  onChange={(e) => setIsSpoiler(e.target.checked)}
                  className="accent-amber-500 rounded cursor-pointer"
                />
                <span className="text-amber-400 font-semibold">Spoyler Tag</span>
              </label>

              <div className="flex items-center space-x-1">
                <span>Reytinq:</span>
                <select
                  value={ratingInput}
                  onChange={(e) => setRatingInput(Number(e.target.value))}
                  className="bg-slate-800 text-amber-300 border border-amber-500/30 rounded px-2 py-0.5 text-xs font-bold"
                >
                  {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(r => (
                    <option key={r} value={r}>{r} / 10</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs gold-glow hover:brightness-110 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Rəy Göndər</span>
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.map(c => {
            const isRevealed = revealedSpoilers[c.id];
            return (
              <div key={c.id} className="p-4 rounded-2xl glass-panel border border-amber-500/10 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <img src={c.userAvatar} alt="" className="w-8 h-8 rounded-xl object-cover border border-amber-400/50" />
                    <div>
                      <span className="text-xs font-bold text-white">{c.userUsername}</span>
                      {c.rating && (
                        <span className="ml-2 px-2 py-0.2 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded border border-amber-500/30">
                          {c.rating}/10 ★
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500">{c.createdAt}</span>
                </div>

                {/* Comment Content (Handling Spoiler Tag) */}
                {c.isSpoiler && !isRevealed ? (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-400 flex items-center space-x-2">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Bu rəydə spoyler var!</span>
                    </span>
                    <button
                      onClick={() => setRevealedSpoilers({ ...revealedSpoilers, [c.id]: true })}
                      className="px-3 py-1 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-lg gold-glow cursor-pointer"
                    >
                      Baxmaq üçün klikləyin
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-200 leading-relaxed pl-10">{c.content}</p>
                )}

                {/* Upvote / Downvote */}
                <div className="flex items-center space-x-4 pl-10 pt-1 text-xs text-slate-400">
                  <button 
                    onClick={() => handleVoteComment(c.id, 'up')}
                    className="flex items-center space-x-1 hover:text-amber-400 cursor-pointer"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{c.upvotes}</span>
                  </button>
                  <button 
                    onClick={() => handleVoteComment(c.id, 'down')}
                    className="flex items-center space-x-1 hover:text-rose-400 cursor-pointer"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>{c.downvotes}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
