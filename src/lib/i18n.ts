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

  // Auth & Account
  signIn: string;
  signUp: string;
  signOut: string;
  emailAddress: string;
  usernameLabel: string;
  passwordLabel: string;
  confirmPasswordLabel: string;
  passwordsDoNotMatch: string;
  passwordsMatch: string;
  minPasswordLength: string;
  signInWithGoogle: string;
  guestMode: string;

  // Catalog & Navigation
  viewWatch: string;
  trendingAnime: string;
  weeklySchedule: string;
  viewAll: string;
  liveFeed: string;
  filterByGenre: string;
  allGenres: string;
  resetFilters: string;
  searchAnime: string;
  highestScore: string;
  mostViews: string;
  newReleases: string;
  ongoing: string;
  completed: string;

  // Watch Party
  createRoom: string;
  activePartyRooms: string;
  join: string;
  typeMessage: string;
  copyLink: string;

  // Profile & Settings
  watchStatistics: string;
  editProfile: string;
  saveChanges: string;
  privacySecurity: string;
  clearLocalData: string;
  footerRights: string;
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
    latestEpisodes: 'Son Əlavə Olunan Epizodlar',

    signIn: 'Daxil Ol',
    signUp: 'Qeydiyyatdan Keç',
    signOut: 'Çıxış Et',
    emailAddress: 'E-poçt Ünvanı',
    usernameLabel: 'Unikal Nickname (Ləqəb)',
    passwordLabel: 'Şifrə',
    confirmPasswordLabel: 'Şifrənin Təkrarı',
    passwordsDoNotMatch: '⚠️ Şifrələr eyni deyil! Zəhmət olmasa təkrar yoxlayın.',
    passwordsMatch: '✓ Şifrələr eynidir',
    minPasswordLength: 'Şifrə ən azı 6 simvol olmalıdır.',
    signInWithGoogle: 'Google ilə Daxil Ol',
    guestMode: 'Siz Qonaq Rejimindəsiniz',

    viewWatch: 'Bax / İzlə',
    trendingAnime: 'Trenddə Olan Animələr',
    weeklySchedule: 'Həftəlik Yayın Təqvimi',
    viewAll: 'Hamısına Bax',
    liveFeed: 'Canlı Şəbəkə Və Aktivlik Lenti',
    filterByGenre: 'Janrlara Görə Filtr',
    allGenres: 'Bütün Janrlar',
    resetFilters: 'Filtrləri Sıfırla',
    searchAnime: 'Kataloqda anime axtar...',
    highestScore: 'Ən Yüksək Reytinq',
    mostViews: 'Ən Çox İzlənilənlər',
    newReleases: 'Ən Yenilər',
    ongoing: 'Davam edir',
    completed: 'Tamamlandı',

    createRoom: 'Canlı İzleme Otağı Yarat',
    activePartyRooms: 'Aktiv Otaqlar',
    join: 'Qoşul',
    typeMessage: 'Canlı mesaj yazın...',
    copyLink: 'Otaq Linkini Kopyala',

    watchStatistics: 'İzləmə Statistikaları',
    editProfile: 'Profili Redaktə Et',
    saveChanges: 'Dəyişiklikləri Yadda Saxla',
    privacySecurity: 'Məxfilik və Təhlükəsizlik',
    clearLocalData: 'Lokal Məlumatları Təmizlə',
    footerRights: 'AnimeAze Azərbaycan - Bütün hüquqlar qorunur.'
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
    latestEpisodes: 'Последние Эпизоды',

    signIn: 'Войти',
    signUp: 'Зарегистрироваться',
    signOut: 'Выйти',
    emailAddress: 'Email Адрес',
    usernameLabel: 'Уникальный Никнейм',
    passwordLabel: 'Пароль',
    confirmPasswordLabel: 'Подтверждение Пароля',
    passwordsDoNotMatch: '⚠️ Пароли не совпадают! Пожалуйста, проверьте снова.',
    passwordsMatch: '✓ Пароли совпадают',
    minPasswordLength: 'Пароль должен содержать минимум 6 символов.',
    signInWithGoogle: 'Войти через Google',
    guestMode: 'Вы в Гостевом Режиме',

    viewWatch: 'Смотреть',
    trendingAnime: 'Трендовые Аниме',
    weeklySchedule: 'Еженедельный Календарь',
    viewAll: 'Посмотреть все',
    liveFeed: 'Лента Активности',
    filterByGenre: 'Фильтр по Жанрам',
    allGenres: 'Все Жанры',
    resetFilters: 'Сбросить Фильтры',
    searchAnime: 'Поиск аниме в каталоге...',
    highestScore: 'Самый Высокий Рейтинг',
    mostViews: 'Самые Популярные',
    newReleases: 'Новинки',
    ongoing: 'Онгоинг',
    completed: 'Завершен',

    createRoom: 'Создать Комнату',
    activePartyRooms: 'Активные Комнаты',
    join: 'Войти',
    typeMessage: 'Напишите сообщение...',
    copyLink: 'Скопировать Ссылку',

    watchStatistics: 'Статистика Просмотров',
    editProfile: 'Редактировать Профиль',
    saveChanges: 'Сохранить Изменения',
    privacySecurity: 'Конфиденциальность и Безопасность',
    clearLocalData: 'Очистить Локальные Данные',
    footerRights: 'AnimeAze Азербайджан - Все права защищены.'
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
    latestEpisodes: 'Latest Episodes',

    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Log Out',
    emailAddress: 'Email Address',
    usernameLabel: 'Unique Username',
    passwordLabel: 'Password',
    confirmPasswordLabel: 'Confirm Password',
    passwordsDoNotMatch: '⚠️ Passwords do not match! Please check again.',
    passwordsMatch: '✓ Passwords match',
    minPasswordLength: 'Password must be at least 6 characters.',
    signInWithGoogle: 'Sign in with Google',
    guestMode: 'You are in Guest Mode',

    viewWatch: 'Watch Now',
    trendingAnime: 'Trending Anime',
    weeklySchedule: 'Weekly Release Schedule',
    viewAll: 'View All',
    liveFeed: 'Live Activity Feed',
    filterByGenre: 'Filter by Genre',
    allGenres: 'All Genres',
    resetFilters: 'Reset Filters',
    searchAnime: 'Search anime in catalog...',
    highestScore: 'Highest Rated',
    mostViews: 'Most Watched',
    newReleases: 'Newest Releases',
    ongoing: 'Ongoing',
    completed: 'Completed',

    createRoom: 'Create Watch Party',
    activePartyRooms: 'Active Rooms',
    join: 'Join',
    typeMessage: 'Type a live message...',
    copyLink: 'Copy Room Link',

    watchStatistics: 'Watch Statistics',
    editProfile: 'Edit Profile',
    saveChanges: 'Save Changes',
    privacySecurity: 'Privacy & Security',
    clearLocalData: 'Clear Local Data',
    footerRights: 'AnimeAze Azerbaijan - All rights reserved.'
  }
};

