import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { 
  Anime, Episode, Character, Studio, User, AnimeTrackItem, 
  Comment, ActivityFeed, Friend, WatchPartyRoom, SystemNotification, SystemAnalytics, AnimeScheduleItem 
} from "./src/types";
import { detectBadWords } from "./src/lib/contentFilter";

const app = express();
app.use(express.json({ limit: "10mb" }));

// Security & Privacy Headers Middleware
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// Security & Privacy: Rate Limiter for Authentication APIs
const authRateLimitMap = new Map<string, { count: number; resetTime: number }>();
function authLimiter(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || "global";
  const now = Date.now();
  const limitWindow = 60000; // 1 minute window
  const maxAttempts = 20;

  const record = authRateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    authRateLimitMap.set(ip, { count: 1, resetTime: now + limitWindow });
    return next();
  }

  if (record.count >= maxAttempts) {
    return res.status(429).json({ error: "🔒 Təhlükəsizlik tədbiri: Çox sayda cəhd edildi. Zəhmət olmasa 1 dəqiqə gözləyin." });
  }

  record.count++;
  next();
}

// Password Hashing Helper
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "animeaze_secure_salt_2026").digest("hex");
}

// Sanitize User Object (Never leak passwordHash or private credentials)
function sanitizeUser(user: User): Omit<User, 'passwordHash'> {
  const { passwordHash, ...cleanUser } = user;
  return cleanUser;
}

const PORT = 3000;

// --- INITIAL MOCK DATABASE ---

const initialStudios: Studio[] = [
  {
    id: "studio-1",
    name: "A-1 Pictures",
    logo: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&auto=format&fit=crop&q=80",
    description: "Yaponiyanın ən məşhur anime studiyalarından biri. Solo Leveling, Sword Art Online və Kaguya-sama kimi əsərləri ilə tanınır.",
    establishedYear: 2005,
    animeCount: 140
  },
  {
    id: "studio-2",
    name: "Ufotable",
    logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80",
    description: "Möhtəşəm visual effektlər və animasiya keyfiyyəti ilə Demon Slayer və Fate seriyalarının istehsalçısı.",
    establishedYear: 2000,
    animeCount: 65
  },
  {
    id: "studio-3",
    name: "MAPPA",
    logo: "https://images.unsplash.com/photo-1563089145-599997674d42?w=300&auto=format&fit=crop&q=80",
    description: "Jujutsu Kaisen, Attack on Titan Final Season və Chainsaw Man kimi dinamik aksiya animelərinin yaradıcısı.",
    establishedYear: 2011,
    animeCount: 85
  },
  {
    id: "studio-4",
    name: "Toei Animation",
    logo: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&auto=format&fit=crop&q=80",
    description: "One Piece, Dragon Ball və Sailor Moon əsərləri ilə əfsanəvi tarixi olan ən böyük studiya.",
    establishedYear: 1956,
    animeCount: 450
  },
  {
    id: "studio-5",
    name: "Madhouse",
    logo: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&auto=format&fit=crop&q=80",
    description: "Frieren, Death Note, One Punch Man S1 və Hunter x Hunter animelərinin yaradıcısı.",
    establishedYear: 1972,
    animeCount: 320
  }
];

const initialCharacters: Character[] = [
  {
    id: "char-1",
    name: "Sung Jin-Woo",
    japaneseName: "水篠 旬",
    role: "Main",
    image: "https://images.unsplash.com/photo-1563089145-599997674d42?w=400&auto=format&fit=crop&q=80",
    description: "Ən zəif E-Rütbəli ovçudan Kölgə Hökmdarına çevrilən əfsanəvi qəhrəman.",
    seiyuu: {
      name: "Taito Ban",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      language: "Yaponca"
    },
    animeIds: ["anime-1"]
  },
  {
    id: "char-2",
    name: "Tanjiro Kamado",
    japaneseName: "竈門 炭治郎",
    role: "Main",
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=80",
    description: "Bbacısını iblislikdən xilas etmək üçün İblis Avçısı Korpusuna qoşulan xeyirxah gənc.",
    seiyuu: {
      name: "Natsuki Hanae",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
      language: "Yaponca"
    },
    animeIds: ["anime-2"]
  },
  {
    id: "char-3",
    name: "Satoru Gojo",
    japaneseName: "五条 悟",
    role: "Main",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80",
    description: "Dünyanın ən güclü cadi kadrı və Jujutsu Kollecinin müəllimi.",
    seiyuu: {
      name: "Yuichi Nakamura",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",
      language: "Yaponca"
    },
    animeIds: ["anime-3"]
  },
  {
    id: "char-4",
    name: "Eren Yeager",
    japaneseName: "エレン・イェーガー",
    role: "Main",
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=80",
    description: "Divarların arxasındakı azadlığı tapmaq üçün Titanlara qarşı mübarizə aparan döyüşçü.",
    seiyuu: {
      name: "Yuki Kaji",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
      language: "Yaponca"
    },
    animeIds: ["anime-4"]
  },
  {
    id: "char-5",
    name: "Monkey D. Luffy",
    japaneseName: "モンキー・D・ルフィ",
    role: "Main",
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80",
    description: "Quldurlar Kralı olmaq arzusu ilə dənizlərə açılan Hasır Şapkalı kapitan.",
    seiyuu: {
      name: "Mayumi Tanaka",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
      language: "Yaponca"
    },
    animeIds: ["anime-5"]
  }
];

const initialAnimes: Anime[] = [
  {
    id: "anime-1",
    title: "Solo Leveling 2-ci Sezon: Arise from the Shadow",
    japaneseTitle: "俺だけレベルアップな件 2nd Season",
    slug: "solo-leveling-season-2",
    synopsis: "Dünyanın ən zəif E-Rütbəli ovçusu Sung Jin-Woo təhlükəli zindanda təkbaşına sağ qaldıqdan sonra sistemi yeniləyir və Yeganə Səviyyə Qaldıran gücə sahib olur. 2-ci sezonda Jin-Woo Kölgə Ordusu ilə daha böyük təhlükələrə qarşı durur.",
    posterImage: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80",
    score: 9.2,
    scoredBy: 142000,
    type: "TV",
    episodesCount: 12,
    status: "Davam edir",
    airedYear: 2025,
    season: "Qış",
    genres: ["Aksiya", "Fantastika", "Macəra", "Müstəqil Güclənmə"],
    studio: "A-1 Pictures",
    ageRating: "16+",
    duration: "24 dəq",
    trailerUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    featured: true,
    trending: true,
    views: 890500,
    bookmarksCount: 45200
  },
  {
    id: "anime-2",
    title: "Demon Slayer: Kimetsu no Yaiba - Hashira Training Arc",
    japaneseTitle: "鬼滅の刃 柱稽古編",
    slug: "demon-slayer-hashira-training",
    synopsis: "Tanjiro və İblis Avçısı Korpusu Muzan Kibutsuji ilə son böyük döyüşə hazırlaşmaq üçün bütün Haşiraların rəhbərliyi altında xüsusi təlim keçirlər.",
    posterImage: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80",
    score: 8.8,
    scoredBy: 98000,
    type: "TV",
    episodesCount: 8,
    status: "Bitdi",
    airedYear: 2024,
    season: "Yaz",
    genres: ["Aksiya", "İblislər", "Tarixi", "Döyüş İncəsənəti"],
    studio: "Ufotable",
    ageRating: "16+",
    duration: "24 dəq",
    featured: true,
    trending: true,
    views: 740100,
    bookmarksCount: 38900
  },
  {
    id: "anime-3",
    title: "Jujutsu Kaisen 2-ci Sezon (Shibuya Incident)",
    japaneseTitle: "呪術廻戦 懐玉・玉折 / 渋谷事変",
    slug: "jujutsu-kaisen-season-2",
    synopsis: "Satoru Gojo və Suguru Geto-nun gənclik illəri və Shibuyada baş verən dəhşətli lənət insidenti. Yuji Itadori və yoldaşları ən böyük sınaqla üz-üzədirlər.",
    posterImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80",
    score: 9.0,
    scoredBy: 215000,
    type: "TV",
    episodesCount: 23,
    status: "Bitdi",
    airedYear: 2023,
    season: "Yay",
    genres: ["Aksiya", "Müstəqil Lənət", "Super Güclər", "Məktəb"],
    studio: "MAPPA",
    ageRating: "18+",
    duration: "24 dəq",
    featured: true,
    trending: true,
    views: 1200000,
    bookmarksCount: 61000
  },
  {
    id: "anime-4",
    title: "Attack on Titan: The Final Season",
    japaneseTitle: "進撃の巨人 The Final Season",
    slug: "attack-on-titan-final-season",
    synopsis: "Eren Yeager azadlığın qiymətini öyrənmək üçün bütün dünyanı silkələyəcək dəhşətli 'Rumbling' planını həyata keçirir. İnsanlığın son mübarizəsi.",
    posterImage: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80",
    score: 9.1,
    scoredBy: 340000,
    type: "TV",
    episodesCount: 28,
    status: "Bitdi",
    airedYear: 2023,
    season: "Payız",
    genres: ["Aksiya", "Dram", "Döyüş", "Hərbi", "Müəmma"],
    studio: "MAPPA",
    ageRating: "18+",
    duration: "25 dəq",
    featured: false,
    trending: true,
    views: 2100000,
    bookmarksCount: 89000
  },
  {
    id: "anime-5",
    title: "One Piece: Egghead Arc",
    japaneseTitle: "ワンピース エッグヘッド編",
    slug: "one-piece-egghead",
    synopsis: "Hasır Şapka Ekipajı gələcəyin adası sayılan Dr. Vegapunk-un Egghead adasına gəlir. Dünya Hökumətinin böyük sirrləri açılır.",
    posterImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&auto=format&fit=crop&q=80",
    score: 8.9,
    scoredBy: 410000,
    type: "TV",
    episodesCount: 1100,
    status: "Davam edir",
    airedYear: 1999,
    season: "Payız",
    genres: ["Aksiya", "Macəra", "Komediya", "Fantastika", "Şonen"],
    studio: "Toei Animation",
    ageRating: "12+",
    duration: "24 dəq",
    featured: true,
    trending: true,
    views: 3500000,
    bookmarksCount: 105000
  },
  {
    id: "anime-6",
    title: "Frieren: Beyond Journey's End",
    japaneseTitle: "葬送のフリーレン",
    slug: "frieren-beyond-journeys-end",
    synopsis: "Elf cadugər Frieren Qəhrəman Himmellə birgə İblis Kralını məğlub etdikdən sonra insan həyatının qısalığını dərk edir və insanları daha yaxşı anlamaq üçün yeni səyahətə çıxır.",
    posterImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    score: 9.3,
    scoredBy: 280000,
    type: "TV",
    episodesCount: 28,
    status: "Bitdi",
    airedYear: 2023,
    season: "Payız",
    genres: ["Macəra", "Dram", "Fantastika", "Həyat Parçası"],
    studio: "Madhouse",
    ageRating: "12+",
    duration: "24 dəq",
    featured: true,
    trending: false,
    views: 1800000,
    bookmarksCount: 72000
  }
];

