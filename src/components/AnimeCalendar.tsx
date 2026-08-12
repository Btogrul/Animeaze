import React, { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, Clock, Bell, BellOff, Play, CheckCircle2, Flame, Sparkles, Filter, ChevronRight, Tv, ShieldCheck, Layers, Film, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnimeScheduleItem } from '../types';
import { Language, translations } from '../lib/i18n';
import { CalendarSkeleton } from './SkeletonLoader';

interface AnimeCalendarProps {
  onSelectAnime: (animeId: string) => void;
  compactMode?: boolean;
  currentLang?: Language;
}

const DAYS_OF_WEEK = [
  { id: 'all', label: 'Bütün Həftə', short: 'Həftə' },
  { id: 'monday', label: 'Bazar ertəsi', short: 'B.E.' },
  { id: 'tuesday', label: 'Çərşənbə axşamı', short: 'Ç.A.', isToday: true },
  { id: 'wednesday', label: 'Çərşənbə', short: 'Ç.' },
  { id: 'thursday', label: 'Cümə axşamı', short: 'C.A.' },
  { id: 'friday', label: 'Cümə', short: 'C.' },
  { id: 'saturday', label: 'Şənbə', short: 'Ş.' },
  { id: 'sunday', label: 'Bazar', short: 'B.' }
];

