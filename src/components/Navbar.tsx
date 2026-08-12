import React, { useState } from 'react';
import { 
  Tv, Search, Bell, Shield, User, Sunset, Sun, Moon, 
  Users, Layers, Bookmark, Sparkles, LogOut, Code, Key, Calendar, ArrowRight, CheckCheck, Globe, Check, LogIn, Eye
} from 'lucide-react';
import { User as UserType, SystemNotification } from '../types';
import { Language, translations } from '../lib/i18n';
import { calculateAnimeRankAndLevel } from '../lib/achievements';

interface NavbarProps {
  currentUser: UserType | null;
  notifications: SystemNotification[];
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenSearch: () => void;
  onOpenAdmin: () => void;
  onOpenMALImport: () => void;
  onOpenAuth: (tab?: 'signin' | 'signup') => void;
  onSignOut: () => void;
  onNavigate: (view: 'home' | 'catalog' | 'watchparty' | 'profile' | 'wiki' | 'calendar') => void;
  onSelectNotification?: (notif: SystemNotification) => void;
  onMarkAllNotificationsRead?: () => void;
  activeView: string;
  unreadCount: number;
  currentLang: Language;
  onChangeLang: (lang: Language) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  notifications,
  theme,
  onToggleTheme,
  onOpenSearch,
  onOpenAdmin,
  onOpenMALImport,
  onOpenAuth,
  onSignOut,
  onNavigate,
  onSelectNotification,
  onMarkAllNotificationsRead,
  activeView,
  unreadCount,
  currentLang,
  onChangeLang
}) => {
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const t = translations[currentLang] || translations.az;

  const languagesList: Array<{ id: Language; label: string; flag: string }> = [
    { id: 'az', label: 'Azərbaycan', flag: '🇦🇿' },
    { id: 'ru', label: 'Русский', flag: '🇷🇺' },
    { id: 'en', label: 'English', flag: '🇬🇧' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/70 border-b border-amber-500/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Brand Logo & Main Nav */}
        <div className="flex items-center space-x-8">
          <button 
            onClick={() => onNavigate('home')} 
            className="flex items-center space-x-2.5 text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center gold-glow shadow-md transform group-hover:scale-105 transition-all">
              <Tv className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight gold-gradient-text">
                AnimeAze
              </span>
              <span className="block text-[10px] font-semibold text-amber-400/80 uppercase tracking-widest -mt-1">
                Anime HD
              </span>
            </div>
          </button>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeView === 'home'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {t.home}
            </button>

            <button
              onClick={() => onNavigate('catalog')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeView === 'catalog'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {t.catalog}
            </button>

            <button
              onClick={() => onNavigate('watchparty')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeView === 'watchparty'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>{t.watchparty}</span>
              <span className="ml-1 px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[10px] rounded-full border border-amber-500/30 animate-pulse">
                Canlı
              </span>
            </button>

            <button
              onClick={() => onNavigate('calendar')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeView === 'calendar'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>{t.calendar}</span>
            </button>

            <button
              onClick={() => onNavigate('wiki')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeView === 'wiki'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {t.wiki}
            </button>
          </nav>
        </div>

        {/* Right: Search, Language Switcher, MAL Import, Notifications, Admin, Profile */}
        <div className="flex items-center space-x-3">
          
          {/* Mobile Search Trigger Icon */}
          <button
            onClick={onOpenSearch}
            className="sm:hidden p-2 rounded-xl bg-slate-900/90 border border-amber-500/30 text-amber-400 hover:bg-slate-800 transition-all cursor-pointer"
            title={t.searchPlaceholder}
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Desktop Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-amber-500/20 text-slate-400 hover:text-white hover:border-amber-500/40 transition-all cursor-pointer text-xs"
          >
            <Search className="w-4 h-4 text-amber-400" />
            <span>{t.searchPlaceholder.slice(0, 12)}...</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-300 rounded border border-slate-700">
              Ctrl+K
            </kbd>
          </button>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/80 border border-amber-500/20 text-slate-200 hover:border-amber-500/50 transition-all cursor-pointer text-xs font-bold"
              title={t.selectLanguage}
            >
              <Globe className="w-4 h-4 text-amber-400" />
              <span className="uppercase">{currentLang}</span>
            </button>

            {showLangDropdown && (
              <div className="absolute right-0 mt-2 w-44 glass-card rounded-2xl p-2 shadow-2xl border border-amber-500/30 z-50 space-y-1">
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider px-2 py-1 block border-b border-amber-500/20">
                  {t.selectLanguage}
                </span>
                {languagesList.map(lang => (
                  <button
                    key={lang.id}
                    onClick={() => {
                      onChangeLang(lang.id);
                      setShowLangDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentLang === lang.id
                        ? 'bg-amber-500 text-slate-950 gold-glow-sm'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </div>
                    {currentLang === lang.id && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onOpenSearch}
            className="sm:hidden p-2 rounded-xl bg-slate-900/80 border border-amber-500/20 text-slate-300 cursor-pointer"
          >
            <Search className="w-4 h-4 text-amber-400" />
          </button>

          {/* MAL / AniList Import Button */}
          <button
            onClick={onOpenMALImport}
            title="MAL / AniList İdxal"
            className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-medium transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>MAL İdxal</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-slate-900/80 border border-amber-500/20 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-all cursor-pointer"
            title="Temanı Dəyiş"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-800" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
              className="p-2 rounded-xl bg-slate-900/80 border border-amber-500/20 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 transition-all cursor-pointer relative"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotificationsDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-card rounded-2xl p-4 shadow-2xl border border-amber-500/30 z-50 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5 mb-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Bell className="w-3.5 h-3.5" />
                    <span>Bildirişlər</span>
                  </h4>
                  {unreadCount > 0 && onMarkAllNotificationsRead && (
                    <button
                      onClick={onMarkAllNotificationsRead}
                      className="text-[10px] font-bold text-amber-400/90 hover:text-amber-300 flex items-center space-x-1 hover:underline cursor-pointer"
                    >
                      <CheckCheck className="w-3 h-3" />
                      <span>Hamısını Oxu</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">Bildiriş yoxdur.</p>
                  ) : (
                    notifications.map(notif => {
                      const getBadgeText = () => {
                        if (notif.targetType === 'anime') return 'Animeyə keç';
                        if (notif.targetType === 'watchparty') return 'Watch Party-yə keç';
                        if (notif.targetType === 'calendar') return 'Təqvimə keç';
                        if (notif.targetType === 'profile') return 'Profilə keç';
                        if (notif.targetType === 'wiki') return 'Wiki-yə keç';
                        if (notif.type === 'new_episode') return 'İzlə';
                        return 'Keçid et';
                      };

                      return (
                        <div
                          key={notif.id}
                          onClick={() => {
                            if (onSelectNotification) {
                              onSelectNotification(notif);
                            }
                            setShowNotificationsDropdown(false);
                          }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between space-y-2 ${
                            !notif.read
                              ? 'bg-slate-900/90 border-amber-500/40 hover:border-amber-400 gold-glow-sm'
                              : 'bg-slate-900/40 border-amber-500/10 hover:border-amber-500/30'
                          }`}
                        >
                          <div className="flex items-start justify-between space-x-2">
                            <div className="flex items-center space-x-1.5">
                              {!notif.read && (
                                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                              )}
                              <span className="text-xs font-bold text-amber-300 group-hover:text-amber-200 transition-colors">
                                {notif.title}
                              </span>
                            </div>
                            <span className="text-[9px] text-slate-400 shrink-0">{notif.createdAt}</span>
                          </div>

                          <p className="text-xs text-slate-300 leading-snug line-clamp-2">
                            {notif.message}
                          </p>

                          <div className="flex items-center justify-end pt-1">
                            <span className="text-[10px] font-extrabold text-amber-400 group-hover:translate-x-0.5 transition-transform flex items-center space-x-1">
                              <span>{getBadgeText()}</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Admin Panel Access Button if logged in and role === 'admin' */}
          {currentUser && currentUser.role === 'admin' && (
            <button
              onClick={onOpenAdmin}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold text-xs gold-glow shadow-md hover:brightness-110 transition-all cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Admin Paneli</span>
            </button>
          )}

          {/* Profile or Guest Sign-In Button */}
          {currentUser ? (() => {
            const rankInfo = calculateAnimeRankAndLevel(currentUser.exp || 0);
            return (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-2 pl-2 pr-1.5 py-1 rounded-xl glass-panel border border-amber-500/30 hover:border-amber-500/60 transition-all cursor-pointer"
                >
                  <div className="relative">
                    <img 
                      src={currentUser.avatar} 
                      alt={currentUser.username} 
                      className="w-7 h-7 rounded-lg object-cover border border-amber-400/50"
                    />
                    <span className="absolute -bottom-1 -right-1 text-[9px] leading-none px-1 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black gold-glow">
                      Lv.{rankInfo.level}
                    </span>
                  </div>
                  <span className="hidden md:inline-block text-xs font-bold text-slate-200 max-w-[90px] truncate">
                    {currentUser.username}
                  </span>
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-60 glass-card rounded-2xl p-3 shadow-2xl border border-amber-500/30 z-50 animate-fadeIn space-y-2">
                    <div className="flex items-center space-x-3 p-2 border-b border-amber-500/20">
                      <img src={currentUser.avatar} alt="" className="w-10 h-10 rounded-xl object-cover border border-amber-400" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white flex items-center space-x-1">
                          <span className="truncate">{currentUser.username}</span>
                          {currentUser.role === 'admin' && (
                            <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 text-[9px] rounded font-bold border border-amber-500/30 shrink-0">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-amber-400 font-extrabold truncate block">{rankInfo.rankTitle}</span>
                      </div>
                    </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => { onNavigate('profile'); setShowUserDropdown(false); }}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-amber-500/15 hover:text-amber-300 transition-all cursor-pointer"
                    >
                      <User className="w-4 h-4 text-amber-400" />
                      <span>Profilim & Siyahım</span>
                    </button>

                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => { onOpenAdmin(); setShowUserDropdown(false); }}
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer sm:hidden"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin Paneli</span>
                      </button>
                    )}

                    <button
                      onClick={() => { onOpenMALImport(); setShowUserDropdown(false); }}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-amber-500/15 hover:text-amber-300 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>MAL / AniList İdxal</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onSignOut();
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/15 transition-all cursor-pointer pt-2 border-t border-slate-800"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Çıxış Et (Qonaq Rejiminə Keç)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            );
          })() : (
            /* Guest Mode Auth Triggers */
            <div className="flex items-center space-x-2">
              <span className="hidden xl:inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-bold text-slate-400">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Qonaq Rejimi</span>
              </span>

              <button
                onClick={() => onOpenAuth('signin')}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs gold-glow shadow-md hover:brightness-110 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Giriş / Qeydiyyat</span>
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-amber-500/30 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center space-y-0.5 px-2 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
            activeView === 'home' ? 'text-amber-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Tv className={`w-5 h-5 ${activeView === 'home' ? 'text-amber-400' : 'text-slate-400'}`} />
          <span>{t.home}</span>
        </button>

        <button
          onClick={() => onNavigate('catalog')}
          className={`flex flex-col items-center space-y-0.5 px-2 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
            activeView === 'catalog' ? 'text-amber-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className={`w-5 h-5 ${activeView === 'catalog' ? 'text-amber-400' : 'text-slate-400'}`} />
          <span>{t.catalog}</span>
        </button>

        <button
          onClick={() => onNavigate('watchparty')}
          className={`relative flex flex-col items-center space-y-0.5 px-2 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
            activeView === 'watchparty' ? 'text-amber-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Users className={`w-5 h-5 ${activeView === 'watchparty' ? 'text-amber-400' : 'text-slate-400'}`} />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          </div>
          <span>Watch Party</span>
        </button>

        <button
          onClick={() => onNavigate('calendar')}
          className={`flex flex-col items-center space-y-0.5 px-2 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
            activeView === 'calendar' ? 'text-amber-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className={`w-5 h-5 ${activeView === 'calendar' ? 'text-amber-400' : 'text-slate-400'}`} />
          <span>{t.calendar}</span>
        </button>

        <button
          onClick={() => {
            if (currentUser) {
              onNavigate('profile');
            } else {
              onOpenAuth('signin');
            }
          }}
          className={`flex flex-col items-center space-y-0.5 px-2 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
            activeView === 'profile' ? 'text-amber-400 font-extrabold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {currentUser ? (
            <img src={currentUser.avatar} alt="" className="w-5 h-5 rounded-full object-cover border border-amber-400" />
          ) : (
            <User className="w-5 h-5 text-slate-400" />
          )}
          <span>{currentUser ? 'Profil' : 'Giriş'}</span>
        </button>
      </nav>
    </header>
  );
};