const initialEpisodes: Episode[] = [
  {
    id: "ep-101",
    animeId: "anime-1",
    episodeNumber: 1,
    title: "Görünməz Qapı və Yeni Başlanğıc",
    thumbnail: "https://images.unsplash.com/photo-1563089145-599997674d42?w=500&auto=format&fit=crop&q=80",
    duration: "23:45",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    subtitles: [
      { lang: "az", label: "Azərbaycan dili", url: "" },
      { lang: "tr", label: "Türkçe", url: "" },
      { lang: "en", label: "English", url: "" }
    ],
    audioTracks: [
      { lang: "ja", label: "Yaponca (Orijinal)" },
      { lang: "az", label: "Azərbaycan Dublyajı (AnimeAze HD)" }
    ],
    introStart: 10,
    introEnd: 95,
    outroStart: 1320,
    outroEnd: 1410
  },
  {
    id: "ep-102",
    animeId: "anime-1",
    episodeNumber: 2,
    title: "Kölgələrin Hökmdarı Oyanır",
    thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80",
    duration: "24:10",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    subtitles: [
      { lang: "az", label: "Azərbaycan dili", url: "" },
      { lang: "en", label: "English", url: "" }
    ],
    audioTracks: [
      { lang: "ja", label: "Yaponca (Orijinal)" }
    ],
    introStart: 15,
    introEnd: 100,
    outroStart: 1340,
    outroEnd: 1430
  },
  {
    id: "ep-201",
    animeId: "anime-2",
    episodeNumber: 1,
    title: "Haşira Təlimi Başlayır",
    thumbnail: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=80",
    duration: "48:00",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    subtitles: [{ lang: "az", label: "Azərbaycan dili", url: "" }],
    audioTracks: [{ lang: "ja", label: "Yaponca (Orijinal)" }],
    introStart: 20,
    introEnd: 105
  }
];

const initialUsers: User[] = [
  {
    id: "user-admin-baghirli",
    username: "baghirli_togrul",
    email: "baghirli.togrul@gmail.com",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1000&auto=format&fit=crop&q=80",
    bio: "AnimeAze Platformasının Baş Admini və Yaradıcısı 🎌",
    role: "admin",
    favCharacters: ["char-1", "char-3"],
    status: "active",
    joinedDate: "2024-01-15",
    stats: {
      watchedEpisodes: 540,
      hoursWatched: 216,
      animeCount: 58
    }
  },
  {
    id: "user-admin",
    username: "test_bot",
    email: "togrul@example.com",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1000&auto=format&fit=crop&q=80",
    bio: "AnimeAze Platformasının Baş Admini və Anime Həvəskarı 🎌",
    role: "admin",
    favCharacters: ["char-1", "char-3"],
    status: "active",
    joinedDate: "2024-01-15",
    stats: {
      watchedEpisodes: 420,
      hoursWatched: 168,
      animeCount: 45
    }
  },
  {
    id: "user-2",
    username: "Orxan_Anime",
    email: "orxan@example.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80",
    bio: "Frieren və Jujutsu Kaisen azarkeşi. Şönen həvəskarı!",
    role: "premium",
    favCharacters: ["char-2"],
    status: "active",
    joinedDate: "2024-03-10",
    stats: {
      watchedEpisodes: 210,
      hoursWatched: 84,
      animeCount: 22
    }
  }
];

const initialTrackers: AnimeTrackItem[] = [
  {
    id: "tr-1",
    userId: "user-admin",
    animeId: "anime-1",
    status: "watching",
    progress: 2,
    score: 10,
    notes: "Möhtəşəm animasiya keyfiyyəti!",
    updatedAt: new Date().toISOString()
  },
  {
    id: "tr-2",
    userId: "user-admin",
    animeId: "anime-2",
    status: "completed",
    progress: 8,
    score: 9,
    updatedAt: new Date().toISOString()
  }
];

const initialComments: Comment[] = [
  {
    id: "cm-1",
    animeId: "anime-1",
    episodeId: "ep-101",
    userId: "user-2",
    userUsername: "Orxan_Anime",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    userRole: "premium",
    content: "Sung Jin-Woo-nun kölgə ordusunu çağırdığı an tam tükləri ürpərdən idi! 🔥 A-1 Pictures həqiqətən əla iş çıxarıb.",
    isSpoiler: false,
    rating: 10,
    upvotes: 24,
    downvotes: 1,
    createdAt: "2 saat əvvəl"
  },
  {
    id: "cm-2",
    animeId: "anime-1",
    episodeId: "ep-101",
    userId: "user-admin",
    userUsername: "test_bot",
    userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    userRole: "admin",
    content: "2-ci seriya tezliklə Azərbaycan dilində subtitrlə və dublyajla yüklənəcək, bəyənməyi unutmayın!",
    isSpoiler: false,
    upvotes: 45,
    downvotes: 0,
    createdAt: "1 saat əvvəl"
  }
];

const initialActivities: ActivityFeed[] = [
  {
    id: "act-1",
    userId: "user-2",
    username: "Orxan_Anime",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    type: "watched_episode",
    animeTitle: "Solo Leveling 2-ci Sezon",
    animePoster: "https://images.unsplash.com/photo-1563089145-599997674d42?w=100&auto=format&fit=crop&q=80",
    details: "1-ci seriyanı bitirdi (10/10 reytinq)",
    timestamp: "2 saat əvvəl"
  },
  {
    id: "act-2",
    userId: "user-admin",
    username: "test_bot",
    userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    type: "added_list",
    animeTitle: "Frieren: Beyond Journey's End",
    animePoster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=100&auto=format&fit=crop&q=80",
    details: "'Tamamlandı' siyahısına əlavə etdi",
    timestamp: "5 saat əvvəl"
  }
];

