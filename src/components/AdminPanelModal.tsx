import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, Film, Activity, AlertTriangle, Plus, Trash2, Edit3, 
  Eye, CheckCircle, Ban, MessageSquare, Sparkles, X, Save, Camera, Check, UserCheck, Search
} from 'lucide-react';
import { Anime, Episode, User, SystemAnalytics, Comment } from '../types';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  animes: Anime[];
  onRefreshData: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  animes,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'anime' | 'episodes' | 'avatars' | 'moderators' | 'users' | 'comments'>('analytics');
  
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [pendingAvatars, setPendingAvatars] = useState<User[]>([]);
  const [userSearchEmail, setUserSearchEmail] = useState('');
  const [modAssignEmail, setModAssignEmail] = useState('');
  const [modAssignStatus, setModAssignStatus] = useState<string | null>(null);

  // Anime Add / Edit Form State
  const [showAnimeForm, setShowAnimeForm] = useState(false);
  const [animeForm, setAnimeForm] = useState<Partial<Anime>>({
    title: '',
    japaneseTitle: '',
    synopsis: '',
    posterImage: '',
    bannerImage: '',
    score: 9.0,
    type: 'TV',
    episodesCount: 12,
    status: 'Davam edir',
    airedYear: 2025,
    season: 'Qış',
    genres: ['Aksiya', 'Fantastika'],
    studio: 'A-1 Pictures',
    ageRating: '16+',
    duration: '24 dəq'
  });

  // Episode Add Form State
  const [showEpForm, setShowEpForm] = useState(false);
  const [epForm, setEpForm] = useState<Partial<Episode>>({
    animeId: animes[0]?.id || '',
    episodeNumber: 1,
    title: '',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: '',
    duration: '24:00',
    subtitles: [{ lang: 'az', label: 'Azərbaycan dili', url: '' }],
    audioTracks: [{ lang: 'ja', label: 'Yaponca (Orijinal)' }]
  });

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
      fetchPendingAvatars();
    }
  }, [isOpen]);

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/admin/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data.analytics);
        setUsers(data.users);
        setComments(data.comments);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPendingAvatars = async () => {
    try {
      const res = await fetch('/api/admin/pending-avatars');
      if (res.ok) {
        const data = await res.json();
        setPendingAvatars(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveAvatar = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/avatars/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        fetchPendingAvatars();
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectAvatar = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/avatars/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        fetchPendingAvatars();
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  const handleSaveAnime = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/anime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(animeForm)
      });
      if (res.ok) {
        setShowAnimeForm(false);
        onRefreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAnime = async (animeId: string) => {
    if (!confirm('Bu animeni silməyə əminsiniz?')) return;
    try {
      const res = await fetch(`/api/admin/anime/${animeId}`, { method: 'DELETE' });
      if (res.ok) {
        onRefreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/episode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(epForm)
      });
      if (res.ok) {
        setShowEpForm(false);
        onRefreshData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string, newStatus?: string) => {
    try {
      const res = await fetch('/api/admin/users/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId, newRole, newStatus })
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAssignModeratorByEmail = async (emailToAssign: string, roleToAssign: string = 'moderator') => {
    if (!emailToAssign.trim()) return;
    try {
      const res = await fetch('/api/admin/users/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToAssign.trim(), newRole: roleToAssign })
      });
      const data = await res.json();
      if (res.ok) {
        setModAssignStatus(`✅ "${emailToAssign}" istifadəçisinə ${roleToAssign === 'moderator' ? 'Moderator' : roleToAssign} rolu təyin edildi. Həmin istifadəçi profil şəkillərini təsdiqləyə bilər!`);
        setModAssignEmail('');
        fetchAdminData();
      } else {
        setModAssignStatus(`❌ ${data.error || 'Xəta baş verdi'}`);
      }
    } catch (e) {
      console.error(e);
      setModAssignStatus("❌ Şəbəkə xətası baş verdi.");
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(userSearchEmail.toLowerCase()) ||
    u.username.toLowerCase().includes(userSearchEmail.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-5xl w-full glass-card rounded-3xl p-6 sm:p-8 border border-amber-500/40 text-slate-100 relative max-h-[90vh] overflow-y-auto space-y-6">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & Navigation */}
        <div className="flex items-center space-x-3 border-b border-amber-500/20 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center gold-glow font-black">
            <Shield className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">AnimeAze İdarəetmə Paneli (Admin & Moderasiya)</h2>
            <p className="text-xs text-amber-300 font-medium">Bütün sistemi, moderator təyinini, profil şəkillərini və analitikanı idarə edin</p>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {[
            { id: 'analytics', label: 'Analitika', icon: Activity },
            { id: 'anime', label: 'Anime İdarəsi', icon: Film },
            { id: 'episodes', label: 'Epizod & Linklər', icon: Plus },
            { id: 'avatars', label: `Profil & Nick Təsdiqi (${pendingAvatars.length})`, icon: Camera },
            { id: 'moderators', label: 'Moderator Təyini (Email)', icon: UserCheck },
            { id: 'users', label: 'Bütün İstifadəçilər', icon: Users },
            { id: 'comments', label: 'Rəy Moderasiyası', icon: MessageSquare }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-slate-950 gold-glow-sm'
                    : 'bg-slate-900/80 text-slate-300 hover:text-amber-300 border border-amber-500/10'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Analytics Dashboard */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl glass-panel border border-amber-500/20">
                <span className="text-2xl font-black gold-gradient-text">{analytics.dailyActiveUsers}</span>
                <span className="block text-xs font-bold text-slate-400 mt-1">Günlük Aktiv İstifadəçilər</span>
              </div>
              <div className="p-4 rounded-2xl glass-panel border border-amber-500/20">
                <span className="text-2xl font-black gold-gradient-text">{analytics.totalViews.toLocaleString()}</span>
                <span className="block text-xs font-bold text-slate-400 mt-1">Ümumi Baxış Sayı</span>
              </div>
              <div className="p-4 rounded-2xl glass-panel border border-amber-500/20">
                <span className="text-2xl font-black gold-gradient-text">99.8%</span>
                <span className="block text-xs font-bold text-slate-400 mt-1">Pleyer Uptime</span>
              </div>
            </div>

            {/* Top Animes Chart */}
            <div className="p-5 rounded-2xl glass-panel border border-amber-500/20 space-y-3">
              <h3 className="text-sm font-bold text-amber-400">Ən Çox İzlənilən Animələr</h3>
              <div className="space-y-2">
                {analytics.topAnimes.map(ta => (
                  <div key={ta.id} className="flex justify-between items-center text-xs p-2 rounded-xl bg-slate-900/60">
                    <span className="font-bold text-slate-200">{ta.title}</span>
                    <span className="text-amber-400 font-bold">{ta.views.toLocaleString()} baxış</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Anime CRUD */}
        {activeTab === 'anime' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-amber-400">Kataloqdakı Animələr ({animes.length})</h3>
              <button
                onClick={() => setShowAnimeForm(true)}
                className="flex items-center space-x-1 px-3 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl gold-glow cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Yeni Anime Əlavə Et</span>
              </button>
            </div>

            {showAnimeForm && (
              <form onSubmit={handleSaveAnime} className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-3 text-xs">
                <h4 className="font-bold text-amber-300">Yeni Anime Məlumatları</h4>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Anime Adı (Azərbaycan)"
                    value={animeForm.title}
                    onChange={(e) => setAnimeForm({ ...animeForm, title: e.target.value })}
                    className="p-2 rounded-xl glass-input"
                  />
                  <input
                    type="text"
                    placeholder="Yaponca Adı"
                    value={animeForm.japaneseTitle}
                    onChange={(e) => setAnimeForm({ ...animeForm, japaneseTitle: e.target.value })}
                    className="p-2 rounded-xl glass-input"
                  />
                  <input
                    type="text"
                    placeholder="Poster Şəkli URL"
                    value={animeForm.posterImage}
                    onChange={(e) => setAnimeForm({ ...animeForm, posterImage: e.target.value })}
                    className="p-2 rounded-xl glass-input"
                  />
                  <input
                    type="text"
                    placeholder="Banner Şəkli URL"
                    value={animeForm.bannerImage}
                    onChange={(e) => setAnimeForm({ ...animeForm, bannerImage: e.target.value })}
                    className="p-2 rounded-xl glass-input"
                  />
                </div>
                <textarea
                  placeholder="Xülasə (Synopsis)"
                  value={animeForm.synopsis}
                  onChange={(e) => setAnimeForm({ ...animeForm, synopsis: e.target.value })}
                  className="w-full p-2 rounded-xl glass-input"
                />
                <div className="flex justify-end space-x-2">
                  <button type="button" onClick={() => setShowAnimeForm(false)} className="px-3 py-1.5 bg-slate-800 rounded-xl cursor-pointer">Ləğv et</button>
                  <button type="submit" className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-xl gold-glow cursor-pointer">Yadda Saxla</button>
                </div>
              </form>
            )}

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {animes.map(a => (
                <div key={a.id} className="p-3 rounded-2xl glass-panel flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-3">
                    <img src={a.posterImage} alt="" className="w-10 h-14 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-bold text-white">{a.title}</h4>
                      <span className="text-[10px] text-slate-400">{a.studio} • {a.episodesCount} Seriya</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteAnime(a.id)}
                    className="p-2 bg-rose-500/20 text-rose-300 hover:bg-rose-500 rounded-xl cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Episodes */}
        {activeTab === 'episodes' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-amber-400">Epizod və Video Link İdarəsi</h3>
              <button
                onClick={() => setShowEpForm(true)}
                className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl gold-glow cursor-pointer"
              >
                + Epizod Əlavə Et
              </button>
            </div>

            {showEpForm && (
              <form onSubmit={handleSaveEpisode} className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-3 text-xs">
                <select
                  value={epForm.animeId}
                  onChange={(e) => setEpForm({ ...epForm, animeId: e.target.value })}
                  className="w-full p-2 rounded-xl bg-slate-800 text-amber-300 font-bold"
                >
                  {animes.map(a => (
                    <option key={a.id} value={a.id}>{a.title}</option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Epizod Nömrəsi"
                    value={epForm.episodeNumber}
                    onChange={(e) => setEpForm({ ...epForm, episodeNumber: Number(e.target.value) })}
                    className="p-2 rounded-xl glass-input"
                  />
                  <input
                    type="text"
                    placeholder="Epizod Başlığı"
                    value={epForm.title}
                    onChange={(e) => setEpForm({ ...epForm, title: e.target.value })}
                    className="p-2 rounded-xl glass-input"
                  />
                </div>

                <input
                  type="text"
                  placeholder="Video URL (mp4 / cloud link)"
                  value={epForm.videoUrl}
                  onChange={(e) => setEpForm({ ...epForm, videoUrl: e.target.value })}
                  className="w-full p-2 rounded-xl glass-input"
                />

                <div className="flex justify-end space-x-2">
                  <button type="button" onClick={() => setShowEpForm(false)} className="px-3 py-1.5 bg-slate-800 rounded-xl cursor-pointer">Ləğv et</button>
                  <button type="submit" className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-xl gold-glow cursor-pointer">Yadda Saxla</button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Tab 4: Pending Profiles & Nicknames Moderation */}
        {activeTab === 'avatars' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <div>
                <h3 className="text-sm font-bold text-amber-400 flex items-center space-x-2">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>Profil Məlumatları Və Nick (Ləqəb) Təsdiq Növbəsi</span>
                </h3>
                <p className="text-[11px] text-slate-400">İstifadəçilərin istədiyi ləqəb (nick) və profil şəkillərini yoxlayın. 18+ məzmun qadağandır.</p>
              </div>
              <span className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 font-extrabold text-xs rounded-xl">
                {pendingAvatars.length} gözləyən müraciət
              </span>
            </div>

            {pendingAvatars.length === 0 ? (
              <div className="text-center py-10 glass-panel rounded-2xl">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-300">Təsdiq gözləyən nick və ya profil şəkli müraciəti yoxdur.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingAvatars.map(u => (
                  <div key={u.id} className="p-4 rounded-2xl glass-panel border border-amber-500/30 flex flex-col justify-between space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-400 shrink-0 bg-slate-900">
                          <img src={u.pendingAvatar || u.avatar} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5 flex-wrap">
                            <span className="font-extrabold text-white text-xs">{u.username}</span>
                            {u.pendingUsername && (
                              <span className="text-[10px] text-emerald-400 font-extrabold bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">
                                → {u.pendingUsername}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block">{u.email}</span>
                          <span className="text-[10px] text-amber-400 font-semibold uppercase">Rol: {u.role}</span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        18+ Yoxlanışı: Qaydalara Uyğun
                      </span>
                    </div>

                    {u.pendingBio && (
                      <div className="text-[11px] text-slate-300 bg-slate-900/60 p-2 rounded-xl">
                        <strong className="text-amber-400">Yeni Bio:</strong> {u.pendingBio}
                      </div>
                    )}

                    <div className="flex items-center space-x-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => handleApproveAvatar(u.id)}
                        className="flex-1 py-2 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs hover:bg-emerald-400 transition-colors flex items-center justify-center space-x-1 cursor-pointer gold-glow-sm"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Təsdiqlə (Approve)</span>
                      </button>
                      <button
                        onClick={() => handleRejectAvatar(u.id)}
                        className="flex-1 py-2 rounded-xl bg-rose-500/20 text-rose-300 font-bold text-xs hover:bg-rose-500 hover:text-white transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Rədd Et (Reject)</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Dedicated Moderator Management by Email */}
        {activeTab === 'moderators' && (
          <div className="space-y-6">
            
            {/* Direct Email-Based Moderator Assignment Banner & Form */}
            <div className="p-5 rounded-3xl glass-card border border-amber-500/40 space-y-4 bg-gradient-to-r from-amber-500/15 via-slate-900/80 to-slate-950/90 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-start space-x-3">
                <div className="p-2.5 rounded-2xl bg-amber-500 text-slate-950 font-black gold-glow shrink-0">
                  <UserCheck className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">E-poçt Vasitəsilə Moderator Təyini İnterfeysi</h3>
                  <p className="text-xs text-amber-200/90 leading-relaxed mt-0.5">
                    Təyin edilən moderatorlar profil şəkillərini təsdiqləyə/rədd edə, rəyləri təmizləyə və istifadəçilərə nəzarət edə biləcəklər.
                  </p>
                </div>
              </div>

              {/* Assignment Form */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAssignModeratorByEmail(modAssignEmail, 'moderator');
                }}
                className="space-y-3 pt-1"
              >
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <div className="relative w-full">
                    <input
                      type="email"
                      required
                      placeholder="Moderator olacaq istifadəçinin e-poçtu (Nümunə: user@animeaze.az)..."
                      value={modAssignEmail}
                      onChange={(e) => setModAssignEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-amber-500/40 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-mono shadow-inner"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition-all cursor-pointer gold-glow shrink-0 flex items-center justify-center space-x-2"
                  >
                    <UserCheck className="w-4 h-4 stroke-[2.5]" />
                    <span>Moderator Təyin Et</span>
                  </button>
                </div>

                {/* Status Alert Message */}
                {modAssignStatus && (
                  <div className="text-xs font-extrabold text-amber-200 bg-amber-950/80 p-3 rounded-2xl border border-amber-500/50 shadow-md animate-fadeIn">
                    {modAssignStatus}
                  </div>
                )}
              </form>

              {/* Registered Emails Quick Chips */}
              <div className="space-y-1.5 pt-2 border-t border-amber-500/20">
                <span className="text-[11px] text-slate-400 font-bold block">Sistemdəki Qeydiyyatlı E-poçtlar (Klikləyərək daxil edin):</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {users.map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setModAssignEmail(u.email);
                        setModAssignStatus(null);
                      }}
                      className={`px-3 py-1 rounded-xl text-[11px] border font-mono transition-all cursor-pointer flex items-center space-x-1.5 ${
                        u.role === 'moderator'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                          : u.role === 'admin'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 font-bold'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-amber-400'
                      }`}
                    >
                      <span>{u.email}</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-800 text-amber-400 font-sans">
                        {u.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Currently Active Moderators List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Aktiv Moderatorlar və Adminlər ({users.filter(u => u.role === 'moderator' || u.role === 'admin').length})</span>
                </h4>
                <span className="text-[11px] text-slate-400">Profil şəkillərini təsdiqləmək hüququ olan istifadəçilər</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {users.filter(u => u.role === 'moderator' || u.role === 'admin').map(mod => (
                  <div key={mod.id} className="p-4 rounded-2xl glass-panel border border-amber-500/30 flex items-center justify-between space-x-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-xl overflow-hidden border border-amber-400 shrink-0 bg-slate-900 flex items-center justify-center">
                        {mod.avatarStatus === 'approved' && mod.avatar ? (
                          <img src={mod.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg">👤</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-white text-xs">{mod.username}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            mod.role === 'admin' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-950'
                          }`}>
                            {mod.role}
                          </span>
                        </div>
                        <span className="text-[11px] text-amber-300/90 font-mono block">{mod.email}</span>
                      </div>
                    </div>

                    {mod.role === 'moderator' && (
                      <button
                        type="button"
                        onClick={() => handleAssignModeratorByEmail(mod.email, 'user')}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 font-bold text-xs hover:bg-rose-500 hover:text-white transition-colors cursor-pointer border border-rose-500/30"
                      >
                        Rolunu Al
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab 6: Users & Role Management */}
        {activeTab === 'users' && (
          <div className="space-y-4">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
              <div>
                <h3 className="text-sm font-bold text-amber-400">Sistemdəki Bütün İstifadəçilər</h3>
                <p className="text-[11px] text-slate-400">İstifadəçilərin siyahısına baxın, rollarını tənzimləyin və ya ban edin</p>
              </div>

              {/* Email Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Mail və ya istifadəçi adı ilə axtar..."
                  value={userSearchEmail}
                  onChange={(e) => setUserSearchEmail(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-amber-500/20 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredUsers.map(u => (
                <div key={u.id} className="p-3.5 rounded-2xl glass-panel flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-amber-400 shrink-0 bg-slate-900 flex items-center justify-center">
                      {u.avatarStatus === 'approved' && u.avatar ? (
                        <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-base">👤</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-white">{u.username}</span>
                        {u.role === 'moderator' && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[9px] uppercase">
                            MODERATOR
                          </span>
                        )}
                        {u.role === 'admin' && (
                          <span className="px-2 py-0.5 rounded-md bg-rose-500 text-white font-black text-[9px] uppercase">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-amber-300/90 font-mono block">{u.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 justify-end">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleUpdateUserRole(u.id, u.role === 'moderator' ? 'user' : 'moderator')}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-all flex items-center space-x-1 ${
                          u.role === 'moderator'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500 hover:text-slate-950'
                            : 'bg-slate-800 text-slate-300 hover:bg-amber-500 hover:text-slate-950'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{u.role === 'moderator' ? 'Moderatorluqdan Çıxart' : 'Moderator Təyin Et'}</span>
                      </button>
                    )}

                    <select
                      value={u.role}
                      onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-amber-300 font-bold border border-amber-500/20 text-xs"
                    >
                      <option value="user">İstifadəçi</option>
                      <option value="premium">Premium</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>

                    <button
                      onClick={() => handleUpdateUserRole(u.id, u.role, u.status === 'banned' ? 'active' : 'banned')}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer ${
                        u.status === 'banned' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {u.status === 'banned' ? 'Bani Qaldır' : 'Ban Et'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Comments Moderation */}
        {activeTab === 'comments' && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-amber-400">Rəylərin Təmizlənməsi və Moderasiya</h3>
            <div className="space-y-2">
              {comments.map(c => (
                <div key={c.id} className="p-3 rounded-2xl glass-panel text-xs space-y-1">
                  <div className="flex justify-between font-bold text-amber-300">
                    <span>{c.userUsername}</span>
                    <span className="text-[10px] text-slate-400">{c.createdAt}</span>
                  </div>
                  <p className="text-slate-200">{c.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
