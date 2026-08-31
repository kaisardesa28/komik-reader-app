import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Sparkles, Clock, ArrowRight, BookOpen, RefreshCw } from 'lucide-react';
import { fetchHome } from '../services/api';
import HeroBanner from '../components/HeroBanner';
import ComicCard from '../components/ComicCard';
import { CardSkeleton } from '../components/SkeletonLoader';

const HomePage = () => {
  const [data, setData] = useState({ featured: [], popular: [], latest: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const homeData = await fetchHome();
      setData(homeData);
    } catch (err) {
      console.error('Failed to load home data', err);
      setError('Gagal memuat komik dari database. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter latest based on active tab
  const filteredLatest = data.latest.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'manhwa') return item.type?.toLowerCase().includes('manhwa');
    if (activeTab === 'manhua') return item.type?.toLowerCase().includes('manhua');
    if (activeTab === 'manga') return item.type?.toLowerCase().includes('manga');
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      
      {/* Hero Featured Slider */}
      {loading ? (
        <div className="h-96 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse flex items-center justify-center">
          <div className="flex items-center gap-2 text-indigo-400 font-medium">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Memuat database komik...</span>
          </div>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-rose-950/20 border border-rose-800/40 text-center space-y-3">
          <p className="text-rose-400 font-semibold">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold rounded-xl transition-all"
          >
            Coba Lagi
          </button>
        </div>
      ) : (
        <HeroBanner featured={data.featured} />
      )}

      {/* Popular Ranking Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Komik Terpopuler</h2>
              <p className="text-xs text-slate-400">Paling banyak dibaca pembaca minggu ini</p>
            </div>
          </div>

          <Link
            to="/browse?sort=popular"
            className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors group"
          >
            <span>Lihat Semua</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Popular Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
            : data.popular.slice(0, 5).map((comic) => (
                <ComicCard key={comic.slug} comic={comic} />
              ))}
        </div>
      </section>

      {/* Latest Releases Section */}
      <section className="space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Rilis Chapter Terbaru</h2>
              <p className="text-xs text-slate-400">Pembaruan komik sub Indo real-time</p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 self-start sm:self-auto overflow-x-auto max-w-full">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'manhwa', label: 'Manhwa' },
              { id: 'manhua', label: 'Manhua' },
              { id: 'manga', label: 'Manga' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Latest Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {loading
            ? Array.from({ length: 18 }).map((_, i) => <CardSkeleton key={i} />)
            : filteredLatest.map((comic) => (
                <ComicCard key={comic.slug} comic={comic} />
              ))}
        </div>

        {/* View More Button */}
        <div className="text-center pt-6">
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white font-bold text-sm border border-slate-700 hover:border-indigo-500 transition-all hover:scale-105 shadow-lg shadow-black/40"
          >
            <BookOpen className="w-4 h-4" />
            <span>Jelajahi Ribuan Koleksi Komik Lengkap</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
