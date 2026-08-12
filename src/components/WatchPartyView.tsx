import React, { useState, useEffect, useRef } from 'react';
import { Users, Send, Play, Pause, Plus, Shield, MessageSquare, Flame, Sparkles, Lock, LockOpen } from 'lucide-react';
import { WatchPartyRoom, Anime, Episode, User, ChatMessage } from '../types';
import { CustomVideoPlayer } from './CustomVideoPlayer';

interface WatchPartyViewProps {
  currentUser: User;
  animes: Anime[];
  onSelectAnime: (animeId: string) => void;
}

export const WatchPartyView: React.FC<WatchPartyViewProps> = ({
  currentUser,
  animes,
  onSelectAnime
}) => {
  const [rooms, setRooms] = useState<WatchPartyRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [activeRoomData, setActiveRoomData] = useState<{
    room: WatchPartyRoom;
    anime?: Anime;
    episode?: Episode;
  } | null>(null);

  const [chatInput, setChatInput] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New room state
  const [newRoomName, setNewRoomName] = useState('');
  const [selectedAnimeId, setSelectedAnimeId] = useState(animes[0]?.id || '');
  const [isPrivateRoom, setIsPrivateRoom] = useState(false);

  // Floating reaction animations
  const [reactions, setReactions] = useState<{ id: string; emoji: string; x: number }[]>([]);

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (selectedRoomId) {
      fetchRoomDetail(selectedRoomId);
      const interval = setInterval(() => {
        fetchRoomDetail(selectedRoomId);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedRoomId]);

  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/watchparty/rooms');
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRoomDetail = async (roomId: string) => {
    try {
      const res = await fetch(`/api/watchparty/room/${roomId}`);
      if (res.ok) {
        const data = await res.json();
        setActiveRoomData(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/watchparty/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRoomName || 'Dostlarla Anime İzləmə Otağı',
          animeId: selectedAnimeId,
          episodeId: 'ep-101',
          hostId: currentUser.id,
          hostName: currentUser.username,
          isPrivate: isPrivateRoom
        })
      });
      if (res.ok) {
        const room = await res.json();
        setSelectedRoomId(room.id);
        setShowCreateModal(false);
        fetchRooms();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedRoomId) return;

    try {
      const res = await fetch(`/api/watchparty/room/${selectedRoomId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          username: currentUser.username,
          userAvatar: currentUser.avatar,
          text: chatInput
        })
      });
      if (res.ok) {
        setChatInput('');
        fetchRoomDetail(selectedRoomId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const triggerReaction = (emoji: string) => {
    const newReaction = {
      id: "react-" + Date.now() + Math.random(),
      emoji,
      x: Math.random() * 80 + 10
    };
    setReactions(prev => [...prev, newReaction]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== newReaction.id));
    }, 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-2">
            <Users className="w-7 h-7 text-amber-400" />
            <span>Watch Party (Birgə İzləmə Otaqları)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dostlarınızla eyni vaxtda anime izləyin, canlı yazışın və reaksiyalar verin
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black text-xs gold-glow hover:brightness-110 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Yeni Otaq Yarat</span>
        </button>
      </div>

      {/* Main Content Area */}
      {!selectedRoomId ? (
        /* Room Grid List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map(room => {
            const anime = animes.find(a => a.id === room.animeId);
            return (
              <div
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                className="glass-card rounded-3xl p-5 border border-amber-500/20 hover:border-amber-500/50 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[10px] border border-emerald-500/30 animate-pulse">
                      <span>CANLI</span>
                    </span>
                    {room.isPrivate ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <LockOpen className="w-3.5 h-3.5 text-slate-400" />}
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors mb-1">
                    {room.name}
                  </h3>
                  <p className="text-xs text-amber-200/80 mb-3">Host: {room.hostName}</p>

                  {anime && (
                    <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-slate-900/60 border border-amber-500/10">
                      <img src={anime.posterImage} alt="" className="w-10 h-14 rounded-xl object-cover shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-slate-200 line-clamp-1">{anime.title}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{anime.episodesCount} Seriya</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-amber-500/10 text-xs">
                  <span className="text-slate-400 flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-amber-400" />
                    <span>{room.participants.length} İzləyici</span>
                  </span>

                  <span className="text-amber-400 font-bold group-hover:underline">Otağa Qoşul →</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : activeRoomData ? (
        /* Active Watch Party Room View */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedRoomId(null)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 text-amber-300 text-xs font-bold border border-amber-500/20 cursor-pointer"
            >
              ← Bütün Otaqlara Qayıt
            </button>
            <h2 className="text-sm font-bold text-amber-300">{activeRoomData.room.name}</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Left 3 cols: Video Player + Reaction Bar */}
            <div className="lg:col-span-3 space-y-3 relative">
              
              {/* Floating Emojis Animation Canvas */}
              <div className="relative overflow-hidden rounded-3xl">
                {activeRoomData.episode && activeRoomData.anime && (
                  <CustomVideoPlayer
                    episode={activeRoomData.episode}
                    animeTitle={activeRoomData.anime.title}
                  />
                )}

                {/* Floating Reaction Overlay */}
                <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
                  {reactions.map(r => (
                    <div
                      key={r.id}
                      style={{ left: `${r.x}%` }}
                      className="absolute bottom-10 text-3xl animate-float transition-all duration-1000"
                    >
                      {r.emoji}
                    </div>
                  ))}
                </div>
              </div>

              {/* Reaction Buttons Toolbar */}
              <div className="p-3 rounded-2xl glass-card border-amber-500/20 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400">Canlı Reaksiyalar:</span>
                <div className="flex items-center space-x-2">
                  {['🔥', '😱', '😂', '❤️', '👏', '🎌'].map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => triggerReaction(emoji)}
                      className="text-lg p-2 rounded-xl bg-slate-900/80 hover:bg-amber-500/20 border border-amber-500/10 hover:scale-125 transition-all cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Right 1 col: Room Live Chat Panel & Participants */}
            <div className="lg:col-span-1 glass-card rounded-3xl p-4 border border-amber-500/30 flex flex-col justify-between h-[520px]">
              
              {/* Chat Header */}
              <div className="border-b border-amber-500/20 pb-3 mb-2 flex items-center justify-between">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Otaq Çatı</span>
                </h4>
                <span className="text-[10px] text-slate-400">{activeRoomData.room.participants.length} Nəfər</span>
              </div>

              {/* Chat Messages Stream */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {activeRoomData.room.messages.map(msg => (
                  <div key={msg.id} className="p-2 rounded-xl bg-slate-900/70 border border-amber-500/10">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-300">{msg.username}</span>
                      <span className="text-[9px] text-slate-500">{msg.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-200 mt-0.5 leading-tight">{msg.text}</p>
                  </div>
                ))}
              </div>

              {/* Chat Input Form */}
              <form onSubmit={handleSendMessage} className="mt-3 flex items-center space-x-2 pt-2 border-t border-amber-500/20">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Mesajınızı yazın..."
                  className="flex-1 px-3 py-2 rounded-xl glass-input text-xs"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold gold-glow cursor-pointer"
                >
                  <Send className="w-4 h-4 stroke-[2.5]" />
                </button>
              </form>

            </div>

          </div>
        </div>
      ) : null}

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="max-w-md w-full glass-card rounded-3xl p-6 border border-amber-500/40 text-slate-100 space-y-4">
            <h3 className="text-base font-extrabold text-amber-400">Yeni Watch Party Otağı Yarat</h3>

            <form onSubmit={handleCreateRoom} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Otaq Adı</label>
                <input
                  type="text"
                  required
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="məs. Solo Leveling 2-ci Sezon Birlikdə İzləmə"
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Anime Seçin</label>
                <select
                  value={selectedAnimeId}
                  onChange={(e) => setSelectedAnimeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 text-amber-300 border border-amber-500/30 text-xs font-bold"
                >
                  {animes.map(a => (
                    <option key={a.id} value={a.id}>{a.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="priv"
                  checked={isPrivateRoom}
                  onChange={(e) => setIsPrivateRoom(e.target.checked)}
                  className="accent-amber-500"
                />
                <label htmlFor="priv" className="text-xs text-slate-300 font-semibold cursor-pointer">
                  Məxfi Otaq (Şifrəli)
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 cursor-pointer"
                >
                  Ləğv Et
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs gold-glow cursor-pointer"
                >
                  Otağı Yarat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