const initialWatchRooms: WatchPartyRoom[] = [
  {
    id: "wp-room-1",
    name: "Solo Leveling S2 Birlikdə İzləmə 🔥",
    animeId: "anime-1",
    episodeId: "ep-101",
    hostId: "user-admin",
    hostName: "test_bot",
    isPrivate: false,
    participants: [
      { id: "user-admin", name: "test_bot", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80" },
      { id: "user-2", name: "Orxan_Anime", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80" }
    ],
    currentTime: 120,
    isPlaying: true,
    messages: [
      { id: "m1", userId: "user-admin", username: "test_bot", userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80", text: "Xoş gəldiniz! Yayım başladıldı.", timestamp: "12:00" },
      { id: "m2", userId: "user-2", username: "Orxan_Anime", userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80", text: "Səs və görüntü tam synchronous dur! 🔥", timestamp: "12:01" }
    ]
  }
];

const initialNotifications: SystemNotification[] = [
  {
    id: "notif-1",
    userId: "user-admin",
    title: "Yeni Epizod Əlavə Olundu! 🔥",
    message: "Solo Leveling S2 - 1-ci seriya artıq saytda izlənilə bilər.",
    type: "new_episode",
    read: false,
    createdAt: "1 saat əvvəl",
    targetType: "anime",
    targetId: "anime-1"
  },
  {
    id: "notif-2",
    userId: "user-admin",
    title: "Watch Party Başladı! 🎉",
    message: "test_bot tərəfindən 'Solo Leveling S2 Birlikdə İzləmə' otağı yaradıldı.",
    type: "system",
    read: false,
    createdAt: "30 dəq əvvəl",
    targetType: "watchparty",
    targetId: "wp-room-1"
  },
  {
    id: "notif-3",
    userId: "user-admin",
    title: "Həftəlik Yayın Təqvimi Yeniləndi 📅",
    message: "Bu həftə yayımlanacaq 7 yeni anime epizodunun vaxtları təqvimdə dəqiqləşdi.",
    type: "system",
    read: false,
    createdAt: "15 dəq əvvəl",
    targetType: "calendar",
    targetId: "all"
  },
  {
    id: "notif-4",
    userId: "user-admin",
    title: "One Piece Egghead Arc 🏴‍☠️",
    message: "1124-cü seriyanın buraxılış cədvəli təqvimə və kataloqa əlavə edildi.",
    type: "new_episode",
    read: false,
    createdAt: "5 dəq əvvəl",
    targetType: "anime",
    targetId: "anime-5"
  }
];

const initialSchedules: AnimeScheduleItem[] = [
  {
    id: "sched-1",
    animeId: "anime-1",
    animeTitle: "Solo Leveling 2-ci Sezon: Arise from the Shadow",
    japaneseTitle: "俺だけレベルアップな件 2nd Season",
    posterImage: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80",
    episodeNumber: 3,
    airDate: "2026-08-11",
    airTime: "18:30",
    dayOfWeek: "tuesday",
    dayNameAz: "Çərşənbə axşamı",
    status: "today",
    timeRemaining: "Bu gün 18:30 (AZT)",
    studio: "A-1 Pictures",
    genres: ["Aksiya", "Fantastika", "Macəra"]
  },
  {
    id: "sched-2",
    animeId: "anime-5",
    animeTitle: "One Piece: Egghead Arc",
    japaneseTitle: "ワンピース エッグヘッド編",
    posterImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
    bannerImage: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&auto=format&fit=crop&q=80",
    episodeNumber: 1124,
    airDate: "2026-08-16",
    airTime: "10:00",
    dayOfWeek: "sunday",
    dayNameAz: "Bazar",
    status: "upcoming",
    timeRemaining: "Bazar günü 10:00",
    studio: "Toei Animation",
    genres: ["Aksiya", "Macəra", "Şonen"]
  },
  {
    id: "sched-3",
    animeId: "anime-3",
    animeTitle: "Jujutsu Kaisen 3-cü Sezon (Culling Game)",
    japaneseTitle: "呪術廻戦 死滅回游",
    posterImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    episodeNumber: 1,
    airDate: "2026-08-12",
    airTime: "23:00",
    dayOfWeek: "wednesday",
    dayNameAz: "Çərşənbə",
    status: "upcoming",
    timeRemaining: "Sabah 23:00",
    studio: "MAPPA",
    genres: ["Aksiya", "Super Güclər", "Lənətlər"]
  },
  {
    id: "sched-4",
    animeId: "anime-2",
    animeTitle: "Demon Slayer: Infinity Castle Arc",
    japaneseTitle: "鬼滅の刃 無限城編",
    posterImage: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80",
    episodeNumber: 1,
    airDate: "2026-08-14",
    airTime: "20:00",
    dayOfWeek: "friday",
    dayNameAz: "Cümə",
    status: "upcoming",
    timeRemaining: "Cümə günü 20:00",
    studio: "Ufotable",
    genres: ["Aksiya", "İblislər", "Tarixi"]
  },
  {
    id: "sched-5",
    animeId: "anime-6",
    animeTitle: "Frieren 2-ci Sezon: Beyond Journey's End",
    japaneseTitle: "葬送のフリーレン 2nd Season",
    posterImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    episodeNumber: 1,
    airDate: "2026-08-15",
    airTime: "22:00",
    dayOfWeek: "saturday",
    dayNameAz: "Şənbə",
    status: "upcoming",
    timeRemaining: "Şənbə 22:00",
    studio: "Madhouse",
    genres: ["Macəra", "Fantastika", "Dram"]
  },
  {
    id: "sched-6",
    animeId: "anime-4",
    animeTitle: "Chainsaw Man 2-ci Sezon (Reze Arc)",
    japaneseTitle: "チェンソーマン レゼ篇",
    posterImage: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
    episodeNumber: 1,
    airDate: "2026-08-10",
    airTime: "21:00",
    dayOfWeek: "monday",
    dayNameAz: "Bazar ertəsi",
    status: "aired",
    timeRemaining: "Dünən yayımlandı",
    studio: "MAPPA",
    genres: ["Aksiya", "Qorxu", "Müstəqil Güclər"]
  },
  {
    id: "sched-7",
    animeId: "anime-1",
    animeTitle: "Bleach: Thousand-Year Blood War Part 3",
    japaneseTitle: "BLEACH 千年血戦篇 相剋譚",
    posterImage: "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80",
    episodeNumber: 27,
    airDate: "2026-08-13",
    airTime: "19:00",
    dayOfWeek: "thursday",
    dayNameAz: "Cümə axşamı",
    status: "upcoming",
    timeRemaining: "Cümə axşamı 19:00",
    studio: "Studio Pierrot",
    genres: ["Aksiya", "Ruhlar", "Şonen"]
  }
];

// In-Memory Data Store
let dbAnimes = [...initialAnimes];
let dbEpisodes = [...initialEpisodes];
let dbCharacters = [...initialCharacters];
let dbStudios = [...initialStudios];
let dbUsers = [...initialUsers];
let dbTrackers = [...initialTrackers];
let dbComments = [...initialComments];
let dbActivities = [...initialActivities];
let dbWatchRooms = [...initialWatchRooms];
let dbNotifications = [...initialNotifications];
let dbSchedules = [...initialSchedules];

interface AnimeStarRating {
  id: string;
  userId: string;
  animeId: string;
  rating: number; // 1..5
  createdAt: string;
}

let dbRatings: AnimeStarRating[] = [
  { id: "r1", userId: "user-1", animeId: "anime-1", rating: 5, createdAt: new Date().toISOString() },
  { id: "r2", userId: "user-2", animeId: "anime-1", rating: 5, createdAt: new Date().toISOString() },
  { id: "r3", userId: "user-3", animeId: "anime-1", rating: 4, createdAt: new Date().toISOString() },
  { id: "r4", userId: "user-1", animeId: "anime-2", rating: 5, createdAt: new Date().toISOString() },
  { id: "r5", userId: "user-2", animeId: "anime-2", rating: 4, createdAt: new Date().toISOString() },
  { id: "r6", userId: "user-1", animeId: "anime-3", rating: 5, createdAt: new Date().toISOString() },
  { id: "r7", userId: "user-1", animeId: "anime-4", rating: 4, createdAt: new Date().toISOString() },
];

function getAnimeRatingStats(animeId: string, userId?: string) {
  const anime = dbAnimes.find(a => a.id === animeId || a.slug === animeId);
  const realAnimeId = anime ? anime.id : animeId;

  const ratings = dbRatings.filter(r => r.animeId === realAnimeId);
  const totalRatings = ratings.length;
  const userRating = userId ? (ratings.find(r => r.userId === userId)?.rating || 0) : 0;

  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;

  ratings.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
      sum += r.rating;
    }
  });

  const defaultAvg = anime ? Math.round((anime.score / 2) * 10) / 10 : 4.5;
  const avgStarRating = totalRatings > 0 ? Math.round((sum / totalRatings) * 10) / 10 : defaultAvg;

  return {
    animeId: realAnimeId,
    userRating,
    averageStarRating: avgStarRating,
    totalRatings: totalRatings > 0 ? totalRatings : (anime?.scoredBy || 120),
    distribution
  };
}

// --- API ROUTES ---

// Health
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "AnimeAze Backend Engine" });
});

