import React, { useState, useEffect } from 'react';
import { User, AnimeTrackItem, Friend, ActivityFeed, Character, Anime } from '../types';
import { User as UserIcon, Star, CheckCircle, Clock, BookOpen, Users, Sparkles, Flame, Shield, Camera, AlertCircle, Check, X, Edit3, ShieldAlert, FileText, Filter, Plus, Minus, TrendingUp, BarChart2, Tv, PlayCircle } from 'lucide-react';
import { detectBadWords } from '../lib/contentFilter';

interface UserProfileViewProps {
  currentUser: User;
  animes: Anime[];
  onSelectAnime: (animeId: string) => void;
  onUpdateUserAvatar?: (newUrl: string) => void;
  onUpdateUserProfile?: (updatedUser: Partial<User>) => void;
}

export const ANIME_AVATAR_PRESETS = [
  {
    name: "Jin-Woo (Solo Leveling)",
    url: "https://images.unsplash.com/photo-1563089145-599997674d42?w=300&auto=format&fit=crop&q=80"
  },
  {
    name: "Tanjiro (Demon Slayer)",
    url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&auto=format&fit=crop&q=80"
  },
  {
    name: "Gojo (Jujutsu Kaisen)",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80"
  },
  {
    name: "Eren (Attack on Titan)",
    url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&auto=format&fit=crop&q=80"
  },
  {
    name: "Luffy (One Piece)",
    url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&auto=format&fit=crop&q=80"
  },
  {
    name: "Cyberpunk Ninja",
    url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300&auto=format&fit=crop&q=80"
  },
  {
    name: "Anime Heroine",
    url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80"
  },
  {
    name: "Shadow Shinobi",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80"
  },
  {
    name: "Mecha Pilot",
    url: "https://images.unsplash.com/photo-1614036417651-efe5912149d8?w=300&auto=format&fit=crop&q=80"
  },
  {
    name: "Flame Warrior",
    url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300&auto=format&fit=crop&q=80"
  }
];

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  currentUser,
  animes,
  onSelectAnime,
  onUpdateUserAvatar,
  onUpdateUserProfile
}) => {
  const [activeTab, setActiveTab] = useState<'watching' | 'completed' | 'plan_to_watch' | 'dropped'>('watching');
  const [userTrackers, setUserTrackers] = useState<AnimeTrackItem[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loadingTrackers, setLoadingTrackers] = useState(true);

  // Edit Profile / Nick Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editNick, setEditNick] = useState(currentUser.username);
  const [editBio, setEditBio] = useState(currentUser.bio || '');
  const [editAvatar, setEditAvatar] = useState(currentUser.avatar || '');
  const [editCover, setEditCover] = useState(currentUser.coverImage || '');
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTrackers();
    fetchFriends();
  }, [currentUser.id]);

  useEffect(() => {
    setEditNick(currentUser.username);
    setEditBio(currentUser.bio || '');
    setEditAvatar(currentUser.avatar || '');
    setEditCover(currentUser.coverImage || '');
  }, [currentUser]);

  const fetchTrackers = async () => {
    try {
      const res = await fetch(`/api/trackers/${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setUserTrackers(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTrackers(false);
    }
  };

  const fetchFriends = async () => {
    try {
      const res = await fetch(`/api/social/friends/${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setFriends(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const nickCheck = detectBadWords(editNick);
  const bioCheck = detectBadWords(editBio);
  const avatarCheck = detectBadWords(editAvatar);
  const coverCheck = detectBadWords(editCover);

  const hasFilterViolation = !nickCheck.isValid || !bioCheck.isValid || !avatarCheck.isValid || !coverCheck.isValid;
  const allDetectedWords = Array.from(new Set([
    ...nickCheck.detectedWords,
    ...bioCheck.detectedWords,
    ...avatarCheck.detectedWords,
    ...coverCheck.detectedWords
  ]));

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);

    if (hasFilterViolation) {
      setProfileError(`🚫 Bad Word / 18+ Filter: Daxil edilən mətnlərdə qadağan olunmuş sözlər var! (${allDetectedWords.join(', ')})`);
      return;
    }

    if (editNick.trim().length < 3) {
      setProfileError("Ləqəb (nick) ən azı 3 simvol olmalıdır.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/users/${currentUser.id}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newUsername: editNick.trim(),
          newBio: editBio.trim(),
          newAvatarUrl: editAvatar.trim(),
          newCoverImage: editCover.trim()
        })
      });

      const data = await res.json();

      if (res.ok) {
        setProfileMsg("Təbriklər! Profiliniz və ləqəbiniz (nick) uğurla yeniləndi və təsdiq edildi. ✨");
        if (onUpdateUserProfile) {
          onUpdateUserProfile(data.user);
        }
        setShowEditModal(false);
      } else {
        setProfileError(data.error || "Xəta baş verdi, zəhmət olmasa yenidən cəhd edin.");
      }
    } catch (e) {
      console.error(e);
      setProfileError("Şəbəkə xətası baş verdi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayAvatar = currentUser.avatar || null;
  const displayCover = currentUser.coverImage || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80";

  const has18PlusDetect = nickCheck.has18Plus || bioCheck.has18Plus || avatarCheck.has18Plus || coverCheck.has18Plus;

  const filteredTrackers = userTrackers.filter(t => t.status === activeTab);

  // Progress Calculations for Module
  const totalWatchedEpisodes = userTrackers.reduce((acc, curr) => acc + (curr.progress || 0), 0);
  const totalTargetEpisodes = userTrackers.reduce((acc, curr) => {
    const anime = animes.find(a => a.id === curr.animeId);
    return acc + (anime?.episodesCount || curr.progress || 12);
  }, 0);

  const overallProgressPct = totalTargetEpisodes > 0 ? Math.round((totalWatchedEpisodes / totalTargetEpisodes) * 100) : 0;

  const watchingCount = userTrackers.filter(t => t.status === 'watching').length;
  const completedCount = userTrackers.filter(t => t.status === 'completed').length;
  const planCount = userTrackers.filter(t => t.status === 'plan_to_watch').length;
  const droppedCount = userTrackers.filter(t => t.status === 'dropped').length;

  const handleUpdateProgress = async (e: React.MouseEvent, tracker: AnimeTrackItem, delta: number) => {
    e.stopPropagation();
    const anime = animes.find(a => a.id === tracker.animeId);
    const totalEps = anime?.episodesCount || 12;
    const newProgress = Math.max(0, Math.min(totalEps, tracker.progress + delta));

    if (newProgress === tracker.progress) return;

    let newStatus = tracker.status;
    if (newProgress === totalEps && totalEps > 0) {
      newStatus = 'completed';
    } else if (newProgress > 0 && tracker.status === 'plan_to_watch') {
      newStatus = 'watching';
    }

    setUserTrackers(prev => prev.map(t => t.id === tracker.id ? { ...t, progress: newProgress, status: newStatus } : t));

    try {
      await fetch('/api/trackers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          animeId: tracker.animeId,
          status: newStatus,
          progress: newProgress,
          score: tracker.score,
          notes: tracker.notes
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn space-y-8">
      
      {/* Toast Notice */}
      {profileMsg && (
        <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold text-xs flex items-center justify-between shadow-xl animate-fadeIn">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <span>{profileMsg}</span>
          </div>
          <button onClick={() => setProfileMsg(null)} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Profile Banner & Header */}
      <div className="glass-card rounded-3xl overflow-hidden border border-amber-500/30 relative shadow-2xl">
        <div className="h-48 sm:h-64 w-full relative bg-slate-900">
          <img 
            src={displayCover} 
            alt="Cover"
            className="w-full h-full object-cover filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        </div>

        <div className="relative px-6 sm:px-10 pb-8 flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-16 gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
            
            {/* Avatar Container with Edit Button */}
            <div className="relative group">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 border-amber-500 shadow-2xl gold-glow shrink-0 bg-slate-900 flex items-center justify-center">
                {displayAvatar ? (
                  <img src={displayAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-amber-950/40 text-amber-400">
                    <UserIcon className="w-14 h-14" />
                    <span className="text-[10px] font-bold text-amber-300/80 mt-1">👤 Təsdiq Gözləyir</span>
                  </div>
                )}
              </div>

              {/* Upload Overlay Button */}
              <button
                onClick={() => setShowEditModal(true)}
                className="absolute inset-0 rounded-3xl bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-amber-300 font-extrabold text-xs space-y-1 cursor-pointer backdrop-blur-xs"
              >
                <Camera className="w-6 h-6 text-amber-400" />
                <span>Profili Dəyiş</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{currentUser.username}</h1>
                <span className="px-2.5 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-black text-[10px] uppercase gold-glow">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-amber-200/80 max-w-md">{currentUser.bio}</p>
              <p className="text-[11px] text-slate-400">Üvülük Tarixi: {currentUser.joinedDate}</p>
              
              <button
                onClick={() => setShowEditModal(true)}
                className="mt-2.5 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-all cursor-pointer gold-glow inline-flex items-center space-x-2"
              >
                <Edit3 className="w-4 h-4 stroke-[2.5]" />
                <span>Nick Və Profil Redaktəsi</span>
              </button>
            </div>
          </div>

          {/* Stats Badges */}
          <div className="grid grid-cols-3 gap-3 w-full sm:w-auto">
            <div className="p-3 rounded-2xl glass-panel text-center border-amber-500/20">
              <span className="text-lg font-black gold-gradient-text block">{currentUser.stats.watchedEpisodes}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">İzlənilən Seriya</span>
            </div>
            <div className="p-3 rounded-2xl glass-panel text-center border-amber-500/20">
              <span className="text-lg font-black gold-gradient-text block">{currentUser.stats.hoursWatched}h</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Saat</span>
            </div>
            <div className="p-3 rounded-2xl glass-panel text-center border-amber-500/20">
              <span className="text-lg font-black gold-gradient-text block">{currentUser.stats.animeCount}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Anime Sayı</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile & Nick Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card rounded-3xl p-6 border border-amber-500/40 max-w-lg w-full space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-extrabold text-white">Profil Və Nick (Ləqəb) Redaktəsi</h3>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 18+ Warning Banner */}
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-200 text-xs space-y-1">
              <div className="flex items-center space-x-2 font-extrabold text-rose-400">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>18+ Təhlükəsizlik Və Moderator Qaydaları:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-300">
                🚫 18+ məzmunlu şəkillər, NSFW keçidlər və əxlaqsız ləqəblər (nicklər) istifadə etmək qadağandır. Bütün nick və profil dəyişiklikləri moderator tərəfindən yoxlanıldıqdan sonra aktivləşir.
              </p>
            </div>

            {/* Error Message */}
            {profileError && (
              <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500 text-rose-200 font-bold text-xs flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            {/* Bad Word Filter & 18+ Content Detector Live Indicator Banner */}
            <div className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between ${
              hasFilterViolation 
                ? 'bg-rose-950/80 border-rose-500 text-rose-200 animate-pulse' 
                : 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
            }`}>
              <div className="flex items-center space-x-2">
                <Filter className={`w-4 h-4 ${hasFilterViolation ? 'text-rose-400' : 'text-emerald-400'}`} />
                <span>
                  {hasFilterViolation 
                    ? `🚫 Bad Word Filter & 18+ Detektoru: Qadağan söz tapıldı! (${allDetectedWords.join(', ')})`
                    : '🛡️ Bad Word Filter & 18+ Detektoru: Bütün mətnlər təmizdir'
                  }
                </span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                hasFilterViolation ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-slate-950'
              }`}>
                {hasFilterViolation ? 'BLOKLANDI' : 'TƏHLÜKƏSİZ'}
              </span>
            </div>

            {/* Error Message */}
            {profileError && (
              <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500 text-rose-200 font-bold text-xs flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {/* Nick (Username) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-extrabold text-amber-300 uppercase">
                    Yeni Nick / Ləqəb:
                  </label>
                  {!nickCheck.isValid && (
                    <span className="text-[10px] text-rose-400 font-extrabold flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Söz qadağandır: {nickCheck.detectedWords.join(', ')}</span>
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  placeholder="Ləqəbinizi daxil edin (məs: Orxan_Anime)..."
                  value={editNick}
                  onChange={(e) => setEditNick(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs focus:outline-none font-mono border ${
                    !nickCheck.isValid 
                      ? 'border-rose-500 focus:border-rose-400 bg-rose-950/20' 
                      : 'border-amber-500/30 focus:border-amber-400'
                  }`}
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Qeyd: Bad word filter və 18+ detektoru daxil olunan sözləri avtomatik skan edir.
                </span>
              </div>

              {/* Bio */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-extrabold text-amber-300 uppercase">
                    Haqqında (Bio):
                  </label>
                  {!bioCheck.isValid && (
                    <span className="text-[10px] text-rose-400 font-extrabold flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Söz qadağandır: {bioCheck.detectedWords.join(', ')}</span>
                    </span>
                  )}
                </div>
                <textarea
                  rows={2}
                  placeholder="Özünüz haqqında qısa məlumat yazın..."
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs focus:outline-none border ${
                    !bioCheck.isValid 
                      ? 'border-rose-500 focus:border-rose-400 bg-rose-950/20' 
                      : 'border-amber-500/30 focus:border-amber-400'
                  }`}
                />
              </div>

              {/* Avatar URL */}
              <div>
                <label className="block text-xs font-extrabold text-amber-300 uppercase mb-1">
                  Profil Şəkli URL:
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-900 border border-amber-500/30 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              {/* Presets - 10 Anime Icons */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider">
                    Hazır Anime İkonları (10 Variant):
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">Tək tıkla seçin</span>
                </div>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                  {ANIME_AVATAR_PRESETS.map((item, idx) => {
                    const isSelected = editAvatar === item.url;
                    return (
                      <button
                        type="button"
                        key={idx}
                        title={item.name}
                        onClick={() => setEditAvatar(item.url)}
                        className={`group relative aspect-square rounded-xl overflow-hidden border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-amber-400 ring-2 ring-amber-400/80 scale-105 shadow-lg shadow-amber-500/20'
                            : 'border-slate-800 hover:border-amber-400/60 hover:scale-102 bg-slate-900'
                        }`}
                      >
                        <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 text-amber-300 stroke-[3] drop-shadow" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cover URL */}
              <div>
                <label className="block text-xs font-extrabold text-amber-300 uppercase mb-1">
                  Arxa Fon Şəkli (Cover) URL:
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={editCover}
                  onChange={(e) => setEditCover(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-900 border border-amber-500/30 text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-amber-500/20">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                >
                  Ləğv Et
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || hasFilterViolation}
                  className="px-6 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-extrabold text-xs gold-glow cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{isSubmitting ? "Yadda Saxlanılır..." : "Təsdiqlə Və Yadda Saxla"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Overall Watch Progress & Visualization Module */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-amber-500/30 space-y-6 shadow-2xl relative overflow-hidden">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-amber-400 flex items-center space-x-2">
              <BarChart2 className="w-5 h-5 text-amber-400" />
              <span>İzləmə İrəliləyişi Və Statistika Modulu</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Bütün animelər üzrə baxılan bölümlərin ümumi faizi və status göstəriciləri
            </p>
          </div>

          <div className="flex items-center space-x-3 self-start md:self-auto">
            <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black flex items-center space-x-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Ümumi İrəliləyiş: {overallProgressPct}%</span>
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 text-xs font-bold font-mono">
              {totalWatchedEpisodes} / {totalTargetEpisodes} Bölüm
            </span>
          </div>
        </div>

        {/* Main Overall Progress Bar */}
        <div className="space-y-2.5 p-5 rounded-2xl bg-slate-900/80 border border-amber-500/20">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-amber-300 flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Cəmi İzlənilən Bölümlərin Ümumi İrəliləyiş Çubuğu:</span>
            </span>
            <span className="text-emerald-400 font-mono font-black text-sm">
              {totalWatchedEpisodes} / {totalTargetEpisodes} Bölüm ({overallProgressPct}%)
            </span>
          </div>

          {/* Animated Main Progress Bar */}
          <div className="w-full h-4 rounded-full bg-slate-950 p-0.5 overflow-hidden border border-amber-500/30 relative">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 transition-all duration-700 shadow-[0_0_12px_rgba(251,191,36,0.5)]"
              style={{ width: `${Math.max(2, Math.min(100, overallProgressPct))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-medium">
            <span>Başlanğıc: 0 Episode</span>
            <span className="text-amber-300 font-bold">Təxmini Baxış Vaxtı: ~{Math.round((totalWatchedEpisodes * 24) / 60)} Saat</span>
            <span>Hədəf: {totalTargetEpisodes} Episode</span>
          </div>
        </div>

        {/* Category Breakdown Progress Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Watching */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/20 space-y-2 hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-amber-300 flex items-center space-x-1.5">
                <PlayCircle className="w-4 h-4 text-amber-400" />
                <span>İzlənilir</span>
              </span>
              <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 font-mono">
                {watchingCount} Anime
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${userTrackers.length ? Math.round((watchingCount / userTrackers.length) * 100) : 0}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block font-semibold">
              Siyahının {userTrackers.length ? Math.round((watchingCount / userTrackers.length) * 100) : 0}%-i
            </span>
          </div>

          {/* Completed */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/20 space-y-2 hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-emerald-300 flex items-center space-x-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Tamamlandı</span>
              </span>
              <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20 font-mono">
                {completedCount} Anime
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${userTrackers.length ? Math.round((completedCount / userTrackers.length) * 100) : 0}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block font-semibold">
              Siyahının {userTrackers.length ? Math.round((completedCount / userTrackers.length) * 100) : 0}%-i
            </span>
          </div>

          {/* Plan to Watch */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-sky-500/20 space-y-2 hover:border-sky-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-sky-300 flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-sky-400" />
                <span>Planlaşdırılır</span>
              </span>
              <span className="text-xs font-black text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-lg border border-sky-500/20 font-mono">
                {planCount} Anime
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-sky-400 rounded-full transition-all duration-500"
                style={{ width: `${userTrackers.length ? Math.round((planCount / userTrackers.length) * 100) : 0}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block font-semibold">
              Siyahının {userTrackers.length ? Math.round((planCount / userTrackers.length) * 100) : 0}%-i
            </span>
          </div>

          {/* Dropped */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700 space-y-2 hover:border-slate-600 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-400 flex items-center space-x-1.5">
                <X className="w-4 h-4 text-slate-500" />
                <span>Tərk Edildi</span>
              </span>
              <span className="text-xs font-black text-slate-400 bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700 font-mono">
                {droppedCount} Anime
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
              <div
                className="h-full bg-slate-500 rounded-full transition-all duration-500"
                style={{ width: `${userTrackers.length ? Math.round((droppedCount / userTrackers.length) * 100) : 0}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block font-semibold">
              Siyahının {userTrackers.length ? Math.round((droppedCount / userTrackers.length) * 100) : 0}%-i
            </span>
          </div>

        </div>

      </div>

      {/* Anime Tracker List Section */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-amber-500/30 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
          <h2 className="text-lg font-extrabold text-amber-400 flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span>Şəxsi Anime Siyahım (Anime Tracker)</span>
          </h2>

          {/* Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            {[
              { id: 'watching', label: 'İzlənir' },
              { id: 'completed', label: 'Tamamlandı' },
              { id: 'plan_to_watch', label: 'Planlaşdırılır' },
              { id: 'dropped', label: 'Tərk Edildi' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-slate-950 gold-glow-sm'
                    : 'bg-slate-900/80 text-slate-300 hover:text-amber-300 border border-amber-500/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tracker Items List Table with Progress Bars */}
        {filteredTrackers.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="w-8 h-8 text-amber-500/40 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400">Bu kateqoriyada heç bir anime siyahıda deyil.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTrackers.map(item => {
              const anime = animes.find(a => a.id === item.animeId);
              if (!anime) return null;

              const totalEps = anime.episodesCount || 12;
              const currentProgress = item.progress || 0;
              const itemPct = Math.round((currentProgress / totalEps) * 100);
              const isFinished = currentProgress >= totalEps;

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectAnime(anime.id)}
                  className="group p-4 rounded-2xl glass-panel border border-amber-500/10 hover:border-amber-500/40 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all cursor-pointer shadow-md"
                >
                  {/* Left: Poster + Info */}
                  <div className="flex items-center space-x-4 min-w-[240px]">
                    <img src={anime.posterImage} alt="" className="w-12 h-16 rounded-xl object-cover border border-amber-500/20 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors flex items-center space-x-2">
                        <span>{anime.title}</span>
                        {isFinished && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase border border-emerald-500/30">
                            Tamamlandı ✓
                          </span>
                        )}
                      </h4>
                      <div className="flex items-center space-x-3 mt-1 text-xs text-slate-400">
                        <span>Reytinqiniz: <strong className="text-amber-400">{item.score > 0 ? `${item.score} ★` : '—'}</strong></span>
                        <span className="text-[11px] text-slate-500">• {anime.type || 'TV'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Per-Anime Progress Bar & Episode Count */}
                  <div className="flex-1 max-w-md space-y-1.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-amber-300 text-[11px] font-extrabold flex items-center space-x-1">
                        <Tv className="w-3.5 h-3.5 text-amber-400" />
                        <span>Bölüm Tərəqqisi:</span>
                      </span>
                      <span className={`font-mono text-xs font-black ${isFinished ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {currentProgress} / {totalEps} Episode ({itemPct}%)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 rounded-full bg-slate-950 p-0.5 overflow-hidden border border-amber-500/20">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isFinished
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                            : 'bg-gradient-to-r from-amber-500 to-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                        }`}
                        style={{ width: `${Math.max(2, Math.min(100, itemPct))}%` }}
                      />
                    </div>
                  </div>

                  {/* Right: Interactive Episode Controls */}
                  <div className="flex items-center justify-between md:justify-end space-x-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <div className="flex items-center space-x-1.5 bg-slate-900 p-1 rounded-xl border border-amber-500/20">
                      <button
                        type="button"
                        onClick={(e) => handleUpdateProgress(e, item, -1)}
                        disabled={currentProgress <= 0}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-300 text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-800 cursor-pointer transition-colors"
                        title="1 bölüm azalt"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <span className="px-2 font-mono text-xs font-black text-amber-300 min-w-[28px] text-center">
                        {currentProgress}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => handleUpdateProgress(e, item, 1)}
                        disabled={currentProgress >= totalEps}
                        className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 disabled:opacity-30 cursor-pointer transition-all"
                        title="1 bölüm artır"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </div>

                    <span className="text-xs text-amber-400 font-extrabold group-hover:underline flex items-center space-x-1">
                      <span>İzlə</span>
                      <span>→</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};

