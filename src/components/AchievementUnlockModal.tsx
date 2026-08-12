import React, { useEffect } from 'react';
import { Achievement, calculateAnimeRankAndLevel } from '../lib/achievements';
import { Sparkles, Trophy, Zap, Award, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AchievementUnlockModalProps {
  achievement: Achievement | null;
  onClose: () => void;
  userExp?: number;
}

export const AchievementUnlockModal: React.FC<AchievementUnlockModalProps> = ({
  achievement,
  onClose,
  userExp = 0
}) => {
  useEffect(() => {
    if (achievement) {
      // Play a pleasant victory web audio chime
      try {
        const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.35);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + idx * 0.12);
            osc.stop(ctx.currentTime + idx * 0.12 + 0.35);
          });
        }
      } catch (e) {
        console.log('Audio chime auto-play skipped', e);
      }
    }
  }, [achievement]);

  if (!achievement) return null;

  const rankInfo = calculateAnimeRankAndLevel(userExp);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="relative w-full max-w-md rounded-3xl glass-card border border-amber-500/50 p-6 sm:p-8 text-center shadow-2xl overflow-hidden gold-glow"
        >
          {/* Glowing Ambient Background Particle Lights */}
          <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-amber-500/20 blur-3xl animate-pulse" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-yellow-500/20 blur-3xl animate-pulse" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top Anime Header Ribbon */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider mb-5">
            <Trophy className="w-4 h-4 text-amber-400 animate-bounce" />
            Yeni Anime Nailiyyəti Qazanıldı!
          </div>

          {/* Main Badge Graphic */}
          <div className="relative mx-auto w-24 h-24 mb-5 flex items-center justify-center">
            <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${achievement.badgeColor} opacity-30 blur-xl animate-pulse`} />
            <div className={`relative w-24 h-24 rounded-3xl bg-gradient-to-br ${achievement.badgeColor} border-2 border-white/30 flex items-center justify-center text-4xl shadow-xl transform hover:scale-105 transition-transform`}>
              {achievement.badgeEmoji}
            </div>
            <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-md">
              <CheckCircle2 className="w-5 h-5 text-slate-950 fill-amber-400" />
            </div>
          </div>

          {/* Title & Anime Reference */}
          <div className="space-y-1 mb-3">
            <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest">
              {achievement.animeTitleRef}
            </span>
            <h3 className="text-2xl font-black text-white leading-tight">
              {achievement.title}
            </h3>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-300 mb-6 leading-relaxed bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
            {achievement.description}
          </p>

          {/* Rewards Breakdown */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <div className="text-left">
                <p className="text-[10px] text-amber-300 font-bold uppercase">Xallar (EXP)</p>
                <p className="text-base font-black text-amber-400">+{achievement.expReward} EXP</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              <div className="text-left">
                <p className="text-[10px] text-purple-300 font-bold uppercase">Cari Titul</p>
                <p className="text-xs font-black text-purple-300 truncate max-w-[100px]">{rankInfo.rankBadge} Lv.{rankInfo.level}</p>
              </div>
            </div>
          </div>

          {/* Claim Action Button */}
          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-slate-950 font-black text-base gold-glow hover:brightness-110 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xl"
          >
            <Sparkles className="w-5 h-5" />
            Təşəkkürlər, Senpai! ✨
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