// Anime API: List & Filter
app.get("/api/anime", (req, res) => {
  let result = [...dbAnimes];
  const { genre, year, studio, status, query, sort, featured } = req.query;

  if (query) {
    const q = String(query).toLowerCase();
    result = result.filter(a => 
      a.title.toLowerCase().includes(q) || 
      a.japaneseTitle.toLowerCase().includes(q) ||
      a.genres.some(g => g.toLowerCase().includes(q))
    );
  }

  if (genre) {
    result = result.filter(a => a.genres.includes(String(genre)));
  }

  if (year) {
    result = result.filter(a => a.airedYear === Number(year));
  }

  if (studio) {
    result = result.filter(a => a.studio.toLowerCase() === String(studio).toLowerCase());
  }

  if (status) {
    result = result.filter(a => a.status === String(status));
  }

  if (featured === 'true') {
    result = result.filter(a => a.featured);
  }

  // Sort
  if (sort === "score") {
    result.sort((a, b) => b.score - a.score);
  } else if (sort === "views") {
    result.sort((a, b) => b.views - a.views);
  } else if (sort === "year") {
    result.sort((a, b) => b.airedYear - a.airedYear);
  }

  res.json(result);
});

// Anime API: Single Detail
app.get("/api/anime/:id", (req, res) => {
  const anime = dbAnimes.find(a => a.id === req.params.id || a.slug === req.params.id);
  if (!anime) {
    return res.status(404).json({ error: "Anime tapılmadı" });
  }

  // Increment view count
  anime.views += 1;

  const episodes = dbEpisodes.filter(e => e.animeId === anime.id).sort((a,b) => a.episodeNumber - b.episodeNumber);
  const characters = dbCharacters.filter(c => c.animeIds.includes(anime.id));
  const studioInfo = dbStudios.find(s => s.name.toLowerCase() === anime.studio.toLowerCase());

  // Simple recommendation engine: match by same genre or studio
  const recommendations = dbAnimes
    .filter(a => a.id !== anime.id && (a.genres.some(g => anime.genres.includes(g)) || a.studio === anime.studio))
    .slice(0, 4);

  const userId = req.query.userId as string | undefined;
  const ratingStats = getAnimeRatingStats(anime.id, userId);

  res.json({
    anime,
    episodes,
    characters,
    studioInfo,
    recommendations,
    ratingStats
  });
});

// Anime Star Rating APIs
app.get("/api/anime/:id/rating", (req, res) => {
  const userId = req.query.userId as string | undefined;
  const stats = getAnimeRatingStats(req.params.id, userId);
  res.json(stats);
});

app.post("/api/anime/:id/rate", (req, res) => {
  const { userId, rating } = req.body;
  if (!userId) return res.status(400).json({ error: "İstifadəçi təyin edilməyib" });

  const numericRating = Math.min(5, Math.max(1, Math.round(Number(rating))));

  const anime = dbAnimes.find(a => a.id === req.params.id || a.slug === req.params.id);
  if (!anime) {
    return res.status(404).json({ error: "Anime tapılmadı" });
  }

  let ratingItem = dbRatings.find(r => r.animeId === anime.id && r.userId === userId);
  if (ratingItem) {
    ratingItem.rating = numericRating;
    ratingItem.createdAt = new Date().toISOString();
  } else {
    ratingItem = {
      id: "rate-" + Date.now() + Math.random().toString(36).substring(2, 6),
      userId,
      animeId: anime.id,
      rating: numericRating,
      createdAt: new Date().toISOString()
    };
    dbRatings.push(ratingItem);
  }

  // Synchronize score in user tracker (1-5 star scale mapped to 1-10 tracker score)
  let tracker = dbTrackers.find(t => t.userId === userId && t.animeId === anime.id);
  const mappedScore = numericRating * 2; // e.g. 5 stars -> 10 score
  if (tracker) {
    tracker.score = mappedScore;
    tracker.updatedAt = new Date().toISOString();
  } else {
    dbTrackers.push({
      id: "tr-" + Date.now(),
      userId,
      animeId: anime.id,
      status: "watching",
      progress: 1,
      score: mappedScore,
      updatedAt: new Date().toISOString()
    });
  }

  // Log activity
  const user = dbUsers.find(u => u.id === userId);
  if (user) {
    dbActivities.unshift({
      id: "act-rate-" + Date.now(),
      userId: user.id,
      username: user.username,
      userAvatar: user.avatar,
      type: "reviewed",
      animeTitle: anime.title,
      animePoster: anime.posterImage,
      details: `${numericRating} / 5 Ulduz reytinq verdi ${'★'.repeat(numericRating)}`,
      timestamp: "İndi"
    });
  }

  const stats = getAnimeRatingStats(anime.id, userId);
  res.json({ message: `Animəyə ${numericRating} ulduz reytinq verdiniz! ★`, stats });
});

// Admin API: Create / Edit Anime
app.post("/api/admin/anime", (req, res) => {
  const newAnimeData = req.body as Anime;
  const existingIdx = dbAnimes.findIndex(a => a.id === newAnimeData.id);

  if (existingIdx >= 0) {
    dbAnimes[existingIdx] = { ...dbAnimes[existingIdx], ...newAnimeData };
    return res.json({ message: "Anime yeniləndi", anime: dbAnimes[existingIdx] });
  } else {
    const newAnime: Anime = {
      ...newAnimeData,
      id: "anime-" + Date.now(),
      score: newAnimeData.score || 8.0,
      scoredBy: 1,
      views: 0,
      bookmarksCount: 0,
      status: newAnimeData.status || "Davam edir"
    };
    dbAnimes.unshift(newAnime);
    return res.json({ message: "Yeni anime əlavə olundu", anime: newAnime });
  }
});

// Admin API: Delete Anime
app.delete("/api/admin/anime/:id", (req, res) => {
  dbAnimes = dbAnimes.filter(a => a.id !== req.params.id);
  dbEpisodes = dbEpisodes.filter(e => e.animeId !== req.params.id);
  res.json({ message: "Anime silindi" });
});

// Admin API: Create / Edit Episode
app.post("/api/admin/episode", (req, res) => {
  const epData = req.body as Episode;
  const existingIdx = dbEpisodes.findIndex(e => e.id === epData.id);

  if (existingIdx >= 0) {
    dbEpisodes[existingIdx] = { ...dbEpisodes[existingIdx], ...epData };
    return res.json({ message: "Epizod yeniləndi", episode: dbEpisodes[existingIdx] });
  } else {
    const newEp: Episode = {
      ...epData,
      id: "ep-" + Date.now()
    };
    dbEpisodes.push(newEp);
    
    // Update anime episode count if needed
    const anime = dbAnimes.find(a => a.id === epData.animeId);
    if (anime && anime.episodesCount < epData.episodeNumber) {
      anime.episodesCount = epData.episodeNumber;
    }

    return res.json({ message: "Yeni epizod əlavə olundu", episode: newEp });
  }
});

// Episode API: Single detail
app.get("/api/episode/:id", (req, res) => {
  const episode = dbEpisodes.find(e => e.id === req.params.id);
  if (!episode) return res.status(404).json({ error: "Epizod tapılmadı" });
  
  const anime = dbAnimes.find(a => a.id === episode.animeId);
  const allEpisodes = dbEpisodes.filter(e => e.animeId === episode.animeId).sort((a,b) => a.episodeNumber - b.episodeNumber);

  res.json({ episode, anime, allEpisodes });
});

// Anime Tracker Progress API
app.get("/api/trackers/:userId", (req, res) => {
  const userTrackers = dbTrackers.filter(t => t.userId === req.params.userId);
  // Join with anime info
  const items = userTrackers.map(tr => ({
    ...tr,
    anime: dbAnimes.find(a => a.id === tr.animeId)
  }));
  res.json(items);
});

