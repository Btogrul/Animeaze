export interface Achievement {
  id: string;
  title: string;
  animeTitleRef: string;
  description: string;
  icon: string;
  category: 'watch' | 'comment' | 'time' | 'rating' | 'social' | 'special';
  expReward: number;
  badgeColor: string;
  targetValue: number;
  badgeEmoji: string;
}

export interface AnimeRankInfo {
  level: number;
  rankTitle: string;
  rankBadge: string;
  rankColor: string;
  currentLevelExp: number;
  nextLevelExp: number;
  progressPercent: number;
  totalExp: number;
}

export const ANIME_ACHIEVEMENTS: Achievement[] = [
  // WATCH CATEGORY
  {
    id: 'ach_watch_1',
    title: 'Genin İmtahanı',
    animeTitleRef: 'Naruto 🍃',
    description: 'İlk 1 epizod anime izləyərək ninja yoluna addım at!',
    icon: 'Play',
    category: 'watch',
    expReward: 100,
    badgeColor: 'from-emerald-500 to-green-600',
    targetValue: 1,
    badgeEmoji: '🍃'
  },
  {
    id: 'ach_watch_10',
    title: 'Chunin Təcrübəsi',
    animeTitleRef: 'Naruto Shippuden 🌀',
    description: '10 epizod anime izləyərək təcrübəli döyüşçü ol!',
    icon: 'Film',
    category: 'watch',
    expReward: 250,
    badgeColor: 'from-blue-500 to-cyan-600',
    targetValue: 10,
    badgeEmoji: '🌀'
  },
  {
    id: 'ach_watch_50',
    title: 'Super Saiyan İzləyicisi',
    animeTitleRef: 'Dragon Ball Z ⚡',
    description: '50 epizod anime izləyərək güc səviyyəni 9000-dən yuxarı qaldır!',
    icon: 'Zap',
    category: 'watch',
    expReward: 600,
    badgeColor: 'from-amber-400 to-yellow-600',
    targetValue: 50,
    badgeEmoji: '⚡'
  },
  {
    id: 'ach_watch_100',
    title: 'Qaranlıq Təşkilat: Akatsuki',
    animeTitleRef: 'Akatsuki 🔴',
    description: '100 epizod anime izləyərək əfsanəvi elit tərkibə daxil ol!',
    icon: 'ShieldAlert',
    category: 'watch',
    expReward: 1200,
    badgeColor: 'from-rose-500 to-red-700',
    targetValue: 100,
    badgeEmoji: '🔴'
  },
  {
    id: 'ach_watch_250',
    title: 'Piratlar Kralı (Pirate King)',
    animeTitleRef: 'One Piece 🏴‍☠️',
    description: '250 epizod izləyərək Grand Line xəzinəsini fəth et!',
    icon: 'Crown',
    category: 'watch',
    expReward: 2500,
    badgeColor: 'from-yellow-400 via-amber-500 to-red-600',
    targetValue: 250,
    badgeEmoji: '🏴‍☠️'
  },

  // COMMENT CATEGORY
  {
    id: 'ach_comment_1',
    title: 'İsekai Tənqidçisi',
    animeTitleRef: 'Re:Zero ✍️',
    description: 'Anime haqqında ilk dəfə fikir və ya şərhini yaz!',
    icon: 'MessageSquare',
    category: 'comment',
    expReward: 100,
    badgeColor: 'from-violet-500 to-purple-600',
    targetValue: 1,
    badgeEmoji: '✍️'
  },
  {
    id: 'ach_comment_5',
    title: 'Bilik Məbədinin Senpai-si',
    animeTitleRef: 'Kaguya-sama 🎓',
    description: '5 fərqli müzakirədə rəy bildirərək məsləhətlər ver!',
    icon: 'Sparkles',
    category: 'comment',
    expReward: 300,
    badgeColor: 'from-pink-500 to-rose-600',
    targetValue: 5,
    badgeEmoji: '🎓'
  },
  {
    id: 'ach_comment_20',
    title: 'Animetik Filosof',
    animeTitleRef: 'Death Note 📓',
    description: '20 dərin şərh yazaraq platformanın əsas tənqidçisi ol!',
    icon: 'BookOpen',
    category: 'comment',
    expReward: 800,
    badgeColor: 'from-slate-600 to-slate-900',
    targetValue: 20,
    badgeEmoji: '📓'
  },

  // RATING CATEGORY
  {
    id: 'ach_rating_1',
    title: 'Sehrli Görmə (Six Eyes)',
    animeTitleRef: 'Jujutsu Kaisen 👁️',
    description: 'İlk 1 animeyə reytinq və xal verərək gücünü qiymətləndir!',
    icon: 'Star',
    category: 'rating',
    expReward: 100,
    badgeColor: 'from-cyan-400 to-blue-600',
    targetValue: 1,
    badgeEmoji: '👁️'
  },
  {
    id: 'ach_rating_10',
    title: 'Xüsusi Dərəcəli Müfəttiş',
    animeTitleRef: 'Tokyo Ghoul ☕',
    description: '10 animeyə xal verərək keyfiyyət standartlarını müəyyən et!',
    icon: 'Award',
    category: 'rating',
    expReward: 500,
    badgeColor: 'from-red-500 to-purple-800',
    targetValue: 10,
    badgeEmoji: '☕'
  },

  // TIME SPENT CATEGORY
  {
    id: 'ach_time_30',
    title: 'Zaman Səyyahı',
    animeTitleRef: 'Steins;Gate ⏳',
    description: 'Saytda 30 dəqiqə vaxt keçirərək dünya xəttini dəyiş!',
    icon: 'Clock',
    category: 'time',
    expReward: 150,
    badgeColor: 'from-amber-500 to-orange-600',
    targetValue: 30, // in minutes
    badgeEmoji: '⏳'
  },
  {
    id: 'ach_time_120',
    title: 'Körpü Sütunu (Hashira)',
    animeTitleRef: 'Demon Slayer ⚔️',
    description: 'Saytda 2 saat (120 dəqiqə) vaxt keçirərək intellektual nəfəs texnikasını mənimsə!',
    icon: 'Flame',
    category: 'time',
    expReward: 400,
    badgeColor: 'from-orange-500 to-red-600',
    targetValue: 120,
    badgeEmoji: '⚔️'
  },
  {
    id: 'ach_time_600',
    title: 'Davamlı Solo Leveling',
    animeTitleRef: 'Solo Leveling 🗡️',
    description: 'Saytda 10 saat (600 dəqiqə) vaxt keçirərək Kölgələr Monarxına çevril!',
    icon: 'TrendingUp',
    category: 'time',
    expReward: 1500,
    badgeColor: 'from-indigo-600 via-purple-700 to-slate-900',
    targetValue: 600,
    badgeEmoji: '🗡️'
  },

  // SOCIAL & SPECIAL CATEGORY
  {
    id: 'ach_watchparty_1',
    title: 'Mugiwaralar Birliyi',
    animeTitleRef: 'Straw Hat Crew 👒',
    description: 'Watch Party otağında dostlarınla birgə anime izlə və ya otaq yarat!',
    icon: 'Users',
    category: 'social',
    expReward: 200,
    badgeColor: 'from-yellow-400 to-amber-600',
    targetValue: 1,
    badgeEmoji: '👒'
  },
  {
    id: 'ach_bookmark_5',
    title: 'Qədim Əlyazmalar Qoruyucusu',
    animeTitleRef: 'Black Clover 🍀',
    description: '5 animeyə əlfəcin (Bookmark) qoyaraq xüsusi kolleksiya yarat!',
    icon: 'Bookmark',
    category: 'special',
    expReward: 200,
    badgeColor: 'from-emerald-400 to-teal-700',
    targetValue: 5,
    badgeEmoji: '🍀'
  },
  {
    id: 'ach_night_owl',
    title: 'Gecə Quşu Shinobisi',
    animeTitleRef: 'Bleach 🌙',
    description: 'Gecə saat 00:00 - 05:00 arasında anime izləyərək qaranlıq aləmə qovuş!',
    icon: 'Moon',
    category: 'special',
    expReward: 350,
    badgeColor: 'from-slate-700 via-purple-900 to-indigo-950',
    targetValue: 1,
    badgeEmoji: '🌙'
  },
  {
    id: 'ach_wiki_explorer',
    title: 'Anime Ensiklopedisti',
    animeTitleRef: 'Fullmetal Alchemist 📖',
    description: 'Wiki bölməsində personajlar və studiyaları kəşf et!',
    icon: 'Compass',
    category: 'special',
    expReward: 150,
    badgeColor: 'from-blue-400 to-indigo-600',
    targetValue: 1,
    badgeEmoji: '📖'
  },
  {
    id: 'ach_level_5',
    title: 'Ustadın Şagirdi (Hunter)',
    animeTitleRef: 'Hunter x Hunter 🌟',
    description: 'Level 5 dərəcəsinə yüksələrək Nen gücünü oyat!',
    icon: 'Award',
    category: 'special',
    expReward: 500,
    badgeColor: 'from-emerald-500 to-green-700',
    targetValue: 5,
    badgeEmoji: '🌟'
  },
  {
    id: 'ach_level_10',
    title: 'Əfsanəvi Hokage',
    animeTitleRef: 'Naruto Hokage 👑',
    description: 'Level 10 dərəcəsinə çataraq kəndin ən güclü lideri ünvanını qazan!',
    icon: 'ShieldCheck',
    category: 'special',
    expReward: 1000,
    badgeColor: 'from-amber-400 via-orange-500 to-red-600',
    targetValue: 10,
    badgeEmoji: '👑'
  }
];