export const AnimeCalendar: React.FC<AnimeCalendarProps> = ({ onSelectAnime, compactMode = false, currentLang = 'az' }) => {
  const t = translations[currentLang];
  const [allSchedules, setAllSchedules] = useState<AnimeScheduleItem[]>([]);
  const [schedules, setSchedules] = useState<AnimeScheduleItem[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedStudio, setSelectedStudio] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
  const [reminders, setReminders] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch full schedule once to get master lists of genres and studios
  useEffect(() => {
    fetchMasterCalendarData();
  }, []);

  useEffect(() => {
    fetchCalendarData();
  }, [selectedDay, selectedGenre, selectedStudio]);

  const fetchMasterCalendarData = async () => {
    try {
      const res = await fetch('/api/calendar');
      if (res.ok) {
        const data = await res.json();
        setAllSchedules(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedDay !== 'all') params.append('dayOfWeek', selectedDay);
      if (selectedGenre !== 'all') params.append('genre', selectedGenre);
      if (selectedStudio !== 'all') params.append('studio', selectedStudio);

      const url = `/api/calendar?${params.toString()}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSchedules(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Extract all unique genres and studios from master calendar
  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    allSchedules.forEach(item => item.genres?.forEach(g => set.add(g)));
    return Array.from(set).sort();
  }, [allSchedules]);

  const availableStudios = useMemo(() => {
    const set = new Set<string>();
    allSchedules.forEach(item => {
      if (item.studio) set.add(item.studio);
    });
    return Array.from(set).sort();
  }, [allSchedules]);

  // Client side search filter over fetched schedules
  const filteredSchedules = useMemo(() => {
    if (!searchQuery.trim()) return schedules;
    const q = searchQuery.toLowerCase();
    return schedules.filter(s =>
      s.animeTitle.toLowerCase().includes(q) ||
      (s.japaneseTitle && s.japaneseTitle.toLowerCase().includes(q)) ||
      s.studio.toLowerCase().includes(q) ||
      s.genres.some(g => g.toLowerCase().includes(q))
    );
  }, [schedules, searchQuery]);

  const activeFilterCount = (selectedGenre !== 'all' ? 1 : 0) + (selectedStudio !== 'all' ? 1 : 0) + (selectedDay !== 'all' ? 1 : 0) + (searchQuery.trim() ? 1 : 0);

  const resetFilters = () => {
    setSelectedDay('all');
    setSelectedGenre('all');
    setSelectedStudio('all');
    setSearchQuery('');
  };

  const toggleReminder = (id: string, title: string) => {
    if (reminders.includes(id)) {
      setReminders(prev => prev.filter(rId => rId !== id));
      showToast(`"${title}" üçün xatırlatma ləğv edildi.`);
    } else {
      setReminders(prev => [...prev, id]);
      showToast(`🔔 "${title}" üçün xatırlatma aktivləşdirildi! Yayın vaxtı bildiriş alacaqsınız.`);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const todaySchedule = filteredSchedules.find(s => s.status === 'today') || allSchedules.find(s => s.status === 'today') || schedules[0];

  return (
    <div className={`space-y-6 ${compactMode ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn'}`}>
      
      {/* Toast Notification Alert */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-slate-900/95 border border-amber-500/50 text-amber-300 font-bold text-xs shadow-2xl gold-glow backdrop-blur-md flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      {!compactMode && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/20 pb-5">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center gold-glow">
                <CalendarIcon className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Anime Yayın Təqvimi
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-1 pl-12">
              Bütün cari və yeni sezon animelərinin həftəlik epizod çıxış cədvəli
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 self-start md:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-amber-500 text-slate-950 gold-glow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-amber-300 border border-amber-500/20'
              }`}
            >
              Cədvəl (Grid)
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-amber-500 text-slate-950 gold-glow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-amber-300 border border-amber-500/20'
              }`}
            >
              Xronoloji (Timeline)
            </button>
          </div>
        </div>
      )}

      {/* Today Spotlight Banner */}
      {todaySchedule && !compactMode && (
        <div className="glass-card rounded-3xl p-6 border border-amber-500/40 relative overflow-hidden shadow-2xl gold-glow-sm">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center space-x-5">
              <div className="relative shrink-0">
                <img
                  src={todaySchedule.posterImage}
                  alt={todaySchedule.animeTitle}
                  className="w-20 h-28 rounded-2xl object-cover border-2 border-amber-400 shadow-xl"
                />
                <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[9px] uppercase gold-glow">
                  BU GÜN
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                    {todaySchedule.studio}
                  </span>
                  <span className="text-xs font-extrabold text-amber-400 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span> Saat {todaySchedule.airTime} (AZT)</span>
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-extrabold text-white">
                  {todaySchedule.animeTitle}
                </h3>

                <p className="text-xs text-amber-200/80 font-medium">
                  Epizod {todaySchedule.episodeNumber} • {todaySchedule.timeRemaining}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full md:w-auto">
              <button
                onClick={() => toggleReminder(todaySchedule.id, todaySchedule.animeTitle)}
                className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  reminders.includes(todaySchedule.id)
                    ? 'bg-amber-500/30 border-amber-400 text-amber-300'
                    : 'bg-slate-900/80 border-amber-500/30 text-slate-200 hover:border-amber-500/60'
                }`}
              >
                {reminders.includes(todaySchedule.id) ? (
                  <>
                    <BellOff className="w-4 h-4 text-amber-400" />
                    <span>Xatırlatma Aktivdir</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span>Xatırlat</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onSelectAnime(todaySchedule.animeId)}
                className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black text-xs gold-glow hover:brightness-110 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-950 stroke-none" />
                <span>İzlə / Səhifəyə Keç</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Days Filter Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {DAYS_OF_WEEK.map(day => (
          <button
            key={day.id}
            onClick={() => setSelectedDay(day.id)}
            className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              selectedDay === day.id
                ? 'bg-amber-500 text-slate-950 gold-glow shadow-md scale-105'
                : 'glass-panel text-slate-300 hover:text-amber-300 hover:border-amber-500/30 border-amber-500/10'
            }`}
          >
            <span>{day.label}</span>
            {day.isToday && (
              <span className={`px-1.5 py-0.2 text-[9px] font-black rounded ${
                selectedDay === day.id ? 'bg-slate-950 text-amber-400' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                BU GÜN
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Advanced Filter Bar: Janr (Genre) & Studiya (Studio) Controls */}
      <div className="glass-card rounded-2xl p-4 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          
          {/* Genre Filter */}
          <div className="flex items-center space-x-2 bg-slate-900/90 border border-amber-500/20 px-3 py-2 rounded-xl flex-1 sm:flex-none">
            <Layers className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-slate-400 font-medium hidden sm:inline">Janr:</span>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="bg-transparent text-amber-300 font-bold focus:outline-none cursor-pointer w-full"
            >
              <option value="all" className="bg-slate-900 text-slate-200">Bütün Janrlar</option>
              {availableGenres.map(g => (
                <option key={g} value={g} className="bg-slate-900 text-slate-200">{g}</option>
              ))}
            </select>
          </div>

          {/* Studio Filter */}
          <div className="flex items-center space-x-2 bg-slate-900/90 border border-amber-500/20 px-3 py-2 rounded-xl flex-1 sm:flex-none">
            <Film className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-slate-400 font-medium hidden sm:inline">Studiya:</span>
            <select
              value={selectedStudio}
              onChange={(e) => setSelectedStudio(e.target.value)}
              className="bg-transparent text-amber-300 font-bold focus:outline-none cursor-pointer w-full"
            >
              <option value="all" className="bg-slate-900 text-slate-200">Bütün Studiyalar</option>
              {availableStudios.map(s => (
                <option key={s} value={s} className="bg-slate-900 text-slate-200">{s}</option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="flex items-center space-x-2 bg-slate-900/90 border border-amber-500/20 px-3 py-2 rounded-xl w-full sm:w-48">
            <Search className="w-4 h-4 text-amber-400 shrink-0" />
            <input
              type="text"
              placeholder="Təqvimdə axtar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-slate-100 font-medium focus:outline-none w-full placeholder-slate-500"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>

        {/* Reset Filters & Active Count Badge */}
        {activeFilterCount > 0 && (
          <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold text-[11px] border border-amber-500/30">
              {filteredSchedules.length} nəticə tapıldı
            </span>
            <button
              onClick={resetFilters}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Sıfırla</span>
            </button>
          </div>
        )}
      </div>

      {/* Schedule Items Section */}
      <AnimatePresence mode="popLayout">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-4"
          >
            <CalendarSkeleton />
          </motion.div>
        ) : filteredSchedules.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="text-center py-12 glass-card rounded-3xl p-8 border border-amber-500/20"
          >
            <CalendarIcon className="w-10 h-10 text-amber-500/30 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-300">Seçilmiş filtrlərə uyğun təqvimləşdirilmiş yayım tapılmadı.</p>
            <button
              onClick={resetFilters}
              className="mt-3 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold gold-glow cursor-pointer inline-block"
            >
              Bütün Filtrləri Sıfırla
            </button>
          </motion.div>
        ) : viewMode === 'grid' ? (
          /* GRID VIEW */
          <motion.div
            key="grid-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredSchedules.map((item, index) => {
                const isToday = item.status === 'today';
                const isAired = item.status === 'aired';
                const isRemind = reminders.includes(item.id);

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.82, y: 24 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -20, filter: 'blur(6px)' }}
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 24,
                      mass: 0.7,
                      delay: Math.min(index * 0.03, 0.2)
                    }}
                    whileHover={{ 
                      y: -6, 
                      scale: 1.03,
                      boxShadow: '0 20px 30px -10px rgba(245, 158, 11, 0.22), 0 10px 15px -5px rgba(0, 0, 0, 0.6)' 
                    }}
                    whileTap={{ scale: 0.97 }}
                    className={`glass-card rounded-3xl p-5 border transition-colors flex flex-col justify-between space-y-4 cursor-pointer group ${
                      isToday
                        ? 'border-amber-500/50 gold-glow-sm bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/20'
                        : 'border-amber-500/20 hover:border-amber-500/40'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Status & Time Bar */}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-400 flex items-center space-x-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{item.dayNameAz} • {item.airTime}</span>
                        </span>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                          isToday
                            ? 'bg-amber-500 text-slate-950 border-amber-400 gold-glow-sm'
                            : isAired
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-slate-900 text-slate-300 border-slate-700'
                        }`}>
                          {isToday ? 'BU GÜN' : isAired ? 'YAYIMLANDI' : 'GƏLƏCƏK'}
                        </span>
                      </div>

                      {/* Content Info */}
                      <div className="flex space-x-4">
                        <img
                          src={item.posterImage}
                          alt={item.animeTitle}
                          className="w-16 h-24 rounded-2xl object-cover border border-amber-500/30 shrink-0 shadow-lg"
                        />

                        <div className="space-y-1">
                          <h4 className="text-sm font-extrabold text-white line-clamp-2 hover:text-amber-300 transition-colors">
                            {item.animeTitle}
                          </h4>
                          {item.japaneseTitle && (
                            <p className="text-[10px] text-amber-200/70 italic line-clamp-1">
                              {item.japaneseTitle}
                            </p>
                          )}
                          
                          <div className="pt-1 flex flex-wrap gap-1">
                            <span className="px-2 py-0.5 rounded-md bg-slate-900 text-amber-400 text-[10px] font-bold border border-amber-500/10">
                              Epizod {item.episodeNumber}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-slate-900 text-amber-300/80 text-[10px] font-medium border border-amber-500/10">
                              {item.studio}
                            </span>
                          </div>

                          {/* Genre Tags */}
                          <div className="flex flex-wrap gap-1 pt-1">
                            {item.genres.map(g => (
                              <span key={g} className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-200 text-[9px]">
                                {g}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Controls */}
                    <div className="flex items-center justify-between pt-3 border-t border-amber-500/10">
                      <button
                        onClick={() => toggleReminder(item.id, item.animeTitle)}
                        className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                          isRemind
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'text-slate-400 hover:text-amber-300 hover:bg-slate-900'
                        }`}
                        title="Xatırlatma Bildirişi"
                      >
                        {isRemind ? <BellOff className="w-4 h-4 text-amber-400" /> : <Bell className="w-4 h-4" />}
                        <span className="text-[11px]">{isRemind ? 'Aktivdir' : 'Xatırlat'}</span>
                      </button>

                      <button
                        onClick={() => onSelectAnime(item.animeId)}
                        className="flex items-center space-x-1 text-xs font-extrabold text-amber-400 hover:text-amber-300 hover:underline cursor-pointer"
                      >
                        <span>{isAired ? 'İzlə' : 'Ətraflı'}</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* TIMELINE VIEW */
          <motion.div
            key="timeline-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            <AnimatePresence mode="popLayout">
              {filteredSchedules.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.92, x: -25, y: 10 }}
                  animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: 25, y: -10, filter: 'blur(5px)' }}
                  transition={{
                    type: 'spring',
                    stiffness: 360,
                    damping: 24,
                    delay: Math.min(index * 0.025, 0.15)
                  }}
                  whileHover={{ 
                    x: 6, 
                    scale: 1.015,
                    boxShadow: '0 15px 25px -8px rgba(245, 158, 11, 0.2)' 
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="glass-card rounded-2xl p-4 border border-amber-500/20 hover:border-amber-500/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.posterImage}
                      alt={item.animeTitle}
                      className="w-12 h-16 rounded-xl object-cover border border-amber-500/30 shrink-0"
                    />

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-extrabold text-amber-400">
                          {item.dayNameAz} • {item.airTime}
                        </span>
                        <span className="px-2 py-0.2 rounded bg-amber-500/15 text-amber-300 text-[10px] font-bold border border-amber-500/20">
                          Epizod {item.episodeNumber}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white mt-0.5">{item.animeTitle}</h4>
                      <p className="text-[11px] text-slate-400">{item.studio} • {item.genres.join(', ')}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-auto">
                    <button
                      onClick={() => toggleReminder(item.id, item.animeTitle)}
                      className="p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-amber-400 border border-amber-500/20 text-xs font-bold cursor-pointer"
                    >
                      <Bell className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onSelectAnime(item.animeId)}
                      className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs gold-glow cursor-pointer"
                    >
                      Səhifəyə Keç
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

