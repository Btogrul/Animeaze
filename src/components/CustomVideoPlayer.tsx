import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, FastForward, 
  SkipForward, Settings, Keyboard, Tv, Sparkles, Languages, Check, RefreshCw
} from 'lucide-react';
import { Episode, SubtitleTrack, AudioTrack } from '../types';

interface CustomVideoPlayerProps {
  episode: Episode;
  animeTitle: string;
  onNextEpisode?: () => void;
  hasNextEpisode?: boolean;
  autoPlayNext?: boolean;
  onToggleAutoPlay?: () => void;
}

export const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({
  episode,
  animeTitle,
  onNextEpisode,
  hasNextEpisode = false,
  autoPlayNext = true,
  onToggleAutoPlay
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [selectedSub, setSelectedSub] = useState<string>('az');
  const [selectedAudio, setSelectedAudio] = useState<string>('ja');

  // AI Auto Subtitles State
  const [isAiSubtitlesActive, setIsAiSubtitlesActive] = useState(false);
  const [aiSubCues, setAiSubCues] = useState<Array<{ start: number; end: number; text: string }>>([]);
  const [loadingAiSubs, setLoadingAiSubs] = useState(false);

  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch AI Subtitles when activated or language changes
  useEffect(() => {
    if (isAiSubtitlesActive) {
      fetchAiSubtitles();
    }
  }, [isAiSubtitlesActive, selectedSub, episode.id]);

  const fetchAiSubtitles = async () => {
    setLoadingAiSubs(true);
    try {
      const res = await fetch('/api/ai/subtitles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episodeId: episode.id, language: selectedSub })
      });
      if (res.ok) {
        const data = await res.json();
        setAiSubCues(data.cues);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAiSubs(false);
    }
  };

  // Find active AI subtitle cue for current playback time
  const currentAiCue = isAiSubtitlesActive 
    ? aiSubCues.find(cue => currentTime >= cue.start && currentTime <= cue.end)
    : null;

  // Intro / Outro thresholds
  const introStart = episode.introStart || 10;
  const introEnd = episode.introEnd || 95;
  const showSkipIntro = currentTime >= introStart && currentTime <= introEnd;

  const outroStart = episode.outroStart || 1320;
  const outroEnd = episode.outroEnd || 1410;
  const showSkipOutro = currentTime >= outroStart && currentTime <= outroEnd;

  // Toggle Play / Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(() => {});
    }
  };

  // Skip Intro / Outro
  const handleSkipIntro = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = introEnd;
    }
  };

  const handleSkipOutro = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = outroEnd;
    }
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Time formatting (mm:ss)
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Mouse inactivity auto-hide controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3500);
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          setIsMuted(prev => !prev);
          break;
        case 'arrowright':
          e.preventDefault();
          if (videoRef.current) videoRef.current.currentTime += 5;
          break;
        case 'arrowleft':
          e.preventDefault();
          if (videoRef.current) videoRef.current.currentTime -= 5;
          break;
        case 's':
          if (showSkipIntro) handleSkipIntro();
          if (showSkipOutro) handleSkipOutro();
          break;
        case 'n':
          if (hasNextEpisode && onNextEpisode) onNextEpisode();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, showSkipIntro, showSkipOutro, hasNextEpisode]);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full aspect-video rounded-3xl overflow-hidden bg-slate-950 border border-amber-500/30 shadow-2xl group select-none"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={episode.videoUrl}
        poster={episode.thumbnail}
        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          if (autoPlayNext && hasNextEpisode && onNextEpisode) {
            onNextEpisode();
          }
        }}
        muted={isMuted}
        className="w-full h-full object-cover cursor-pointer"
        onClick={togglePlay}
      />

      {/* Ambient Glow behind player */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40 pointer-events-none" />

      {/* Top Branding Overlay */}
      <div className={`absolute top-0 inset-x-0 p-4 sm:p-6 flex items-center justify-between z-20 transition-opacity duration-300 ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="flex items-center space-x-3 bg-slate-950/70 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-amber-500/20">
          <Tv className="w-4 h-4 text-amber-400" />
          <div>
            <span className="text-xs font-bold text-amber-300 block">{animeTitle}</span>
            <span className="text-[10px] text-slate-300 font-medium">{episode.episodeNumber}-ci Seriya: {episode.title}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* AI Auto Subtitles Toggle Button */}
          <button
            onClick={() => setIsAiSubtitlesActive(!isAiSubtitlesActive)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer border shadow-lg ${
              isAiSubtitlesActive
                ? 'bg-amber-500 text-slate-950 border-amber-400 gold-glow animate-pulse'
                : 'bg-slate-900/80 text-amber-400 border-amber-500/30 hover:bg-slate-800'
            }`}
            title="Süni İntellekt Avto Altyazı Generatoru"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAiSubtitlesActive ? 'AI Altyazı [Aktiv]' : 'AI Avto Altyazı'}</span>
          </button>

          {/* Custom Player Logo Badge */}
          <span className="px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black text-[10px] rounded-xl gold-glow tracking-wider uppercase">
            AnimeAze HD
          </span>

          <button
            onClick={() => setShowKeyboardHelp(true)}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-amber-400 border border-amber-500/20 text-xs font-semibold backdrop-blur-md transition-all cursor-pointer"
            title="Klaviatura Qısayolları"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AI Subtitles On-Screen Caption Overlay */}
      {isAiSubtitlesActive && (
        <div className="absolute bottom-20 inset-x-0 z-30 flex flex-col items-center justify-center px-6 pointer-events-none transition-all">
          <div className="max-w-2xl text-center bg-slate-950/85 border border-amber-500/40 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-2xl space-y-1">
            <div className="flex items-center justify-center space-x-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-widest">
              <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
              <span>✨ AI Avto Altyazı ({selectedSub.toUpperCase()})</span>
            </div>
            <p className="text-sm sm:text-base font-extrabold text-white drop-shadow-md leading-snug">
              {currentAiCue ? currentAiCue.text : "..."}
            </p>
          </div>
        </div>
      )}

      {/* Skip Intro / Outro Overlay Buttons */}
      <div className="absolute bottom-20 left-6 z-30 flex items-center space-x-2">
        {showSkipIntro && (
          <button
            onClick={handleSkipIntro}
            className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs gold-glow shadow-2xl animate-bounce hover:scale-105 transition-transform cursor-pointer"
          >
            <FastForward className="w-4 h-4 fill-slate-950" />
            <span>Girişi Keç [85s]</span>
          </button>
        )}

        {showSkipOutro && (
          <button
            onClick={handleSkipOutro}
            className="flex items-center space-x-2 px-4 py-2 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs gold-glow shadow-2xl animate-bounce hover:scale-105 transition-transform cursor-pointer"
          >
            <FastForward className="w-4 h-4 fill-slate-950" />
            <span>Outro-nu Keç</span>
          </button>
        )}
      </div>

      {/* Bottom Custom Controls Bar */}
      <div className={`absolute bottom-0 inset-x-0 p-4 sm:p-6 z-20 transition-opacity duration-300 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent ${
        showControls ? 'opacity-100' : 'opacity-0'
      }`}>
        
        {/* Progress Bar Slider */}
        <div className="relative group/progress mb-3 cursor-pointer">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => {
              const val = Number(e.target.value);
              setCurrentTime(val);
              if (videoRef.current) videoRef.current.currentTime = val;
            }}
            className="w-full h-1.5 bg-slate-800 accent-amber-500 rounded-lg cursor-pointer transition-all group-hover/progress:h-2.5"
          />
        </div>

        {/* Player Buttons Bar */}
        <div className="flex items-center justify-between text-slate-200">
          
          {/* Left Controls: Play, Next, Volume, Time */}
          <div className="flex items-center space-x-3">
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center gold-glow transition-all cursor-pointer"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-slate-950 ml-0.5" />}
            </button>

            {hasNextEpisode && (
              <button
                onClick={onNextEpisode}
                className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-amber-300 border border-amber-500/20 transition-all cursor-pointer"
                title="Növbəti Epizod (N)"
              >
                <SkipForward className="w-4 h-4 fill-amber-300" />
              </button>
            )}

            {/* Volume Control */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 rounded-xl text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setVolume(v);
                  if (videoRef.current) videoRef.current.volume = v;
                  setIsMuted(v === 0);
                }}
                className="w-16 h-1 bg-slate-700 accent-amber-500 rounded cursor-pointer hidden sm:block"
              />
            </div>

            {/* Time Indicator */}
            <span className="text-xs font-mono font-bold text-slate-300 pl-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right Controls: Sub/Audio Settings, Auto-Play, Fullscreen */}
          <div className="flex items-center space-x-2">
            
            {/* Auto Play Toggle */}
            <button
              onClick={onToggleAutoPlay}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                autoPlayNext
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-900/80 text-slate-400 border-slate-700'
              }`}
              title="Avtomatik Növbəti Epizod"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${autoPlayNext ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Avto-Play</span>
            </button>

            {/* Audio & Subtitle Settings */}
            <div className="relative">
              <button
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-amber-500/20 transition-all cursor-pointer"
                title="Səs və Subtitr seçimi"
              >
                <Languages className="w-5 h-5" />
              </button>

              {showSettingsMenu && (
                <div className="absolute right-0 bottom-12 w-64 glass-card rounded-2xl p-4 shadow-2xl border border-amber-500/40 z-50">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 border-b border-amber-500/20 pb-1">
                    Subtitr Seçimi
                  </h4>
                  <div className="space-y-1 mb-3">
                    {episode.subtitles.map(sub => (
                      <button
                        key={sub.lang}
                        onClick={() => { setSelectedSub(sub.lang); setShowSettingsMenu(false); }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                          selectedSub === sub.lang
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span>{sub.label}</span>
                        {selectedSub === sub.lang && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </button>
                    ))}
                  </div>

                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 border-b border-amber-500/20 pb-1">
                    Səs (Audio Track)
                  </h4>
                  <div className="space-y-1">
                    {episode.audioTracks.map(audio => (
                      <button
                        key={audio.lang}
                        onClick={() => { setSelectedAudio(audio.lang); setShowSettingsMenu(false); }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                          selectedAudio === audio.lang
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span>{audio.label}</span>
                        {selectedAudio === audio.lang && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-amber-500/20 transition-all cursor-pointer"
            >
              <Maximize className="w-5 h-5" />
            </button>

          </div>

        </div>

      </div>

      {/* Keyboard Shortcuts Helper Modal */}
      {showKeyboardHelp && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="max-w-md w-full glass-card rounded-3xl p-6 border border-amber-500/40 text-slate-100">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3 mb-4">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
                <Keyboard className="w-4 h-4" />
                <span>Klaviatura Qısayolları</span>
              </h3>
              <button 
                onClick={() => setShowKeyboardHelp(false)}
                className="px-2 py-1 bg-slate-800 rounded-lg text-xs font-bold hover:bg-slate-700 cursor-pointer"
              >
                Bağla
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-900/60">
                <span>Play / Pause</span>
                <kbd className="px-2 py-1 bg-slate-800 text-amber-400 rounded border border-amber-500/30 font-mono">Space / K</kbd>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-900/60">
                <span>Tam Ekran (Full Screen)</span>
                <kbd className="px-2 py-1 bg-slate-800 text-amber-400 rounded border border-amber-500/30 font-mono">F</kbd>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-900/60">
                <span>Səsi Kəs (Mute)</span>
                <kbd className="px-2 py-1 bg-slate-800 text-amber-400 rounded border border-amber-500/30 font-mono">M</kbd>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-900/60">
                <span>5 Saniyə İrəli / Geri</span>
                <kbd className="px-2 py-1 bg-slate-800 text-amber-400 rounded border border-amber-500/30 font-mono">Sol / Sağ Oxlar</kbd>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-900/60">
                <span>Girişi Keç (Skip Intro)</span>
                <kbd className="px-2 py-1 bg-slate-800 text-amber-400 rounded border border-amber-500/30 font-mono">S</kbd>
              </div>
              <div className="flex justify-between items-center p-2 rounded-xl bg-slate-900/60">
                <span>Növbəti Epizod</span>
                <kbd className="px-2 py-1 bg-slate-800 text-amber-400 rounded border border-amber-500/30 font-mono">N</kbd>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