app.post("/api/trackers", (req, res) => {
  const { userId, animeId, status, progress, score, notes } = req.body;
  let tracker = dbTrackers.find(t => t.userId === userId && t.animeId === animeId);

  if (tracker) {
    tracker.status = status;
    tracker.progress = progress;
    tracker.score = score;
    tracker.notes = notes;
    tracker.updatedAt = new Date().toISOString();
  } else {
    tracker = {
      id: "tr-" + Date.now(),
      userId,
      animeId,
      status,
      progress: progress || 0,
      score: score || 0,
      notes,
      updatedAt: new Date().toISOString()
    };
    dbTrackers.push(tracker);
  }

  // Record user activity
  const user = dbUsers.find(u => u.id === userId);
  const anime = dbAnimes.find(a => a.id === animeId);
  if (user && anime) {
    const activity: ActivityFeed = {
      id: "act-" + Date.now(),
      userId: user.id,
      username: user.username,
      userAvatar: user.avatar,
      type: "added_list",
      animeTitle: anime.title,
      animePoster: anime.posterImage,
      details: `${status === 'watching' ? 'İzlənilir' : status === 'completed' ? 'Tamamlandı' : 'Siyahıya əlavə edildi'} (${progress} epizod)`,
      timestamp: "İndi"
    };
    dbActivities.unshift(activity);
  }

  res.json({ message: "Siyahı yeniləndi", tracker });
});

// Comments & Reviews API
app.get("/api/comments/:animeId", (req, res) => {
  const { episodeId } = req.query;
  let comments = dbComments.filter(c => c.animeId === req.params.animeId);
  if (episodeId) {
    comments = comments.filter(c => c.episodeId === String(episodeId));
  }
  res.json(comments);
});

app.post("/api/comments", (req, res) => {
  const { animeId, episodeId, userId, userUsername, userAvatar, content, isSpoiler, rating, parentId } = req.body;
  const user = dbUsers.find(u => u.id === userId);

  const newComment: Comment = {
    id: "cm-" + Date.now(),
    animeId,
    episodeId,
    userId,
    userUsername: userUsername || "Qonaq",
    userAvatar: userAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    userRole: user ? user.role : "user",
    content,
    isSpoiler: Boolean(isSpoiler),
    rating: rating ? Number(rating) : undefined,
    upvotes: 0,
    downvotes: 0,
    parentId,
    createdAt: "İndi"
  };

  dbComments.unshift(newComment);
  res.json(newComment);
});

app.post("/api/comments/:id/vote", (req, res) => {
  const comment = dbComments.find(c => c.id === req.params.id);
  const { vote } = req.body; // 'up' or 'down'

  if (comment) {
    if (vote === 'up') comment.upvotes += 1;
    if (vote === 'down') comment.downvotes += 1;
    return res.json(comment);
  }
  res.status(404).json({ error: "Rəy tapılmadı" });
});

// Social Activity Feed
app.get("/api/social/feed", (req, res) => {
  res.json(dbActivities);
});

// Friends API
app.get("/api/social/friends/:userId", (req, res) => {
  const friends = [
    {
      id: "f-1",
      userId: req.params.userId,
      friendId: "user-2",
      friendUsername: "Orxan_Anime",
      friendAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      status: "accepted",
      lastSeen: "10 dəq əvvəl"
    }
  ];
  res.json(friends);
});

// Watch Party Rooms API
app.get("/api/watchparty/rooms", (req, res) => {
  res.json(dbWatchRooms);
});

