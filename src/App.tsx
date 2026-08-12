import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroCarousel } from './components/HeroCarousel';
import { AnimeCard } from './components/AnimeCard';
import { LiveSearchModal } from './components/LiveSearchModal';
import { AnimeDetailView } from './components/AnimeDetailView';
import { CatalogView } from './components/CatalogView';
import { WatchPartyView } from './components/WatchPartyView';
import { UserProfileView } from './components/UserProfileView';
import { MALImportExportModal } from './components/MALImportExportModal';
import { WikiView } from './components/WikiView';
import { AdminPanelModal } from './components/AdminPanelModal';
import { AnimeCalendar } from './components/AnimeCalendar';
import { AuthModal } from './components/AuthModal';
import { AnimeGridSkeleton } from './components/SkeletonLoader';
import { AchievementUnlockModal } from './components/AchievementUnlockModal';
import { evaluateUserAchievements } from './lib/achievementEngine';
import { Achievement } from './lib/achievements';
import { Anime, User, SystemNotification, ActivityFeed } from './types';
import { Sparkles, Flame, Star, Users, MessageSquare, Clock, Tv, Bookmark, Calendar as CalendarIcon } from 'lucide-react';

import { Language, translations } from './lib/i18n';

export default function App() {
  const [currentLang, setCurrentLang] = useState<Language>('az');

  // Default to Guest Mode (currentUser === null)
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [animes, setAnimes] = useState<Anime[]>([]);
  const [isLoadingAnimes, setIsLoadingAnimes] = useState(true);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [activities, setActivities] = useState<ActivityFeed[]>([]);
  
  const [activeView, setActiveView] = useState<'home' | 'catalog' | 'watchparty' | 'profile' | 'wiki' | 'calendar' | 'detail'>('home');
  const [selectedAnimeId, setSelectedAnimeId] = useState<string | null>(null);

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(['anime-1', 'anime-3']);

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isMALOpen, setIsMALOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authReason, setAuthReason] = useState<string | undefined>(undefined);
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  const [unlockedModalAchievement, setUnlockedModalAchievement] = useState<Achievement | null>(null);

  const triggerAchievementAction = async (actionType: 'watch_episode' | 'post_comment' | 'rate_anime' | 'watch_party' | 'bookmark' | 'add_time' | 'wiki', value: number = 1) => {
    if (!currentUser) return;

    const { updatedUser, newlyUnlocked } = evaluateUserAchievements(currentUser, actionType, value);
    setCurrentUser(updatedUser);

    if (newlyUnlocked.length > 0) {
      setUnlockedModalAchievement(newlyUnlocked[0]);
    }

    try {
      await fetch(`/api/users/${currentUser.id}/achievements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stats: updatedUser.stats,
          exp: updatedUser.exp,
          level: updatedUser.level,
          unlockedAchievements: updatedUser.unlockedAchievements
        })
      });
    } catch (e) {
      console.error('Achievement sync error:', e);
    }
  };

  // Time spent on site ticker (1 minute interval)
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      triggerAchievementAction('add_time', 1);
    }, 60000); // every 60s
    return () => clearInterval(interval);
  }, [currentUser]);

  // View navigation achievement triggers
  useEffect(() => {
    if (!currentUser) return;
    if (activeView === 'wiki') {
      triggerAchievementAction('wiki', 1);
    } else if (activeView === 'watchparty') {
      triggerAchievementAction('watch_party', 1);
    }
  }, [activeView, currentUser]);

  useEffect(() => {
    fetchAnimes();
    fetchActivities();
  }, []);

  // Dynamic SEO Title & Meta Description Manager for Google Indexing
  useEffect(() => {
    if (activeView === 'detail' && selectedAnimeId) {
      const currentAnime = animes.find(a => a.id === selectedAnimeId);
      if (currentAnime) {
        document.title = `${currentAnime.title} (${currentAnime.japaneseTitle || 'Anime'}) - Azərbaycan dilində Onlayn İzlə | AnimeAze`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.setAttribute('content', `${currentAnime.title} anime serialını Azərbaycan dilində HD keyfiyyətdə, pulsuz və donmadan onlayn izləyin. ${currentAnime.synopsis.slice(0, 150)}...`);
        }
      }
    } else if (activeView === 'catalog') {
      document.title = "Bütün Animələr və Janrlar Kataloqu | AnimeAze Azərbaycan";
    } else if (activeView === 'watchparty') {
      document.title = "Canlı Watch Party və Birlikdə İzləmə Otaqları | AnimeAze";
    } else if (activeView === 'calendar') {
      document.title = "Həftəlik Yeni Buraxılışlar və Yayın Təqvimi | AnimeAze";
    } else if (activeView === 'profile') {
      document.title = "İstifadəçi Profili və İzləmə Statistikası | AnimeAze";
    } else if (activeView === 'wiki') {
      document.title = "Anime Ensiklopediyası, Personajlar və Studiyalar | AnimeAze Wiki";
    } else {
      document.title = "AnimeAze - Azərbaycanın Nömrə 1 Onlayn Anime Platforması | Anime İzle HD";
    }
  }, [activeView, selectedAnimeId, animes]);

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [currentUser]);

  const handleOpenAuth = (tab: 'signin' | 'signup' = 'signin', reason?: string) => {
    setAuthTab(tab);
    setAuthReason(reason);
    setIsAuthOpen(true);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
  };

  const fetchAnimes = async () => {
    setIsLoadingAnimes(true);
    try {
      const res = await fetch('/api/anime');
      if (res.ok) {
        const data = await res.json();
        setAnimes(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingAnimes(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`/api/notifications/${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/social/feed');
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleBookmark = (animeId: string) => {
    setBookmarkedIds(prev => {
      const isAdding = !prev.includes(animeId);
      if (isAdding) {
        triggerAchievementAction('bookmark', 1);
      }
      return isAdding ? [...prev, animeId] : prev.filter(id => id !== animeId);
    });
  };

  const handleSelectAnime = (id: string) => {
    setSelectedAnimeId(id);
    setActiveView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateWatchPartyFromAnime = (animeId: string) => {
    setActiveView('watchparty');
  };

  const handleSelectNotification = async (notif: SystemNotification) => {
    // Mark notification as read
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    try {
      await fetch(`/api/notifications/${notif.id}/read`, { method: 'POST' });
    } catch (e) {
      console.error(e);
    }

    const targetType = notif.targetType;
    const targetId = notif.targetId;

    if (targetType === 'anime' && targetId) {
      handleSelectAnime(targetId);
    } else if (targetType === 'watchparty') {
      setActiveView('watchparty');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (targetType === 'calendar') {
      setActiveView('calendar');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (targetType === 'profile') {
      setActiveView('profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (targetType === 'wiki') {
      setActiveView('wiki');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (targetType === 'catalog') {
      setActiveView('catalog');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Smart Fallback inference
      if (notif.type === 'new_episode') {
        const found = animes.find(a => notif.message.toLowerCase().includes(a.title.toLowerCase()));
        if (found) {
          handleSelectAnime(found.id);
        } else if (animes.length > 0) {
          handleSelectAnime(animes[0].id);
        }
      } else if (notif.message.toLowerCase().includes('watch party') || notif.message.toLowerCase().includes('otağ')) {
        setActiveView('watchparty');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (notif.message.toLowerCase().includes('təqvim') || notif.title.toLowerCase().includes('təqvim')) {
        setActiveView('calendar');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
  };

  const featuredList = animes.filter(a => a.featured);
  const trendingList = animes.filter(a => a.trending);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${theme === 'light' ? 'light-mode' : ''}`}>
      
      {/* Glass Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        notifications={notifications}
        theme={theme}
        onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenMALImport={() => setIsMALOpen(true)}
        onOpenAuth={handleOpenAuth}
        onSignOut={handleSignOut}
        onNavigate={(v) => { setActiveView(v); setSelectedAnimeId(null); }}
        onSelectNotification={handleSelectNotification}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        activeView={activeView}
        unreadCount={notifications.filter(n => !n.read).length}
        currentLang={currentLang}
        onChangeLang={setCurrentLang}
      />

      {/* Main Content Router */}
      <main className="flex-1 pb-20 md:pb-0">
        {activeView === 'home' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10 animate-fadeIn">
            
            {/* Featured Hero Carousel Slider */}
            <HeroCarousel
              featuredAnimes={featuredList.length > 0 ? featuredList : animes}
              onSelectAnime={handleSelectAnime}
              onCreateWatchParty={handleCreateWatchPartyFromAnime}
              onToggleBookmark={handleToggleBookmark}
              bookmarkedIds={bookmarkedIds}
              currentLang={currentLang}
              isLoading={isLoadingAnimes}
            />

            {/* Trending Animes Grid */}
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center space-x-2">
                  <Flame className="w-6 h-6 text-amber-400 fill-amber-400" />
                  <span>Trenddə Olan Animələr</span>
                </h2>
                <button
                  onClick={() => setActiveView('catalog')}
                  className="text-xs font-bold text-amber-400 hover:underline cursor-pointer"
                >
                  Hamısına Bax →
                </button>
              </div>

              {isLoadingAnimes ? (
                <AnimeGridSkeleton count={6} />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {trendingList.map(anime => (
                    <AnimeCard
                      key={anime.id}
                      anime={anime}
                      onSelect={handleSelectAnime}
                      onToggleBookmark={handleToggleBookmark}
                      isBookmarked={bookmarkedIds.includes(anime.id)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Anime Release Calendar Section on Main Page */}
            <section className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center space-x-2">
                  <CalendarIcon className="w-6 h-6 text-amber-400" />
                  <span>Həftəlik Yayın Təqvimi</span>
                </h2>
                <button
                  onClick={() => setActiveView('calendar')}
                  className="text-xs font-bold text-amber-400 hover:underline cursor-pointer"
                >
                  Tam Təqvimə Bax →
                </button>
              </div>

              <AnimeCalendar onSelectAnime={handleSelectAnime} compactMode={true} currentLang={currentLang} />
            </section>

            {/* Recent Social Activity Feed Widget */}
            <section className="glass-card rounded-3xl p-6 border border-amber-500/20 space-y-4">
              <h3 className="text-base font-extrabold text-amber-400 flex items-center space-x-2">
                <Users className="w-5 h-5 text-amber-400" />
                <span>Canlı Şəbəkə Və Aktivlik Lenti</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activities.map(act => (
                  <div key={act.id} className="p-3 rounded-2xl glass-panel flex items-center space-x-3 border-amber-500/10">
                    <img src={act.userAvatar} alt="" className="w-10 h-10 rounded-xl object-cover border border-amber-400/50 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                        <span>{act.username}</span>
                        <span className="text-[10px] text-slate-500">{act.timestamp}</span>
                      </div>
                      <p className="text-xs text-amber-300 font-medium line-clamp-1 mt-0.5">
                        {act.animeTitle} - {act.details}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}

        {/* Calendar Dedicated View */}
        {activeView === 'calendar' && (
          <AnimeCalendar onSelectAnime={handleSelectAnime} compactMode={false} currentLang={currentLang} />
        )}

        {/* Catalog View */}
        {activeView === 'catalog' && (
          <CatalogView
            animes={animes}
            onSelectAnime={handleSelectAnime}
            onToggleBookmark={handleToggleBookmark}
            bookmarkedIds={bookmarkedIds}
            currentLang={currentLang}
            isLoading={isLoadingAnimes}
          />
        )}

        {/* Watch Party View */}
        {activeView === 'watchparty' && (
          <WatchPartyView
            currentUser={currentUser}
            animes={animes}
            onSelectAnime={handleSelectAnime}
            onOpenAuth={(reason) => handleOpenAuth('signin', reason)}
            currentLang={currentLang}
          />
        )}

        {/* User Profile View */}
        {activeView === 'profile' && (
          <UserProfileView
            currentUser={currentUser}
            animes={animes}
            onSelectAnime={handleSelectAnime}
            onUpdateUserProfile={(updatedData) => {
              if (currentUser) {
                setCurrentUser(prev => prev ? { ...prev, ...updatedData } : null);
              }
            }}
            onOpenAuth={(tab) => handleOpenAuth(tab)}
            onOpenMALImport={() => setIsMALOpen(true)}
            currentLang={currentLang}
          />
        )}

        {/* Wiki View */}
        {activeView === 'wiki' && <WikiView />}

        {/* Detail View */}
        {activeView === 'detail' && selectedAnimeId && (
          <AnimeDetailView
            animeId={selectedAnimeId}
            currentUser={currentUser}
            onBack={() => setActiveView('home')}
            onCreateWatchParty={handleCreateWatchPartyFromAnime}
            onOpenAuth={(reason) => handleOpenAuth('signin', reason)}
            currentLang={currentLang}
            onTriggerAchievementAction={triggerAchievementAction}
          />
        )}
      </main>

      {/* Achievement Unlock Celebratory Modal */}
      <AchievementUnlockModal
        achievement={unlockedModalAchievement}
        onClose={() => setUnlockedModalAchievement(null)}
        userExp={currentUser?.exp || 0}
      />

      {/* Footer */}
      <footer className="mt-16 border-t border-amber-500/20 bg-slate-950/80 backdrop-blur-xl py-8 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-extrabold gold-gradient-text text-base">AnimeAze - Azərbaycan dilində Anime Platforması</p>
          <p>© 2026 AnimeAze Azerbaijan. Bütün hüquqlar qorunur.</p>
        </div>
      </footer>

      {/* Modals */}
      <LiveSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        animes={animes}
        onSelectAnime={handleSelectAnime}
      />

      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        animes={animes}
        onRefreshData={fetchAnimes}
      />

      <MALImportExportModal
        isOpen={isMALOpen}
        onClose={() => setIsMALOpen(false)}
        userId={currentUser?.id || 'guest'}
        onSuccessImport={fetchAnimes}
        onTriggerAchievementAction={triggerAchievementAction}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthOpen(false);
        }}
        initialReason={authReason}
        initialTab={authTab}
        currentLang={currentLang}
      />

    </div>
  );
}