export function calculateAnimeRankAndLevel(totalExp: number = 0): AnimeRankInfo {
  // Level threshold: Level L requires L * 200 EXP
  // Level 1: 0 - 199 EXP
  // Level 2: 200 - 499 EXP
  // etc.
  let level = 1;
  let expAccumulated = 0;

  while (totalExp >= expAccumulated + level * 200) {
    expAccumulated += level * 200;
    level++;
  }

  const currentLevelExp = totalExp - expAccumulated;
  const nextLevelExp = level * 200;
  const progressPercent = Math.min(100, Math.floor((currentLevelExp / nextLevelExp) * 100));

  let rankTitle = '🥋 Genin (Akademiya Şagirdi)';
  let rankBadge = '🥋';
  let rankColor = 'text-slate-300 border-slate-700 bg-slate-800/80';

  if (level >= 30) {
    rankTitle = '🌌 God of Destruction (Sonsuz Otaku)';
    rankBadge = '🌌';
    rankColor = 'text-purple-300 border-purple-500/80 bg-purple-950/80 shadow-purple-500/50 shadow-lg';
  } else if (level >= 20) {
    rankTitle = '🔥 Monarx / Pirate King';
    rankBadge = '👑';
    rankColor = 'text-amber-300 border-amber-500/80 bg-amber-950/80 gold-glow';
  } else if (level >= 15) {
    rankTitle = '🔮 Xüsusi Dərəcəli Sorcerer';
    rankBadge = '🔮';
    rankColor = 'text-cyan-300 border-cyan-500/80 bg-cyan-950/80';
  } else if (level >= 10) {
    rankTitle = '💥 Hashira (Böyük Sütun)';
    rankBadge = '💥';
    rankColor = 'text-rose-300 border-rose-500/80 bg-rose-950/80';
  } else if (level >= 6) {
    rankTitle = '🛡️ Jonin (Təcrübəli Animeçi)';
    rankBadge = '🛡️';
    rankColor = 'text-blue-300 border-blue-500/80 bg-blue-950/80';
  } else if (level >= 3) {
    rankTitle = '⚔️ Chunin (Pirat Tayfası Üzvü)';
    rankBadge = '⚔️';
    rankColor = 'text-emerald-300 border-emerald-500/80 bg-emerald-950/80';
  }

  return {
    level,
    rankTitle,
    rankBadge,
    rankColor,
    currentLevelExp,
    nextLevelExp,
    progressPercent,
    totalExp
  };
}
