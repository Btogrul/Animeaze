import React, { useState, useEffect } from 'react';
import { Character, Studio } from '../types';
import { Sparkles, Tv, User, Film, BookOpen } from 'lucide-react';

export const WikiView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'characters' | 'studios'>('characters');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWikiData();
  }, []);

  const fetchWikiData = async () => {
    try {
      const [resC, resS] = await Promise.all([
        fetch('/api/wiki/characters'),
        fetch('/api/wiki/studios')
      ]);
      if (resC.ok && resS.ok) {
        setCharacters(await resC.json());
        setStudios(await resS.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center space-x-2">
            <BookOpen className="w-7 h-7 text-amber-400" />
            <span>Anime Bilik Bazası (Wiki)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Məşhur anime personajları, səs aktyorları (Seiyuu) və studiyalar haqqında ətraflı məlumat
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('characters')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'characters'
                ? 'bg-amber-500 text-slate-950 gold-glow'
                : 'bg-slate-900/80 text-slate-300 border border-amber-500/20'
            }`}
          >
            Personajlar & Seiyuu
          </button>
          <button
            onClick={() => setActiveTab('studios')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === 'studios'
                ? 'bg-amber-500 text-slate-950 gold-glow'
                : 'bg-slate-900/80 text-slate-300 border border-amber-500/20'
            }`}
          >
            Anime Studiyaları
          </button>
        </div>
      </div>

      {/* Characters Tab */}
      {activeTab === 'characters' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map(char => (
            <div key={char.id} className="glass-card rounded-3xl p-5 border border-amber-500/20 space-y-4">
              <div className="flex items-center space-x-4">
                <img src={char.image} alt={char.name} className="w-20 h-24 rounded-2xl object-cover border border-amber-400/50 shrink-0 shadow-lg" />
                <div>
                  <h3 className="text-base font-extrabold text-white">{char.name}</h3>
                  <p className="text-xs text-amber-300 italic">{char.japaneseName}</p>
                  <span className="inline-block mt-2 px-2.5 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded-lg border border-amber-500/30">
                    {char.role} Personaj
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{char.description}</p>

              {/* Seiyuu Info */}
              <div className="p-3 rounded-2xl bg-slate-900/70 border border-amber-500/10 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Səs Aktyoru (Seiyuu)</span>
                  <span className="font-bold text-amber-300">{char.seiyuu.name}</span>
                </div>
                <img src={char.seiyuu.image} alt="" className="w-9 h-9 rounded-xl object-cover border border-amber-400/40" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Studios Tab */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studios.map(studio => (
            <div key={studio.id} className="glass-card rounded-3xl p-5 border border-amber-500/20 space-y-4">
              <div className="flex items-center space-x-4">
                <img src={studio.logo} alt={studio.name} className="w-16 h-16 rounded-2xl object-cover border border-amber-400/50 shrink-0" />
                <div>
                  <h3 className="text-lg font-extrabold text-white">{studio.name}</h3>
                  <p className="text-xs text-amber-300 font-medium">Təsis İli: {studio.establishedYear}</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{studio.description}</p>

              <div className="pt-2 border-t border-amber-500/10 flex justify-between items-center text-xs">
                <span className="text-slate-400">Ümumi İstehsal Olunan Anime</span>
                <span className="font-bold text-amber-400">{studio.animeCount}+</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
