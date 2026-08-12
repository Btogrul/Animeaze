import { User } from '../types';
import { ANIME_ACHIEVEMENTS, calculateAnimeRankAndLevel, Achievement } from './achievements';

export interface AchievementCheckResult {
  updatedUser: User;
  newlyUnlocked: Achievement[];
}

export function evaluateUserAchievements(
  user: User,
  actionType: 'watch_episode' | 'post_comment' | 'rate_anime' | 'watch_party' | 'bookmark' | 'add_time' | 'wiki',
  value: number = 1
): AchievementCheckResult {
  // Clone stats and achievements
  const stats = {
    watchedEpisodes: user.stats?.watchedEpisodes || 0,
    hoursWatched: user.stats?.hoursWatched || 0,
    animeCount: user.stats?.animeCount || 0,
    commentsCount: user.stats?.commentsCount || 0,
    ratingsCount: user.stats?.ratingsCount || 0,
    minutesSpent: user.stats?.minutesSpent || 0,
    watchPartyCount: user.stats?.watchPartyCount || 0,
    bookmarksCount: user.stats?.bookmarksCount || 0,
  };

  const currentUnlocked = [...(user.unlockedAchievements || [])];
  const newlyUnlocked: Achievement[] = [];

  // Update stats according to action
  if (actionType === 'watch_episode') {
    stats.watchedEpisodes += value;
    stats.hoursWatched = parseFloat((stats.watchedEpisodes * 0.4).toFixed(1));
  } else if (actionType === 'post_comment') {
    stats.commentsCount += value;
  } else if (actionType === 'rate_anime') {
    stats.ratingsCount += value;
  } else if (actionType === 'watch_party') {
    stats.watchPartyCount += value;
  } else if (actionType === 'bookmark') {
    stats.bookmarksCount += value;
  } else if (actionType === 'add_time') {
    stats.minutesSpent += value; // in minutes
  }

  // Calculate user level & rank
  let exp = user.exp || 0;

  // Check night owl time
  const currentHour = new Date().getHours();
  const isNightHour = currentHour >= 0 && currentHour < 5;

  // Loop through all defined achievements
  ANIME_ACHIEVEMENTS.forEach(ach => {
    if (currentUnlocked.includes(ach.id)) return; // Already unlocked

    let isMet = false;

    if (ach.category === 'watch' && stats.watchedEpisodes >= ach.targetValue) {
      isMet = true;
    } else if (ach.category === 'comment' && stats.commentsCount >= ach.targetValue) {
      isMet = true;
    } else if (ach.category === 'rating' && stats.ratingsCount >= ach.targetValue) {
      isMet = true;
    } else if (ach.category === 'time' && stats.minutesSpent >= ach.targetValue) {
      isMet = true;
    } else if (ach.category === 'social' && stats.watchPartyCount >= ach.targetValue) {
      isMet = true;
    } else if (ach.id === 'ach_bookmark_5' && stats.bookmarksCount >= ach.targetValue) {
      isMet = true;
    } else if (ach.id === 'ach_night_owl' && actionType === 'watch_episode' && isNightHour) {
      isMet = true;
    } else if (ach.id === 'ach_wiki_explorer' && actionType === 'wiki') {
      isMet = true;
    }

    if (isMet) {
      currentUnlocked.push(ach.id);
      newlyUnlocked.push(ach);
      exp += ach.expReward;
    }
  });

  // Calculate level with updated exp
  const rankInfo = calculateAnimeRankAndLevel(exp);

  // Check level-based achievements
  ANIME_ACHIEVEMENTS.forEach(ach => {
    if (currentUnlocked.includes(ach.id)) return;

    let isLevelMet = false;
    if (ach.id === 'ach_level_5' && rankInfo.level >= 5) {
      isLevelMet = true;
    } else if (ach.id === 'ach_level_10' && rankInfo.level >= 10) {
      isLevelMet = true;
    }

    if (isLevelMet) {
      currentUnlocked.push(ach.id);
      newlyUnlocked.push(ach);
      exp += ach.expReward;
    }
  });

  const finalRankInfo = calculateAnimeRankAndLevel(exp);

  const updatedUser: User = {
    ...user,
    stats,
    exp,
    level: finalRankInfo.level,
    unlockedAchievements: currentUnlocked
  };

  return {
    updatedUser,
    newlyUnlocked
  };
}