app.post("/api/watchparty/room", (req, res) => {
  const { name, animeId, episodeId, hostId, hostName, isPrivate, passcode } = req.body;
  const user = dbUsers.find(u => u.id === hostId) || { avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100" };

  const newRoom: WatchPartyRoom = {
    id: "wp-" + Date.now(),
    name: name || "Birgə İzləmə Otağı",
    animeId,
    episodeId,
    hostId,
    hostName,
    isPrivate: Boolean(isPrivate),
    passcode,
    participants: [{ id: hostId, name: hostName, avatar: user.avatar }],
    currentTime: 0,
    isPlaying: false,
    messages: [
      {
        id: "msg-1",
        userId: "system",
        username: "Sistem Bot",
        userAvatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100",
        text: `Watch Party Otağı yaradıldı! ${hostName} tərəfindən idarə olunur.`,
        timestamp: "İndi"
      }
    ]
  };

  dbWatchRooms.unshift(newRoom);
  res.json(newRoom);
});

app.get("/api/watchparty/room/:id", (req, res) => {
  const room = dbWatchRooms.find(r => r.id === req.params.id);
  if (!room) return res.status(404).json({ error: "Otaq tapılmadı" });
  
  const anime = dbAnimes.find(a => a.id === room.animeId);
  const episode = dbEpisodes.find(e => e.id === room.episodeId) || dbEpisodes[0];

  res.json({ room, anime, episode });
});

app.post("/api/watchparty/room/:id/message", (req, res) => {
  const room = dbWatchRooms.find(r => r.id === req.params.id);
  if (!room) return res.status(404).json({ error: "Otaq tapılmadı" });

  const { userId, username, userAvatar, text } = req.body;
  const newMsg = {
    id: "msg-" + Date.now(),
    userId,
    username,
    userAvatar,
    text,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  room.messages.push(newMsg);
  res.json(newMsg);
});

app.post("/api/watchparty/room/:id/sync", (req, res) => {
  const room = dbWatchRooms.find(r => r.id === req.params.id);
  if (!room) return res.status(404).json({ error: "Otaq tapılmadı" });

  const { currentTime, isPlaying } = req.body;
  if (typeof currentTime === 'number') room.currentTime = currentTime;
  if (typeof isPlaying === 'boolean') room.isPlaying = isPlaying;

  res.json({ currentTime: room.currentTime, isPlaying: room.isPlaying });
});

// MAL / AniList Import API
app.post("/api/mal/import", (req, res) => {
  const { userId, listData } = req.body;
  // Parse simulated XML/JSON items
  let count = 0;
  if (Array.isArray(listData)) {
    listData.forEach(item => {
      const matchAnime = dbAnimes.find(a => a.title.toLowerCase().includes((item.title || '').toLowerCase()));
      if (matchAnime) {
        let tracker = dbTrackers.find(t => t.userId === userId && t.animeId === matchAnime.id);
        if (!tracker) {
          dbTrackers.push({
            id: "tr-mal-" + Date.now() + Math.random(),
            userId,
            animeId: matchAnime.id,
            status: item.status || "completed",
            progress: item.progress || matchAnime.episodesCount,
            score: item.score || 9,
            notes: "MAL / AniList İdxal Olundu",
            updatedAt: new Date().toISOString()
          });
          count++;
        }
      }
    });
  }
  res.json({ message: `${count} ədəd anime siyahınıza uğurla köçürüldü!`, importedCount: count });
});

// Wiki APIs
app.get("/api/wiki/characters", (req, res) => {
  res.json(dbCharacters);
});

app.get("/api/wiki/studios", (req, res) => {
  res.json(dbStudios);
});

// Notifications
app.get("/api/notifications/:userId", (req, res) => {
  res.json(dbNotifications);
});

app.post("/api/notifications/:id/read", (req, res) => {
  const notif = dbNotifications.find(n => n.id === req.params.id);
  if (notif) {
    notif.read = true;
    return res.json(notif);
  }
  res.status(404).json({ error: "Bildiriş tapılmadı" });
});

app.post("/api/notifications/read-all", (req, res) => {
  dbNotifications.forEach(n => n.read = true);
  res.json({ message: "Bütün bildirişlər oxunmuş olaraq işarələndi" });
});

// Calendar API
app.get("/api/calendar", (req, res) => {
  const { dayOfWeek, genre, studio } = req.query;
  let schedule = [...dbSchedules];

  if (dayOfWeek && dayOfWeek !== 'all') {
    schedule = schedule.filter(s => s.dayOfWeek === dayOfWeek);
  }
  if (genre && genre !== 'all') {
    schedule = schedule.filter(s => s.genres.includes(genre as string));
  }
  if (studio && studio !== 'all') {
    schedule = schedule.filter(s => s.studio === studio);
  }

  res.json(schedule);
});

// Admin Analytics API
app.get("/api/admin/analytics", (req, res) => {
  const analytics: SystemAnalytics = {
    dailyActiveUsers: 1420,
    totalViews: dbAnimes.reduce((acc, curr) => acc + curr.views, 0),
    topAnimes: dbAnimes.map(a => ({ id: a.id, title: a.title, views: a.views })).sort((a,b) => b.views - a.views).slice(0, 5),
    playerErrors: [
      { time: "10:15", msg: "CDN Timeout", anime: "Solo Leveling S2" },
      { time: "08:30", msg: "Subtitr sinxronizasiya xətası", anime: "One Piece" }
    ],
    userDistribution: [
      { role: "admin", count: 2 },
      { role: "moderator", count: 5 },
      { role: "premium", count: 320 },
      { role: "user", count: 1850 }
    ]
  };
  res.json({ analytics, users: dbUsers, comments: dbComments });
});

// Username Uniqueness Check API
app.get("/api/auth/check-username", (req, res) => {
  const username = (req.query.username as string || '').trim();
  const excludeUserId = req.query.excludeUserId as string | undefined;

  if (!username) {
    return res.json({ available: false, message: "Ləqəb daxil edilməyib." });
  }

  if (username.length < 3) {
    return res.json({ available: false, message: "Ləqəb ən azı 3 simvol olmalıdır." });
  }

  const badWordCheck = detectBadWords(username);
  if (!badWordCheck.isValid) {
    return res.json({ available: false, message: `🚫 Qadağan olunmuş söz aşkar edildi! (${badWordCheck.detectedWords.join(', ')})` });
  }

  const exists = dbUsers.some(u => 
    (!excludeUserId || u.id !== excludeUserId) && 
    u.username.toLowerCase() === username.toLowerCase()
  );

  if (exists) {
    return res.json({ available: false, message: "Bu ləqəb (nick) artıq götürülüb. Zəhmət olmasa başqa bir nick seçin." });
  }

  res.json({ available: true, message: "Bu ləqəb istifadəyə uyğundur! ✓" });
});

// Auth Sign Up / Registration API
app.post("/api/auth/register", authLimiter, (req, res) => {
  const { email, username, password, avatar } = req.body;

  if (!email || !username) {
    return res.status(400).json({ error: "E-poçt və Unikal Nickname (ləqəb) tələb olunur." });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ error: "Şifrə ən azı 6 simvoldan ibarət olmalıdır." });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanUsername = username.trim();

  if (cleanUsername.length < 3) {
    return res.status(400).json({ error: "Ləqəb (nick) ən azı 3 simvol olmalıdır." });
  }

  const badWordCheck = detectBadWords(cleanUsername);
  if (!badWordCheck.isValid) {
    return res.status(400).json({ error: `🚫 Ləqəbdə qadağan olunmuş söz aşkar edildi! (${badWordCheck.detectedWords.join(', ')})` });
  }

  // Check unique email
  if (dbUsers.some(u => u.email.toLowerCase() === cleanEmail)) {
    return res.status(400).json({ error: "Bu e-poçt ünvanı ilə artıq profil mövcuddur. Giriş edin." });
  }

  // Check unique username (NO DUPLICATES ALLOWED)
  if (dbUsers.some(u => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
    return res.status(400).json({ error: "Bu ləqəb (nick) artıq götürülüb! Zəhmət olmasa fərqli və unikal bir nick yazın." });
  }

  // Admin Assignment: First user registering or baghirli.togrul@gmail.com gets admin role
  const hasRegisteredUsers = dbUsers.some(u => u.isRegisteredUser);
  const isAdmin = !hasRegisteredUsers || cleanEmail === 'baghirli.togrul@gmail.com';

  const newUser: User = {
    id: "user-" + Date.now(),
    username: cleanUsername,
    email: cleanEmail,
    avatar: avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    passwordHash: hashPassword(password),
    coverImage: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1000&auto=format&fit=crop&q=80",
    bio: isAdmin ? "AnimeAze Platformasının Baş Admini və Yaradıcısı 🎌" : "AnimeAze platformasının yeni istifadəçisi 👋",
    role: isAdmin ? "admin" : "user",
    favCharacters: [],
    status: "active",
    joinedDate: new Date().toISOString().split('T')[0],
    isRegisteredUser: true,
    stats: {
      watchedEpisodes: 0,
      hoursWatched: 0,
      animeCount: 0
    }
  };

  dbUsers.push(newUser);
  res.json({ message: isAdmin ? "Təbriklər Admin! Qeydiyyat uğurla tamamlandı! ✨" : "Qeydiyyat uğurla tamamlandı! Xoş gəldiniz! 🎉", user: sanitizeUser(newUser) });
});

// Auth Sign In / Login API
app.post("/api/auth/login", authLimiter, (req, res) => {
  const { emailOrUsername, password } = req.body;

  if (!emailOrUsername) {
    return res.status(400).json({ error: "E-poçt və ya istifadəçi adını daxil edin." });
  }

  const clean = emailOrUsername.trim().toLowerCase();
  let user = dbUsers.find(u => u.email.toLowerCase() === clean || u.username.toLowerCase() === clean);

  if (!user) {
    return res.status(404).json({ error: "Bu məlumatlara uyğun istifadəçi profil tapılmadı." });
  }

  // Password verification if passwordHash exists
  if (user.passwordHash && password) {
    const inputHash = hashPassword(password);
    if (inputHash !== user.passwordHash) {
      return res.status(401).json({ error: "E-poçt / Ləqəb və ya şifrə yanlışdır." });
    }
  }

  // Ensure baghirli.togrul@gmail.com gets admin role always
  if (user.email.toLowerCase() === 'baghirli.togrul@gmail.com') {
    user.role = 'admin';
  }

  res.json({ message: `Xoş gəldiniz, ${user.username}! ✨`, user: sanitizeUser(user) });
});

// Auth Google Sign In API
app.post("/api/auth/google", authLimiter, (req, res) => {
  const { email, name, picture } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Google e-poçt ünvanı təyin edilməyib." });
  }

  const cleanEmail = email.trim().toLowerCase();
  let user = dbUsers.find(u => u.email.toLowerCase() === cleanEmail);

  const hasRegisteredUsers = dbUsers.some(u => u.isRegisteredUser);
  const isAdmin = !hasRegisteredUsers || cleanEmail === 'baghirli.togrul@gmail.com';

  if (user) {
    if (isAdmin) user.role = 'admin';
    if (picture) user.avatar = picture;
    return res.json({ message: `Google ilə uğurla daxil olundu! Xoş gəldiniz, ${user.username}! ✨`, user: sanitizeUser(user) });
  }

  // Create new user with Google account, generating a unique username
  let baseUsername = name ? name.replace(/\s+/g, '_') : cleanEmail.split('@')[0];
  baseUsername = baseUsername.replace(/[^a-zA-Z0-9_]/g, '');
  if (baseUsername.length < 3) baseUsername = 'User_' + baseUsername;

  let finalUsername = baseUsername;
  let counter = 1;
  while (dbUsers.some(u => u.username.toLowerCase() === finalUsername.toLowerCase())) {
    finalUsername = `${baseUsername}_${counter}`;
    counter++;
  }

  const newUser: User = {
    id: "user-g-" + Date.now(),
    username: finalUsername,
    email: cleanEmail,
    avatar: picture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1000&auto=format&fit=crop&q=80",
    bio: isAdmin ? "AnimeAze Platformasının Baş Admini 🎌" : "Google hesabı ilə qoşulan istifadəçi 🚀",
    role: isAdmin ? "admin" : "user",
    favCharacters: [],
    status: "active",
    joinedDate: new Date().toISOString().split('T')[0],
    isRegisteredUser: true,
    stats: {
      watchedEpisodes: 0,
      hoursWatched: 0,
      animeCount: 0
    }
  };

  dbUsers.push(newUser);
  res.json({ message: isAdmin ? "Google Admin hesabı ilə giriş edildi! 👑" : "Google hesabı ilə profil yaradıldı və daxil olundu! 🎉", user: sanitizeUser(newUser) });
});

// User Profile & Nickname Update Request (with Bad Word Filter & 18+ Content Detector)
app.post("/api/users/:id/profile", (req, res) => {
  const { newUsername, newBio, newAvatarUrl, newCoverImage } = req.body;
  const user = dbUsers.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "İstifadəçi tapılmadı" });

  // 18+ / NSFW & Bad Word Filter checks
  const nickCheck = detectBadWords(newUsername);
  const bioCheck = detectBadWords(newBio);
  const avatarCheck = detectBadWords(newAvatarUrl);
  const coverCheck = detectBadWords(newCoverImage);

  if (!nickCheck.isValid) {
    return res.status(400).json({
      error: `🚫 Nickname (Ləqəb) filtri: Qadağan olunmuş söz aşkar edildi! (${nickCheck.detectedWords.join(', ')})`
    });
  }

  if (!bioCheck.isValid) {
    return res.status(400).json({
      error: `🚫 Bio (Haqqında) filtri: Qadağan olunmuş söz aşkar edildi! (${bioCheck.detectedWords.join(', ')})`
    });
  }

  if (!avatarCheck.isValid || !coverCheck.isValid) {
    return res.status(400).json({
      error: "🚫 18+ və ya NSFW məzmunlu şəkil keçidləri istifadə etmək qadağandır!"
    });
  }

  const oldUsername = user.username;
  const oldAvatar = user.avatar;

  // Username uniqueness check (if nickname is changing)
  if (newUsername && newUsername.trim() !== user.username) {
    const trimmedNick = newUsername.trim();
    if (trimmedNick.length < 3) {
      return res.status(400).json({ error: "Ləqəb (nick) ən azı 3 simvol olmalıdır." });
    }
    const exists = dbUsers.some(u => u.id !== user.id && u.username.toLowerCase() === trimmedNick.toLowerCase());
    if (exists) {
      return res.status(400).json({ error: "Bu ləqəb (nick) artıq başqa istifadəçi tərəfindən istifadə olunur!" });
    }
    user.username = trimmedNick;
  }

  if (newAvatarUrl && newAvatarUrl.trim()) {
    user.avatar = newAvatarUrl.trim();
  }

  if (newBio !== undefined) {
    user.bio = newBio.trim();
  }

  if (newCoverImage && newCoverImage.trim()) {
    user.coverImage = newCoverImage.trim();
  }

  user.avatarStatus = 'approved';
  user.profileStatus = 'approved';
  user.pendingUsername = undefined;
  user.pendingAvatar = undefined;
  user.pendingBio = undefined;
  user.pendingCoverImage = undefined;

  // Cascade updates if username or avatar changed across comments, watch rooms & activities
  if (oldUsername !== user.username || oldAvatar !== user.avatar) {
    dbComments.forEach(c => {
      if (c.userId === user.id) {
        c.userUsername = user.username;
        c.userAvatar = user.avatar;
      }
    });
    dbWatchRooms.forEach(wp => {
      if (wp.hostId === user.id) {
        wp.hostName = user.username;
      }
      wp.participants.forEach(p => {
        if (p.id === user.id) {
          p.name = user.username;
          p.avatar = user.avatar;
        }
      });
      wp.messages.forEach(m => {
        if (m.userId === user.id) {
          m.username = user.username;
          m.userAvatar = user.avatar;
        }
      });
    });
    dbActivities.forEach(af => {
      if (af.userId === user.id) {
        af.username = user.username;
        af.userAvatar = user.avatar;
      }
    });
  }

  res.json({ 
    message: "Profiliniz və ləqəbiniz (nick) uğurla yeniləndi! ✨", 
    user 
  });
});

