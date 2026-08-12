export type UserRole = 'admin' | 'moderator' | 'user' | 'premium';
export type TrackStatus = 'watching' | 'completed' | 'plan_to_watch' | 'dropped' | 'on_hold';

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  pendingAvatar?: string;
  pendingUsername?: string;
  pendingBio?: string;
  pendingCoverImage?: string;
  avatarStatus?: 'approved' | 'pending' | 'rejected';
  profileStatus?: 'approved' | 'pending' | 'rejected';
  coverImage?: string;
  bio?: string;
  role: UserRole;
  favCharacters: string[]; // character IDs
  status: 'active' | 'banned' | 'muted';
  joinedDate: string;
  stats: {
    watchedEpisodes: number;
    hoursWatched: number;
    animeCount: number;
  };
}

export interface SubtitleTrack {
  lang: string;
  label: string;
  url: string;
}

export interface AudioTrack {
  lang: string;
  label: string;
}

export interface Episode {
  id: string;
  animeId: string;
  episodeNumber: number;
  title: string;
  thumbnail: string;
  duration: string; // e.g. "24:00"
  videoUrl: string; // Direct video or embed URL
  subtitles: SubtitleTrack[];
  audioTracks: AudioTrack[];
  introStart?: number; // in seconds
  introEnd?: number;
  outroStart?: number;
  outroEnd?: number;
}

export interface Anime {
  id: string;
  title: string;
  japaneseTitle: string;
  slug: string;
  synopsis: string;
  posterImage: string;
  bannerImage: string;
  score: number;
  scoredBy: number;
  type: 'TV' | 'Film' | 'OVA' | 'OONA';
  episodesCount: number;
  status: 'Davam edir' | 'Bitdi' | 'Tezliklə';
  airedYear: number;
  season: 'Yaz' | 'Yay' | 'Payız' | 'Qış';
  genres: string[];
  studio: string;
  ageRating: string;
  duration: string;
  trailerUrl?: string;
  featured?: boolean;
  trending?: boolean;
  views: number;
  bookmarksCount: number;
}

export interface Character {
  id: string;
  name: string;
  japaneseName: string;
  role: 'Main' | 'Supporting';
  image: string;
  description: string;
  seiyuu: {
    name: string;
    image: string;
    language: string;
  };
  animeIds: string[];
}

export interface Studio {
  id: string;
  name: string;
  logo: string;
  description: string;
  establishedYear: number;
  animeCount: number;
}

export interface AnimeTrackItem {
  id: string;
  userId: string;
  animeId: string;
  status: TrackStatus;
  progress: number;
  score: number; // 1-10
  notes?: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  animeId: string;
  episodeId?: string;
  userId: string;
  userUsername: string;
  userAvatar: string;
  userRole?: UserRole;
  content: string;
  isSpoiler: boolean;
  rating?: number; // 1-10
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  parentId?: string;
  createdAt: string;
}

export interface ActivityFeed {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  type: 'watched_episode' | 'added_list' | 'reviewed';
  animeTitle: string;
  animePoster: string;
  details: string;
  timestamp: string;
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  friendUsername: string;
  friendAvatar: string;
  status: 'pending' | 'accepted';
  lastSeen?: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  text: string;
  timestamp: string;
}

export interface WatchPartyRoom {
  id: string;
  name: string;
  animeId: string;
  episodeId: string;
  hostId: string;
  hostName: string;
  isPrivate: boolean;
  passcode?: string;
  participants: {
    id: string;
    name: string;
    avatar: string;
  }[];
  currentTime: number;
  isPlaying: boolean;
  messages: ChatMessage[];
}

export interface SystemNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'new_episode' | 'reply' | 'friend_req' | 'system';
  read: boolean;
  createdAt: string;
  targetType?: 'anime' | 'watchparty' | 'profile' | 'wiki' | 'calendar' | 'catalog';
  targetId?: string;
}

export interface SystemAnalytics {
  dailyActiveUsers: number;
  totalViews: number;
  topAnimes: { id: string; title: string; views: number }[];
  playerErrors: { time: string; msg: string; anime: string }[];
  userDistribution: { role: UserRole; count: number }[];
}

export interface AnimeScheduleItem {
  id: string;
  animeId: string;
  animeTitle: string;
  japaneseTitle?: string;
  posterImage: string;
  bannerImage?: string;
  episodeNumber: number;
  airDate: string; // e.g. "2026-08-11"
  airTime: string; // e.g. "19:30"
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  dayNameAz: string; // e.g. "Çərşənbə"
  status: 'aired' | 'today' | 'upcoming';
  timeRemaining?: string; // e.g. "3 saat sonra"
  studio: string;
  genres: string[];
}

