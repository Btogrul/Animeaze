export type Language = 'az' | 'ru' | 'en';

export interface Translations {
  home: string;
  catalog: string;
  calendar: string;
  watchparty: string;
  wiki: string;
  profile: string;
  adminPanel: string;
  searchPlaceholder: string;
  notifications: string;
  markAllRead: string;
  noNotifications: string;
  aiAutoSubtitles: string;
  aiSubtitlesActive: string;
  selectLanguage: string;
  avatarPendingNotice: string;
  avatarApprovedNotice: string;
  avatarRejectedNotice: string;
  moderatorApprovals: string;
  approve: string;
  reject: string;
  manageModerators: string;
  assignModerator: string;
  removeModerator: string;
  userEmail: string;
  role: string;
  actions: string;
  welcome: string;
  featured: string;
  trending: string;
  latestEpisodes: string;
}

export const translations: Record<Language, Translations> = {
  az: {
    home: 'Əsas Səhifə',
    catalog: 'Kataloq',
    calendar: 'Yayın Təqvimi',
    watchparty: 'Watch Party',
    wiki: 'Anime Wiki',
    profile: 'Profilim',
    adminPanel: 'Admin Paneli',
    searchPlaceholder: 'Anime, personaj və ya studiya axtar...',
    notifications: 'Bildirişlər',
    markAllRead: 'Hamısını Oxu',
    noNotifications: 'Yeni bildiriş yoxdur.',
    aiAutoSubtitles: 'AI Avto Altyazı Generatoru',
    aiSubtitlesActive: '✨ AI Altyazı (Canlı Sinxronlaşdırılır)',
    selectLanguage: 'Dil Seçimi',
    avatarPendingNotice: 'Profil şəkliniz moderator təsdiqini gözləyir. Təsdiqlənənə qədər 👤 göstərilir.',
    avatarApprovedNotice: 'Profil şəkliniz təsdiqləndi!',
    avatarRejectedNotice: 'Profil şəkliniz rədd edildi.',
    moderatorApprovals: 'Profil Şəkilləri Təsdiqi',
    approve: 'Təsdiqlə',
    reject: 'Rədd et',
    manageModerators: 'Moderatorların Təyini',
    assignModerator: 'Moderator Et',
    removeModerator: 'İstifadəçi Et',
    userEmail: 'İstifadəçi E-poçtu',
    role: 'Rolu',
    actions: 'Əməliyyatlar',
    welcome: 'AnimeAze-yə Xoş Gelmisiniz',
    featured: 'Xüsusi Seçilmişlər',
    trending: 'Ən Çox İzlənilənlər',
    latestEpisodes: 'Son Əlavə Olunan Epizodlar'
  },
  ru: {
    home: 'Главная',
    catalog: 'Каталог',
    calendar: 'Календарь Релизов',
    watchparty: 'Совместный Просмотр',
    wiki: 'Аниме Вики',
    profile: 'Мой Профиль',
    adminPanel: 'Панель Админа',
    searchPlaceholder: 'Поиск аниме, персонажей или студий...',
    notifications: 'Уведомления',
    markAllRead: 'Прочитать все',
    noNotifications: 'Нет новых уведомлений.',
    aiAutoSubtitles: 'ИИ Генератор Автосубтитров',
    aiSubtitlesActive: '✨ ИИ Субтитры (Живая Синхронизация)',
    selectLanguage: 'Выбор Языка',
    avatarPendingNotice: 'Ваша аватарка на модерации. До одобрения отображается 👤.',
    avatarApprovedNotice: 'Ваше фото профиля было одобрено!',
    avatarRejectedNotice: 'Ваше фото профиля было отклонено.',
    moderatorApprovals: 'Одобрение Аватарок',
    approve: 'Одобрить',
    reject: 'Отклонить',
    manageModerators: 'Управление Модераторами',
    assignModerator: 'Сделать Модератором',
    removeModerator: 'Сделать Пользователем',
    userEmail: 'Email Пользователя',
    role: 'Роль',
    actions: 'Действия',
    welcome: 'Добро пожаловать в AnimeAze',
    featured: 'Рекомендуемое',
    trending: 'В Тренде',
    latestEpisodes: 'Последние Эпизоды'
  },
  en: {
    home: 'Home',
    catalog: 'Catalog',
    calendar: 'Release Schedule',
    watchparty: 'Watch Party',
    wiki: 'Anime Wiki',
    profile: 'My Profile',
    adminPanel: 'Admin Panel',
    searchPlaceholder: 'Search anime, character or studio...',
    notifications: 'Notifications',
    markAllRead: 'Mark All Read',
    noNotifications: 'No new notifications.',
    aiAutoSubtitles: 'AI Auto Subtitles Generator',
    aiSubtitlesActive: '✨ AI Subtitles (Live Syncing)',
    selectLanguage: 'Select Language',
    avatarPendingNotice: 'Your profile picture is pending moderator approval. Default 👤 is displayed until approved.',
    avatarApprovedNotice: 'Your profile picture has been approved!',
    avatarRejectedNotice: 'Your profile picture was rejected.',
    moderatorApprovals: 'Profile Picture Approvals',
    approve: 'Approve',
    reject: 'Reject',
    manageModerators: 'Moderator Management',
    assignModerator: 'Promote to Moderator',
    removeModerator: 'Demote to User',
    userEmail: 'User Email',
    role: 'Role',
    actions: 'Actions',
    welcome: 'Welcome to AnimeAze',
    featured: 'Featured Anime',
    trending: 'Trending Now',
    latestEpisodes: 'Latest Episodes'
  }
};