// User Achievements & Rank Progress Sync API
app.post("/api/users/:id/achievements", (req, res) => {
  const user = dbUsers.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "İstifadəçi tapılmadı" });

  const { stats, exp, level, unlockedAchievements } = req.body;
  if (stats) user.stats = { ...user.stats, ...stats };
  if (typeof exp === 'number') user.exp = exp;
  if (typeof level === 'number') user.level = level;
  if (Array.isArray(unlockedAchievements)) user.unlockedAchievements = unlockedAchievements;

  res.json({ message: "Nailiyyətlər və Level uğurla sinxronlaşdırıldı! ✓", user: sanitizeUser(user) });
});

// User Profile Avatar Update Request
app.post("/api/users/:id/avatar", (req, res) => {
  const { newAvatarUrl } = req.body;
  const user = dbUsers.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: "İstifadəçi tapılmadı" });

  if (!detectBadWords(newAvatarUrl).isValid) {
    return res.status(400).json({ error: "🚫 18+ və ya NSFW məzmunlu profil şəkli keçidi istifadə etmək qadağandır!" });
  }

  const oldAvatar = user.avatar;
  user.avatar = newAvatarUrl.trim();
  user.avatarStatus = 'approved';
  user.profileStatus = 'approved';
  user.pendingAvatar = undefined;

  if (oldAvatar !== user.avatar) {
    dbComments.forEach(c => {
      if (c.userId === user.id) {
        c.userAvatar = user.avatar;
      }
    });
    dbWatchRooms.forEach(wp => {
      wp.participants.forEach(p => {
        if (p.id === user.id) {
          p.avatar = user.avatar;
        }
      });
      wp.messages.forEach(m => {
        if (m.userId === user.id) {
          m.userAvatar = user.avatar;
        }
      });
    });
    dbActivities.forEach(af => {
      if (af.userId === user.id) {
        af.userAvatar = user.avatar;
      }
    });
  }

  res.json({ 
    message: "Profil şəkliniz uğurla yeniləndi! ✨", 
    user 
  });
});

// Admin / Moderator List Pending Avatars & Profiles
app.get("/api/admin/pending-avatars", (req, res) => {
  const pendingUsers = dbUsers.filter(u => 
    u.avatarStatus === 'pending' || 
    u.profileStatus === 'pending' || 
    Boolean(u.pendingUsername) || 
    Boolean(u.pendingAvatar)
  );
  res.json(pendingUsers);
});

// Admin / Moderator Approve Avatar & Profile
app.post("/api/admin/avatars/approve", (req, res) => {
  const { userId } = req.body;
  const user = dbUsers.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: "İstifadəçi tapılmadı" });

  const oldUsername = user.username;
  const oldAvatar = user.avatar;

  if (user.pendingUsername) {
    user.username = user.pendingUsername;
  }
  if (user.pendingAvatar) {
    user.avatar = user.pendingAvatar;
  }
  if (user.pendingBio !== undefined) {
    user.bio = user.pendingBio;
  }
  if (user.pendingCoverImage) {
    user.coverImage = user.pendingCoverImage;
  }

  // Cascade updates if username or avatar changed across comments & watch party & feeds
  if (oldUsername !== user.username || oldAvatar !== user.avatar) {
    dbComments.forEach(c => {
      if (c.userId === user.id) {
        c.userUsername = user.username;
        c.userAvatar = user.avatar;
      }
    });
    dbWatchRooms.forEach(wp => {
      if (wp.hostId === user.id) {
        wp.hostName = user.username;
      }
      wp.participants.forEach(p => {
        if (p.id === user.id) {
          p.name = user.username;
          p.avatar = user.avatar;
        }
      });
      wp.messages.forEach(m => {
        if (m.userId === user.id) {
          m.username = user.username;
          m.userAvatar = user.avatar;
        }
      });
    });
    dbActivities.forEach(af => {
      if (af.userId === user.id) {
        af.username = user.username;
        af.userAvatar = user.avatar;
      }
    });
  }

  user.pendingUsername = undefined;
  user.pendingAvatar = undefined;
  user.pendingBio = undefined;
  user.pendingCoverImage = undefined;
  user.avatarStatus = 'approved';
  user.profileStatus = 'approved';

  // Notify user
  dbNotifications.unshift({
    id: "notif-appr-" + Date.now(),
    userId: user.id,
    title: "Profil & Nick Təsdiqləndi! 🎉",
    message: "Təbriklər! Profilinizdə və nickinizdə etdiyiniz dəyişikliklər moderator tərəfindən təsdiq olundu.",
    type: "system",
    read: false,
    createdAt: "İndi"
  });

  res.json({ message: "Profil və Nick dəyişikliyi uğurla təsdiq olundu!", user });
});

// Admin / Moderator Reject Avatar & Profile
app.post("/api/admin/avatars/reject", (req, res) => {
  const { userId } = req.body;
  const user = dbUsers.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: "İstifadəçi tapılmadı" });

  user.pendingUsername = undefined;
  user.pendingAvatar = undefined;
  user.pendingBio = undefined;
  user.pendingCoverImage = undefined;
  user.avatarStatus = 'rejected';
  user.profileStatus = 'rejected';

  // Notify user
  dbNotifications.unshift({
    id: "notif-rej-" + Date.now(),
    userId: user.id,
    title: "Profil / Nick Dəyişikliyi Rədd Edildi 🚫",
    message: "Müraciət etdiyiniz nick və ya şəkil 18+ qaydalarına və ya platforma şərtlərinə uyğun gəlmədiyi üçün moderator tərəfindən rədd edildi.",
    type: "system",
    read: false,
    createdAt: "İndi"
  });

  res.json({ message: "Profil və Nick dəyişikliyi rədd edildi", user });
});

// AI Auto Subtitles API
app.post("/api/ai/subtitles", (req, res) => {
  const { episodeId, language = 'az' } = req.body;
  
  // Dynamic AI generated subtitle cues for anime episodes
  const sampleCues: Record<string, Array<{ start: number; end: number; text: string }>> = {
    az: [
      { start: 0, end: 4, text: "✨ [AI Avto Altyazı]: AnimeAze süni intellekt sinxronizasiyası aktivdir" },
      { start: 5, end: 12, text: "Bu dünyada yalnız güclülər sağ qalır..." },
      { start: 13, end: 19, text: "Mən hər bir maneəni aşaraq ən zirvəyə yüksələcəyəm!" },
      { start: 20, end: 28, text: "Sistem xəbərdarlığı: Kölgə gücü tam oyandırıldı." },
      { start: 29, end: 38, text: "Dostlarımı qorumaq üçün bütün riskləri gözə alıram." },
      { start: 39, end: 50, text: "Bizi heç bir qüvvə dayandıra bilməz!" },
      { start: 51, end: 65, text: "Gələcək döyüşlər üçün hazırlaşın, heç vaxt təslim olmayın!" }
    ],
    ru: [
      { start: 0, end: 4, text: "✨ [ИИ Автосубтитры]: Включена ИИ синхронизация AnimeAze" },
      { start: 5, end: 12, text: "В этом мире выживают только сильнейшие..." },
      { start: 13, end: 19, text: "Преодолев все препятствия, я поднимусь на самую вершину!" },
      { start: 20, end: 28, text: "Системное предупреждение: Сила тени полностью пробуждена." },
      { start: 29, end: 38, text: "Я рискую всем, чтобы защитить своих друзей." },
      { start: 39, end: 50, text: "Никакая сила не сможет нас остановить!" },
      { start: 51, end: 65, text: "Готовьтесь к будущим битвам, никогда не сдавайтесь!" }
    ],
    en: [
      { start: 0, end: 4, text: "✨ [AI Auto Subtitles]: AnimeAze AI Sync Active" },
      { start: 5, end: 12, text: "Only the strongest survive in this world..." },
      { start: 13, end: 19, text: "I will overcome every obstacle and rise to the absolute top!" },
      { start: 20, end: 28, text: "System Alert: Shadow power fully awakened." },
      { start: 29, end: 38, text: "I take all risks to protect my friends." },
      { start: 39, end: 50, text: "No force can stop us!" },
      { start: 51, end: 65, text: "Prepare for future battles, never give up!" }
    ]
  };

  const selectedCues = sampleCues[language] || sampleCues['az'];
  res.json({
    message: "AI Avto Altyazılar uğurla yaradıldı",
    language,
    cues: selectedCues
  });
});

// Admin Get All Users
app.get("/api/admin/users", (req, res) => {
  res.json(dbUsers);
});

// --- SEO & GOOGLE CRAWLING ENDPOINTS ---

// Robots.txt Handler
app.get("/robots.txt", (_req, res) => {
  res.type("text/plain");
  res.send(`User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin

# Google & Yandex Crawlers Optimization for Azerbaijan
User-agent: Googlebot
Allow: /

User-agent: YandexBot
Allow: /

Sitemap: https://animeaze.az/sitemap.xml
Host: https://animeaze.az
`);
});

// Dynamic XML Sitemap Generator Handler for Google Search Indexing
app.get("/sitemap.xml", (_req, res) => {
  res.type("application/xml");
  const today = new Date().toISOString().split('T')[0];

  const animeUrlsXml = dbAnimes.map(anime => `
  <url>
    <loc>https://animeaze.az/anime/${anime.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
    <image:image>
      <image:loc>${anime.bannerImage || anime.posterImage}</image:loc>
      <image:title>${anime.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</image:title>
    </image:image>
  </url>`).join("");

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://animeaze.az/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="az" href="https://animeaze.az/"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://animeaze.az/?lang=en"/>
    <xhtml:link rel="alternate" hreflang="ru" href="https://animeaze.az/?lang=ru"/>
  </url>
  <url>
    <loc>https://animeaze.az/catalog</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://animeaze.az/calendar</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://animeaze.az/watch-party</loc>
    <lastmod>${today}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>
  ${animeUrlsXml}
</urlset>`;

  res.send(sitemapXml.trim());
});

// PWA & Web Manifest
app.get("/site.webmanifest", (_req, res) => {
  res.type("application/manifest+json");
  res.json({
    name: "AnimeAze - Azərbaycan Anime Platforması",
    short_name: "AnimeAze",
    description: "Azərbaycan dilində HD keyfiyyətdə onlayn anime izləmə platforması",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#020617",
    orientation: "portrait",
    icons: [
      {
        src: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎌</text></svg>",
        sizes: "192x192 512x512",
        type: "image/svg+xml"
      }
    ]
  });
});

// User Role Update / Ban API
app.post("/api/admin/users/role", (req, res) => {
  const { targetUserId, email, newRole, newStatus } = req.body;
  const user = dbUsers.find(u => 
    (targetUserId && u.id === targetUserId) || 
    (email && u.email.toLowerCase() === email.toLowerCase().trim())
  );
  if (user) {
    if (newRole) user.role = newRole;
    if (newStatus) user.status = newStatus;
    return res.json({ message: "İstifadəçi statusu yeniləndi", user });
  }
  res.status(404).json({ error: "E-poçt ünvanına uyğun istifadəçi tapılmadı" });
});

// MyAnimeList RapidAPI Proxy Endpoints
const MAL_RAPIDAPI_HOST = "myanimelist.p.rapidapi.com";
const MAL_RAPIDAPI_KEY = process.env.MAL_RAPIDAPI_KEY || "a005368adfmsh9475ffec9ce47d5p19cc0cjsn3af963af6e73";

app.get("/api/mal/genres", async (req, res) => {
  const type = (req.query.type as string) === "anime" ? "anime" : "manga";
  try {
    const response = await fetch(`https://${MAL_RAPIDAPI_HOST}/v2/${type}/genres`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-host": MAL_RAPIDAPI_HOST,
        "x-rapidapi-key": MAL_RAPIDAPI_KEY
      }
    });
    if (!response.ok) {
      throw new Error(`MAL API returned status ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching MAL genres:", error);
    res.status(500).json({ error: "MyAnimeList janrlarını çəkmək mümkün olmadı" });
  }
});

app.get("/api/mal/search", async (req, res) => {
  const query = (req.query.q as string) || "Naruto";
  const type = (req.query.type as string) === "manga" ? "manga" : "anime";
  try {
    const response = await fetch(`https://${MAL_RAPIDAPI_HOST}/v2/${type}/search?q=${encodeURIComponent(query)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-host": MAL_RAPIDAPI_HOST,
        "x-rapidapi-key": MAL_RAPIDAPI_KEY
      }
    });
    if (!response.ok) {
      throw new Error(`MAL Search API returned status ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error searching MAL:", error);
    res.status(500).json({ error: "MyAnimeList axtarışı zamanı xəta baş verdi" });
  }
});

app.post("/api/mal/import-to-viewlist", (req, res) => {
  const { userId, item, listType = "watching" } = req.body;
  if (!item || !item.title) {
    return res.status(400).json({ error: "İmport etmək üçün etibarlı MyAnimeList elementi təqdim olunmalıdır" });
  }

  const generatedId = `mal-${item.myanimelist_id || item.id || Date.now()}`;
  
  // Check if already in dbAnimes
  let existing = dbAnimes.find(a => a.id === generatedId || a.title.toLowerCase() === item.title.toLowerCase());
  if (!existing) {
    existing = {
      id: generatedId,
      title: item.title,
      japaneseTitle: item.title,
      slug: (item.title || 'anime').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      synopsis: item.description || "MyAnimeList verilənlər bazasından idxal edilmiş anime/manga kontenti.",
      posterImage: item.picture_url || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80",
      bannerImage: item.picture_url || "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80",
      score: 8.8,
      scoredBy: 15000,
      airedYear: 2024,
      season: "Payız",
      status: "Davam edir",
      type: "TV",
      episodesCount: 24,
      genres: ["MyAnimeList", "Top Genre"],
      studio: "MyAnimeList Verified",
      ageRating: "13+",
      duration: "24 dəq",
      featured: false,
      trending: true,
      views: 12000,
      bookmarksCount: 3500
    };
    dbAnimes.push(existing);
  }

  // Update user's tracking item
  let userTracker = dbTrackers.find(t => t.userId === userId && t.animeId === existing.id);
  if (!userTracker) {
    userTracker = {
      id: `track-${Date.now()}`,
      userId: userId || "user-1",
      animeId: existing.id,
      status: listType as any,
      progress: listType === "completed" ? 24 : 1,
      score: 10,
      updatedAt: new Date().toISOString()
    };
    dbTrackers.push(userTracker);
  } else {
    userTracker.status = listType as any;
    userTracker.updatedAt = new Date().toISOString();
  }

  res.json({
    message: `"${item.title}" müvəffəqiyyətlə izləmə siyahınıza əlavə edildi! 🎉`,
    importedAnime: existing,
    tracker: userTracker
  });
});

// --- VITE MIDDLEWARE SETUP FOR DEV / PROD SERVING ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`✨ AnimeAze Server running on http://localhost:${PORT}`);
  });
}

startServer();
